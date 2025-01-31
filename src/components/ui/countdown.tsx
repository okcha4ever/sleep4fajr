import { useEffect, useState } from "react";

function Countdown({ fajrTime }: { fajrTime: string }) {
  const [counter, setCounter] = useState("");

  useEffect(() => {
    const updateCounter = () => {
      const now = new Date();

      // Parse the fajrTime string (e.g., '6:22 am') into a Date object
      const [time, modifier] = fajrTime.split(" ");
      let [hours, minutes] = time.split(":").map((num) => parseInt(num, 10));

      // Convert to 24-hour format
      if (modifier === "pm" && hours < 12) {
        hours += 12;
      } else if (modifier === "am" && hours === 12) {
        hours = 0; // Midnight case
      }

      const fajrDate = new Date(now);
      fajrDate.setHours(hours, minutes, 0, 0);

      // If the current time is already past the Fajr time, set it for the next day
      if (now > fajrDate) {
        fajrDate.setDate(fajrDate.getDate() + 1);
      }

      const diff = fajrDate.getTime() - now.getTime();
      const hoursRemaining = Math.floor(diff / (1000 * 60 * 60));
      const minutesRemaining = Math.floor(
        (diff % (1000 * 60 * 60)) / (1000 * 60),
      );
      const secondsRemaining = Math.floor((diff % (1000 * 60)) / 1000);

      setCounter(
        `${String(hoursRemaining).padStart(2, "0")}:${String(minutesRemaining).padStart(2, "0")}:${String(secondsRemaining).padStart(2, "0")}`,
      );
    };

    // Initialize the counter
    updateCounter();

    // Update every second
    const timer = setInterval(updateCounter, 1000);

    // Clean up the interval on component unmount
    return () => clearInterval(timer);
  }, [fajrTime]); // Dependency array makes sure it updates when fajrTime changes

  return <div>{counter}</div>;
}

export default Countdown;
