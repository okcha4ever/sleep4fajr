import { type PrayerTimesResponse } from "@src/lib/utils";

console.log("background script loaded!");
const proxyBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "https://sleep4fajr.onrender.com";
const BEDTIME_ALARM_PREFIX = "sleep4fajr-bedtime-";
const BEDTIME_NOTIFICATION_ICON = "icon192x192.png";

type SleepTimeKey =
  | "oneCycle"
  | "twoCycles"
  | "threeCycles"
  | "fourCycles"
  | "fiveCycles"
  | "sixCycles";

type SleepTimes = Record<SleepTimeKey, string>;

type SleepAlarm = {
  key: SleepTimeKey;
  label: string;
  triggerAt: number;
};

/**
 * Calculate optimal sleep times based on Fajr time (06:30 AM).
 */
function parseTimeStringToDate(timeString: string, baseDate = new Date()) {
  const [time, modifier] = timeString.split(" ");
  let [hours, minutes] = time.split(":");

  if (modifier === "pm" && hours !== "12") {
    hours = String(Number(hours) + 12);
  } else if (modifier === "am" && hours === "12") {
    hours = "00";
  }

  const parsedDate = new Date(baseDate);
  parsedDate.setHours(Number(hours), Number(minutes), 0, 0);

  return parsedDate;
}

function calculateOptimalBedTimes(fajrTimeString: string): SleepTimes {
  const now = new Date();
  const fajrTime = parseTimeStringToDate(fajrTimeString, now);

  // If the current time is past the fajrTime, set it to the next day
  if (now > fajrTime) {
    fajrTime.setDate(fajrTime.getDate() + 1);
  }

  const calculateBedTime = (cycles: number) => {
    const totalSleepTime = cycles * 90 + 15; // 90 minutes per cycle + 15 minutes to fall asleep
    return new Date(
      fajrTime.getTime() - totalSleepTime * 60000,
    ).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return {
    oneCycle: calculateBedTime(1),
    twoCycles: calculateBedTime(2),
    threeCycles: calculateBedTime(3),
    fourCycles: calculateBedTime(4),
    fiveCycles: calculateBedTime(5),
    sixCycles: calculateBedTime(6),
  };
}

function getSleepAlarmSchedule(fajrTimeString: string): SleepAlarm[] {
  const now = new Date();
  const fajrTime = parseTimeStringToDate(fajrTimeString, now);

  if (now > fajrTime) {
    fajrTime.setDate(fajrTime.getDate() + 1);
  }

  const cycles: Array<{ key: SleepTimeKey; cycles: number; label: string }> = [
    { key: "oneCycle", cycles: 1, label: "1 cycle" },
    { key: "twoCycles", cycles: 2, label: "2 cycles" },
    { key: "threeCycles", cycles: 3, label: "3 cycles" },
    { key: "fourCycles", cycles: 4, label: "4 cycles" },
    { key: "fiveCycles", cycles: 5, label: "5 cycles" },
    { key: "sixCycles", cycles: 6, label: "6 cycles" },
  ];

  return cycles
    .map(({ key, cycles, label }) => ({
      key,
      label,
      triggerAt: fajrTime.getTime() - (cycles * 90 + 15) * 60_000,
    }))
    .filter(({ triggerAt }) => triggerAt > now.getTime());
}

async function clearBedtimeAlarms() {
  const alarms = await chrome.alarms.getAll();
  await Promise.all(
    alarms
      .filter((alarm) => alarm.name.startsWith(BEDTIME_ALARM_PREFIX))
      .map((alarm) => chrome.alarms.clear(alarm.name)),
  );
}

async function scheduleBedtimeNotifications(fajrTimeString: string) {
  await clearBedtimeAlarms();

  const sleepSchedule = getSleepAlarmSchedule(fajrTimeString);

  await Promise.all(
    sleepSchedule.map(({ key, triggerAt }) =>
      chrome.alarms.create(`${BEDTIME_ALARM_PREFIX}${key}`, { when: triggerAt }),
    ),
  );

  await chrome.storage.local.set({
    bedtimeSchedule: sleepSchedule,
    bedtimeFajrTime: fajrTimeString,
  });
}

/*
 * Fetch Prayer times
 */

async function fetchData(
  location: string,
  date?: string,
): Promise<PrayerTimesResponse> {
  try {
    const prayerUrl = new URL("/api/prayer-times", proxyBaseUrl);
    prayerUrl.searchParams.set("location", location);

    if (date) {
      prayerUrl.searchParams.set("date", date);
    }

    const response = await fetch(prayerUrl.toString(), {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      throw new Error(
        errorPayload?.error ||
          `Prayer time proxy failed with status ${response.status}`,
      );
    }

    const prayerTimes = (await response.json()) as PrayerTimesResponse;

    await chrome.storage.local.set({ prayerTimes: prayerTimes });
    const fajrTime = prayerTimes.items?.[0]?.fajr;

    if (fajrTime) {
      await scheduleBedtimeNotifications(fajrTime);
    }

    return prayerTimes;
  } catch (err) {
    console.error("Error fetching data:", err);
    throw err; // Propagate the error
  }
}

/**
 * Fetch Prayer times
 */

const refetchData = async () => {
  try {
    // Get the current location from sync storage
    const storage = await chrome.storage.sync.get("location");
    const location = storage.location;

    if (!location) {
      throw new Error("No location found in storage.");
    }

    // Fetch new prayer times based on the location
    const newPrayerTimes = await fetchData(location);

    // Return the new prayer times
    return newPrayerTimes;
  } catch (error) {
    console.error("Failed to refetch data:", error);
    throw error; // Propagate the error
  }
};

// chrome.runtime.onInstalled.addListener(async () => {
//   // Fetch data on extension installation or reload
//   refetchData();
// });

// Event listener for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed, initializing notifications...");
});

