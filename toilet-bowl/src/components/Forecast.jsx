// src/components/Forecast.jsx
import { useEffect, useState } from "react";

export default function Forecast() {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  // Newton Park, Glen Ellyn, IL
  const LAT = 41.875;
  const LON = -88.063;

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current_weather=true`
        );
        const data = await res.json();
        setWeather(data.current_weather);
      } catch (err) {
        setError("Could not load weather.");
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000); // refresh every 30 min
    return () => clearInterval(interval);
  }, []);

  const getIcon = (code) => {
    // Simple icon set for Open-Meteo weathercode
    if ([0].includes(code)) return "☀️";
    if ([1, 2].includes(code)) return "🌤️";
    if ([3].includes(code)) return "☁️";
    if ([45, 48].includes(code)) return "🌫️";
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "🌧️";
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
    if ([95, 96, 99].includes(code)) return "⛈️";
    return "🌡️";
  };

  return (
    <section id="forecast" className="forecast">
      <h2>Game-Day Forecast</h2>

      {error && <p className="error">{error}</p>}
      {!weather && !error && <p>Loading forecast...</p>}

      {weather && (
        <div className="forecast-box">
          <span className="icon">{getIcon(weather.weathercode)}</span>
          <div className="forecast-info">
            <p>Temperature: {(weather.temperature * 9 / 5 + 32).toFixed(1)}°F</p>
            <p className="desc">
              Wind {Math.round(weather.windspeed)} mph
            </p>
            <p className="update-time">
              Updated {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
