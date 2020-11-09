import clock from "clock";
import { preferences } from "user-settings";

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

type AmOrPm = "AM" | "PM" | "  ";
export type HoursFormat = "user" | "12h" | "24h";

export class FormatedDate {
    Hours: string | undefined;
    Minutes: string | undefined;
    Date1: string | undefined;
    Date2: string | undefined;
    Date3: string | undefined;
    AmOrPm: AmOrPm | undefined;
    HoursAngle: number | undefined;
    MinutesAngle: number | undefined;
    SecondsAngle: number | undefined;
}

// Callback
let _callback: (clock: FormatedDate) => void;

// 24h format
let _hoursFormat: HoursFormat;

// Last values
let _lastDate: Date;

// Ouputs
export let last: FormatedDate;

// Initialize the call back
export function initialize(hoursFormat: HoursFormat, callback: (clock: FormatedDate) => void): void {
    // Init values
    _hoursFormat = hoursFormat;
    _callback = callback;

    // Tick every seconds
    clock.granularity = "seconds";

    // Tick
    clock.ontick = (evt) => {
        update(evt.date);
    };
}

// Update the user setting
export function updateHoursFormat(value: HoursFormat): void {
    _hoursFormat = value;
    update(_lastDate);
}

// Update the clock
function update(date: Date): void {
    if (date === undefined) return;
    // last date
    _lastDate = date;

    // 24 hours format
    const is4hFormat = get24hFormat();

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
    ouput.Hours = formatHours(hours, is4hFormat);

    // Format AM / PM if requested
    if (is4hFormat) {
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
    _callback(ouput);
}

/**
 * The user need 24h clock format?
 */
function get24hFormat(): boolean {
    switch (_hoursFormat) {
        case "12h": return false;
        case "24h": return true;
    }
    return preferences.clockDisplay === "24h";
}

// Format the hours, based on user preferences
function formatHours(hours: number, is4hFormat: boolean): string|undefined {
    if (hours === undefined) return undefined;
    let result = is4hFormat
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