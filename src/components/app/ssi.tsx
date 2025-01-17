"use client";
import { useEffect, useState } from "react";
import { default as twConfig } from "../../../tailwind.config";
const screens = Object.fromEntries(
  Object.entries(twConfig.theme.screens).map(([k, v]) => [
    k,
    v.replace("px", ""),
  ]),
);
function mapPxToSize(px: number): string {
  const breakpoints = Object.entries(screens)
    .map(([label, size]) => ({ label, size }))
    .sort((a, b) => Number(a.size) - Number(b.size));

  if (px < Number(breakpoints[0]?.size)) {
    return "default";
  }

  let screenSize = breakpoints[0]?.label; // Default to the smallest size

  breakpoints.forEach((breakpoint) => {
    if (px >= Number(breakpoint.size)) {
      screenSize = breakpoint.label;
    }
  });

  return screenSize as string;
}

interface Color {
  [key: string]: string;
}

const colorMapping: Color = {
  default: "bg-purple-500",
  sm: "bg-green-500",
  md: "bg-fuchsia-500",
  lg: "bg-amber-500",
  xl: "bg-red-500",
  "2xl": "bg-blue-500",
  GT2xl: "bg-pink-500",
};

const ScreenSizeIndicator = () => {
  const [screenSize, setScreenSize] = useState<string>(mapPxToSize(0));
  const [actualSize, setActualSize] = useState<number>(0);
  useEffect(() => {
    setScreenSize(mapPxToSize(window.innerWidth));
    setActualSize(window.innerWidth);

    const handleResize = () => {
      setScreenSize(mapPxToSize(window?.innerWidth));
      setActualSize(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`fixed top-0 z-40 flex pl-2 pr-2 text-white hover:hidden ${
        colorMapping[screenSize] || "bg-red-500"
      } ${process.env.NODE_ENV === "production" ? "hidden" : ""}`}
    >
      <p className="font-bold italic">{screenSize.toUpperCase()}</p>{" "}
      <p className="pl-2 font-light italic text-gray-300">[{actualSize}px]</p>
    </div>
  );
};

export default ScreenSizeIndicator;
