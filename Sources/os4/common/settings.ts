import * as simpleSettings from "simple-fitbit-settings/common";
// Settings 
export class Settings {
  public clockFormat: simpleSettings.Selection = { selected: [0], values: [{ name: "user", value: "user" }] };
  public showBatteryPourcentage = true;
  public showBatteryBar = true;
  public statsPosition = false;
  public colorBackground = "black";
  public colorForeground = "white";
  public graduationForeground = "white";
}