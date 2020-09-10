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
const _batteryValueContainer = document.getElementById("battery-value-conainer") as GraphicsElement;
const _batteryValueMask = document.getElementById("battery-arc-back") as ArcElement;

const _batteryTextContainer = document.getElementById("battery-test-container") as GraphicsElement;
const _batteries = document.getElementById("battery-text").getElementsByTagName("image") as ImageElement[];

// Stats
const GoalColor = "gold";

const StepColor = "#FF0000";
const CalsColor = "#FF8000";
const ActiveMinutesColor = "green";
const DistColor = "blue";
const ElevationColor = "#FF0080";

const _statcontainer = document.getElementById("statcontainer") as GraphicsElement;
const _stepsLegendSymbol = document.getElementById("steps-legend") as GraphicsElement;
const _calsLegendSymbol = document.getElementById("cals-legend") as GraphicsElement;
const _activeMinutesLegendSymbol = document.getElementById("am-legend") as GraphicsElement;
const _distLegendSymbol = document.getElementById("dist-legend") as GraphicsElement;
const _elevationLegendSymbol = document.getElementById("elevation-legend") as GraphicsElement;

const _stepsArc = document.getElementById("steps") as ArcElement;
const _calsArc = document.getElementById("cals") as ArcElement;
const _amArc = document.getElementById("am") as ArcElement;
const _distArc = document.getElementById("dist") as ArcElement;

const _elevationValueContainer = document.getElementById("elevation-value-conainer") as GraphicsElement;
const _elevationValueMask = document.getElementById("elevation-arc-back") as ArcElement;

const _elevationTextscontainer = document.getElementById("elevation-text-container") as GraphicsElement;
const _elevationTexts = document.getElementById("elevation-text").getElementsByTagName("image") as ImageElement[];

// Heart rate management
const _hrmContainer = document.getElementById("hrm-container") as GroupElement;
const _iconHRM = document.getElementById("iconHRM") as GraphicsElement;
const _imgHRM = document.getElementById("icon") as ImageElement;
const _hrmTexts = document.getElementById("hrm-text-container").getElementsByTagName("image") as ImageElement[];

class Goals {
  stepsIsHover: boolean;
  calsIsHover: boolean;
  activeMinutesIsHover: boolean;
  distIsHover: boolean;
  elevationsIsHover: boolean;
  public reset(): void {
    this.stepsIsHover = false;
    this.calsIsHover = false;
    this.activeMinutesIsHover = false;
    this.distIsHover = false;
    this.elevationsIsHover = false;
  }
}

const _goeals = new Goals();

let lastBpm: number;

// Import the settigns module
import * as appSettings from "simple-fitbit-settings/app";
// Import settings class from common folder
import { Settings } from "../common/settings";
// Current settings
const _settings = new Settings();

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
  }

  // Minutes
  if (clock.Minutes) {
    _cloks[3].href = util.getImageFromLeft(clock.Minutes, 0);
    _cloks[4].href = util.getImageFromLeft(clock.Minutes, 1);
    _hoursTick.groupTransform.rotate.angle = clock.HoursAngle;
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
  const batteryString = device.screen.height > 250
    ? battery.toString() + "%" // Versa and up
    : battery.toString(); // Ionic
  const angle = Math.floor(100 - battery) * 60 / 100;
  // Battery arc
  _batteryValueMask.startAngle = 300 - angle;
  _batteryValueMask.sweepAngle = angle;

  // Battery text
  util.display(batteryString, _batteries);
});
// --------------------------------------------------------------------------------
// Activity
// --------------------------------------------------------------------------------
import * as simpleActivities from "./simple/activities"

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
    const isHoverGoal = updateActivity(activities.steps, StepColor, _stepsArc);

    if (startposition) {
      _stepsArc.startAngle = 0;
    }
    else {
      _stepsArc.startAngle = 90 - _stepsArc.sweepAngle;
    }
    // Animation?
    if (_goeals.stepsIsHover !== isHoverGoal) {
      UpdateActivityLegent(_stepsLegendSymbol, StepColor, isHoverGoal);
      _goeals.stepsIsHover = isHoverGoal;
    }
  }

  // Calories
  if (activities.calories !== undefined) {
    const isHoverGoal = updateActivity(activities.calories, CalsColor, _calsArc);
    // Animation?
    if (_goeals.calsIsHover !== isHoverGoal) {
      UpdateActivityLegent(_calsLegendSymbol, CalsColor, isHoverGoal);
      _goeals.calsIsHover = isHoverGoal;
    }
  }

  // Active minutes
  if (activities.activeMinutes !== undefined) {
    const isHoverGoal = updateActivity(activities.activeMinutes, ActiveMinutesColor, _amArc);
    if (startposition) {
      _amArc.startAngle = 180;
    }
    else {
      _amArc.startAngle = 270 - _amArc.sweepAngle;
    }
    // Animation?
    if (_goeals.activeMinutesIsHover !== isHoverGoal) {
      UpdateActivityLegent(_activeMinutesLegendSymbol, ActiveMinutesColor, isHoverGoal);
      _goeals.activeMinutesIsHover = isHoverGoal;
    }
  }

  // Disance
  if (activities.distance !== undefined) {
    const isHoverGoal = updateActivity(activities.distance, DistColor, _distArc);
    // Animation?
    if (_goeals.distIsHover !== isHoverGoal) {
      UpdateActivityLegent(_distLegendSymbol, DistColor, isHoverGoal);
      _goeals.distIsHover = isHoverGoal;
    }
  }

  // Elevation
  if (simpleActivities.elevationIsAvailable() && activities.elevationGain !== undefined) {
    const isHoverGoal = updateElevation(activities.elevationGain);
    // Animation?
    if (_goeals.elevationsIsHover !== isHoverGoal) {
      UpdateActivityLegent(_elevationLegendSymbol, ElevationColor, isHoverGoal);
      _goeals.elevationsIsHover = isHoverGoal;
    }
  }
}

