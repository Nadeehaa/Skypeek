// API Key (Replace with your actual API key)
const API_KEY = '2a717e6ef003f58a9617f34e96514d9f';

// Function to Fetch Current Weather
async function fetchWeather() {
    const city = document.getElementById('search').value;
    if (!city) return alert("Enter a city!");

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod !== 200) throw new Error(data.message);

        document.getElementById('weather-data').innerHTML = `
            <h2>${data.name}, ${data.sys.country}</h2>
            <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather Icon">
            <p>${data.weather[0].description}</p>
            <p>🌡️ ${data.main.temp}°C</p>
            <button onclick="saveCity('${data.name}')">Save City</button>
        `;

        fetchForecast(city); // Fetch weather forecast when city is searched

    } catch (error) {
        alert("City not found!");
    }
}

// Function to Save City
function saveCity(city) {
    let cities = JSON.parse(localStorage.getItem('savedCities')) || [];
    if (!cities.includes(city)) {
        cities.push(city);
        localStorage.setItem('savedCities', JSON.stringify(cities));
        displaySavedCities();
    }
}

// Function to Display Saved Cities with Weather Details
async function displaySavedCities() {
    const savedList = document.getElementById('saved-city-list');
    savedList.innerHTML = "";
    let cities = JSON.parse(localStorage.getItem('savedCities')) || [];

    if (cities.length === 0) {
        savedList.innerHTML = "<p>No saved cities yet!</p>";
        return;
    }

    const cityWeatherPromises = cities.map(async (city) => {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.cod !== 200) throw new Error(data.message);

            return `
                <div class="saved-city">
                    <h3>${data.name}, ${data.sys.country}</h3>
                    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather Icon">
                    <p>${data.weather[0].description}</p>
                    <p>🌡️ ${data.main.temp}°C</p>
                </div>
            `;
        } catch (error) {
            console.error(`Error fetching weather for ${city}:`, error);
            return `<p>Could not fetch weather for ${city}.</p>`;
        }
    });

    const weatherData = await Promise.all(cityWeatherPromises);
    savedList.innerHTML = weatherData.join(""); // Combine all results and display them
}

// Function to Fetch and Display 7-Day Forecast
// Function to Fetch and Display Weekly Weather Forecast
async function fetchForecast() {
    const city = document.getElementById('forecast-city').value;
    if (!city) return alert("Enter a city!");

    // Get coordinates for the city (required for One Call API)
    const geoUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

    try {
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

        if (geoData.cod !== 200) throw new Error(geoData.message);

        const { lat, lon } = geoData.coord; // Get latitude and longitude

        // Fetch 7-day forecast using One Call API
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();

        if (forecastData.cod !== "200") throw new Error(forecastData.message);

        // Extract daily forecasts (group by date)
        let dailyForecasts = {};
        forecastData.list.forEach((item) => {
            let date = item.dt_txt.split(" ")[0]; // Extract date (YYYY-MM-DD)
            if (!dailyForecasts[date]) {
                dailyForecasts[date] = {
                    temp: item.main.temp,
                    description: item.weather[0].description,
                    icon: item.weather[0].icon
                };
            }
        });

        // Display Forecast
        const forecastContainer = document.getElementById('forecast-data');
        forecastContainer.innerHTML = `<h3>7-Day Forecast for ${geoData.name}, ${geoData.sys.country}</h3>`;

        Object.keys(dailyForecasts).forEach(date => {
            const day = dailyForecasts[date];
            forecastContainer.innerHTML += `
                <div class="forecast-day">
                    <h4>${date}</h4>
                    <img src="https://openweathermap.org/img/wn/${day.icon}@2x.png" alt="Weather Icon">
                    <p>${day.description}</p>
                    <p>🌡️ ${day.temp}°C</p>
                </div>
            `;
        });

    } catch (error) {
        alert("City not found or error fetching forecast!");
        console.error(error);
    }
}


// Function to Toggle Celsius/Fahrenheit
document.getElementById("unit-toggle").addEventListener("click", function() {
    let unitLabel = this.innerText.includes("°C") ? "°F" : "°C";
    this.innerText = `Click to Change (${unitLabel})`;
});

// Function to Show Sections
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
}

// Load Saved Cities on Page Load
window.onload = displaySavedCities;
