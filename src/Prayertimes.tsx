import React, { useState, useRef, useEffect } from "react";
import { FlexCol, FlexRow } from "./Flex";
import { getActivePrayer } from "./Helpers";

type CityInfo = {
  city: string;
  country: string;
};

type WeatherForecast = {
  date: Date;
  temp: number;
  icon: string;
  description: string;
};

const PrayerTimes = () => {
  const [cities, setCities] = useState<CityInfo[]>(() => {
    const stored = window.localStorage.getItem("cities");
    if (stored) {
      return JSON.parse(stored);
    }
    return [{ city: "Boston", country: "USA" }, {city: "Mecca", country: "Saudi Arabia"}];
  });
  
  const [currentCityIndex, setCurrentCityIndex] = useState(() => {
    const stored = window.localStorage.getItem("currentCityIndex");
    return stored ? parseInt(stored) : 0;
  });

  const [prayerInfo, setPrayerInfo] = useState(null);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [changeCityModal, setChangeCityModal] = useState(false);
  const [aboutModal, setAboutModal] = useState(false);
  const [militaryTime, setMilitaryTime] = useState(false);
  const [weatherForecast, setWeatherForecast] = useState<WeatherForecast[]>([]);

  const originalCity = useRef(city);
  const originalCountry = useRef(country);

  let displayTimes = [
    "Fajr",
    "Sunrise",
    "Dhuhr",
    "Asr",
    "Maghrib",
    "Isha",
    "Imsak",
  ];

  let now = new Date();
  let day = now.getDate(); //day of the month
  let month = now.getMonth(); //month
  let year = now.getFullYear(); //year

  let timings: any = null;
  if (prayerInfo) {
    for (let key in prayerInfo as any) {
      let dayInfo = (prayerInfo as any)[key];
      if (parseFloat(dayInfo.date.gregorian.day) === day) {
        timings = dayInfo.timings;
      }
    }
  }

  let activePrayer = getActivePrayer(timings);

  const fetchPrayerInfo = async (fetchCity: string, fetchCountry: string) => {
    let fetchURL = `https://api.aladhan.com/v1/calendarByCity?city=${fetchCity}&country=${fetchCountry}&method=2&month=${
      month + 1
    }&year=${year}`;
    fetch(fetchURL)
      .then((response) => response.json())
      .then((result) => {
        setPrayerInfo(result.data);
      });
  };

  const fetchWeatherForecast = async (city: string, country: string) => {
    const API_KEY = '3887aaff6e854f788c382103242912';
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city},${country}&days=3&aqi=no`
      );
      const data = await response.json();
      
      if (data.error) {
        console.error('Weather API error:', data.error);
        setWeatherForecast([]);
        return;
      }

      const forecasts = data.forecast.forecastday.map((day: any) => ({
        date: new Date(day.date),
        temp: Math.round(day.day.avgtemp_f),
        icon: day.day.condition.icon,
        description: day.day.condition.text,
      }));
      
      setWeatherForecast(forecasts);
    } catch (error) {
      console.error('Error fetching weather:', error);
      setWeatherForecast([]);
    }
  };

  const saveCities = (newCities: CityInfo[]) => {
    window.localStorage.setItem("cities", JSON.stringify(newCities));
    setCities(newCities);
  };

  useEffect(() => {
    const currentCity = cities[currentCityIndex];
    fetchPrayerInfo(currentCity.city, currentCity.country);
    fetchWeatherForecast(currentCity.city, currentCity.country);
    window.localStorage.setItem("currentCityIndex", currentCityIndex.toString());
  }, [currentCityIndex, cities]);

  const removeCity = (indexToRemove: number) => {
    if (cities.length <= 1) {
      return; // Don't allow removing the last city
    }
    const newCities = cities.filter((_, index) => index !== indexToRemove);
    saveCities(newCities);
    if (currentCityIndex >= indexToRemove) {
      // Adjust current city index if needed
      setCurrentCityIndex(Math.max(0, currentCityIndex - 1));
    }
  };

  return (
    <FlexCol style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column", justifyContent: "space-around" }}>
      <FlexCol style={{
        margin: "10px"
      }}>
        <FlexRow style={{ width: "100%", fontSize: "4vh" }}>
          {`Prayer Times for `}
        </FlexRow>
        <FlexRow style={{ width: "100%", fontSize: "4vh" }}>
          <strong>{` ${cities[currentCityIndex].city}, ${cities[currentCityIndex].country}`}</strong>
        </FlexRow>
        <FlexRow style={{ width: "100%" }}>
        {`${now.toLocaleDateString()}`}
        </FlexRow>
      </FlexCol>

    <FlexCol style={{
      margin: "5px"
    }}>
      {cities.length > 1 && (
        <FlexRow style={{
          display: "flex",
          width: "100%",
          justifyContent: "center"
        }}>
        <FlexRow 
          style={{ 
            width: "80%", 
            justifyContent: "center", 
            gap: "10px",
            // flexWrap: "nowrap",
            // overflowX: "auto",
            padding: "10px 0"
          }}
        >
          {cities.map((cityInfo, index) => (
            <div 
              key={index} 
              style={{ 
                display: "inline-flex", 
                alignItems: "center",
                position: "relative",
                minWidth: "fit-content"
              }}
            >
              <button
                onClick={() => setCurrentCityIndex(index)}
                style={{
                  padding: "5px 25px 5px 10px",
                  backgroundColor: index === currentCityIndex ? "#ddd" : "white",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  cursor: "pointer",
                  whiteSpace: "nowrap"
                }}
              >
                {`${cityInfo.city}, ${cityInfo.country}`}
              </button>
              <button
                onClick={() => removeCity(index)}
                style={{
                  position: "absolute",
                  right: "5px",
                  padding: "2px 5px",
                  backgroundColor: "transparent",
                  border: "none",
                  borderRadius: "50%",
                  cursor: "pointer",
                  color: "#999",
                  fontSize: "14px",
                  lineHeight: "1",
                  transition: "color 0.2s ease"
                }}
                onMouseOver={(e) => e.currentTarget.style.color = "#ff4444"}
                onMouseOut={(e) => e.currentTarget.style.color = "#999"}
              >
                ×
              </button>
            </div>
          ))}
        </FlexRow>
        </FlexRow>
      )}

      {weatherForecast.length > 0 && (
        <FlexRow style={{
          width: "80%",
          maxWidth: "500px",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 16px",
          margin: "0 auto",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
        }}>
          {weatherForecast.map((forecast, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
                flex: "1",
                justifyContent: "center"
              }}
            >
              <div style={{ 
                fontSize: "0.9em",
                textAlign: "center"
              }}>
                {forecast.date.toLocaleDateString(undefined, { weekday: 'short' })}
              </div>
              <div style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "4px"
              }}>
                <img
                  src={`https:${forecast.icon}`}
                  alt={forecast.description}
                  style={{ width: "30px", height: "30px" }}
                />
                <div style={{ 
                  fontSize: "0.9em",
                  textAlign: "center"
                }}>
                  {forecast.temp}°F
                </div>
              </div>
            </div>
          ))}
        </FlexRow>
      )}
      </FlexCol>

      <FlexCol
        style={{
          width: "100%",
          height: "100%",
          justifyContent: "center",
          display: "flex",
          flexDirection: "column",
          margin: "2px"
        }}
      >
      {timings && (
        <FlexCol >

          {Object.keys(timings).map((prayerName) => {
            if (displayTimes.includes(prayerName)) {
              let timing = timings[prayerName];

              if (!militaryTime) {
                try {
                  //let hourNum = parseFloat(timing.split(':')[0]);
                  let parts = timing.split(" ");
                  let timeParts = parts[0].split(":");
                  let hourNum = parseFloat(timeParts[0]);
                  let ampm = "AM";
                  if (hourNum >= 12) {
                    ampm = "PM";
                  }
                  hourNum = hourNum % 12;
                  if (hourNum === 0) {
                    hourNum = 12;
                  }
                  timing =
                    "" +
                    hourNum +
                    ":" +
                    timeParts[1] +
                    " " +
                    ampm +
                    " " +
                    parts[1];
                } catch (e: any) {
                  //console.log('something went wrong parsing the format for timing: ', timing);
                }
              }

              let fontColor =
                prayerName === activePrayer ? "rgba(0,160,60)" : "black";
              let fontWeight = prayerName === activePrayer ? "bold" : "normal";

              return (
                <FlexRow
                  style={{
                    width: "60%",
                    maxWidth: "500px",
                    margin: "auto",
                    fontSize: "1.2em",
                    color: fontColor,
                    fontWeight: fontWeight,
                    justifyContent: "space-between",
                    clear: "both",
                    borderBottom: "1px solid #000",
                    paddingTop: "20px",
                  }}
                >
                  <span style={{ float: "left" }}>{prayerName}</span>
                  <span></span>
                  <span style={{ float: "right" }}> {timing}</span>
                  <div style={{ clear: "both" }} />
                </FlexRow>
              );
            }
          })}{" "}
        </FlexCol>
      )}
         <div style={{
        width: "100%",
        height: "5vh",
        // backgroundColor: "red",
      }} /> 
      </FlexCol>

      <div
        onClick={() => setChangeCityModal(true)}
        style={{
          position: "absolute",
          bottom: "3vw",
          right: "3vw",
          fontSize: "1em",
          color: "#666",
          cursor: "pointer"
        }}
      >
        [Add City]
      </div>
      <div
        onClick={() => {
          setAboutModal(true);
        }}
        style={{
          position: "absolute",
          bottom: "3vw",
          left: "3vw",
          fontSize: "1em",
          color: "#666",
          cursor: "pointer"
        }}
      >
        [About]
      </div>
      {changeCityModal && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              backdropFilter: "blur(2px)",
              zIndex: 999,
            }}
            onClick={() => setChangeCityModal(false)}
          />
          <FlexCol
            style={{
              position: "absolute",
              bottom: "50%",
              left: "50%",
              transform: "translate(-50%, 50%)",
              width: "90%",
              maxWidth: "350px",
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "32px",
              justifyContent: "left",
              boxShadow: "0 16px 40px rgba(0, 0, 0, 0.25)",
              gap: "24px",
              border: "1px solid rgba(0, 0, 0, 0.05)",
              zIndex: 1000,
            }}
          >
            <div style={{ 
              fontSize: "1.6em",
              marginBottom: "8px",
              color: "#333"
            }}>
              Add New City
            </div>
            <FlexCol style={{ gap: "24px" }}>
              <div>
                <div style={{ 
                  marginBottom: "10px",
                  color: "#555",
                  fontSize: "0.95em",
                }}>City</div>
                <input
                  placeholder="Enter city name"
                  type="text"
                  style={{
                    width: "100%",
                    padding: "14px",
                    fontSize: "1em",
                    border: "1px solid #e0e0e0",
                    borderRadius: "10px",
                    outline: "none",
                    transition: "all 0.2s ease",
                    backgroundColor: "#f8f8f8",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#007AFF";
                    e.target.style.backgroundColor = "#ffffff";
                    e.target.style.boxShadow = "0 0 0 3px rgba(0, 122, 255, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e0e0e0";
                    e.target.style.backgroundColor = "#f8f8f8";
                    e.target.style.boxShadow = "none";
                  }}
                  onChange={(e) => setCity(e.target.value)}
                  value={city}
                />
              </div>
              <div>
                <div style={{ 
                  marginBottom: "10px",
                  color: "#555",
                  fontSize: "0.95em",
                }}>Country</div>
                <input
                  placeholder="Enter country name"
                  type="text"
                  style={{
                    width: "100%",
                    padding: "14px",
                    fontSize: "1em",
                    border: "1px solid #e0e0e0",
                    borderRadius: "10px",
                    outline: "none",
                    transition: "all 0.2s ease",
                    backgroundColor: "#f8f8f8",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#007AFF";
                    e.target.style.backgroundColor = "#ffffff";
                    e.target.style.boxShadow = "0 0 0 3px rgba(0, 122, 255, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e0e0e0";
                    e.target.style.backgroundColor = "#f8f8f8";
                    e.target.style.boxShadow = "none";
                  }}
                  onChange={(e) => setCountry(e.target.value)}
                  value={country}
                />
              </div>
            </FlexCol>
            <FlexRow style={{ 
              justifyContent: "flex-end", 
              marginTop: "8px",
              gap: "12px"
            }}>
              <button
                onClick={() => setChangeCityModal(false)}
                style={{
                  padding: "12px 24px",
                  fontSize: "0.95em",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  backgroundColor: "#f0f0f0",
                  color: "#555",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#e5e5e5";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#f0f0f0";
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (city && country) {
                    const newCities = [...cities, { city, country }];
                    saveCities(newCities);
                    setCurrentCityIndex(newCities.length - 1);
                    setCity("");
                    setCountry("");
                    setChangeCityModal(false);
                  }
                }}
                style={{
                  padding: "12px 24px",
                  fontSize: "0.95em",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  backgroundColor: "#007AFF",
                  color: "white",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#0066DD";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#007AFF";
                }}
              >
                Add City
              </button>
            </FlexRow>
          </FlexCol>
        </>
      )}
      {aboutModal && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              backdropFilter: "blur(2px)",
              zIndex: 999,
            }}
            onClick={() => setAboutModal(false)}
          />
          <FlexCol style={{
            position: "absolute",
            left: "0px",
            top: "0px",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center"
          }}>


          <FlexCol
            style={{
              width: "60%",           
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "32px",
              justifyContent: "center",
              boxShadow: "0 16px 40px rgba(0, 0, 0, 0.25)",
              gap: "20px",
              border: "1px solid rgba(0, 0, 0, 0.05)",
              zIndex: 1000,
              margin: "20px",
            }}
          >
            <div style={{ 
              fontSize: "1.6em",
              color: "#333",
              marginBottom: "8px"
            }}>
              About
            </div>
            <div style={{
              lineHeight: "1.6",
              color: "#555",
              fontSize: "0.95em"
            }}>
              This was an attempt at a minimal prayer times app. It's free and open
              source forever isA. I used the{" "}
              <a 
                href="https://aladhan.com/prayer-times-api"
                style={{
                  color: "#007AFF",
                  textDecoration: "none"
                }}
              >
                Al-Adhan API
              </a>{" "}
              which is maintained by Islamic Network.
            </div>
            <div style={{
              lineHeight: "1.6",
              color: "#555",
              fontSize: "0.95em"
            }}>
              Prayer times use the Islamic Society of North America calculation method. 
              This site does not track you.
            </div>
            <div style={{
              lineHeight: "1.6",
              color: "#555",
              fontSize: "0.95em"
            }}>
              You can see the source code for this site{" "}
              <a 
                href="https://github.com/ultrafro/prayertimes"
                style={{
                  color: "#007AFF",
                  textDecoration: "none"
                }}
              >
                here
              </a>.
            </div>
            <FlexRow style={{ 
              justifyContent: "flex-end",
              marginTop: "8px"
            }}>
              <button
                onClick={() => setAboutModal(false)}
                style={{
                  padding: "12px 24px",
                  fontSize: "0.95em",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  backgroundColor: "#f0f0f0",
                  color: "#555",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#e5e5e5";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#f0f0f0";
                }}
              >
                Close
              </button>
            </FlexRow>
          </FlexCol>
          </FlexCol>
        </>
      )}
    </FlexCol>
  );
};
export default PrayerTimes;
