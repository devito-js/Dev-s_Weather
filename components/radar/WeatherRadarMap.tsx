"use client";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LOCATION, Radar } from "@/lib/weather";
export default function WeatherRadarMap({
  radar,
  frame,
  opacity,
  coverage,
  reset,
}: {
  radar: Radar | null;
  frame: number;
  opacity: number;
  coverage: boolean;
  reset: number;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.TileLayer | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!container.current) return;
    const m = L.map(container.current, {
      center: [LOCATION.latitude, LOCATION.longitude],
      zoom: LOCATION.zoom,
      minZoom: 4,
      maxZoom: 12,
      scrollWheelZoom: false,
    });
    map.current = m;
    const base = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(m);
    base.on("tileerror", () =>
      setError("Mapa-base indisponível. Verifique sua conexão."),
    );
    L.circleMarker([LOCATION.latitude, LOCATION.longitude], {
      radius: 8,
      color: "#fff",
      weight: 3,
      fillColor: "#164e45",
      fillOpacity: 1,
    })
      .addTo(m)
      .bindTooltip(`${LOCATION.name} · ${LOCATION.state}`, {
        permanent: true,
        direction: "top",
        offset: [0, -9],
      });
    const observer = new ResizeObserver(() => m.invalidateSize());
    observer.observe(container.current);
    return () => {
      observer.disconnect();
      m.remove();
      map.current = null;
    };
  }, []);
  useEffect(() => {
    const m = map.current;
    const f = radar?.frames[frame];
    if (!m || !radar || !f) return;
    setError("");
    layer.current?.remove();
    const tile = L.tileLayer(f.tileUrl, {
      opacity,
      tileSize: 512,
      zoomOffset: -1,
      maxNativeZoom: 8,
      maxZoom: 12,
      attribution: radar.attribution,
      keepBuffer: 0,
    }).addTo(m);
    layer.current = tile;
    tile.on("tileerror", () =>
      setError(
        "Alguns blocos do radar não carregaram. A cobertura pode estar incompleta.",
      ),
    );
    return () => {
      tile.remove();
    };
  }, [radar, frame]);
  useEffect(() => {
    layer.current?.setOpacity(opacity);
  }, [opacity]);
  useEffect(() => {
    const m = map.current;
    if (!m || !radar?.coverageUrl || !coverage) return;
    const mask = L.tileLayer(radar.coverageUrl, {
      opacity: 0.4,
      tileSize: 512,
      zoomOffset: -1,
      maxNativeZoom: 8,
      maxZoom: 12,
    }).addTo(m);
    return () => {
      mask.remove();
    };
  }, [coverage, radar]);
  useEffect(() => {
    map.current?.setView(
      [LOCATION.latitude, LOCATION.longitude],
      LOCATION.zoom,
    );
  }, [reset]);
  return (
    <>
      <div
        ref={container}
        className="map"
        aria-label="Mapa de radar de chuva centrado em Pompeia, São Paulo"
      />
      {error && (
        <div className="map-error" role="status">
          {error}
        </div>
      )}
    </>
  );
}
