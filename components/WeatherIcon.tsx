"use client";
import {
  CloudSun,
  Sun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudFog,
  Snowflake,
  CircleHelp,
} from "lucide-react";
export default function WeatherIcon({
  code,
  size = 31,
  className = "",
}: {
  code?: number | null;
  size?: number;
  className?: string;
}) {
  const Icon =
    code == null
      ? CircleHelp
      : code === 0
        ? Sun
        : code < 3
          ? CloudSun
          : code === 3
            ? Cloud
            : code < 50
              ? CloudFog
              : code < 60
                ? CloudDrizzle
                : code < 70
                  ? CloudRain
                  : code < 80
                    ? Snowflake
                    : code < 90
                      ? CloudRain
                      : CloudLightning;
  return (
    <Icon
      size={size}
      className={className}
      strokeWidth={1.5}
      aria-hidden="true"
    />
  );
}
