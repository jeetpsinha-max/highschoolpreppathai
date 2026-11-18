import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Extract a human-readable message from an unknown thrown value. */
export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message || fallback;
  }
  return fallback;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
