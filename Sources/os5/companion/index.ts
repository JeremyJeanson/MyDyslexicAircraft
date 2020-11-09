import * as companionSettings from "simple-fitbit-settings/companion";
import { Settings } from "../common/settings";
import * as weather from "simple-fitbit-weather/companion";

// Init settings
companionSettings.initialize(new Settings());

const apiKey = ""; // Set the API key

if (apiKey === "") {
    console.error("Please set a weather API key!");
}
else {
    // Init weather
    weather.initialize({
        provider: weather.Providers.openweathermap,
        apiKey: apiKey,
        maximumAge: 5,
        refreshInterval: 60
    });
}