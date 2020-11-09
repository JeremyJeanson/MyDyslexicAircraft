import * as simpleSettings from "simple-fitbit-settings/common";
// Settings 
export class Settings {
  public clockFormat: simpleSettings.Selection = { selected: [0], values: [{ name: "user", value: "user" }] };
  public showBatteryPourcentage: boolean = true;
  public showBatteryBar: boolean = true;
  public statsPosition: boolean = false;
  public colorBackground: string = "black";
  public colorForeground: string = "white";
  public graduationForeground: string = "white";
}