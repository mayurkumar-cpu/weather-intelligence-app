import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Search, Sun, Cloud, CloudRain, Wind, Droplets, Thermometer, AlertCircle, Calendar } from 'lucide-react';

interface WeatherData {
  city: string;
  country: string;
  temp: number;
  apparentTemp: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  daily: {
    time: string[];
    maxTemp: number[];
    minTemp: number[];
    weatherCode: number[];
  };
}

export default function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weather, setWeatherData] = useState<WeatherData | null>(null);

  const fetchWeather = async (cityName: string) => {
    if (!cityName.trim()) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Open-Meteo Geocoding API
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error(`City "${cityName}" not found. Please enter a valid city name.`);
      }

      const location = geoData.results[0];
      const { latitude, longitude, name, country } = location;

      // 2. Open-Meteo Forecast API
      const forecastRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
      );
      const forecastData = await forecastRes.json();

      setWeatherData({
        city: name,
        country: country || '',
        temp: forecastData.current.temperature_2m,
        apparentTemp: forecastData.current.apparent_temperature,
        humidity: forecastData.current.relative_humidity_2m,
        windSpeed: forecastData.current.wind_speed_10m,
        weatherCode: forecastData.current.weather_code,
        daily: {
          time: forecastData.daily.time,
          maxTemp: forecastData.daily.temperature_2m_max,
          minTemp: forecastData.daily.temperature_2m_min,
          weatherCode: forecastData.daily.weather_code,
        }
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch weather data. Please try again.');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeather(query);
  };

  const getRecommendation = (temp: number, code: number) => {
    if (code >= 51) return "☔ Carry an umbrella! Rain or precipitation expected today.";
    if (temp > 30) return "☀️ Stay hydrated! Light cotton clothing and sunscreen recommended.";
    if (temp < 15) return "🧥 Cool weather! Wear a warm jacket or sweater.";
    return "🌤️ Great weather for outdoor activities!";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-slate-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-indigo-900 flex items-center justify-center gap-3">
            <Sun className="w-10 h-10 text-amber-500 animate-spin-slow" /> Weather Intelligence App
          </h1>
          <p className="text-slate-600">Real-time weather insights & 7-day forecast powered by Open-Meteo</p>
        </header>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter city name (e.g., Chennai, London)..."
              className="w-full px-4 py-3 pl-11 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition duration-200 disabled:opacity-50 shadow-md"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-start gap-3 max-w-lg mx-auto shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <span className="text-red-700 font-medium">{error}</span>
          </div>
        )}

        {/* Current Weather Card */}
        {weather && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-50 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">{weather.city}, {weather.country}</h2>
                <div className="text-6xl font-extrabold text-indigo-600 my-2">
                  {Math.round(weather.temp)}°C
                </div>
                <p className="text-slate-500 flex items-center gap-1">
                  <Thermometer className="w-4 h-4" /> Feels like {Math.round(weather.apparentTemp)}°C
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <Droplets className="w-6 h-6 text-blue-500" />
                  <div>
                    <p className="text-xs text-slate-500">Humidity</p>
                    <p className="font-semibold text-slate-800">{weather.humidity}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Wind className="w-6 h-6 text-teal-500" />
                  <div>
                    <p className="text-xs text-slate-500">Wind Speed</p>
                    <p className="font-semibold text-slate-800">{weather.windSpeed} km/h</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Strategic Recommendations */}
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-900 font-medium shadow-sm">
              <h3 className="font-bold text-amber-900 mb-1">💡 Travel & Activity Recommendation:</h3>
              <p>{getRecommendation(weather.temp, weather.weatherCode)}</p>
            </div>

            {/* 7-Day Forecast */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-50">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" /> 7-Day Forecast
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                {weather.daily.time.map((date, idx) => (
                  <div key={date} className="bg-slate-50 p-3 rounded-xl text-center flex flex-col items-center justify-between border border-slate-100">
                    <p className="text-xs font-semibold text-slate-600">
                      {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })}
                    </p>
                    <div className="my-2 text-indigo-500">
                      {weather.daily.weatherCode[idx] >= 51 ? <CloudRain className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{Math.round(weather.daily.maxTemp[idx])}°</p>
                      <p className="text-xs text-slate-400">{Math.round(weather.daily.minTemp[idx])}°</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
