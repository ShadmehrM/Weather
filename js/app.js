
const videoBackground = document.querySelector(".bg-video__content");
const infoContainer = document.querySelector(".row");
const Parent = document.querySelector(".crypto-place");
const post = document.querySelector(".post");
const footer = document.querySelector(".footer-container");
const background = document.querySelector(".img-bg-container");


// var
let marker;
const infoCityArr = [];
const recentLocationArr = [];
const currentLocation = infoCityArr.length - 1;



//Getting data from NASA
const nasaPhoto = async function () {
	
    try {
        const res = await fetch('https://api.nasa.gov/planetary/apod?api_key=VxDDdabhmByAzmtgAVa6gt7y3x2XqTg0ceLfEWxz');
		const data = await res.json();
		console.log(res,data);
	
		renderNasa(data);
		
    } catch (err) {
        console.log(err);

    }
};nasaPhoto();


//Rendering NASA post
const renderNasa= function (data) {
	const section = document.createElement("section");
	section.classList.add('nasa-article');
	section.innerHTML = `
			<h1 class="nasa-title">${data.title}</h1>
			<div class="img-container">
				<img src="${data.url}" alt="photo" class="nasa-img">
			</div>
			<p class="nasa-caption">${data.explanation}<br/><p class="nasa-copyright">Copywrite: ${data.copyright}<br/>${data.date}</p></p>
			
		`;
		footer.innerHTML=`
			    <ul class="footer-list">
				    <li class="footer-items" ><a id="footer-Link" href="${data.hdurl}">Downlaod</a></li>
                    <li class="footer-items"><a id="footer-site" href="http://nasa.gov">NASA</a></li>
                    <li class="footer-items"><a id="footer-Contact" href="https://wa.me/message/WJGTUYODOZBIM1 ">Contact</a></li>
                </ul>
			`;
			
	    background.innerHTML=`
				<img src="${data.url}" alt="photo" class="img-bg">
		`;
	post.append(section);
};


// Crypto 
const cryptoList = async function () {
    try {
        const res = await fetch(
		'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true'
		);
		const data = await res.json();
		console.log(res,data);
		renderCrypto(data);
		
    } catch (err) {
        console.log(err);

    }
};

const checkTypeOfNumber = function (nums) {
  if (`${nums}`.includes("-", 0)) {
    return "negetive";
  } else {
    return "plus";
  }
};

const splitIdFromUrl = function (url) {
  const arr = url.split("/");
  return arr[5];
};

const formatCurrency = function (num) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
  }).format(Number(num));
};

