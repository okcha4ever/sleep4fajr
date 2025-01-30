console.log("background script loaded!");
// background.ts

const cycleLength = 90; // Sleep cycle duration in minutes
const fallAsleepTime = 15; // Time to fall asleep in minutes

/**
 * Calculate optimal sleep times based on Fajr time (06:30 AM).
 */
function calculateOptimalBedTimes() {
  const now = new Date();
  const fajrTime = new Date(now);
  fajrTime.setHours(6, 30, 0, 0);

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

/**
 * Schedule alarms for Fajr and sleep notifications.
 */
function scheduleNotifications() {
  const now = new Date();
  const fajrTime = new Date(now);
  fajrTime.setHours(6, 30, 0, 0);

  if (now > fajrTime) {
    fajrTime.setDate(fajrTime.getDate() + 1);
  }

  const timeUntilFajr = fajrTime.getTime() - now.getTime();

  // Schedule notifications
  chrome.alarms.create("sleepCycleNotification", { delayInMinutes: 0.1 }); // Testing purposes
  chrome.alarms.create("fajrNotification", {
    when: Date.now() + timeUntilFajr,
  });
}

// Event listener for extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log("Browser started, initializing notifications...");
  scheduleNotifications();
});

// Event listener for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed, initializing notifications...");
  scheduleNotifications();
});

// Event listener for alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "sleepCycleNotification") {
    const { fiveCycles, sixCycles } = calculateOptimalBedTimes();
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png", // Update this to the actual icon in your extension
      title: "Optimal Sleep Times",
      message: `Sleep at ${fiveCycles} or ${sixCycles} for optimal rest.`,
    });
  } else if (alarm.name === "fajrNotification") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png", // Update this to the actual icon in your extension
      title: "Fajr Alert",
      message: "It's time for Fajr prayer (06:30 AM).",
    });

    // Reschedule for the next day
    scheduleNotifications();
  }
});

// Event listener for messages from the popup UI
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.type === "GET_SLEEP_TIMES") {
    const sleepTimes = calculateOptimalBedTimes();
    sendResponse(sleepTimes);
  }
});
