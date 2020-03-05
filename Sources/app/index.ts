import document from "document";
import * as util from "./simple/utils";

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
const _cloks = document.getElementById("clock-container").getElementsByTagName("image") as ImageElement[];
const _hoursTick = document.getElementById("hours-tick") as GroupElement;
const _minutesTick = document.getElementById("mins-tick") as GroupElement;
const _secondsTick = document.getElementById("seconds-tick") as GroupElement;

// AM or PM
const _ampm = document.getElementById("ampm-container").getElementsByTagName("image") as ImageElement[];

// Battery
const _batteryBar = document.getElementById("battery-bar-value") as RectElement;
const _batteriesContainer = document.getElementById("battery-container") as GraphicsElement;
const _batteries = _batteriesContainer.getElementsByTagName("image") as ImageElement[];

// Stats
const GoalColor = "gold";

const StepColor = "#FF0000";
const CalsColor = "#FF8000";
const AmColor = "green";
const DistColor = "blue";
const ElevationColor = "#FF0080";

const _stepsLegend = document.getElementById("steps-image") as ImageElement;
const _calsLegend = document.getElementById("cals-image") as ImageElement;
const _amLegend = document.getElementById("am-image") as ImageElement;
const _distLegend = document.getElementById("dist-image") as ImageElement;
const _elevationLegend = document.getElementById("elevation-image") as ImageElement;

const _stepsArc = document.getElementById("steps") as ArcElement;
const _calsArc = document.getElementById("cals") as ArcElement;
const _amArc = document.getElementById("am") as ArcElement;
const _distArc = document.getElementById("dist") as ArcElement;

const _elevationBar = document.getElementById("elevation-bar-value") as RectElement;
const _elevationTextscontainer = document.getElementById("elevation-text-container") as GraphicsElement;
const _elevationTexts = _elevationTextscontainer.getElementsByTagName("image") as ImageElement[];

// Heart rate management
const _hrmContainer = document.getElementById("hrm-container") as GroupElement;
const _iconHRM = document.getElementById("iconHRM") as GraphicsElement;
const _imgHRM = document.getElementById("icon") as ImageElement;
const _hrmTexts = document.getElementById("hrm-text-container").getElementsByTagName("image") as ImageElement[];

// --------------------------------------------------------------------------------
// Clock
// --------------------------------------------------------------------------------
// Update the clock every seconds
simpleMinutes.initialize("seconds", (clock) => {
  // date for screenshots
  //clock.Date = "jun 23";

  // Hours
  if (clock.Hours) {
    _cloks[0].href = util.getImageFromLeft(clock.Hours, 0);
    _cloks[1].href = util.getImageFromLeft(clock.Hours, 1);
    _hoursTick.groupTransform.rotate.angle = clock.HoursAngle;
  }

  // Minutes
  if (clock.Minutes) {
    _cloks[3].href = util.getImageFromLeft(clock.Minutes, 0);
    _cloks[4].href = util.getImageFromLeft(clock.Minutes, 1);
    _minutesTick.groupTransform.rotate.angle = clock.MinutesAngle;
  }
  _secondsTick.groupTransform.rotate.angle = clock.SecondsAngle;

  // AM or PM
  if (clock.AmOrPm) {
    util.display(clock.AmOrPm, _ampm);
  }

  // Date 1
  if (clock.Date1 !== undefined) {
    // Position
    _dates1Container.x = 100 - (clock.Date1.length * 10);
    // Values
    util.display(clock.Date1, _dates1);
  }

  // Date 2
  if (clock.Date2 !== undefined) {
    // Position
    _dates2Container.x = 100 - (clock.Date2.length * 10);
    // Values
    util.display(clock.Date2, _dates2);
  }

  // Date 3
  if (clock.Date3 !== undefined) {
    // Position
    _dates3Container.x = 100 - (clock.Date3.length * 10);
    // Values
    util.display(clock.Date3, _dates3);
  }

  // update od stats
  UpdateActivities();
});

// --------------------------------------------------------------------------------
// Power
// --------------------------------------------------------------------------------
import * as batterySimple from "./simple/power-battery";

// Method to update battery level informations
batterySimple.initialize((battery) => {
  let batteryString = battery.toString() + "%";
  let height = Math.floor(battery) * device.screen.height / 100;
  // Battery bar
  _batteryBar.y = device.screen.height - height;
  _batteryBar.height = height;

  // Battery text
  let max = _batteries.length - 1;
  for (let i = 0; i < max; i++) {
    _batteries[i + 1].href = util.getImageFromLeft(batteryString, i);
  }
});
// --------------------------------------------------------------------------------
// Settings
// --------------------------------------------------------------------------------
import * as simpleSettings from "./simple/device-settings";

