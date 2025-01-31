import { useEffect, useState } from "react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { ArrowLeft } from "lucide-react";
import { Prayers, PrayerTimesResponse } from "@src/lib/utils";

type SidebarProps = {
  prayers: Prayers;
  toggleSidebar: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ prayers, toggleSidebar }) => {
  return (
    <div className="absolute inset-0 transition-transform duration-300 ease-in-out translate-x-0">
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
            <li className="flex justify-between items-center border-b pb-2">
              <span className="text-lg">Fajr</span>
              <span className="text-xl font-semibold">{prayers?.fajr}</span>
            </li>
            <li className="flex justify-between items-center border-b pb-2">
              <span className="text-lg">Shurooq</span>
              <span className="text-xl font-semibold">{prayers?.shurooq}</span>
            </li>
            <li className="flex justify-between items-center border-b pb-2">
              <span className="text-lg">Dhuhr</span>
              <span className="text-xl font-semibold">{prayers?.dhuhr}</span>
            </li>
            <li className="flex justify-between items-center border-b pb-2">
              <span className="text-lg">Asr</span>
              <span className="text-xl font-semibold">{prayers?.asr}</span>
            </li>
            <li className="flex justify-between items-center border-b pb-2">
              <span className="text-lg">Maghrib</span>
              <span className="text-xl font-semibold">{prayers?.maghrib}</span>
            </li>
            <li className="flex justify-between items-center border-b pb-2">
              <span className="text-lg">Isha</span>
              <span className="text-xl font-semibold">{prayers?.isha}</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sidebar;
