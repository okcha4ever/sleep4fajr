import { type PrayerTimesResponse } from "@src/lib/utils";

console.log("background script loaded!");
const proxyBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8787";

/**
 * Calculate optimal sleep times based on Fajr time (06:30 AM).
 */
function calculateOptimalBedTimes(fajrTimeString: string) {
  const now = new Date();

  // Parse the fajrTimeString into a Date object
  const [time, modifier] = fajrTimeString.split(" ");
  let [hours, minutes] = time.split(":");

  // Convert to 24-hour format
  if (modifier === "pm" && hours !== "12") {
    hours = String(Number(hours) + 12);
  } else if (modifier === "am" && hours === "12") {
    hours = "00";
  }

  const fajrTime = new Date(now);
  fajrTime.setHours(Number(hours), Number(minutes), 0, 0);

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
