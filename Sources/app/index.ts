import document from "document";
import * as util from "./simple/utils";
import * as font from "./simple/font";
// Display & AOD
import * as simpleDisplay from "./simple/display";

// Simpl activities
import * as simpleActivities from "simple-fitbit-activities";

// import clock from "clock";
import * as simpleMinutes from "./simple/clock-strings";

// Device form screen detection
import { me as device } from "device";

// Elements for style
const _container = document.getElementById("container") as GraphicsElement;
const _background = document.getElementById("background") as RectElement;

// Date
const _dates1Container = document.getElementById("date1-container") as GraphicsElement;
const _dates1 = _dates1Container.getElementsByTagName("image") as ImageElement[];
const _dates2Container = document.getElementById("date2-container") as GraphicsElement;
const _dates2 = _dates2Container.getElementsByTagName("image") as ImageElement[];
const _dates3Container = document.getElementById("date3-container") as GraphicsElement;
const _dates3 = _dates3Container.getElementsByTagName("image") as ImageElement[];

// Hours
const _clocks = document.getElementById("clock-container").getElementsByTagName("image") as ImageElement[];
const _cloksHours = _clocks.slice(0, 2);
const _cloksMinutes = _clocks.slice(3, 5);

const _hoursTick = document.getElementById("hours-tick") as GroupElement;
const _minutesTick = document.getElementById("mins-tick") as GroupElement;
const _secondsTick = document.getElementById("seconds-tick") as GroupElement;

// AM or PM
const _ampm = document.getElementById("ampm-container").getElementsByTagName("image") as ImageElement[];

// Battery
const _batteryValueContainer = document.getElementById("battery-value-container") as GraphicsElement;
const _batteryValueMask = document.getElementById("battery-arc") as ArcElement;

const _batteryTextContainer = document.getElementById("battery-test-container") as GraphicsElement;
const _batteries = document.getElementById("battery-text").getElementsByTagName("image") as ImageElement[];

// Stats
import { ActivitySymbol } from "./simple/activity-symbol";
const _statcontainer = document.getElementById("statcontainer") as GraphicsElement;

const _steps = new ActivitySymbol(document.getElementById("steps-legend") as GraphicsElement, _background);
const _calories = new ActivitySymbol(document.getElementById("cals-legend") as GraphicsElement, _background);
const _activesMinutes = new ActivitySymbol(document.getElementById("am-legend") as GraphicsElement, _background);
const _distance = new ActivitySymbol(document.getElementById("dist-legend") as GraphicsElement, _background);
const _elevation = new ActivitySymbol(document.getElementById("elevation-legend") as GraphicsElement, _background);

const _stepsArc = document.getElementById("steps") as ArcElement;
const _calsArc = document.getElementById("cals") as ArcElement;
const _amArc = document.getElementById("am") as ArcElement;
const _distArc = document.getElementById("dist") as ArcElement;

const _elevationValueContainer = document.getElementById("elevation-value-container") as GraphicsElement;
const _elevationValueMask = document.getElementById("elevation-arc") as ArcElement;

const _elevationTextscontainer = document.getElementById("elevation-text-container") as GraphicsElement;
const _elevationTexts = document.getElementById("elevation-text").getElementsByTagName("image") as ImageElement[];

// Heart rate management
const _hrmContainer = document.getElementById("hrm-container") as GroupElement;
const _iconHRM = document.getElementById("iconHRM") as GraphicsElement;
const _imgHRM = document.getElementById("icon") as ImageElement;
const _hrmTexts = document.getElementById("hrm-text-container").getElementsByTagName("image") as ImageElement[];

let lastBpm: number;

// Import the settigns module
import * as appSettings from "simple-fitbit-settings/app";
// Import settings class from common folder
import { Settings } from "../common/settings";
// Current settings
const _settings = new Settings();

// Weather
const _weatherTextContainer = document.getElementById("weather-temp") as GraphicsElement;

// --------------------------------------------------------------------------------
// Clock
// --------------------------------------------------------------------------------
// Update the clock every seconds
simpleMinutes.initialize("seconds", (clock) => {
  const folder: font.folder = simpleDisplay.isInAodMode()
    ? "chars-aod"
    : "chars";

  // Hours
  if (clock.Hours) {
    font.print(clock.Hours, _cloksHours, folder);
  }

  // Minutes
  if (clock.Minutes) {
    font.print(clock.Minutes, _cloksMinutes, folder);
    _hoursTick.groupTransform.rotate.angle = clock.HoursAngle;
    _minutesTick.groupTransform.rotate.angle = clock.MinutesAngle;
  }
  _secondsTick.groupTransform.rotate.angle = clock.SecondsAngle;

  // AM or PM
  if (clock.AmOrPm) {
    font.print(clock.AmOrPm, _ampm);
  }

  // Date 1
  if (clock.Date1 !== undefined) {
    // Position
    _dates1Container.x = 100 - (clock.Date1.length * 10);
    // Values
    font.print(clock.Date1, _dates1);
  }

  // Date 2
  if (clock.Date2 !== undefined) {
    // Position
    _dates2Container.x = 100 - (clock.Date2.length * 10);
    // Values
    font.print(clock.Date2, _dates2);
  }

  // Date 3
  if (clock.Date3 !== undefined) {
    // Position
    _dates3Container.x = 100 - (clock.Date3.length * 10);
    // Values
    font.print(clock.Date3, _dates3);
  }

  // update od stats
  UpdateActivities();
});

