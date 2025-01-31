import { useState, useEffect } from "react";
import { Input } from "./input";
import { Button } from "./button";
import { Menu } from "lucide-react";
import Sidebar from "./sidebar";
import Countdown from "./countdown";
import { Prayers, PrayerTimesResponse } from "@src/lib/utils";

type SleepTimes = {
  oneCycle: string;
  twoCycles: string;
  threeCycles: string;
  fourCycles: string;
  fiveCycles: string;
  sixCycles: string;
};

export default function ExtensionUI() {
  const [location, setLocation] = useState("");
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sleepTimes, setSleepTimes] = useState<SleepTimes>({
    oneCycle: "",
    twoCycles: "",
    threeCycles: "",
    fourCycles: "",
    fiveCycles: "",
    sixCycles: "",
  });

  // Fetch prayer times from background script
  const [prayers, setPrayers] = useState<Prayers>();

  const getPrayerTimesFromStorage = async () => {
    try {
      const storage = await chrome.storage.local.get("prayerTimes");
      const prayerTimesResponse = storage.prayerTimes as PrayerTimesResponse;
      setPrayers(prayerTimesResponse.items[0]);
    } catch (err) {
      console.error(
        "Error accessing chrome.storage.local for prayerTimes:",
        err,
      );
    }
  };

  function capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Fetch prayer times and location on initial load
  useEffect(() => {
    getPrayerTimesFromStorage();

    const checkStorageForLocation = async () => {
      const storage = await chrome.storage.sync.get("location");
      if (storage.location) {
        setLocation(capitalizeFirstLetter(storage.location));
      }
    };
    checkStorageForLocation();
  }, []);

  // Refetch prayer times and update sleep times when location changes
  useEffect(() => {
    if (location) {
      getPrayerTimesFromStorage();
    }
  }, [location]);

  // Update sleep times when prayers change
  useEffect(() => {
    if (prayers) {
      const fajrTime = prayers.fajr;

      chrome.runtime.sendMessage(
        { type: "GET_SLEEP_TIMES", fajrTime: fajrTime },
        (response: SleepTimes) => {
          if (response) {
            setSleepTimes(response);
          }
        },
      );
    }
  }, [prayers]);

  const handleApply = async () => {
    try {
      const storage = chrome?.storage?.sync || browser?.storage?.sync;
      if (!storage) {
        throw new Error("Storage API is not available.");
      }

      // Save the new location
      await storage.set({ location: location.toLowerCase() });

      // Trigger a refetch of data in the background script
      chrome.runtime.sendMessage({ type: "REFETCH_DATA" }, (response) => {
        if (response?.success) {
          // Refetch prayer times after the background script reloads
          getPrayerTimesFromStorage();
        } else {
          console.log("Failed to reload background script:", response?.error);
        }
      });
    } catch (error) {
      console.error("Failed to save location to storage:", error);
    }
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleApply();
    }
  };

  return (
    <div className="w-[400px] h-[450px] bg-background text-foreground relative overflow-hidden">
      <div
        className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
          sidebarVisible ? "translate-x-[-100%]" : "translate-x-0"
        }`}
      >
        <div className="p-4 flex flex-col h-full">
          <header className="text-2xl font-bold mb-4 text-center flex justify-between items-center">
            <span>Sleep4Fajr</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              aria-label="Show prayer times"
              disabled={!location} // Disable the button if location is empty
            >
              <Menu className="h-6 w-6" />
            </Button>
          </header>
          <div className="mb-4 flex space-x-2">
            <Input
              type="text"
              placeholder="Enter country or place"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={handleKeyDown} // Add keydown event listener
              className="flex-grow"
            />
            <Button onClick={handleApply}>Apply</Button>
          </div>
          {location && ( // Only show countdown if location is set
            <div className="text-2xl font-bold mb-2 text-center">
              <Countdown fajrTime={prayers?.fajr || "00:00 am"} />
            </div>
          )}
          {!location && ( // Show note only when location is empty
            <p className="text-sm text-center text-muted-foreground mb-2">
              Start typing in the input field above and press Enter to get the
              info you need!
            </p>
          )}
          {location && ( // Only render the bottom half if location is not empty
            <>
              <p className="text-sm text-center text-muted-foreground mb-2">
                Time until Fajr prayer ({prayers?.fajr})
              </p>
              <p className="text-sm text-center text-muted-foreground mb-2">
                Optimal bed times:
              </p>
              <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                {Object.entries(sleepTimes)
                  .reverse()
                  .map(([key, value]) => (
                    <div key={key} className="border rounded p-2 text-sm">
                      {value}
                      {key.split("Cycles")[0] === "six" ||
                      key.split("Cycles")[0] === "five" ? (
                        <>
                          {" "}
                          <span className="text-xs font-semibold text-yellow-400">
                            SUGGESTED
                          </span>
                        </>
                      ) : null}
                    </div>
                  ))}
              </div>
              <p className="text-sm text-center text-muted-foreground mb-4">
                The average human takes 16 minutes to fall asleep.
                <br />
                If you wake up at one of these times, you’ll rise in between
                90-minute sleep cycles. A good night’s sleep consists of 5-6
                complete sleep cycles.
              </p>
            </>
          )}
        </div>
      </div>
      {/* Sidebar for Prayer Times */}
      <div
        className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
          sidebarVisible ? "translate-x-0" : "translate-x-[100%]"
        }`}
      >
        <Sidebar prayers={prayers!} toggleSidebar={toggleSidebar} />
      </div>
    </div>
  );
}
