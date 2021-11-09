let weatherApp = {
  main: {},
  day: new Date(),
  daysOfWeek: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
  unit: "metric",
  storedLocation: "Toronto",
};

let getCurrentLocationData = async (city) => {
  let weatherData;
  try {
    weatherData = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=2be85eb54330596629505e20d2e6cf90`,
      { mode: "cors" }
    );
    if (weatherData.ok === false) {
      alert("Invalid Entry");
      submitSearch("Toronto");
    }
  } catch {
    console.error("network failure");
  } finally {
    let response = await weatherData.json();
    let lon = response.coord.lon;
    let lat = response.coord.lat;
    getForecastData(lat, lon);
  }
};

let getForecastData = async (lat, lon) => {
  let forecastData = await fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=${weatherApp.unit}&appid=2be85eb54330596629505e20d2e6cf90`,
    { mode: "cors" }
  );
  let info = await forecastData.json();
  weatherApp.main = info;
  populateDisplay();
};

//get real time out of unix time
let convertUnixTime = (time) => {
  let unix_timestamp = time;
  let date = new Date(unix_timestamp * 1000);
  let hours = date.getHours();
  let minutes = "0" + date.getMinutes();
  let formattedTime = hours + ":" + minutes.substr(-2);
  return formattedTime;
};

//change units (Metric/Imperial)
let changeUnitsBtn = document.getElementById("change_units");
changeUnitsBtn.addEventListener("click", function changeUnits() {
  if (weatherApp.unit === "metric") {
    weatherApp.unit = "imperial";
    submitSearch(changeUnitsBtn);
  } else {
    weatherApp.unit = "metric";
    submitSearch(changeUnitsBtn);
  }
});

//search bar logic
let submitSearch = (e) => {
  if (e.target === searchBtn || e.key === "Enter") {
    document.getElementById("central_div").style.display = "none";
    getCurrentLocationData(result.value);
    document.getElementById("city_name").textContent = result.value;
    weatherApp.storedLocation = result.value;
    result.value = "";
  } else if (e === "Toronto") {
    document.getElementById("central_div").style.display = "none";
    getCurrentLocationData(e);
    document.getElementById("city_name").textContent = e;
    weatherApp.storedLocation = "Toronto";
    result.value = "";
  } else if (e === changeUnitsBtn) {
    document.getElementById("central_div").style.display = "none";
    getCurrentLocationData(weatherApp.storedLocation);
  }
};

let searchBtn = document.getElementById("submit");
let result = document.getElementById("search_bar");
result.addEventListener("keypress", submitSearch);
searchBtn.addEventListener("click", submitSearch);
submitSearch("Toronto");

function populateDisplay() {
  //Current weather conditions
  if (weatherApp.main.current.clouds < 11) {
    document.getElementById("city_weather").textContent = "Clear Skies";
  } else if (weatherApp.main.current.clouds < 26) {
    document.getElementById("city_weather").textContent = "Minimal Cloudiness";
  } else if (weatherApp.main.current.clouds < 51) {
    document.getElementById("city_weather").textContent = "Scattered Clouds";
  } else if (weatherApp.main.current.clouds < 85) {
    document.getElementById("city_weather").textContent = "Cloudy";
  } else if (weatherApp.main.current.clouds <= 100) {
    document.getElementById("city_weather").textContent = "Overcast";
  }

  //current temp
  if (weatherApp.unit === "metric") {
    document.getElementById("city_temp").innerHTML =
      `${Math.round(weatherApp.main.current.temp)}` + "&#8451;";
  } else if (weatherApp.unit === "imperial") {
    document.getElementById("city_temp").innerHTML =
      `${Math.round(weatherApp.main.current.temp)}` + "&#8457;";
  }

  //feels like
  if (weatherApp.unit === "metric") {
    document.getElementById("feels_like").innerHTML =
      `Feels Like: ${Math.round(weatherApp.main.current.feels_like)}` +
      "&#8451;";
  } else if (weatherApp.unit === "imperial") {
    document.getElementById("feels_like").innerHTML =
      `Feels Like: ${Math.round(weatherApp.main.current.feels_like)}` +
      "&#8457;";
  }

  //windiness
  if (weatherApp.unit === "metric") {
    document.getElementById("wind").innerHTML =
      `Wind Speed: ${weatherApp.main.current.wind_speed}` + " &#13223;";
  } else if (weatherApp.unit === "imperial") {
    document.getElementById("wind").innerHTML =
      `Wind Speed: ${weatherApp.main.current.wind_speed}` + " mph";
  }
  //humidity
  document.getElementById(
    "humidity"
  ).textContent = `Humidity: ${weatherApp.main.current.humidity}%`;

  //sunrise
  weatherApp.main.current.sunrise = convertUnixTime(
    weatherApp.main.current.sunrise
  );
  document.getElementById(
    "sunrise"
  ).textContent = `Sunrise: ${weatherApp.main.current.sunrise} `;

  //sunset
  weatherApp.main.current.sunset = convertUnixTime(
    weatherApp.main.current.sunset
  );
  document.getElementById(
    "sunset"
  ).textContent = `Sunset: ${weatherApp.main.current.sunset}`;
  createForecast();
}

let createForecast = () => {
  for (i = 0; i < weatherApp.main.daily.length - 1; i++) {
    document.getElementById(`day_of_week_${i}`).textContent =
      weatherApp.daysOfWeek[dayOfWeek(i)];
    document.getElementById(`chance_of_rain_${i}`).textContent =
      Math.round(weatherApp.main.daily[i].pop * 100) + "%";
    document.getElementById(`humidity_${i}`).textContent =
      weatherApp.main.daily[i].humidity + "%";
    if (weatherApp.unit === "metric") {
      document.getElementById(`temperature_${i}`).innerHTML =
        Math.round(weatherApp.main.daily[i].temp.day) + "&#8451;";
    } else if (weatherApp.unit === "imperial") {
      document.getElementById(`temperature_${i}`).innerHTML =
        Math.round(weatherApp.main.daily[i].temp.day) + "&#8457;";
    }
    document.getElementById(
      `img_${i}`
    ).src = `http://openweathermap.org/img/wn/${weatherApp.main.daily[i].weather[0].icon}@2x.png`;
  }
  document.getElementById("central_div").style.display = "flex";
};

//returning day of week
function dayOfWeek(i) {
  x = weatherApp.day.getDay() + i;
  switch (x) {
    case 6:
      return 0;
    case 7:
      return 1;
      break;
    case 8:
      return 2;
      break;
    case 9:
      return 3;
      break;
    case 10:
      return 4;
      break;
    case 11:
      return 5;
      break;
    case 12:
      return 6;
      break;
    case 13:
      return 7;
      break;
    default:
      return x + 1;
  }
}
