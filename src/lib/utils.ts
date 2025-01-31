import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export type Prayers = {
  date_for: string; // Date for the prayer times (e.g., "2025-1-31")
  fajr: string; // Fajr prayer time (e.g., "6:22 am")
  shurooq: string; // Shurooq (sunrise) time (e.g., "7:43 am")
  dhuhr: string; // Dhuhr prayer time (e.g., "1:01 pm")
  asr: string; // Asr prayer time (e.g., "3:50 pm")
  maghrib: string; // Maghrib prayer time (e.g., "6:19 pm")
  isha: string; // Isha prayer time (e.g., "7:35 pm")
};

export type PrayerTimesResponse = {
  status_valid: number;
  status_description: string;
  items: Prayers[];
  country: string;
  country_code: string;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
