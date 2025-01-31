import { type PrayerTimesResponse } from "@src/lib/utils";

console.log("background script loaded!");
const api_key = process.env.APi_KEY;

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
  const url = date
    ? `https://muslimsalat.com/${location}/${date}.json?key=${api_key}`
    : `https://muslimsalat.com/${location}.json?key=${api_key}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();

    // Filter and extract the desired fields from the API response
    const prayerTimes: PrayerTimesResponse = {
      status_valid: result.status_valid,
      status_description: result.status_description,
      items: result.items,
      country: result.country,
      country_code: result.country_code,
    };

    // Store the filtered data in chrome storage
    await chrome.storage.local.set({ prayerTimes: prayerTimes });

    // Return the filtered data
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
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.type === "REFETCH_DATA") {
    refetchData()
      .then((newPrayerTimes) => {
        sendResponse({ success: true, data: newPrayerTimes });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });

    // Return true to indicate that the response will be sent asynchronously
    return true;
  }
});

// chrome.runtime.onInstalled.addListener(async () => {
//   // Fetch data on extension installation or reload
//   refetchData();
// });

// Listen for messages to get the filtered data
chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (request.type === "getPrayerTimes") {
    chrome.storage.local.get("prayerTimes", (data) => {
      sendResponse(data.prayerTimes);
    });
    return true; // Keep the message channel open for asynchronous response
  }
});

// Event listener for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed, initializing notifications...");
});

// Event listener for calculateOptimalBedTimes
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.type === "GET_SLEEP_TIMES") {
    // Extract fajrTime from the message
    const fajrTime = message.fajrTime || "6:30 am"; // Default to "6:30 am" if not provided
    const sleepTimes = calculateOptimalBedTimes(fajrTime);
    sendResponse(sleepTimes);
  }
  return true; // Required to use sendResponse asynchronously
});
