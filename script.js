const apiKey = 'ba31892845a74ffbab065702252303';
const searchBtn = document.getElementById('search-btn');
const locationInput = document.getElementById('location');
const weatherInfo = document.getElementById('weather-info');
const loading = document.getElementById('loading');
const error = document.getElementById('error');

// Add event listeners
searchBtn.addEventListener('click', getWeather);
locationInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getWeather();
    }
});

// Initialize with default theme
setTheme('clear', true);

function getWeather() {
    const location = locationInput.value.trim();
    
    if (!location) {
        alert('Please enter a location');
        return;
    }
    
    // Display loading message and hide previous results
    loading.style.display = 'block';
    weatherInfo.style.display = 'none';
    error.style.display = 'none';
    
    // Fetch weather data
    fetchWeatherData(location);
}

async function fetchWeatherData(location) {
    try {
        // Current weather data
        const currentWeatherResponse = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}&aqi=no`);
        
        if (!currentWeatherResponse.ok) {
            throw new Error('Weather data not found');
        }
        
        const currentWeatherData = await currentWeatherResponse.json();
        
        // Forecast data - 5 days
        const forecastResponse = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=5&aqi=no&alerts=no`);
        
        if (!forecastResponse.ok) {
            throw new Error('Forecast data not found');
        }
        
        const forecastData = await forecastResponse.json();
        
        // Set theme based on weather condition
        setThemeBasedOnWeather(currentWeatherData);
        
        // Update UI with weather data
        updateWeatherUI(currentWeatherData, forecastData);
        
        // Hide loading, show weather info
        loading.style.display = 'none';
        weatherInfo.style.display = 'block';
        
    } catch (error) {
        console.error('Error fetching weather data:', error);
        loading.style.display = 'none';
        document.getElementById('error').style.display = 'block';
    }
}

function updateWeatherUI(currentData, forecastData) {
    // Update current weather
    document.getElementById('location-display').textContent = `${currentData.location.name}, ${currentData.location.country}`;
    document.getElementById('current-date').textContent = formatDate(new Date(currentData.location.localtime));
    document.getElementById('weather-description').textContent = currentData.current.condition.text;
    document.getElementById('weather-icon').src = `https:${currentData.current.condition.icon}`;
    document.getElementById('temp-main').textContent = `${Math.round(currentData.current.temp_c)}°C`;
    document.getElementById('feels-like').textContent = `${Math.round(currentData.current.feelslike_c)}°C`;
    document.getElementById('humidity').textContent = `${currentData.current.humidity}%`;
    document.getElementById('wind-speed').textContent = `${currentData.current.wind_kph} km/h`;
    document.getElementById('pressure').textContent = `${currentData.current.pressure_mb} hPa`;
    
    // Update forecast
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = '';
    
    forecastData.forecast.forecastday.forEach((day) => {
        const date = new Date(day.date);
        const dayName = getDayName(date);
        
        const forecastDayElement = document.createElement('div');
        forecastDayElement.className = 'forecast-day';
        forecastDayElement.innerHTML = `
            <p><strong>${dayName}</strong></p>
            <p>${formatDateShort(date)}</p>
            <img class="forecast-icon" src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
            <p>${Math.round(day.day.maxtemp_c)}°C / ${Math.round(day.day.mintemp_c)}°C</p>
            <p>${day.day.condition.text}</p>
        `;
        
        forecastContainer.appendChild(forecastDayElement);
    });

    // Add subtle color effects to forecast days based on temperature
    const forecastDays = document.querySelectorAll('.forecast-day');
    forecastDays.forEach((day, index) => {
        const dayData = forecastData.forecast.forecastday[index].day;
        const maxTemp = dayData.maxtemp_c;
        
        if (maxTemp > 30) {
            day.style.borderLeft = '4px solid #ff5e5e';
        } else if (maxTemp > 25) {
            day.style.borderLeft = '4px solid #ffac3c';
        } else if (maxTemp > 15) {
            day.style.borderLeft = '4px solid #ffde59';
        } else if (maxTemp > 5) {
            day.style.borderLeft = '4px solid #59b7ff';
        } else {
            day.style.borderLeft = '4px solid #59e0ff';
        }
    });
}