function setHoursMinutes(folder: font.folder) {
  // Hours
  font.print(simpleMinutes.last.Hours + ":" + simpleMinutes.last.Minutes, _clocks, folder);
}

// --------------------------------------------------------------------------------
// Power
// --------------------------------------------------------------------------------
import * as simpleBattery from "./simple/battery";

// Method to update battery level informations
simpleBattery.initialize((battery) => {
  const batteryString = device.screen.height > 250
    ? battery.toString() + "%" // Versa and up
    : battery.toString(); // Ionic
  // Battery text
  font.print(batteryString, _batteries);
  const angle = Math.floor(100 - battery) * 60 / 100;
  // Battery arc
  _batteryValueMask.startAngle = 300 - angle;
  _batteryValueMask.sweepAngle = angle;
});
// --------------------------------------------------------------------------------
// Activity
// --------------------------------------------------------------------------------

// Init
simpleActivities.initialize(UpdateActivities);

// Elevation is not available
if (!simpleActivities.elevationIsAvailable()) {
  util.hide(_elevationValueContainer);
  util.hide(_elevationTextscontainer);
}

// Update Activities informations
function UpdateActivities() {
  // Get activities
  const activities = simpleActivities.getNewValues();
  const startposition = _settings.statsPosition === undefined || _settings.statsPosition;

  // Steps
  if (activities.steps !== undefined) {
    updateActivity(activities.steps, "steps", _stepsArc, _steps);
    // Position
    if (startposition) {
      _stepsArc.startAngle = 0;
    }
    else {
      _stepsArc.startAngle = 90 - _stepsArc.sweepAngle;
    }
  }

  // Calories
  if (activities.calories !== undefined) {
    updateActivity(activities.calories, "calories", _calsArc, _calories);
  }

  // Active minutes
  if (activities.activeZoneMinutes !== undefined) {
    updateActivity(activities.activeZoneMinutes, "activesminutes", _amArc, _activesMinutes);
    // Position
    if (startposition) {
      _amArc.startAngle = 180;
    }
    else {
      _amArc.startAngle = 270 - _amArc.sweepAngle;
    }
  }

  // Disance
  if (activities.distance !== undefined) {
    updateActivity(activities.distance, "distance", _distArc, _distance);
  }

  // Elevation
  if (simpleActivities.elevationIsAvailable() && activities.elevationGain !== undefined) {
    updateElevation(activities.elevationGain);
  }
}

function refreshActivitiesColors() {
  _steps.refresh();
  _calories.refresh();
  _activesMinutes.refresh();
  _distance.refresh();
  _elevation.refresh();
}

// update activity arc
function updateActivity(activity: simpleActivities.Activity, css: string, arc: ArcElement, symbol: ActivitySymbol) {
  // Test if goals is reached
  if (activity.goalReached()) {
    arc.class = "stat goalreached";
    arc.sweepAngle = 90;
  }
  else {
    arc.class = "stat " + css;
    arc.sweepAngle = util.activityToAngle90(activity.goal, activity.actual);
  }
  // Legend updated
  symbol.set(activity);
}

// update elevation
function updateElevation(activity: simpleActivities.Activity) {
  const goalReached: boolean = activity.goalReached();
  if (goalReached) {
    _elevationValueMask.sweepAngle = 0;
  }
  else {
    const purcent = activity.asPourcent();
    _elevationValueMask.sweepAngle = 60 * (100 - purcent) / 100;
  }

  // Display text
  const text = activity.actual.toString();

  // postion of text
  if (device.screen.height < 300) {
    const width = text.length * 20;
    _elevationTextscontainer.x = device.screen.width - width;
    _elevationTextscontainer.width = width;
  }
  else {
    _elevationTextscontainer.x = device.screen.width - text.length * 20 - 30;
  }

  // Legend
  _elevation.set(activity);

  // Update texts
  font.print(text, _elevationTexts);
}

// --------------------------------------------------------------------------------
// Heart rate manager
// --------------------------------------------------------------------------------
import * as simpleHRM from "./simple/hrm";