//Redering data from Crypto
const renderCrypto = function (arr) {
 // Parent.innerHTML = ``;
  arr.forEach((value) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
         
      <td class="body__item body__item--row">
        <img
          src='${value.image}'
          alt="currency"
          class="body__item-img"
        />
      </td>
	  
	  <td class="body__item item-name">
	   <span class="body__item-currency-name">${value.symbol}</span>
	  </td>
	  
      <td class="body__item">
        <p class="body__item-currency-price">${formatCurrency(
          value.current_price
        )}</p>
      </td>
      <td class="body__item">
        <p class="body__item-currency-change currency-change-- ${checkTypeOfNumber(
          value.price_change_percentage_24h
        )}">${value.price_change_percentage_24h.toFixed(2)}%</p>

      `;
    Parent.append(tr);
  });
};
cryptoList();



// show location name
const geocodeLocation = async function (lat, lng) {
    try {
        const res = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&language='en'&key=b4d833452a124ea49d16c49e7caedee2`
        );

        const data = await res.json();
        return data.results[0].components;
    } catch (err) {
        console.log(err);

    }
};
// show locotion with marker
const whereAmI = function (map, lat, lng) {
    geocodeLocation(lat, lng).then((res) => {
        const { city, country } = res;
        infoCityArr.push({ city, country, lat, lng });
        wetherInfo(infoCityArr);
        if (marker !== undefined) map.removeLayer(marker);

        marker = new L.marker([lat, lng])
            .addTo(map)
            .bindPopup(
                L.popup({
                    maxWidth: 250,
                    minWidth: 100,

                    autoClose: false,
                    closeOnClick: false,
                    className: "address-popup",
                })
            )
            .setPopupContent(`  ${city ?? ""} ${city !== undefined ? "," : ""
                } ${country}`)
            .openPopup();
    });
};
// show map
const showMap = function () {



    const map = L.map("map").setView([51.505, -0.09], 13);

    L.tileLayer(
        "https://{s}.tile.thunderforest.com/neighbourhood/{z}/{x}/{y}{r}.png?apikey=d337b37ee9ee48299a0e32208f474416", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }
    ).addTo(map);
    // find location by gps and pin the marker
    navigator.geolocation.getCurrentPosition(
        (location) => {
            console.log(location);
            const { latitude: lat, longitude: lng } = location.coords;
            whereAmI(map, lat, lng);

        },
        (err) => {
            console.log(err);
        }
    );
    // select location and pin marker by click in map
    map.on("click", function (e) {
        const { lat, lng } = e.latlng;

        whereAmI(map, lat, lng);

    });
};
const renderSpiner = function () {
    const markup = `
    <div class="lds-facebook"><div></div><div></div><div></div>
      `;
    infoContainer.innerHTML = '';
    infoContainer.insertAdjacentHTML('afterbegin', markup);
};
// get city wether info
const wetherInfo = async function (info) {
    renderSpiner();
    const { lat, lng, city, country } = info[info.length - 1];

    // 1)get data
    const res = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&appid=22f4c78bc8e3c0f81469fb5be7dafb05&units=metric`
    );

    const data = await res.json();
    console.log(data);
    // 2)render data

    renderData(data, city, country);

    // 3) push data in array
    recentLocationArr.push({ data, city, country });
  
};
// convert time stamp to date
const convsrtTimeStampToDate = function (timestamp) {
    const date = new Date(timestamp * 1000).toString();
    const day = date.split(" ");
    return day[0];
};



// change wether icon to animated icon
const changeWeatherIcon = function (dis, info, type = "d") {
    if (dis == "Rain" && type == "d") return "./assets/images/rainy-2.svg";
    if (dis == "Clear" && type == "d") return "./assets/images/day.svg";
    if (dis == "Clear" && type == "n") return "./assets/images/night.svg";
    if ((dis == "Clouds" && info == "broken clouds") || info == "overcast clouds")
        return "./assets/images/cloudy.svg";
    if (dis == "Clouds" && type == "d")
        return "./assets/images/cloudy-day-2.svg";

    if (dis == "Clouds" && type == "n")
        return "./assets/images/cloudy-night-3.svg";

    if (dis == "Snow") return "./assets/images/snowy-2.svg";
    if (dis == "thunderstorm") return "./assets/images/thunder.svg";
    if (dis == "Rain" && type == "n") return "./assets/images/rainy-6.svg";
};

// render data
const renderData = function (wetherInfo, city, country) {

    const { current, daily } = wetherInfo;
    // render current data
    const currentWeatherInfo = renderCurrentWeather(current, city, country);

    // render 8 day forcast
    const dailyWeatherInfo = renderForcastWeather(daily);


    // append element to dom
    const weatherInfoElement = [currentWeatherInfo, dailyWeatherInfo];
    infoContainer.innerHTML = ``;
    weatherInfoElement.map(item => infoContainer.insertAdjacentHTML('beforeend', item)).join('');

};

const renderCurrentWeather = function (currWeather, city, country) {

    return `
        <div class="info-wether">
            <h2 class="info-wether__city">
            ${city ?? ""} ${city !== undefined ? "," : ""
        } ${country}
            </h2>
            <p class="info-wether__temp">${Math.round(currWeather.temp)}°</p>

            <p class="info-row__type dis-weather">${currWeather.weather[0].description}</p>

            <div class="wrapper">
            <div class="info-row2">
                <img src="./assets/images/humidity.svg" alt="" />
                <div class="info-row3">
                <p class="txt-humidity">${Math.round(currWeather.humidity)}%</p>
                <p>humidity</p>
                </div>
            </div>
            <div class="info-row2">
                <img src="./assets/images/wind.svg" alt="" />
                <div class="info-row3">
                <p class="txt-wind">${Math.round(currWeather.wind_speed)} m/s</p>
                <p>wind</p>
                </div>
            </div>
            <div class="info-row2">
                <img src="./assets/images/pressure.svg" alt="" />
                <div class="info-row3">
                <p class="txt-presure">${Math.round(currWeather.pressure)} mb</p>
                <p>pressure</p>
                </div>
            </div>
            </div>
        </div>
    `;
};

const renderForcastWeather = function (daily) {
    return `
        <section class="items-place">
            <div class="place place--hidden">
            <div class="place__header">
                <p class="place__header-logo">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
                </p>
                <p class="place__header-txt">daily forcast</p>
            </div>
            <div class="place__wether">
              ${daily.map((item) => {
        const { dt, weather, temp } = item;

        return `
             <div class="wether__item">
             <p class="wether__item-time">${convsrtTimeStampToDate(dt)}</p>
             <img src='${changeWeatherIcon(
            weather[0].main,
            weather[0].description,
            weather[0].icon[3]
        )}' alt="" />
        
             <div class="col">
             <p class="wether__item-temp">${Math.round(temp.max)}°</p>
             <p class="wether__item-temp2">${Math.round(temp.min)}°</p>
             </div>
           </div>
             `;

    }).join('')}
            
            
            
            </div>
         </div>
        </section>
    
    `;

};

//  recent location



// init vedeo background
const initVideoBackground = function () {
    const hour = new Date().getHours();

    if (hour >= 19 || hour <= 5)
        videoBackground.setAttribute("src", "../assets/images/night-sky.mp4");
    else videoBackground.setAttribute("src", "../assets/images/Cloudy sky.mp4");
};



window.addEventListener('load', () => {
    // render map
    showMap();
    // set background by hour
    initVideoBackground();

  
});
