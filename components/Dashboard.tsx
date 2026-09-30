"use client";
import WeatherIcon from "./WeatherIcon";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import {
  CloudSun,
  Radar as RadarIcon,
  Satellite,
  MapPin,
  RefreshCw,
  ArrowUpRight,
  Droplets,
  Wind,
  Gauge,
  CloudRain,
  Play,
  Pause,
  Crosshair,
  ChevronRight,
  Radio,
  Sun,
  Clock3,
  Layers,
} from "lucide-react";
import { useSource } from "@/hooks/useSource";
import { weatherConfig, LOCATION } from "@/lib/config/location";
import { satelliteSource } from "@/lib/weather/satelliteApi";
import {
  getWeather,
  getRadar,
  value,
  time,
  day,
  condition,
} from "@/lib/weather";
const RadarMap = dynamic(() => import("./radar/WeatherRadarMap"), {
  ssr: false,
  loading: () => (
    <div className="map map-loading">Preparando mapa regional…</div>
  ),
});
const external = { target: "_blank", rel: "noopener noreferrer" };
export default function Dashboard() {
  const [request, setRequest] = useState(0);
  const weatherSource = useSource(
    getWeather,
    weatherConfig.refresh.weather,
    request,
  );
  const radarSource = useSource(getRadar, weatherConfig.refresh.radar, request);
  const weather = weatherSource.data;
  const radar = radarSource.data;
  const loading = weatherSource.loading || radarSource.loading;
  const errors = {
    weather: weatherSource.error
      ? "Não foi possível atualizar o Open-Meteo."
      : "",
    radar: radarSource.error ? "RainViewer indisponível neste momento." : "",
  };
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [opacity, setOpacity] = useState(0.65);
  const [coverage, setCoverage] = useState(false);
  const [reset, setReset] = useState(0);
  const [tab, setTab] = useState("radar");
  const [period, setPeriod] = useState("forecast");
  const [now, setNow] = useState(0);
  const [satelliteLoaded, setSatelliteLoaded] = useState(false);
  const refresh = useCallback(() => setRequest((n) => n + 1), []);
  useEffect(() => {
    if (radar) {
      setFrame(radar.frames.length - 1);
      setPlaying(false);
    }
  }, [radar]);
  useEffect(() => {
    setNow(Date.now() / 1000);
    const id = setInterval(() => setNow(Date.now() / 1000), 60000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (!playing || !radar) return;
    const id = setInterval(() => {
      if (!document.hidden) setFrame((f) => (f + 1) % radar.frames.length);
    }, 6000);
    return () => clearInterval(id);
  }, [playing, radar]);
  const c = weather?.current;
  const today = new Date(now * 1000).toLocaleDateString("en-CA", {
    timeZone: LOCATION.timezone,
  });
  const days =
    weather?.daily.time
      .map((t, i) => ({ t, i }))
      .filter(
        ({ t }) =>
          new Date(t * 1000).toLocaleDateString("en-CA", {
            timeZone: LOCATION.timezone,
          }) >= today,
      )
      .slice(0, 7) || [];
  const hours =
    weather?.hourly.time
      .map((t, i) => ({ t, i }))
      .filter(({ t }) =>
        period === "forecast"
          ? t >= now && t < now + 86400
          : t < now && t >= now - 86400,
      )
      .slice(0, 24) || [];
  const temps = hours
    .map(({ i }) => weather!.hourly.temperature_2m[i])
    .filter((n): n is number => n !== null && Number.isFinite(n));
  const low = Math.min(...temps) - 3;
  const high = Math.max(...temps) + 3;
  const stale = !!c && now - c.time > 7200;
  return (
    <div className="shell">
      <aside className="sidebar">
        <a className="brand" href="#overview">
          <span className="brand-icon">
            <CloudSun size={25} />
          </span>
          <span>
            Dev&apos;s Weather<small>CLIMA & CONEXÃO</small>
          </span>
        </a>
        <div className="nav-caption">EXPLORAR</div>
        <nav>
          <a className="active" href="#overview">
            <CloudSun size={18} /> Visão geral
          </a>
          <a href="#monitor" onClick={() => setTab("radar")}>
            <RadarIcon size={18} /> Radar de chuva
          </a>
          <a href="#monitor" onClick={() => setTab("satellite")}>
            <Satellite size={18} /> Satélite
          </a>
          <a href="#forecast">
            <Sun size={18} /> Previsão
          </a>
          <a href="#history" onClick={() => setPeriod("history")}>
            <Clock3 size={18} /> Histórico
          </a>
        </nav>
        <div className="region-card">
          <MapPin size={20} />
          <small>SUA REGIÃO</small>
          <strong>Pompeia, SP</strong>
          <span>Interior de São Paulo · Brasil</span>
          <div className="coordinates">
            {Math.abs(LOCATION.latitude).toLocaleString("pt-BR")}° S &nbsp;{" "}
            {Math.abs(LOCATION.longitude).toLocaleString("pt-BR")}° O
          </div>
        </div>
        <div className="sidebar-bottom">
          <span className="dot" /> Dados públicos, conexão aberta.
          <p>Uma nova perspectiva do tempo.</p>
          <span className="version">DEV&apos;S WEATHER / v1.0</span>
        </div>
      </aside>
      <main id="overview">
        <header className="topbar">
          <span>Monitoramento Meteorológico Regional</span>
          <a href="https://portal.inmet.gov.br/" {...external}>
            Portal INMET <ArrowUpRight size={14} />
          </a>
        </header>
        <section className="page-heading">
          <div>
            <div className="eyebrow">
              <span className="dot" /> SEU HORIZONTE, EM DETALHES
            </div>
            <h1>
              O tempo em Pompeia<span>.</span>
            </h1>
            <p>
              <MapPin size={14} /> Pompeia – SP, Brasil{" "}
              <span className="separator">/</span> Horário de Brasília
            </p>
          </div>
          <button className="refresh" onClick={refresh} disabled={loading}>
            <RefreshCw size={15} className={loading ? "spin" : ""} />
            {loading ? "Atualizando…" : "Atualizar dados"}
          </button>
        </section>
        {(errors.weather || stale) && (
          <div className="notice" role="status">
            {errors.weather ||
              "A atualização disponível tem mais de duas horas."}{" "}
            {weather
              ? "Exibindo a última resposta recebida; confira o horário."
              : "Os valores ficarão indisponíveis até a conexão retornar."}
          </div>
        )}
        <section
          className={`conditions ${weatherSource.loading && !weather ? "is-loading" : ""}`}
        >
          <article className="current-card">
            <div className="current-label">
              AGORA EM POMPEIA{" "}
              <span>
                {loading
                  ? "CARREGANDO"
                  : weather
                    ? "MODELO METEOROLÓGICO"
                    : "INDISPONÍVEL"}
              </span>
            </div>
            <div className="temperature-row">
              <div>
                <div className="temperature">
                  {value(c?.temperature_2m)}
                  <span>°C</span>
                </div>
                <h2>{condition(c?.weather_code)}</h2>
                <p>Sensação térmica de {value(c?.apparent_temperature)}°</p>
              </div>
              <WeatherIcon
                code={c?.weather_code}
                className="hero-weather"
                size={100}
              />
            </div>
            <div className="current-footer">
              <span>
                ↑ {value(weather?.daily.temperature_2m_max[days[0]?.i])}° &nbsp;
                ↓ {value(weather?.daily.temperature_2m_min[days[0]?.i])}°
              </span>
              <small>
                {c ? `Referência ${time(c.time)}` : "Aguardando Open-Meteo"}
              </small>
            </div>
          </article>
          <div className="metrics">
            {[
              {
                label: "Umidade relativa",
                number: c?.relative_humidity_2m,
                unit: "%",
                icon: Droplets,
                note: "Umidade do ar a 2 metros",
              },
              {
                label: "Vento",
                number: c?.wind_speed_10m,
                unit: "km/h",
                icon: Wind,
                note:
                  c?.wind_direction_10m != null
                    ? `Origem ${value(c.wind_direction_10m)}° · ${["N", "NE", "L", "SE", "S", "SO", "O", "NO"][Math.round(c.wind_direction_10m / 45) % 8]}`
                    : "Direção indisponível",
              },
              {
                label: "Pressão atmosférica",
                number: c?.surface_pressure,
                unit: "hPa",
                icon: Gauge,
                note: "Pressão na superfície",
              },
              {
                label: "Precipitação",
                number: c?.precipitation,
                unit: "mm",
                icon: CloudRain,
                note: "Acumulado do intervalo de 15 min",
              },
            ].map((item) => (
              <article className="metric" key={item.label}>
                <div>
                  <span>{item.label}</span>
                  <item.icon size={19} />
                </div>
                <strong>
                  {value(item.number, 1)} <small>{item.unit}</small>
                </strong>
                <p>{item.note}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="monitor-section" id="monitor">
          <div className="section-heading">
            <div>
              <h2>Um olhar sobre a região</h2>
              <p>Acompanhe a chuva e explore o céu do interior paulista.</p>
            </div>
            <span className="subtle-badge">
              <span className="dot" /> FONTES PÚBLICAS
            </span>
          </div>
          <div className="map-card">
            <div className="map-toolbar">
              <div className="tabs">
                <button
                  className={tab === "radar" ? "selected" : ""}
                  onClick={() => setTab("radar")}
                >
                  <RadarIcon size={16} /> Radar de chuva
                </button>
                <button
                  className={tab === "satellite" ? "selected" : ""}
                  onClick={() => {
                    setTab("satellite");
                    setPlaying(false);
                  }}
                >
                  <Satellite size={16} /> Satélite
                </button>
              </div>
              {tab === "radar" && (
                <button
                  className="icon-button"
                  aria-label="Centralizar em Pompeia"
                  onClick={() => setReset((n) => n + 1)}
                >
                  <Crosshair size={19} />
                </button>
              )}
            </div>
            {tab === "radar" ? (
              <>
                <div className="map-wrap">
                  <RadarMap
                    radar={radar}
                    frame={frame}
                    opacity={opacity}
                    coverage={coverage}
                    reset={reset}
                  />
                  <div className="map-label">
                    <span className="dot" /> POMPEIA E REGIÃO{" "}
                    <small>Radar observado · últimas 2 horas</small>
                  </div>
                </div>
                {errors.radar && (
                  <div className="notice" role="status">
                    {errors.radar}{" "}
                    {radar
                      ? "Os quadros anteriores podem estar desatualizados."
                      : "Mapa-base disponível sem dados de chuva."}
                  </div>
                )}
                <div className="playback">
                  <button
                    className="play-button"
                    disabled={!radar}
                    aria-label={
                      playing ? "Pausar animação" : "Reproduzir animação"
                    }
                    onClick={() => setPlaying(!playing)}
                  >
                    {playing ? <Pause size={17} /> : <Play size={17} />}
                  </button>
                  <span className="frame-time">
                    {radar
                      ? time(
                          radar.frames[Math.min(frame, radar.frames.length - 1)]
                            .timestamp,
                        )
                      : "—:—"}
                  </span>
                  <input
                    aria-label="Quadro do radar"
                    type="range"
                    min={0}
                    max={Math.max(0, (radar?.frames.length || 1) - 1)}
                    value={frame}
                    disabled={!radar}
                    onChange={(e) => {
                      setPlaying(false);
                      setFrame(Number(e.target.value));
                    }}
                  />
                  <span className="playback-end">
                    {radar ? day(radar.frames[frame].timestamp) : "Sem quadros"}
                  </span>
                </div>
                <div className="map-options">
                  <label>
                    <Layers size={14} /> Opacidade{" "}
                    <input
                      aria-label="Opacidade do radar"
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={opacity}
                      onChange={(e) => setOpacity(Number(e.target.value))}
                    />
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={coverage}
                      onChange={(e) => setCoverage(e.target.checked)}
                    />{" "}
                    Mostrar áreas sem cobertura
                  </label>
                  <span>Refletividade · paleta RainViewer</span>
                </div>
                <p className="map-note">
                  Áreas sem ecos podem indicar ausência de chuva ou de
                  cobertura.{" "}
                  {coverage
                    ? "A máscara escura indica áreas sem cobertura. "
                    : ""}
                  Quadro:{" "}
                  {radar
                    ? new Date(
                        radar.frames[frame].timestamp * 1000,
                      ).toLocaleString("pt-BR", {
                        timeZone: LOCATION.timezone,
                      })
                    : "indisponível"}
                  .{" "}
                  <a href="https://www.rainviewer.com" {...external}>
                    Weather data by RainViewer ↗
                  </a>
                </p>
              </>
            ) : (
              <div className="satellite-panel">
                <div className="satellite-intro">
                  <Satellite size={32} />
                  <h3>Satélite GOES · INPE/CPTEC</h3>
                  <p>
                    Imagens e animações no visualizador oficial DSAT. A
                    disponibilidade da incorporação depende do provedor.
                  </p>
                  <div className="satellite-actions">
                    <button
                      className="refresh"
                      onClick={() => setSatelliteLoaded(true)}
                    >
                      Carregar visualizador
                    </button>
                    <a href="https://www.cptec.inpe.br/dsat/" {...external}>
                      Abrir DSAT <ArrowUpRight size={16} />
                    </a>
                  </div>
                </div>
                {satelliteLoaded && (
                  <>
                    <iframe
                      title="Imagens de satélite DSAT INPE CPTEC"
                      src={satelliteSource.viewerUrl}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <p className="map-note">
                      Se o visualizador não aparecer, use “Abrir DSAT” para
                      consultar as imagens no portal oficial.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </section>
        <section id="history" className="hourly-card">
          <div className="section-heading">
            <div>
              <h2>
                {period === "forecast"
                  ? "Nas próximas 24 horas"
                  : "Últimas 24 horas"}
              </h2>
              <p>
                Temperatura e precipitação ·{" "}
                {period === "forecast"
                  ? "previsão horária"
                  : "histórico recente do modelo"}
              </p>
            </div>
            <div className="tabs">
              <button
                className={period === "forecast" ? "selected" : ""}
                onClick={() => setPeriod("forecast")}
              >
                Previsão
              </button>
              <button
                className={period === "history" ? "selected" : ""}
                onClick={() => setPeriod("history")}
              >
                Histórico
              </button>
            </div>
          </div>
          {hours.length ? (
            <div className="chart-scroll">
              <div className="hourly-chart">
                {hours.map(({ t, i }) => {
                  const temp = weather!.hourly.temperature_2m[i];
                  return (
                    <div className="hour-column" key={t}>
                      <span>{time(t)}</span>
                      <div className="chart-track">
                        <div
                          className="temp-point"
                          style={{
                            bottom:
                              temp == null
                                ? "50%"
                                : `${15 + ((temp - low) / (high - low)) * 65}%`,
                          }}
                        >
                          <b>{value(temp)}°</b>
                          <i />
                        </div>
                      </div>
                      <CloudRain size={15} />
                      <small>
                        {value(weather!.hourly.precipitation[i], 1)} mm
                      </small>
                      <small className="muted">
                        {value(weather!.hourly.precipitation_probability[i])}%
                      </small>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="empty">
              {loading
                ? "Buscando a série horária…"
                : "Série horária indisponível. Tente atualizar os dados."}
            </div>
          )}
        </section>
        <section id="forecast">
          <div className="section-heading">
            <div>
              <h2>Planeje os próximos dias</h2>
              <p>Previsão de 7 dias para Pompeia</p>
            </div>
            <span className="source-label">
              OPEN-METEO <ArrowUpRight size={13} />
            </span>
          </div>
          <div className="forecast-grid">
            {days.length ? (
              days.map(({ t, i }, index) => (
                <article
                  className={`day-card ${index === 0 ? "today" : ""}`}
                  key={t}
                >
                  <h3>{index === 0 ? "Hoje" : day(t)}</h3>
                  <WeatherIcon code={weather!.daily.weather_code[i]} />
                  <p>{condition(weather!.daily.weather_code[i])}</p>
                  <div>
                    <strong>
                      {value(weather!.daily.temperature_2m_max[i])}°
                    </strong>
                    <span>{value(weather!.daily.temperature_2m_min[i])}°</span>
                  </div>
                  <small>
                    <Droplets size={12} />
                    {value(weather!.daily.precipitation_probability_max[i])}% ·{" "}
                    {value(weather!.daily.precipitation_sum[i], 1)} mm
                  </small>
                </article>
              ))
            ) : (
              <div className="empty">
                {loading ? "Carregando previsão…" : "Previsão indisponível."}
              </div>
            )}
          </div>
        </section>
        <section className="source-status" aria-label="Status das fontes">
          <h2>Fontes de dados</h2>
          <div>
            {[
              {
                name: "Previsão · Open-Meteo",
                source: weatherSource,
                stale: stale,
              },
              {
                name: "Radar · RainViewer",
                source: radarSource,
                stale:
                  !!radar &&
                  now - radar.frames[radar.frames.length - 1].timestamp > 1800,
              },
            ].map(({ name, source, stale: old }) => (
              <article key={name}>
                <strong>{name}</strong>
                <span className={source.error || old ? "status-warning" : ""}>
                  {source.loading
                    ? "Atualizando…"
                    : source.error
                      ? "Temporariamente indisponível"
                      : old
                        ? "Dados desatualizados"
                        : source.data
                          ? "Resposta recebida"
                          : "Sem dados"}
                </span>
                <small>
                  {source.updatedAt
                    ? "Última consulta: " + time(source.updatedAt)
                    : "Aguardando conexão"}
                </small>
              </article>
            ))}
            <article>
              <strong>Satélite · INPE/CPTEC</strong>
              <span>Visualizador externo</span>
              <small>Disponibilidade não monitorada</small>
            </article>
            <article>
              <strong>INMET</strong>
              <span>Consulta ao portal oficial</span>
              <small>Sem integração de medições</small>
            </article>
          </div>
        </section>
        <section className="bottom-grid">
          <article className="sources">
            <h2>Informação que vem da fonte.</h2>
            <p>Dados abertos para acompanhar o tempo com contexto.</p>
            <div>
              <a href="https://open-meteo.com/" {...external}>
                <span>
                  Open-Meteo<small>Previsão e histórico de modelos</small>
                </span>
                <ArrowUpRight size={18} />
              </a>
              <a href="https://portal.inmet.gov.br/" {...external}>
                <span>
                  INMET<small>Estações e avisos meteorológicos oficiais</small>
                </span>
                <ArrowUpRight size={18} />
              </a>
              <a href="https://www.cptec.inpe.br/dsat/" {...external}>
                <span>
                  INPE / CPTEC<small>Imagens de satélite no DSAT</small>
                </span>
                <ArrowUpRight size={18} />
              </a>
            </div>
          </article>
          <article className="station">
            <Radio size={27} />
            <span className="subtle-badge">PRÓXIMO HORIZONTE</span>
            <h2>
              Mais perto do clima.
              <br />
              Mais perto de você.
            </h2>
            <p>
              Arquitetura preparada para uma futura estação ESP32 em Pompeia.
            </p>
            <span className="station-status">
              <span /> Estação local ainda não conectada{" "}
              <ChevronRight size={14} />
            </span>
          </article>
        </section>
        <footer>
          <span>
            <CloudSun size={17} /> Dev&apos;s Weather{" "}
            <small>· Monitoramento Meteorológico Regional</small>
          </span>
          <p>
            Open-Meteo: estimativas de modelos, não medições locais. Previsão:
            atualização a cada 15 min; radar: a cada 10 min.
          </p>
        </footer>
      </main>
    </div>
  );
}
