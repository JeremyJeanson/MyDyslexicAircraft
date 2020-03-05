// Add zero in front of numbers < 10
export function zeroPad(i:number) : string {
  if (i < 10) {
    return "0" + i;
  }
  return i.toString();
}

// Get image url for a char in a string from left
export function getImageFromLeft(str:string,index:number) : string {
  if(str.length <= index)
  {
    return "";
  }
  str = str.substr(index,1);
  return getImage(str);
}

function getImage(str:string) : string{
  // Test if a special image is requiered
  switch(str)
  {
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

export function display(text: string, controls: ImageElement[]) {
  for (let i = 0; i < controls.length; i++) {
    controls[i].href = getImageFromLeft(text, i);
  }
}

export function activityToAngle(activityGoal:number, activityToday:number):number
{
  if(activityGoal<=0) {
    return 0;
  }
  if(activityGoal)
  {
    return (activityToday||0) * 360 / activityGoal;
  }
  return 0;
}

export function activityToAngle90(activityGoal:number, activityToday:number):number
{
  if(activityGoal<=0) {
    return 0;
  }
  if(activityGoal)
  {
    const val = (activityToday||0) * 90 / activityGoal;
    if(val>90) return 90;    
    return val;
  }
  return 0;
}