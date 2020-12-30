export const isBetween = (
  startKey: string,
  stopKey: string,
  now: Date,
  prayerTimings: any
): boolean => {
  try {
    let startString = prayerTimings[startKey];
    let stopString = prayerTimings[stopKey];

    let startTime = startString.split(" ")[0];
    let startHour = parseFloat(startTime.split(":")[0]);
    let startMinutes = parseFloat(startTime.split(":")[1]);
    let startTotal = startHour * 60 + startMinutes;

    let stopTime = stopString.split(" ")[0];
    let stopHour = parseFloat(stopTime.split(":")[0]);
    let stopMinutes = parseFloat(stopTime.split(":")[1]);
    let stopTotal = stopHour * 60 + stopMinutes;
    if (stopKey === "Imsak") {
      stopTotal += 24 * 60;
    }

    let nowTotal = now.getHours() * 60 + now.getMinutes();

    if (nowTotal > startTotal && nowTotal < stopTotal) {
      return true;
    }
  } catch (e) {
    //console.log('could not read date format correctly for',startKey,stopKey,now,prayerTimings);
  }

  return false;
};

export const getActivePrayer = (prayerTimings: any) => {
  let now = new Date();

  if (isBetween("Fajr", "Sunrise", now, prayerTimings)) {
    return "Fajr";
  }

  if (isBetween("Dhuhr", "Asr", now, prayerTimings)) {
    return "Dhuhr";
  }

  if (isBetween("Asr", "Maghrib", now, prayerTimings)) {
    return "Asr";
  }

  if (isBetween("Maghrib", "Isha", now, prayerTimings)) {
    return "Maghrib";
  }

  if (isBetween("Isha", "Imsak", now, prayerTimings)) {
    return "Isha";
  }
};
