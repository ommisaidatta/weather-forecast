const weatherIcons = {
  Clear: "assets/forecastimages/clear.png",
  Clouds: "assets/forecastimages/cloud.png",
  Rain: "assets/forecastimages/rain.png",
  Snow: "assets/forecastimages/snow.png",
  Thunderstorm: "assets/forecastimages/thunderstorm.png",
  Drizzle: "assets/forecastimages/fog.png",
  Mist: "assets/forecastimages/fog.png",
  Haze: "assets/forecastimages/fog.png",
  Fog: "assets/forecastimages/fog.png"
};


const themeswitch = document.getElementById('theme-switch');

themeswitch.addEventListener("change", () => {
  document.body.classList.toggle("dark-theme");
});

const apiKey = "Your_Api_Key";  // Replace with your Api key Here

// 🌍 Get input and search button
const searchInput = document.querySelector(".search-btn input");
const searchIcon = document.querySelector(".search-btn i");
const locationBtn = document.getElementById("current-location-btn");


// 🌤 Main card elements
const mainWeatherCard = document.querySelector(".main-weather");
const locationName = document.querySelector(".location");
const weatherDate = document.querySelector('.weather-date');
const temp = document.querySelector(".temp");
const climate = document.querySelector(".climate");
const feelsLike = document.querySelector(".feels-like");

// 🌡 Highlights
const highlightItems = document.querySelectorAll(".highlight-item");
const pressureEl = highlightItems[0].querySelector("div:last-child");
const rainChanceEl = highlightItems[1].querySelector("div:last-child");
const windEl = highlightItems[2].querySelector("div:last-child");
const humidityEl = highlightItems[3].querySelector("div:last-child");

// ☀ Sunrise / Sunset
const sunriseEl = document.querySelector(".sun-card:nth-child(1) div:last-child");
const sunsetEl = document.querySelector(".sun-card:nth-child(2) div:last-child");

// 🗓 Forecast
const forecastContainer = document.querySelector(".forecast-list");

function getFormattedDate() {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return now.toLocaleDateString(undefined, options);
}
weatherDate.textContent = getFormattedDate();

// 🔍 Search event
searchIcon.addEventListener("click", () => {
  const city = searchInput.value.trim();
  if (city) getWeatherData(city);
});

searchInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") searchIcon.click();
});

// On page load, check if user previously allowed geolocation
window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('useCurrentLocation') === 'true') {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(successLocation, errorLocation);
    }
  }
});

// 📍 Current Location Button
locationBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      // Set flag in localStorage to remember user preference
      localStorage.setItem('useCurrentLocation', 'true');
      successLocation(position);
    }, errorLocation);
  } else {
    alert("Geolocation is not supported by this browser.");
  }
});

function successLocation(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  getWeatherByCoords(lat, lon);
}

function errorLocation() {
  // If geolocation fails, remove the flag so it doesn't keep trying
  localStorage.removeItem('useCurrentLocation');
  alert("Unable to retrieve your location.");
}

// 🌐 Fetch by city
async function getWeatherData(city) {
  try {
    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    const currentData = await currentRes.json();

    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
    );
    const forecastData = await forecastRes.json();

    updateUI(currentData, forecastData);

  } catch (err) {
    showWelcomeMessage("City not found or unable to fetch data.....");
    console.error(err);
  }
}

// 🌐 Fetch by coordinates
async function getWeatherByCoords(lat, lon) {
  try {
    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const currentData = await currentRes.json();

    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const forecastData = await forecastRes.json();

    updateUI(currentData, forecastData);

  } catch (err) {
    showWelcomeMessage("Unable to fetch weather for your location.....");
    console.error(err);
  }
}

// 🖼️ Update UI with weather data
function updateUI(currentData, forecastData) {
    const weatherMain = currentData.weather[0].main.toLowerCase();


  // ✅ Reset classes and add weather background class
  mainWeatherCard.className = "main-weather card";
  switch (weatherMain) {
    case "clear":
      mainWeatherCard.classList.add("weather-clear");
      break;
    case "clouds":
      mainWeatherCard.classList.add("weather-clouds");
      break;
    case "rain":
    case "drizzle":
      mainWeatherCard.classList.add("weather-rain");
      break;
    case "thunderstorm":
      mainWeatherCard.classList.add("weather-thunderstorm");
      break;
    case "snow":
      mainWeatherCard.classList.add("weather-snow");
      break;
    case "mist":
    case "haze":
    case "fog":
      mainWeatherCard.classList.add("weather-fog");
      break;
    default:
      mainWeatherCard.classList.add("weather-clear"); // fallback
    }

    weatherDate.textContent = getFormattedDate();

    
  // Normalize city name to remove diacritics
  const normalizedCityName = currentData.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  locationName.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${normalizedCityName}`;
  climate.textContent = currentData.weather[0].main;
  temp.textContent = `${Math.round(currentData.main.temp)}°C`;
  feelsLike.textContent = `Feels Like ${Math.round(currentData.main.feels_like)}°C`;

  pressureEl.textContent = `${currentData.main.pressure} hPa`;
  rainChanceEl.textContent = `${forecastData.list[0].pop * 100}%`;
  windEl.textContent = `${currentData.wind.speed} km/h`;
  humidityEl.textContent = `${currentData.main.humidity}%`;

  sunriseEl.textContent = convertUnixToTime(currentData.sys.sunrise);
  sunsetEl.textContent = convertUnixToTime(currentData.sys.sunset);

  const dailyForecast = forecastData.list.filter(item =>
    item.dt_txt.includes("12:00:00")
  );

  forecastContainer.innerHTML = "";
  dailyForecast.slice(0, 5).forEach(item => {
    const date = new Date(item.dt_txt);
    const day = date.toLocaleDateString("en-US", { weekday: "short" });
    // Use custom icon mapping
    const icon = weatherIcons[item.weather[0].main] || 'assets/forecastimages/default.png';
    const forecastHTML = `
      <div class="forecast-item">
        <div>${day}</div>
        <img src="${icon}" alt="${item.weather[0].main}">
        <div>${Math.round(item.main.temp)}°C</div>
      </div>
    `;
    forecastContainer.insertAdjacentHTML("beforeend", forecastHTML);
  });
}

// 🕐 Convert Unix Time to HH:MM AM/PM
function convertUnixToTime(unix) {
  const date = new Date(unix * 1000);
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  minutes = minutes.toString().padStart(2, "0");
  return `${hours}:${minutes} ${ampm}`;
}