function setThemeBasedOnWeather(weatherData) {
    const condition = weatherData.current.condition.text.toLowerCase();
    const isDay = weatherData.current.is_day === 1;
    const temp = weatherData.current.temp_c;
    
    if (!isDay) {
        setTheme('night');
        return;
    }
    
    if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('shower')) {
        setTheme('rain');
    } else if (condition.includes('snow') || condition.includes('sleet') || condition.includes('ice')) {
        setTheme('snow');
    } else if (condition.includes('thunder') || condition.includes('storm')) {
        setTheme('storm');
    } else if (condition.includes('cloud') || condition.includes('overcast')) {
        setTheme('cloudy');
    } else if (temp > 30) {
        setTheme('hot');
    } else if (temp < 5) {
        setTheme('cold');
    } else {
        setTheme('clear');
    }
}

function setTheme(themeName, isInitial = false) {
    // Remove all theme classes
    document.body.classList.remove('theme-clear', 'theme-cloudy', 'theme-rain', 'theme-snow', 'theme-storm', 'theme-hot', 'theme-cold', 'theme-night');
    
    // Add the new theme class
    document.body.classList.add(`theme-${themeName}`);
    document.body.classList.add('gradient-bg');
    
    // Set button color based on theme
    if (themeName === 'night') {
        searchBtn.style.backgroundColor = '#3498db';
        document.documentElement.style.setProperty('--text-color', '#f5f5f5');
    } else if (themeName === 'hot') {
        searchBtn.style.backgroundColor = '#e74c3c';
    } else if (themeName === 'cold') {
        searchBtn.style.backgroundColor = '#3498db';
    } else if (themeName === 'rain') {
        searchBtn.style.backgroundColor = '#2980b9';
    } else if (themeName === 'snow') {
        searchBtn.style.backgroundColor = '#7f8c8d';
    } else if (themeName === 'storm') {
        searchBtn.style.backgroundColor = '#8e44ad';
    } else if (themeName === 'cloudy') {
        searchBtn.style.backgroundColor = '#7f8c8d';
    } else {
        searchBtn.style.backgroundColor = '#3498db';
    }
    
    // Apply weather detail colors based on theme
    const weatherDetails = document.querySelectorAll('.weather-detail');
    weatherDetails.forEach(detail => {
        if (themeName === 'night') {
            detail.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        } else if (themeName === 'hot') {
            detail.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
        } else if (themeName === 'cold') {
            detail.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
        } else {
            detail.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
        }
    });
    
    // Apply current weather background based on theme
    const currentWeather = document.querySelector('.current-weather');
    if (currentWeather) {
        if (themeName === 'night') {
            currentWeather.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        } else if (themeName === 'hot') {
            currentWeather.style.backgroundColor = 'rgba(255, 235, 235, 0.8)';
        } else if (themeName === 'cold') {
            currentWeather.style.backgroundColor = 'rgba(235, 245, 255, 0.8)';
        } else if (themeName === 'rain') {
            currentWeather.style.backgroundColor = 'rgba(220, 240, 255, 0.8)';
        } else if (themeName === 'snow') {
            currentWeather.style.backgroundColor = 'rgba(245, 245, 255, 0.8)';
        } else if (themeName === 'storm') {
            currentWeather.style.backgroundColor = 'rgba(225, 225, 240, 0.8)';
        } else {
            currentWeather.style.backgroundColor = 'rgba(235, 245, 255, 0.8)';
        }
    }
    
    // Only animate if it's not the initial load
    if (!isInitial) {
        document.body.style.animation = 'none';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 10);
    }
}

function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function formatDateShort(date) {
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function getDayName(date) {
    const options = { weekday: 'short' };
    return date.toLocaleDateString('en-US', options);
}