simpleSettings.initialize((settings: any) => {
  if (!settings) {
    return;
  }

  if (settings.showBatteryPourcentage !== undefined) {
    _batteriesContainer.style.display = settings.showBatteryPourcentage === true
      ? "inline"
      : "none";
  }

  if (settings.showBatteryBar !== undefined) {
    _batteryBar.style.display = settings.showBatteryBar === true
      ? "inline"
      : "none";
  }

  if (settings.statsPosition !== undefined) {
    _statsPosition = settings.statsPosition;
    simpleActivities.reset(); // Reset data to force update
    UpdateActivities(); // For achivement color
  }

  if (settings.colorBackground) {
    _background.style.fill = settings.colorBackground;
  }

  if (settings.graduationForeground) {
    const graduationContainer = document.getElementById("tickcontainer") as GraphicsElement
    const analogContainer = document.getElementById("analog-container") as GroupElement;
    graduationContainer.style.fill = settings.graduationForeground;
    analogContainer.style.fill = settings.graduationForeground;
  }

  if (settings.colorForeground) {
    _container.style.fill = settings.colorForeground;
  }

  // Display based on 12H or 24H format
  if (settings.clockDisplay24 !== undefined) {
    simpleMinutes.updateClockDisplay24(settings.clockDisplay24 as boolean);
  }
});
// --------------------------------------------------------------------------------
// Activity
// --------------------------------------------------------------------------------
import * as simpleActivities from "./simple/activities"

let _statsPosition: boolean;

// Init
simpleActivities.initialize(UpdateActivities);
_stepsArc.startAngle = 0;
_calsArc.startAngle = 90;
_amArc.startAngle = 180;
_distArc.startAngle = 270;

// Elevation is available
if (!simpleActivities.elevationIsAvailable()) {
  _elevationBar.style.display = "none";
  _elevationTextscontainer.style.display = "none";
}

// Update Activities informations
function UpdateActivities() {
  // Get activities
  const activities = simpleActivities.getNewValues();

  // Steps
  if (activities.steps !== undefined) {
    UpdateActivity(activities.steps, StepColor, _stepsArc, _stepsLegend);
    if (_statsPosition === true || _statsPosition === undefined) {
      _stepsArc.startAngle = 0;
    }
    else {
      _stepsArc.startAngle = 90 - _stepsArc.sweepAngle;
    }
  }

  // Calories
  if (activities.calories !== undefined) {
    UpdateActivity(activities.calories, CalsColor, _calsArc, _calsLegend);
  }

  // Active minutes
  if (activities.activeMinutes !== undefined) {
    UpdateActivity(activities.activeMinutes, AmColor, _amArc, _amLegend);
    if (_statsPosition === true || _statsPosition === undefined) {
      _amArc.startAngle = 180;
    }
    else {
      _amArc.startAngle = 270 - _amArc.sweepAngle;
    }
  }

  // Disance
  if (activities.distance !== undefined) {
    UpdateActivity(activities.distance, DistColor, _distArc, _distLegend);
  }

  // Elevation
  if (simpleActivities.elevationIsAvailable() && activities.elevationGain !== undefined) {
    updateElevation(activities.elevationGain);
  }
}

// update activity arc
function UpdateActivity(activity: simpleActivities.Activity, color: string, arc: ArcElement, legend: ImageElement): void {
  if (activity.actual >= activity.goal) {
    arc.sweepAngle = 90;
    setFillColor(arc, GoalColor);
    setFillColor(legend, GoalColor);
  }
  else {
    arc.sweepAngle = util.activityToAngle90(activity.goal, activity.actual);
    setFillColor(arc, color);
    setFillColor(legend, color);
  }
}

// update color only when requested
function setFillColor(element: GraphicsElement, color: string) {
  if (element.style.fill === color) return;
  element.style.fill = color;
}

// update elevation
function updateElevation(activity: simpleActivities.Activity) {
  if (activity.actual >= activity.goal) {
    _elevationBar.y = 0;
    _elevationBar.height = device.screen.height;
    _elevationBar.style.fill = GoalColor;
    _elevationLegend.style.fill = GoalColor;
  }
  else {
    const purcent = getPurcent(activity);
    const height = device.screen.height * purcent / 100;
    _elevationBar.y = device.screen.height - height;
    _elevationBar.height = height;
    _elevationBar.style.fill = ElevationColor;
    _elevationLegend.style.fill = ElevationColor;
  }

  // Display text
  const text = activity.actual.toString();

  // postion of text
  _elevationTextscontainer.x = device.screen.width - text.length * 20 - 30;

  // Uodate texts
  for (let i = 1; i < _elevationTexts.length; i++) {
    _elevationTexts[i].href = util.getImageFromLeft(text, i - 1);
  }
}

// % of an activity
function getPurcent(activity: simpleActivities.Activity): number {
  if (activity.goal <= 0) {
    return 0;
  }
  if (activity.goal) {
    if (activity.goal > activity.goal) return 100;
    return (activity.actual || 0) * 100 / activity.goal;
  }
  return 0;
}

// --------------------------------------------------------------------------------
// Heart rate manager
// --------------------------------------------------------------------------------
import * as simpleHRM from "./simple/hrm";
let lastBpm: number;

simpleHRM.initialize((newValue, bpm, zone, restingHeartRate) => {
  // Zones
  if (zone === "out-of-range") {
    _imgHRM.href = "images/stat_hr_open_48px.png";
  } else {
    _imgHRM.href = "images/stat_hr_solid_48px.png";
  }

  // Animation
  if (newValue) {
    _iconHRM.animate("highlight");
  }

  // BPM value display
  if (bpm !== lastBpm) {
    if (bpm > 0) {
      _hrmContainer.style.display = "inline";
      let bpmString = bpm.toString();
      _hrmTexts[0].href = util.getImageFromLeft(bpmString, 0);
      _hrmTexts[1].href = util.getImageFromLeft(bpmString, 1);
      _hrmTexts[2].href = util.getImageFromLeft(bpmString, 2);
    } else {
      _hrmContainer.style.display = "none";
    }
  }
});