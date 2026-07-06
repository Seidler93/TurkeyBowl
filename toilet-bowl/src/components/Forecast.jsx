import { useEffect, useState } from "react";

const LAT = 41.875;
const LON = -88.063;
const GAME_DAY = "2026-11-26";

function formatDisplayDate(dateString) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function buildForecastUrl(dateString) {
  const params = new URLSearchParams({
    latitude: LAT,
    longitude: LON,
    daily: "weathercode,temperature_2m_max,temperature_2m_min,windspeed_10m_max",
    temperature_unit: "fahrenheit",
    windspeed_unit: "mph",
    timezone: "America/Chicago",
    start_date: dateString,
    end_date: dateString,
  });

  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

function getDailyForecast(data) {
  if (!data?.daily?.time?.length) return null;

  return {
    date: data.daily.time[0],
    weathercode: data.daily.weathercode?.[0],
    high: data.daily.temperature_2m_max?.[0],
    low: data.daily.temperature_2m_min?.[0],
    wind: data.daily.windspeed_10m_max?.[0],
  };
}

async function fetchDailyForecast(dateString) {
  const res = await fetch(buildForecastUrl(dateString));
  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.reason || "Forecast is unavailable.");
  }

  const forecast = getDailyForecast(data);
  if (!forecast) {
    throw new Error("Forecast response did not include daily weather.");
  }

  return forecast;
}

export default function Forecast() {
  const [forecast, setForecast] = useState(null);
  const [label, setLabel] = useState("Game day");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const gameDayForecast = await fetchDailyForecast(GAME_DAY);
        setForecast(gameDayForecast);
        setLabel("Game day");
        setError(null);
      } catch (gameDayError) {
        console.info("Game-day forecast unavailable, showing today's forecast:", gameDayError);

        try {
          const todayForecast = await fetchDailyForecast(getTodayDate());
          setForecast(todayForecast);
          setLabel("Today's");
          setError(null);
        } catch (todayError) {
          console.error("Could not load weather:", todayError);
          setForecast(null);
          setError("Could not load weather.");
        }
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getDescription = (code) => {
    if ([0].includes(code)) return "Sunny";
    if ([1, 2].includes(code)) return "Partly cloudy";
    if ([3].includes(code)) return "Cloudy";
    if ([45, 48].includes(code)) return "Fog";
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "Rain";
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
    if ([95, 96, 99].includes(code)) return "Storms";
    return "Weather";
  };

  return (
    <section id="forecast" className="forecast">
      <h2>Game-Day Forecast</h2>

      {error && <p className="error">{error}</p>}
      {!forecast && !error && <p>Loading forecast...</p>}

      {forecast && (
        <div className="forecast-box">
          <span className="icon">{getDescription(forecast.weathercode)}</span>
          <div className="forecast-info">
            <p>{label} forecast for {formatDisplayDate(forecast.date)}</p>
            <p>High: {Math.round(forecast.high)} F | Low: {Math.round(forecast.low)} F</p>
            <p className="desc">Wind up to {Math.round(forecast.wind)} mph</p>
            <p className="update-time">
              Updated {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
