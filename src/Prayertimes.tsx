import React, { useState, useRef, useEffect } from "react";
import { FlexCol, FlexRow } from "./Flex";
const PrayerTimes = () => {
  let storedCity = window.localStorage.getItem("city");
  let storedCountry = window.localStorage.getItem("country");

  const [prayerInfo, setPrayerInfo] = useState(null);
  const [city, setCity] = useState(storedCity || "Boston");
  const [country, setCountry] = useState(storedCountry || "USA");
  const [changeCityModal, setChangeCityModal] = useState(false);
  const [aboutModal, setAboutModal] = useState(false);
  const [militaryTime, setMilitaryTime] = useState(false);

  const originalCity = useRef(city);
  const originalCountry = useRef(country);

  let fiveTimes = [
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

  useEffect(() => {
    fetchPrayerInfo(city, country);
  }, []);

  return (
    <FlexCol style={{ width: "100%" }}>
      <FlexRow style={{ width: "60%", margin: "auto" }}>
        <h1>{`Prayer Times for ${originalCity.current} ${originalCountry.current}`}</h1>
      </FlexRow>
      <FlexRow style={{ width: "60%", margin: "auto" }}>
        <h2>{`${now.toLocaleDateString()}`}</h2>
      </FlexRow>
      {timings &&
        Object.keys(timings).map((prayerName) => {
          if (fiveTimes.includes(prayerName)) {
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

            return (
              <FlexRow
                style={{
                  width: "60%",
                  maxWidth: "500px",
                  margin: "auto",
                  fontSize: "1.2em",
                  justifyContent: "space-between",
                  clear: "both",
                  borderBottom: "4px solid black",
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
        })}
      <div
        onClick={() => {
          setChangeCityModal(true);
        }}
        style={{
          position: "absolute",
          bottom: "5vw",
          right: "5vw",
          fontSize: "1.4em",
        }}
      >
        [Change City]
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
            // height: "60vh",
            backgroundColor: "rgba(200,200,200)",
            borderRadius: "20px",
            padding: "20px",
            justifyContent: "left",
          }}
        >
          <FlexRow style={{ fontSize: "1.2em" }}>
            <span style={{ float: "left" }}> City? </span>{" "}
            <input
              placeholder={"Boston"}
              type="text"
              style={{
                float: "right",
                width: "200px",
                height: "25px",
                fontSize: "1.2em",
              }}
              onChange={(event) => {
                setCity(event.target.value);
              }}
              value={city}
            ></input>
            <div style={{ clear: "both" }}></div>
          </FlexRow>
          <FlexRow style={{ fontSize: "1.2em" }}>
            <span style={{ float: "left" }}> Country? </span>{" "}
            <input
              placeholder={"USA"}
              type="text"
              style={{
                float: "right",
                width: "200px",
                height: "25px",
                fontSize: "1.2em",
              }}
              onChange={(event) => {
                setCountry(event.target.value);
              }}
              value={country}
            ></input>
            <div style={{ clear: "both" }}></div>
          </FlexRow>
          <p></p>
          <div
            style={{ float: "right", fontSize: "1.4em" }}
            onClick={() => {
              window.localStorage.setItem("city", city);
              window.localStorage.setItem("country", country);
              originalCity.current = city;
              originalCountry.current = country;
              fetchPrayerInfo(city, country);
              setChangeCityModal(false);
            }}
          >
            [Finished]
          </div>
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
            // height: "60vh",
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
