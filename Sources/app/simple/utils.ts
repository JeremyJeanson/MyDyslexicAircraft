// Add zero in front of numbers < 10
export function zeroPad(i: number): string {
  if (i < 10) {
    return "0" + i;
  }
  return i.toString();
}

// Get image url for a char in a string from left
export function getImageFromLeft(str: string, index: number): string {
  if (str.length <= index) {
    return "";
  }
  str = str.substr(index, 1);
  return getImageUrl(str);
}

// Get image for a special char
function getImageUrl(str: string): string {
  // Test if a special image is requiered
  switch (str) {
    case " ":
      str = "space";
      break;
    case "é":
      str = "eacute";
      break;
    case "û":
      str = "ucirc";
      break;
    case "%":
      str = "pourcent";
      break;
    case ".":
    case ",":
      str = "dot";
      break;
  }
  return `images/${str}.png`;
}

// Display text with an array of images
export function display(text: string, controls: ImageElement[]) {
  for (let i = 0; i < controls.length; i++) {
    controls[i].href = getImageFromLeft(text, i);
  }
}

// Activity % convert as angle (90° = 100%) 
export function activityToAngle90(activityGoal: number, activityToday: number): number {
  if (activityGoal <= 0) {
    return 0;
  }
  if (activityGoal) {
    const val = (activityToday || 0) * 90 / activityGoal;
    if (val > 90) return 90;
    return val;
  }
  return 0;
}

// Show control
export function show(control: GraphicsElement): void {
  control.style.display = "inline";
}

// Hide control
export function hide(control: GraphicsElement): void {
  control.style.display = "none";
}

// Set visibility
export function setVisibility(control: GraphicsElement, visible: boolean): void {
  control.style.display = visible
    ? "inline"
    : "none";
}

// highlight a control vith animation
export function highlight(control: GraphicsElement): void {
  control.animate("highlight");
}

// update color only when requested
export function fill(control: GraphicsElement, color: string) {
  // if (control.style.fill === color) return;
  // console.warn(`${color} ${control.style.fill}`);
  control.style.fill = color;
}