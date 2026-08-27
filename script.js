const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const weather = document.getElementById("weather");
const loading = document.getElementById("loading");
const error = document.getElementById("error");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");

const weatherCodes = {
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Foggy",
    51: "Light Drizzle",
    53: "Drizzle",
    55: "Heavy Drizzle",
    61: "Light Rain",
    63: "Rain",
    65: "Heavy Rain",
    71: "Light Snow",
    73: "Snow",
    75: "Heavy Snow",
    80: "Rain Showers",
    81: "Rain Showers",
    82: "Heavy Rain Showers",
    95: "Thunderstorm",
    96: "Thunderstorm with Hail",
    99: "Thunderstorm with Hail"
};

async function getWeather(latitude, longitude, name) {
    try {
        loading.style.display = "block";
        weather.style.display = "none";
        error.style.display = "none";

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Weather data could not be loaded");
        }

        const data = await response.json();
        const current = data.current;

        cityName.textContent = name;
        temperature.textContent = `${Math.round(current.temperature_2m)}°C`;
        condition.textContent = weatherCodes[current.weather_code] || "Unknown";
        feelsLike.textContent = `${Math.round(current.apparent_temperature)}°C`;
        humidity.textContent = `${current.relative_humidity_2m}%`;
        wind.textContent = `${Math.round(current.wind_speed_10m)} km/h`;

        loading.style.display = "none";
        weather.style.display = "block";
    } catch (err) {
        loading.style.display = "none";
        error.textContent = "Unable to fetch weather data.";
        error.style.display = "block";
    }
}

async function searchCity() {
    const city = cityInput.value.trim();

    if (!city) {
        error.textContent = "Please enter a city name.";
        error.style.display = "block";
        weather.style.display = "none";
        return;
    }

    try {
        loading.style.display = "block";
        error.style.display = "none";
        weather.style.display = "none";

        const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            throw new Error("City not found");
        }

        const location = data.results[0];

        await getWeather(
            location.latitude,
            location.longitude,
            `${location.name}, ${location.country}`
        );
    } catch (err) {
        loading.style.display = "none";
        error.textContent = "City not found. Please try another city.";
        error.style.display = "block";
    }
}

function useLocation() {
    if (!navigator.geolocation) {
        error.textContent = "Geolocation is not supported by your browser.";
        error.style.display = "block";
        return;
    }

    loading.style.display = "block";
    error.style.display = "none";

    navigator.geolocation.getCurrentPosition(
        async position => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            await getWeather(latitude, longitude, "Your Location");
        },
        () => {
            loading.style.display = "none";
            error.textContent = "Unable to access your location.";
            error.style.display = "block";
        }
    );
}

searchBtn.addEventListener("click", searchCity);

locationBtn.addEventListener("click", useLocation);

cityInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        searchCity();
    }
});
