import clock from "clock"

// Localisation
import { gettext } from "i18n";
const _months = [
    gettext("m1"),
    gettext("m2"),
    gettext("m3"),
    gettext("m4"),
    gettext("m5"),
    gettext("m6"),
    gettext("m7"),
    gettext("m8"),
    gettext("m9"),
    gettext("m10"),
    gettext("m11"),
    gettext("m12")
];

const _days = [
    gettext("d1"),
    gettext("d2"),
    gettext("d3"),
    gettext("d4"),
    gettext("d5"),
    gettext("d6"),
    gettext("d7")
];

type Granularity = "off" | "seconds" | "minutes" | "hours";
type AmOrPm = "AM" | "PM" | "  ";

export class FormatedDate {
    Hours: string;
    Minutes: string;
    Date1: string;
    Date2: string;
    Date3: string;
    AmOrPm: AmOrPm;
    HoursAngle: number;
    MinutesAngle: number;
    SecondsAngle: number;
}

// Callback
let _callback: (clock: FormatedDate) => void;

// H24 setting
let _clockDisplay24: boolean;

// Last values
let _lastDate: Date;

// Ouputs
export let last: FormatedDate;

// Initialize the call back
export function initialize(granularity: Granularity, callback: (clock: FormatedDate) => void): void {
    // Tick every minutes
    clock.granularity = granularity;

    _callback = callback;

    // Tick
    clock.ontick = (evt) => {
        update(evt.date);
    };
}

// Update the user setting
export function updateClockDisplay24(value: boolean): void {
    _clockDisplay24 = value;
    update(_lastDate);
}

// Update the clock
function update(date: Date): void {
    if (date === undefined) return;
    // last date
    _lastDate = date;

    // Las output
    if (last === undefined) {
        last = new FormatedDate();
    }

    // Declare ouputs
    const ouput = new FormatedDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    ouput.SecondsAngle = secondsToAngle(date.getSeconds());

    // Format the hour
    ouput.Hours = formatHours(hours);

    // Format AM / PM if requested
    if (_clockDisplay24 === undefined || _clockDisplay24 === true) {
        // No AM or PM
        ouput.AmOrPm = "  ";
    }
    else {
        // AM / PM are available
        ouput.AmOrPm = hours < 12 ? "AM" : "PM";
    }

    // Format the minutes
    ouput.Minutes = zeroPad(minutes);

    // Format the date
    setDate(ouput, date);

    // Save or updage states
    if (ouput.Hours !== last.Hours) {
        last.Hours = ouput.Hours;
    }
    else {
        ouput.Hours = undefined;
    }

    if (ouput.Minutes !== last.Minutes) {
        last.Minutes = ouput.Minutes;
        ouput.HoursAngle = hoursToAngle(hours, minutes);
        ouput.MinutesAngle = minutesToAngle(minutes);
    }
    else {
        ouput.Minutes = undefined;
    }

    if (ouput.Date1 !== last.Date1) {
        last.Date1 = ouput.Date1;
    }
    else {
        ouput.Date1 = undefined;
    }

    if (ouput.Date2 !== last.Date2) {
        last.Date2 = ouput.Date2;
    }
    else {
        ouput.Date2 = undefined;
    }

    if (ouput.Date3 !== last.Date3) {
        last.Date3 = ouput.Date3;
    }
    else {
        ouput.Date3 = undefined;
    }

    if (ouput.AmOrPm !== last.AmOrPm) {
        last.AmOrPm = ouput.AmOrPm;
    }
    else {
        ouput.AmOrPm = undefined;
    }

    // Call the callback
    _callback(ouput)
};

// Format the hours, based on user preferences
function formatHours(hours: number): string {
    if (hours === undefined) return undefined;
    let result = _clockDisplay24 === undefined || _clockDisplay24 === true
        ? zeroPad(hours)
        : (hours % 12 || 12).toString();
    if (result.length === 1) result = " " + result;
    return result;
}

// Format the date, based on user language
function setDate(output: FormatedDate, date: Date): void {
    const month = _months[date.getMonth()];
    const day = date.getDate();
    const dayOfWeeck = _days[date.getDay()];

    output.Date1 = dayOfWeeck;
    output.Date2 = day.toString();
    output.Date3 = month;
}

// Returns an angle (0-360) for the current hour in the day, including minutes
function hoursToAngle(hours: number, minutes: number): number {
    return (360 / 12) * (hours + minutes / 60);
}

// Returns an angle (0-360) for minutes
function minutesToAngle(minutes: number): number {
    return (360 / 60) * minutes;
}

// Returns an angle (0-360) for seconds
function secondsToAngle(seconds: number): number {
    return (360 / 60) * seconds;
}

// Add zero in front of numbers < 10
function zeroPad(i: number): string {
    return i < 10
        ? "0" + i
        : i.toString();
}