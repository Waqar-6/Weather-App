"use strict";





const openWeatherApiKey = '5f8d52fa20ac9a2105fd9252278049fe';
let city = "London";
const serachBar = document.querySelector(".summary--form__input");
const searchBtn = document.querySelector(".search-btn");






// Weather Urls
const weatherDataUrls = [
  `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${openWeatherApiKey}&units=metric`,
  `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${openWeatherApiKey}&units=metric`
]



// Functions


// function fetching all wetaher data 
async function  fetchAllWeatherData (weatherDataUrls) {

  try {

    const responses = await Promise.all(weatherDataUrls.map(weatherDataUrl => fetch(weatherDataUrl)));
    const data = await Promise.all(responses.map(response => response.json()))
    const [currentWeatherData, forecastWeatherData] = data;
    console.log(currentWeatherData, forecastWeatherData)

    destructureSummaryVariables(currentWeatherData);
    destructureHighlightsVariables(currentWeatherData);
    destructureForecastVariables(forecastWeatherData);

      
  } catch (error) {

    console.log(error)
    
  }

}



// Functions for destructring variables 
const destructureSummaryVariables = (currentWeatherData) => {
  // prettier ignore
  const {coord:{lon,lat},weather: [{ description, icon }], main: { temp },name,} = currentWeatherData;
  
  const iconUrl = `http://openweathermap.org/img/wn/${icon}.png`;
  console.log(description, icon, temp, name);
  console.log(lon,lat)

  updateSummaryUI(description, iconUrl, temp, name);
  displayMap(iconUrl,lon,lat, openWeatherApiKey);
};


const destructureHighlightsVariables = (currentWeatherData) => {
  const {wind: { speed }, sys: { sunrise, sunset }, visibility, main: { feels_like },} = currentWeatherData;
  
  
  updateHighlightsTopLayerUI(speed, sunrise, sunset);
  updateHighlightsBottomLayerUI(visibility, feels_like)
};

const destructureForecastVariables = (forecastWeatherData) => {
  const {list } = forecastWeatherData;

  let weatherForecastDays = list.flatMap((li) => li.weather);
  weatherForecastDays.length = 10;
  

  let weatherForecastDaysDate = list.map(li => li.dt)
  weatherForecastDaysDate.length = 10;
  console.log(weatherForecastDaysDate);


  
  displayForecastUI(weatherForecastDays, weatherForecastDaysDate);
};




// Functions for formatting 
const formatTime = (time) => {
  const convertedTime = new Date(time * 1000);
  const hours = convertedTime.getHours() > 12 ? convertedTime.getHours() - 12 : convertedTime.getHours();
  const minutes = convertedTime.getMinutes().toString().padStart(2, '0');
  const meridian = convertedTime.getHours() >= 12 ? 'PM' : 'AM';
  return `${hours}:${minutes} ${meridian}`;
};

const formatDay = (day) => {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const findDay = new Date(day * 1000);
  const dayName = daysOfWeek[findDay.getDay()];
  return dayName
}


// functions for updating ui
const updateSummaryUI = (text, icon, temp_f, name) => {
  const summaryIcon = document.querySelector(".summary--weather__image");
  const summaryTemp = document.querySelector(".summary--weather__temp");
  const summaryDescription = document.querySelector(".summary--weather__description");
  const summaryCity = document.querySelector(".summary--weather__city");

  //
  summaryTemp.textContent = temp_f;
  summaryIcon.src = icon;
  summaryDescription.textContent = text;
  summaryCity.textContent = name;
  console.log(icon);
};


const updateHighlightsTopLayerUI = ( wind_mph, sunset, sunrise) => {
  // Top Layer of Highlights UI
  const highlightsWindSpeed = document.querySelector(".highlights--wind__speed");
  const highlightsUVIndex = document.querySelector(".highlights--uv__index");
  const highlightSunrise = document.querySelector(".highlights--sunrise__time");
  const highlightSunset = document.querySelector(".highlights--sunset__time");


  highlightsWindSpeed.textContent = wind_mph;
  // highlightsUVIndex.textContent = uv;
  highlightSunrise.textContent = formatTime(sunrise) ;
  highlightSunset.textContent = formatTime(sunset);

  
};


const updateHighlightsBottomLayerUI = (vis_miles, feelslike_f) => {
  // Bottom Layer of Highlights UI
  // const highlightsHumidity = document.querySelector(".highlights--humidity__temp");
  const highlightsVisibility = document.querySelector(".highlights--visibility__level");
  const highlightsFeelsLikeTemp = document.querySelector(".highlights--feels--like__temp");
  console.log(highlightsVisibility);

  // highlightsHumidity.textContent = humidity;
  highlightsVisibility.textContent = vis_miles;
  highlightsFeelsLikeTemp.textContent = feelslike_f;

}



const displayForecastUI = (weatherForecastDays, weatherForecastDaysDate) => {
  const forecastContainer = document.querySelector(".forecast--list");

  forecastContainer.innerHTML = "";
  weatherForecastDays.map((day, index) => {
    const addForecast = `

  <li class="forcast--list__day">
      <img class="orcast--list__day__image" src="http://openweathermap.org/img/wn/${day.icon}.png"/ >
      <p class="forcast--list__day--date">${day.description}</p>
      <p class="forcast--list__day--dateday">${formatDay(weatherForecastDaysDate[index])}</p>

    </li>

`;

    forecastContainer.insertAdjacentHTML("afterbegin", addForecast);
  });
};




// Displaying map 

function displayMap(iconUrl,lon,lat) {
  // Initialize Leaflet map
  const map = L.map("map").setView([51.505, -0.09], 13);

  // Add OpenStreetMap layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  // Add OpenWeatherMap temperature layer
  const openWeatherMapUrl = `https://{s}.tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${openWeatherApiKey}`;
  const openWeatherMapLayer = L.tileLayer(openWeatherMapUrl, {
    maxZoom: 19,
  }).addTo(map);

  // Add marker and popup
  L.marker([lat, lon])
    .addTo(map)
    .bindPopup(`<img src="${iconUrl}"/>`)
    .openPopup();
}

// Event Listner

searchBtn.addEventListener("click", (e) => {
  e.preventDefault();
  city = serachBar.value;
  fetchAllWeatherData(weatherDataUrls ,openWeatherApiKey, city);
  // getForecatWeather(openWeatherApiKey, city);
});



// Charts
const wind = document.getElementById("wind");

new Chart(wind, {
  type: "bar",
  data: {
    labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
    datasets: [
      {
        label: "Wind speed",
        data: [12, 19, 3, 5, 2, 3],
        borderWidth: 1,
      },
    ],
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
});

const uv = document.getElementById("uv");

new Chart(uv, {
  type: "line",
  data: {
    // labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
    datasets: [
      {
        label: "UV Index",
        // data: [12, 19, 3, 5, 2, 3],
        data: [1],
        borderWidth: 1,
      },
    ],
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
});




const sunrise = document.getElementById("sunrise");

new Chart(sunrise, {
  type: "line",
  data: {
    labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
    datasets: [
      {
        label: "Sun Level",
        // data: [12, 19, 3, 5, 2, 3],
        data: [1],
        borderWidth: 1,
      },
    ],
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
});

