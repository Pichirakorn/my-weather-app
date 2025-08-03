const apiKey = '0f6fd75d34178ff7a167f1a4b02b51dc';

const searchForm = document.querySelector('#search-form');
const cityInput = document.querySelector('#city-input');
const weatherInfoContainer = document.querySelector('#weather-info-container');
const forecastContainer = document.querySelector('#forecast-container');

function saveLastCity(city) {
    localStorage.setItem('lastCity', city);
}

function getLastCity() {
    return localStorage.getItem('lastCity');
}

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const cityName = cityInput.value.trim();

    if (cityName) {
        getWeather(cityName);
        getForecast(cityName);
        saveLastCity(cityName);
    } else {
        alert('กรุณาป้อนชื่อเมือง');
    }
});

async function getWeather(city) {
    weatherInfoContainer.innerHTML = `<p>กำลังโหลดข้อมูล...</p>`;
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=th`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('ไม่พบข้อมูลเมืองนี้');
        }
        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        weatherInfoContainer.innerHTML = `<p class="error">${error.message}</p>`;
    }
}

async function getForecast(city) {
    forecastContainer.innerHTML = `<h2>พยากรณ์อากาศล่วงหน้า 5 วัน</h2><p>กำลังโหลดข้อมูล...</p>`;
    const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=th`;

    try {
        const response = await fetch(forecastApiUrl);
        if (!response.ok) {
            throw new Error('ไม่พบข้อมูลพยากรณ์อากาศสำหรับเมืองนี้');
        }
        const data = await response.json();
        displayForecast(data);
    } catch (error) {
        forecastContainer.innerHTML = `<h2>พยากรณ์อากาศล่วงหน้า 5 วัน</h2><p class="error">${error.message}</p>`;
    }
}

function displayWeather(data) {
    const { name, main, weather, dt, sys } = data;
    const { temp, humidity } = main;
    const { description, icon } = weather[0];

    const body = document.body;
    body.classList.remove('day', 'night', 'hot', 'cold');

    const currentTime = dt;
    const sunrise = data.sys.sunrise;
    const sunset = data.sys.sunset;

    if (currentTime >= sunrise && currentTime < sunset) {
        body.classList.add('day');
    } else {
        body.classList.add('night');
    }

    if (temp > 25) {
        body.classList.add('hot');
    } else if (temp < 10) {
        body.classList.add('cold');
    }

    const weatherHtml = `
        <h2 class="text-2xl font-bold">${name}</h2>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
        <p class="temp">${temp.toFixed(1)}°C</p>
        <p>${description}</p>
        <p>ความชื้น: ${humidity}%</p>
    `;
    weatherInfoContainer.innerHTML = weatherHtml;
}

function displayForecast(data) {
    const dailyForecasts = {};

    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' });

        if (!dailyForecasts[day]) {
            dailyForecasts[day] = {
                temps: [],
                icons: [],
                descriptions: []
            };
        }
        dailyForecasts[day].temps.push(item.main.temp);
        dailyForecasts[day].icons.push(item.weather[0].icon);
        dailyForecasts[day].descriptions.push(item.weather[0].description);
    });

    let forecastHtml = '<h2>พยากรณ์อากาศล่วงหน้า 5 วัน</h2>';
    const daysToShow = Object.keys(dailyForecasts).slice(0, 5);

    daysToShow.forEach(day => {
        const temps = dailyForecasts[day].temps;
        const minTemp = Math.min(...temps).toFixed(1);
        const maxTemp = Math.max(...temps).toFixed(1);
        const icon = dailyForecasts[day].icons[0];
        const description = dailyForecasts[day].descriptions[0];

        forecastHtml += `
            <div class="forecast-day">
                <p><strong>${day}</strong></p>
                <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${description}">
                <div class="day-details">
                    <p class="temp-range">${minTemp}°C / ${maxTemp}°C</p>
                    <p>${description}</p>
                </div>
            </div>
        `;
    });
    forecastContainer.innerHTML = forecastHtml;
}


document.addEventListener('DOMContentLoaded', () => {
    const lastCity = getLastCity();
    if (lastCity) {
        cityInput.value = lastCity;
        getWeather(lastCity);
        getForecast(lastCity);
    } else {
        getWeather('Bangkok');
        getForecast('Bangkok');
    }
});