import { fetchJSON } from "./http";
import type { Radar } from "@/types/radar";
interface RainViewerResponse {
  host: string;
  radar: { past: { time: number; path: string }[] };
}
export async function getRadar(signal?: AbortSignal): Promise<Radar> {
  const data = (await fetchJSON(
    "https://api.rainviewer.com/public/weather-maps.json",
    signal,
  )) as RainViewerResponse;
  if (
    !data?.host?.startsWith("https://") ||
    !Array.isArray(data.radar?.past) ||
    !data.radar.past.length ||
    data.radar.past.some(
      (f) =>
        !Number.isFinite(f.time) ||
        !/^\/v2\/radar\/[a-zA-Z0-9_-]+$/.test(f.path),
    )
  )
    throw new Error("Radar indisponível");
  return {
    frames: data.radar.past.map((f) => ({
      timestamp: f.time,
      tileUrl: `${data.host}${f.path}/512/{z}/{x}/{y}/2/1_0.png`,
    })),
    coverageUrl: `${data.host}/v2/coverage/0/512/{z}/{x}/{y}/0/0_0.png`,
    attribution:
      '<a href="https://www.rainviewer.com">Weather data by RainViewer</a>',
  };
}
