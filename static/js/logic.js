
// define variable for the geojson url
const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// grab data from the query url and pass object to createMap function
d3.json(queryUrl, function (data) {
    createMap(data.features);
});

function bindPopMaker(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
}

// function to create the map
function createMap(earthquakeData) {

    // function to change color of markers based on magnitude
    function checkPoints(mag) {
        return mag > 5 ? "#db2e2e" :
            mag > 4 ? "#db6b2e" :
                mag > 3 ? "#db902e" :
                    mag > 2 ? "#dbc72e" :
                        mag > 1 ? "#c1db2e" :
                            "#31db2e";
    }

    // loop through locations
    var earthquakeMarkers = earthquakeData.map((feature) =>
        L.circle([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
            fillOpacity: .8,
            color: checkPoints(feature.properties.mag),
            fillColor: checkPoints(feature.properties.mag),
            radius: feature.properties.mag * 15000
        })
            .bindPopup("<h2> Magnitude : " + feature.properties.mag +
                "</h2><hr><h3>" + feature.properties.place +
                "</h3><hr><p>" + new Date(feature.properties.time) + "</p>")
    )

    // add the earthquakes layer.
    var earthquakes = L.layerGroup(earthquakeMarkers)

    // add a tile layer to the map
    var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.dark",
        accessToken: API_KEY
    });

    // create a baseMaps object to hold the lightmap layer
    var baseMaps = {
        "Light Map": lightmap,
        "Dark Map": darkmap
    };

    // create an overlayMaps object to hold the earthquakes layer
    var overlayMaps = {
        "Earthquakes": earthquakes
    };

    // create the map object
    var myMap = L.map("map", {
        center: [39.7392, -104.9903],
        zoom: 4.8,
        layers: [lightmap, earthquakes]
    });

    // create a layer control, pass in the baseMaps and overlayMaps and add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // create a legend
    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            range = [0, 1, 2, 3, 4, 5];

        // loop through ranges intervals and generate a label with a colored square for each interval
        for (var i = 0; i < range.length; i++) {
            div.innerHTML +=
                '<i style="background:' + checkPoints(range[i] + 1) + '"></i> ' +
                range[i] + (range[i + 1] ? '&ndash;' + range[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(myMap);
};


