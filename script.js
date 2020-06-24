// this line waits for the html document to be fully loaded, then executes the callback function
$(document).ready(function() {
  // event listener for search button click
  $("#search-button").on("click", function() {
    // get the value of the input box
    var searchValue = $("#search-value").val();

    // clear input box
    $("#search-value").val("");
    // hits the api
    searchWeather(searchValue);
  });
    // runs search weather function to create a list of cities searched  
  $(".history").on("click", "li", function() {
    searchWeather($(this).text());
  });
  // this function hits the api and makes a list with the cities searched
  function makeRow(text) {
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    $(".history").append(li);
  }
    // api key: b6677566d5d1b3e237d8113a04b6e6ca
  function searchWeather(searchValue) {
    // ajax call hits the openweathermap API
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&appid=d0722f6583302b9d88da0f9f1e36d9f8&units=imperial",
      dataType: "json",
      success: function(data) {
        // create history link for this search if it hasn't been searched yet
        //prevents the same city from being rendered to the page multiple times
        if (history.indexOf(searchValue) === -1) {
          // pushes search value to the history array
          history.push(searchValue);
          window.localStorage.setItem("history", JSON.stringify(history));
          
          makeRow(searchValue);
        }
        
        // clear any old content
        $("#today").empty();

        // create html content for current weather
        // create a <h3> element and assigned it to the varaible. Provide text and date 
        var title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
        //  create an element <div> and add class to the card
        var card = $("<div>").addClass("card");
        // create an element <p> and assigned to the varaible wind and add class to the card-text and refenrece to the wind speed data
        var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
        // create an element <p> and add class card-text and regerence to the data of humidity
        var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
        
        // create an element <p> and add a class card-text, then adds the temperature data to the element
        var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " °F");
        // create an element div and assigned to the variable cardBody and add class "card-body"
        var cardBody = $("<div>").addClass("card-body");
        // create an elemet img  and add the attribute of url
        var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png");

        // merge and add to page
        // appending image to the title varible (created for <h3>)
        title.append(img);
        // appending title,temp.humid and wind to the cardBody
        cardBody.append(title, temp, humid, wind);
        // appending cardBody to the card
        card.append(cardBody);
        // appending card to the class "today"
        $("#today").append(card);

        // call follow-up api endpoints
        getForecast(searchValue);
        getUVIndex(data.coord.lat, data.coord.lon);
      }
    });
  }
  // this function retrieves the forcast from the API
  function getForecast(searchValue) {
    // ajax hits the openweathermap API
    $.ajax({
      // calling to get a response from the openweath api
      type: "GET",
      // link to api that gets imperial 
      url: "https://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=d0722f6583302b9d88da0f9f1e36d9f8&units=imperial",
      dataType: "json",
      success: function(data) {
//         console.log(data.list)

        // overwrite any existing content with title and empty row
        $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");

        // loop over all forecasts (by 3-hour increments)
        for (var i = 0; i < data.list.length; i++) {
          // only look at forecasts around 3:00pm
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            // create html elements for a bootstrap card
            var col = $("<div>").addClass("col-md-2");
            var card = $("<div>").addClass("card text-white");
            var body = $("<div>").addClass("card-body p-2");
            // gets the date
            var title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());

            var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");
            
            var p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " °F");
            var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");
            
            // ADDED FEATURE: if the temp is above 75, make the background color red
            if (data.list[i].main.temp_max >= 75) {
              // card.addClass('bg-danger');
              card.css({'background-image' : 'url("https://image.freepik.com/free-photo/flame-circle_1160-750.jpg")', 'text-shadow': '1px 1px white'})
              card.addClass('text-dark')
              // if the temp is below 75, make the background color blue
            } else if (data.list[i].main.temp_max < 75 && data.list[i].main.temp_max >= 40) {
              card.css('background-image', 'url("https://townsquare.media/site/385/files/2019/02/sunlight-through-clouds.jpg?w=980&q=75")');
            } else if (data.list[i].main.temp_max < 70) {
              card.css({'background-image': 'url("https://www.popsci.com/resizer/VsnPTTTGJQ7bYe3fYq5rWcWy0OQ=/760x544/arc-anglerfish-arc2-prod-bonnier.s3.amazonaws.com/public/7PWF2DFYP6NDYPTMN3PUBRSYU4.jpg")', 'text-shadow': '1px 1px white' })
              card.addClass('text-dark')
            };

            // merge together and put on page
            col.append(card.append(body.append(title, img, p1, p2)));
            $("#forecast .row").append(col);
          }
        }
      }
    });
  }
  // getUVIndex hits the openweathermap API for latatude and longitude
  function getUVIndex(lat, lon) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/uvi?appid=d0722f6583302b9d88da0f9f1e36d9f8&lat=" + lat + "&lon=" + lon,
      dataType: "json",
      success: function(data) {
        var uv = $("<p>").text("UV Index: ");
        var btn = $("<span>").addClass("btn btn-sm").text(data.value);
        
        // change color depending on uv value
        if (data.value < 3) {
          btn.addClass("btn-success");
        }
        else if (data.value < 7) {
          btn.addClass("btn-warning");
        }
        else {
          btn.addClass("btn-danger");
        }
        
        $("#today .card-body").append(uv.append(btn));
      }
    });
  }

  // get current history, if any
  var history = JSON.parse(window.localStorage.getItem("history")) || [];

  if (history.length > 0) {
    searchWeather(history[history.length-1]);
  }

  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }
});
