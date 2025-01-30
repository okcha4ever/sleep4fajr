import { useState, useEffect } from "react";
import { Input } from "./input";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Menu, ArrowLeft, ExternalLink } from "lucide-react";

// Placeholder for prayer times
const prayerTimes = [
  { name: "Fajr", time: "06:30" },
  { name: "Dhuhr", time: "00:00" },
  { name: "Asr", time: "00:00" },
  { name: "Maghrib", time: "00:00" },
  { name: "Isha", time: "00:00" },
];

interface SleepTimes {
  oneCycle: string;
  twoCycles: string;
  threeCycles: string;
  fourCycles: string;
  fiveCycles: string;
  sixCycles: string;
}

export default function ExtensionUI() {
  const [location, setLocation] = useState("");
  const [counter, setCounter] = useState("");
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sleepTimes, setSleepTimes] = useState<SleepTimes>({
    oneCycle: "",
    twoCycles: "",
    threeCycles: "",
    fourCycles: "",
    fiveCycles: "",
    sixCycles: "",
  });

  // Fetch sleep times from background script
  useEffect(() => {
    chrome.runtime.sendMessage(
      { type: "GET_SLEEP_TIMES" },
      (response: SleepTimes) => {
        if (response) {
          setSleepTimes(response);
        }
      },
    );
  }, []);

  // Countdown to Fajr
  useEffect(() => {
    const updateCounter = () => {
      const now = new Date();
      const fajrTime = new Date(now);
      fajrTime.setHours(6, 30, 0, 0);

      if (now > fajrTime) {
        fajrTime.setDate(fajrTime.getDate() + 1);
      }

      const diff = fajrTime.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCounter(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
      );
    };

    updateCounter();
    const timer = setInterval(updateCounter, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleApply = async () => {
    console.log(`Fetching prayer times for ${location}`);
    // Add your prayer times fetching logic here
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <div className="w-[400px] h-[600px] bg-background text-foreground relative overflow-hidden">
      {/* Main UI */}
      <div
        className={`absolute inset-0 transition-transform duration-300 ease-in-out ${sidebarVisible ? "translate-x-[-100%]" : "translate-x-0"}`}
      >
        <div className="p-4 flex flex-col h-full">
          <header className="text-2xl font-bold mb-4 text-center flex justify-between items-center">
            <span>Prayer Times</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              aria-label="Show prayer times"
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
              className="flex-grow"
            />
            <Button onClick={handleApply}>Apply</Button>
          </div>
          <div className="text-2xl font-bold mb-2 text-center">{counter}</div>
          <p className="text-sm text-center text-muted-foreground mb-2">
            Time until Fajr prayer (06:30 AM)
          </p>
          <p className="text-sm text-center text-muted-foreground mb-2">
            Optimal bed times:
          </p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {Object.entries(sleepTimes)
              .reverse() // Reverse the order of the array
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
          <div className="mt-auto">
            <p className="text-sm text-center text-muted-foreground mb-4">
              The average human takes 16 minutes to fall asleep.
              <br></br>
              <br></br>
              If you wake up at one of these times, you’ll rise in between
              90-minute sleep cycles. A good night’s sleep consists of 5-6
              complete sleep cycles.
            </p>
            <footer className="pt-4 border-t text-center">
              <a
                href="https://your-portfolio-url.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary hover:underline"
              >
                Visit My Portfolio
                <ExternalLink className="ml-1 h-4 w-4" />
              </a>
            </footer>
          </div>
        </div>
      </div>

      {/* Sidebar for Prayer Times */}
      <div
        className={`absolute inset-0 transition-transform duration-300 ease-in-out ${sidebarVisible ? "translate-x-0" : "translate-x-[100%]"}`}
      >
        <Card className="w-full h-full rounded-none">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="mr-2"
              aria-label="Go back"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <CardTitle className="text-lg">Prayer Times</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {prayerTimes.map((prayer) => (
                <li
                  key={prayer.name}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <span className="text-lg">{prayer.name}</span>
                  <span className="text-xl font-semibold">{prayer.time}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
