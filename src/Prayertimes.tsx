import React, { useState, useRef, useEffect } from "react";
import { FlexCol, FlexRow } from "./Flex";
import { getActivePrayer } from "./Helpers";

type CityInfo = {
  city: string;
  country: string;
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

  const saveCities = (newCities: CityInfo[]) => {
    window.localStorage.setItem("cities", JSON.stringify(newCities));
    setCities(newCities);
  };

  useEffect(() => {
    const currentCity = cities[currentCityIndex];
    fetchPrayerInfo(currentCity.city, currentCity.country);
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
    <FlexCol style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <FlexRow style={{ width: "100%" }}>
        <h2>{`Prayer Times for ${cities[currentCityIndex].city}, ${cities[currentCityIndex].country}`}</h2>
      </FlexRow>
      <FlexRow style={{ width: "100%" }}>
        <h3>{`${now.toLocaleDateString()}`}</h3>
      </FlexRow>
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
                    borderBottom: "3px solid black",
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
        backgroundColor: "red",
      }} /> 

      <div
        onClick={() => setChangeCityModal(true)}
        style={{
          position: "absolute",
          bottom: "5vw",
          right: "5vw",
          fontSize: "1.4em",
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
          bottom: "5vw",
          left: "5vw",
          fontSize: "1.4em",
        }}
      >
        [About]
      </div>
      {changeCityModal && (
        <FlexCol
          style={{
            position: "absolute",
            bottom: "20px",
            left: "5vw",
            width: "80vw",
            maxWidth: "400px",
            backgroundColor: "rgba(200,200,200)",
            borderRadius: "20px",
            padding: "20px",
            justifyContent: "left",
          }}
        >
          <FlexRow style={{ fontSize: "1.2em" }}>
            <span>City:</span>
            <input
              placeholder="Boston"
              type="text"
              style={{
                width: "200px",
                height: "25px",
                fontSize: "1.2em",
              }}
              onChange={(e) => setCity(e.target.value)}
              value={city}
            />
          </FlexRow>
          <FlexRow style={{ fontSize: "1.2em" }}>
            <span>Country:</span>
            <input
              placeholder="USA"
              type="text"
              style={{
                width: "200px",
                height: "25px",
                fontSize: "1.2em",
              }}
              onChange={(e) => setCountry(e.target.value)}
              value={country}
            />
          </FlexRow>
          <FlexRow style={{ justifyContent: "space-between", marginTop: "20px" }}>
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
            >
              Add City
            </button>
            <button onClick={() => setChangeCityModal(false)}>Cancel</button>
          </FlexRow>
        </FlexCol>
      )}
      {aboutModal && (
        <FlexCol
          style={{
            position: "absolute",
            bottom: "20px",
            left: "5vw",
            width: "80vw",
            maxWidth: "400px",
            backgroundColor: "rgba(200,200,200)",
            borderRadius: "20px",
            padding: "20px",
            justifyContent: "left",
          }}
        >
          This was an attempt at a minimal prayer times app. It's free and open
          source forever isA. I used the{" "}
          <a href="https://aladhan.com/prayer-times-api">Al-Adhan API</a> which
          is maintained by Islamic Network. Prayer times use the Islamic Society
          of North America calculation method. This site does not track you. You
          can see the source code for this site{" "}
          <a href={"https://github.com/ultrafro/prayertimes"}>here</a>.<p></p>
          <div
            style={{ float: "right", fontSize: "1.4em" }}
            onClick={() => {
              setAboutModal(false);
            }}
          >
            [Finished]
          </div>
        </FlexCol>
      )}
    </FlexCol>
  );
};
export default PrayerTimes;