// update activity arc
function updateActivity(activity: simpleActivities.Activity, color: string, arc: ArcElement): boolean {
  // Test if goals is reached
  const isHoverGoal: boolean = activity.actual >= activity.goal
  if (isHoverGoal) {
    arc.sweepAngle = 90;
    util.fill(arc, GoalColor);
  }
  else {
    arc.sweepAngle = util.activityToAngle90(activity.goal, activity.actual);
    util.fill(arc, color);
  }

  return isHoverGoal;
}

// update legend symbol stat
function UpdateActivityLegent(legend: GraphicsElement, color: string, isHoverGoal: boolean) {
  const image = legend.getElementById("image") as ImageElement;
  const circle = legend.getElementById("circle") as ImageElement;

  // Test stat
  if (isHoverGoal) {
    util.show(circle);
    util.fill(image, _settings.colorBackground);
    util.highlight(legend);
  }
  else {
    util.hide(circle);
    util.fill(image, color);
  }
}

// update elevation
function updateElevation(activity: simpleActivities.Activity): boolean {
  const isHoverGoal: boolean = activity.actual >= activity.goal;
  if (isHoverGoal) {
    _elevationValueMask.sweepAngle = 0;
  }
  else {
    const purcent = getPurcent(activity);
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

  // Uodate texts
  util.display(text, _elevationTexts);

  return isHoverGoal;
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
    util.display(bpm.toString(), _hrmTexts);
  }
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

        simpleActivities.reset();
        _goeals.reset();
        UpdateActivities(); // For achivement color
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
import { me } from "appbit";
import { display } from "display";
import clock from "clock"

display.addEventListener("change", () => {
  if (display.on) {
    if (_goeals.activeMinutesIsHover) util.highlight(_activeMinutesLegendSymbol);
    if (_goeals.calsIsHover) util.highlight(_calsLegendSymbol);
    if (_goeals.distIsHover) util.highlight(_distLegendSymbol);
    if (_goeals.stepsIsHover) util.highlight(_stepsLegendSymbol);
    if (_goeals.elevationsIsHover) util.highlight(_elevationLegendSymbol);
  }
});

// does the device support AOD, and can I use it?
if (display.aodAvailable && me.permissions.granted("access_aod")) {
  // tell the system we support AOD
  display.aodAllowed = true;

  // respond to display change events
  display.addEventListener("change", () => {

    // console.info(`${display.aodAvailable} ${display.aodEnabled} ${me.permissions.granted("access_aod")} ${display.aodAllowed} ${display.aodActive}`);

    // Is AOD inactive and the display is on?
    if (!display.aodActive && display.on) {
      clock.granularity = "seconds";

      // Show elements & start sensors
      _background.style.display = "inline";
      if (_settings.showBatteryPourcentage) util.show(_batteryTextContainer);
      if (_settings.showBatteryBar) util.show(_batteryValueContainer);
      util.show(_statcontainer);
      if (simpleActivities.elevationIsAvailable) {
        util.show(_elevationValueContainer);
        util.show(_elevationTextscontainer);
      }
      util.show(_hrmContainer);
      util.show(_secondsTick);

      // Start sensors
      simpleHRM.start();
    } else {
      clock.granularity = "minutes";

      // Stop sensors
      simpleHRM.stop();

      // Hide elements
      util.hide(_background);
      util.hide(_batteryTextContainer);
      util.hide(_batteryValueContainer);
      util.hide(_statcontainer);
      util.hide(_elevationValueContainer);
      util.hide(_elevationTextscontainer);
      util.hide(_hrmContainer);
      util.hide(_secondsTick);
    }
  });
}