chrome.runtime.onStartup.addListener(async () => {
  const storage = await chrome.storage.local.get("prayerTimes");
  const fajrTime = (storage.prayerTimes as PrayerTimesResponse | undefined)
    ?.items?.[0]?.fajr;

  if (fajrTime) {
    await scheduleBedtimeNotifications(fajrTime);
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (!alarm.name.startsWith(BEDTIME_ALARM_PREFIX)) {
    return;
  }

  const storage = await chrome.storage.local.get(["bedtimeSchedule", "location"]);
  const bedtimeSchedule = (storage.bedtimeSchedule as SleepAlarm[] | undefined) || [];
  const matchedAlarm = bedtimeSchedule.find(
    ({ key }) => `${BEDTIME_ALARM_PREFIX}${key}` === alarm.name,
  );

  if (!matchedAlarm) {
    return;
  }

  const locationSuffix = storage.location ? ` for ${storage.location}` : "";

  await chrome.notifications.create(alarm.name, {
    type: "basic",
    iconUrl: BEDTIME_NOTIFICATION_ICON,
    title: "Sleep4Fajr bedtime reminder",
    message: `It's time to sleep${locationSuffix}. This bedtime lines up with ${matchedAlarm.label} before Fajr.`,
  });
});

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.type === "REFETCH_DATA") {
    refetchData()
      .then((newPrayerTimes) => {
        sendResponse({ success: true, data: newPrayerTimes });
      })
      .catch((error) => {
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      });

    return true;
  }

  if (message.type === "getPrayerTimes") {
    chrome.storage.local.get("prayerTimes").then((data) => {
      sendResponse(data.prayerTimes);
    });

    return true;
  }

  if (message.type === "GET_SLEEP_TIMES") {
    const fajrTime = message.fajrTime || "6:30 am";
    sendResponse(calculateOptimalBedTimes(fajrTime));
    return false;
  }

  return false;
});