simpleHRM.initialize((newValue, bpm, zone, restingHeartRate) => {
  // Zones
  _imgHRM.href = zone === "out-of-range"
    ? "images/stat_hr_open_48px.png"
    : "images/stat_hr_solid_48px.png";

  // Animation
  if (newValue) {
    util.highlight(_iconHRM);
  }

  // BPM value display
  if (bpm !== lastBpm && bpm > 0) {
    font.print(bpm.toString(), _hrmTexts);
  }
});
// --------------------------------------------------------------------------------
// Weather
// --------------------------------------------------------------------------------
import * as simpleWeather from "simple-fitbit-weather/app";
import { units } from "user-settings";
import { gettext } from 'i18n';

simpleWeather.initialize((weather) => {
  if (weather === undefined) return;
  // debug
  const debugText = document.getElementById("weather-debug") as TextElement;
  debugText.text = gettext("w" + weather.conditionCode);

  // update image
  const image = document.getElementById("weather-image") as ImageElement;
  image.href = `weather/${weather.conditionCode}.png`;

  // update text
  const texts = _weatherTextContainer.getElementsByTagName("image") as ImageElement[];
  const temp = (units.temperature === "C"
    ? Math.round(weather.temperatureC)
    : Math.round(weather.temperatureF))
    + "°" + units.temperature;
  // Display
  font.print(temp, texts);
  // Center text
  _weatherTextContainer.x = 100 - temp.length * 10;

  // Log
  //console.log(JSON.stringify(weather));  
});

// --------------------------------------------------------------------------------
// Settings
// --------------------------------------------------------------------------------
appSettings.initialize(
  _settings,
  (newSettings: any) => {
    if (!newSettings) {
      return;
    }
    try {
      if (newSettings.showBatteryPourcentage !== undefined) {
        util.setVisibility(_batteryTextContainer, newSettings.showBatteryPourcentage);
      }

      if (newSettings.showBatteryBar !== undefined) {
        util.setVisibility(_batteryValueContainer, newSettings.showBatteryBar);
      }

      if (newSettings.statsPosition !== undefined) {
        simpleActivities.reset(); // Reset data to force update
        UpdateActivities(); // For achivement position
      }

      if (newSettings.colorBackground !== undefined) {
        const value: string = newSettings.colorBackground;
        util.fill(_background, value);
        util.fill(_batteryValueMask, value);
        util.fill(_elevationValueMask, value);
        refreshActivitiesColors();
      }

      if (newSettings.graduationForeground !== undefined) {
        const analogContainer = document.getElementById("analog-container") as GroupElement;
        _statcontainer.style.fill = newSettings.graduationForeground;
        analogContainer.style.fill = newSettings.graduationForeground;
      }

      if (newSettings.colorForeground !== undefined) {
        util.fill(_container, newSettings.colorForeground);
      }

      // Display based on 12H or 24H format
      if (newSettings.clockDisplay24 !== undefined) {
        simpleMinutes.updateClockDisplay24(newSettings.clockDisplay24);
      }
    }
    catch (error) {
      console.error(error);
    }
  });

// --------------------------------------------------------------------------------
// Allway On Display
// --------------------------------------------------------------------------------
simpleDisplay.initialize(onEnteredAOD, onLeavedAOD, onDisplayGoOn);

function onEnteredAOD() {
  // Stop sensors
  simpleHRM.stop();

  // Clock
  setHoursMinutes("chars-aod");

  // Hide elements
  util.hide(_background);
  util.hide(_batteryTextContainer);
  util.hide(_batteryValueContainer);
  util.hide(_statcontainer);
  util.hide(_elevationValueContainer);
  util.hide(_elevationTextscontainer);
  util.hide(_hrmContainer);
  util.hide(_secondsTick);
  util.hide(_weatherTextContainer);
}

function onLeavedAOD() {
  // Show elements & start sensors
  _background.style.display = "inline";
  // Clock
  setHoursMinutes("chars");
  if (_settings.showBatteryPourcentage) util.show(_batteryTextContainer);
  if (_settings.showBatteryBar) util.show(_batteryValueContainer);
  util.show(_statcontainer);
  if (simpleActivities.elevationIsAvailable) {
    util.show(_elevationValueContainer);
    util.show(_elevationTextscontainer);
  }
  util.show(_hrmContainer);
  util.show(_secondsTick);
  util.show(_weatherTextContainer);

  // Start sensors
  simpleHRM.start();
}

function onDisplayGoOn() {
  _steps.onDiplayGoOn();
  _calories.onDiplayGoOn();
  _activesMinutes.onDiplayGoOn();
  _distance.onDiplayGoOn();
  _elevation.onDiplayGoOn();
}