export { LOCATION } from "./config/location";
import { LOCATION } from "./config/location";
export type { Weather } from "@/types/weather";
export type { Radar } from "@/types/radar";
export { getWeather } from "./weather/weatherApi";
export { getRadar } from "./weather/radarApi";
export const value = (n: number | null | undefined, digits = 0) =>
  n != null && Number.isFinite(n)
    ? n.toLocaleString("pt-BR", { maximumFractionDigits: digits })
    : "—";
export const time = (n: number) =>
  new Date(n * 1000).toLocaleTimeString("pt-BR", {
    timeZone: LOCATION.timezone,
    hour: "2-digit",
    minute: "2-digit",
  });
export const day = (n: number) =>
  new Date(n * 1000).toLocaleDateString("pt-BR", {
    timeZone: LOCATION.timezone,
    weekday: "short",
    day: "2-digit",
  });
export function condition(code: number | null | undefined) {
  if (code == null) return "Condição indisponível";
  if (code === 0) return "Céu limpo";
  if (code < 3) return "Parcialmente nublado";
  if (code === 3) return "Nublado";
  if (code < 50) return "Nevoeiro";
  if (code < 60) return "Garoa";
  if (code < 70) return "Chuva";
  if (code < 80) return "Neve";
  if (code < 90) return "Pancadas de chuva";
  return "Trovoadas";
}
