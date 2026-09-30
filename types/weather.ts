export type Weather = {
  current: {
    time: number;
    temperature_2m: number | null;
    relative_humidity_2m: number | null;
    apparent_temperature: number | null;
    precipitation: number | null;
    weather_code: number | null;
    surface_pressure: number | null;
    wind_speed_10m: number | null;
    wind_direction_10m: number | null;
  };
  hourly: {
    time: number[];
    temperature_2m: (number | null)[];
    precipitation: (number | null)[];
    precipitation_probability: (number | null)[];
  };
  daily: {
    time: number[];
    weather_code: (number | null)[];
    temperature_2m_max: (number | null)[];
    temperature_2m_min: (number | null)[];
    precipitation_sum: (number | null)[];
    precipitation_probability_max: (number | null)[];
  };
};
// Contrato para um futuro adaptador de estação. Nenhum dispositivo está conectado.
export interface StationReading {
  source: "esp32";
  stationId: string;
  measuredAt: string;
  latitude: number;
  longitude: number;
  temperatureC: number | null;
  humidityPercent: number | null;
  pressureHpa: number | null;
  windKmh: number | null;
  windDirectionDegrees: number | null;
  precipitationMm: number | null;
}
export interface StationProvider {
  getLatest(signal?: AbortSignal): Promise<StationReading>;
}
