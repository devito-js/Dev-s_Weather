import { LOCATION } from "@/lib/config/location";
import type { Weather } from "@/types/weather";
import { fetchJSON } from "./http";
export async function getWeather(signal?: AbortSignal): Promise<Weather> {
  const params = new URLSearchParams({
    latitude: String(LOCATION.latitude),
    longitude: String(LOCATION.longitude),
    timezone: LOCATION.timezone,
    timeformat: "unixtime",
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m",
    hourly: "temperature_2m,precipitation,precipitation_probability",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max",
    past_days: "2",
    forecast_days: "7",
  });
  const data = (await fetchJSON(
    `https://api.open-meteo.com/v1/forecast?${params}`,
    signal,
  )) as Weather;
  if (
    !data?.current ||
    !Number.isFinite(data.current.time) ||
    !Array.isArray(data.hourly?.time) ||
    !Array.isArray(data.daily?.time)
  )
    throw new Error("Resposta meteorológica inválida");
  for (const [group, keys] of [
    [
      data.hourly,
      ["temperature_2m", "precipitation", "precipitation_probability"],
    ],
    [
      data.daily,
      [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "precipitation_sum",
        "precipitation_probability_max",
      ],
    ],
  ] as const) {
    for (const key of keys) {
      const values = (group as unknown as Record<string, unknown>)[key];
      if (!Array.isArray(values) || values.length !== group.time.length)
        throw new Error("Série meteorológica incompleta");
    }
  }
  for (const group of [data.hourly, data.daily]) {
    if (group.time.some((t) => !Number.isFinite(t)))
      throw new Error("Horários inválidos");
    for (const key of Object.keys(group)) {
      if (key === "time") continue;
      const record = group as unknown as Record<string, (number | null)[]>;
      record[key] = record[key].map((n) =>
        typeof n === "number" && Number.isFinite(n) ? n : null,
      );
    }
  }
  for (const key of [
    "temperature_2m",
    "relative_humidity_2m",
    "apparent_temperature",
    "precipitation",
    "weather_code",
    "surface_pressure",
    "wind_speed_10m",
    "wind_direction_10m",
  ] as const) {
    if (
      typeof data.current[key] !== "number" ||
      !Number.isFinite(data.current[key])
    )
      data.current[key] = null;
  }
  return data;
}
