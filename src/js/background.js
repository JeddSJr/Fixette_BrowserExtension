import {retrieveImages} from './retrieveImages.js'
import { setMainImg } from './newtabHandler.js';
import { displayLoadingState } from './newtabHandler.js';

chrome.runtime.onInstalled.addListener((details)  => {
  console.log(details)
})


const DefaultOptions = {
  "museum": "Met",
  "medium": null,
  "numDailyImgsRange": 4,
  "enableAISelect": false
}

var nextAlarmTime = 0;
var newDayAlarmTime = 0;

var launchTime = new Date()


async function autoLaunchImagesRetrieval(forceRetrieval=false){
  var rightToRetrieveImgs = await chrome.storage.sync.get("CAN_RETRIEVE_IMGS");
  rightToRetrieveImgs = rightToRetrieveImgs["CAN_RETRIEVE_IMGS"];

  if(rightToRetrieveImgs || forceRetrieval){

    let ppOpt = await chrome.storage.sync.get("options") //add default pop up options
    ppOpt = ppOpt["options"];
    
    if(ppOpt === undefined){ppOpt = DefaultOptions;}
    retrieveImages(ppOpt);
    chrome.storage.sync.set({"CAN_RETRIEVE_IMGS":false}).then(()=>{ });

  }
  else{

    let indexImg = await chrome.storage.sync.get("INDEX_IMG_TO_DISPLAY");
    indexImg = indexImg["INDEX_IMG_TO_DISPLAY"];
    let imgs = await chrome.storage.sync.get("DAILY_IMGS_KEY");
    imgs = imgs["DAILY_IMGS_KEY"];
    
    if(imgs === undefined){
      autoLaunchImagesRetrieval(true)
    }
    else if(indexImg === undefined){
      setIndexImgToDisplay()
    }
    else{
      setDisplayImg(imgs,indexImg);
    }

  }
}

function setDisplayImg(imgs,indexImg){
  displayLoadingState(true)
  if(!indexImg){indexImg = 0}
  console.log(indexImg);
  console.log(imgs);
  let museumImage = imgs[indexImg]
  setMainImg(museumImage);
}

async function setRightToRetrieveImgs(){
  let today = launchTime.getDate()
  let storedDay = await chrome.storage.sync.get("TODAY") //Hesitating between a set + listener or a get and if
  storedDay = storedDay["TODAY"];
  if(storedDay != today){
    chrome.storage.sync.set({"TODAY":today});
    chrome.storage.sync.set({"CAN_RETRIEVE_IMGS":true});
  }

}

async function getHoursChange(numberImgs=undefined){
  var schedule = {
    1:[24],
    2:[12,24],
    3:[8,16,24],
    4:[6,12,18,24],
    6:[4,8,12,16,20,24],
    8:[3,6,9,12,15,18,21,24],
    12:[2,4,6,8,10,12,14,16,18,20,22,24]
  }
  
  if(numberImgs === undefined){
    var ppOpt = await chrome.storage.sync.get("options") //add default pop up options
    ppOpt = ppOpt["options"];
    if(ppOpt === undefined){ppOpt = DefaultOptions;}
    numberImgs = ppOpt.numDailyImgsRange;
  }
  var hoursChange = schedule[numberImgs];
  
  return hoursChange;
}

async function setIndexImgToDisplay(numberImgs=undefined){ //Make it a do while loop
  //console.log('launchTime: '+launchTime.getHours()+':'+launchTime.getMinutes());
  let launchHour = launchTime.getHours();
  let hoursChange = await getHoursChange(numberImgs);
  let indexImg = 0;
  while (launchHour>=hoursChange[indexImg]) {indexImg++}
  
  chrome.storage.sync.set({"INDEX_IMG_TO_DISPLAY":indexImg}).then(()=>{}); //Can change the set to a get and if if they are costly
  nextAlarmTime = (hoursChange[indexImg]-launchHour)*60-launchTime.getMinutes(); //We also calculate when should be the next alarm  to change the index
  
}

async function checkLiveAlarms(nextAlarmTime){
  let changeImgAlarm = await chrome.alarms.get('changeImgAlarm');
  let newDayAlarm = await chrome.alarms.get('newDayAlarm');

  if (!changeImgAlarm) {
    //console.log('Alarm is not set, setting it now')
    var storedAlarm = await chrome.alarms.create('changeImgAlarm', {
      delayInMinutes: nextAlarmTime,
      periodInMinutes: 6*60
    });
    chrome.storage.sync.set({"changeImgAlarm":storedAlarm}); 
  }

  let launchHour = launchTime.getHours();
  newDayAlarmTime = (24-launchHour)*60-launchTime.getMinutes();
  //console.log('New day alarm time: '+newDayAlarmTime);
  if (!newDayAlarm) {
    //console.log('Alarm is not set, setting it now')
    var storedAlarm = await chrome.alarms.create('newDayAlarm', {
      delayInMinutes: newDayAlarmTime,
      periodInMinutes: 24*60
    });
    chrome.storage.sync.set({"newDayAlarm":storedAlarm});
    chrome.storage.sync.set({"CAN_RETRIEVE_IMGS":true});
  }
  
}

chrome.storage.onChanged.addListener(async (changes, storageArea) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(key)
    if(key === "DAILY_IMGS_KEY"){
      let indexImg = await chrome.storage.sync.get("INDEX_IMG_TO_DISPLAY");
      indexImg = indexImg["INDEX_IMG_TO_DISPLAY"];
      if(indexImg != undefined){
        setDisplayImg(newValue,indexImg)
      }
    }
    if(key === "INDEX_IMG_TO_DISPLAY"){
      //console.log('Changing the indx of img on display');
      let imgs = await chrome.storage.sync.get("DAILY_IMGS_KEY");
      imgs = imgs["DAILY_IMGS_KEY"];
      if(imgs != undefined){
        setDisplayImg(imgs,newValue)
      }    
    }
    if(key === "CAN_RETRIEVE_IMGS"){
      if(newValue){
       //CAN RETRIEVE IMGS
      }
    }
    if(key === "options"){
      if(newValue.numDailyImgsRange != oldValue.numDailyImgsRange){
        setIndexImgToDisplay(newValue.numDailyImgsRange);
      }
    }
    /*if(key === "isLoadingImgs"){
      console.log('isLoadingImgs: '+newValue);
      displayLoadingState(newValue)
    }*/
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if(alarm.name === 'changeImgAlarm'){
    setIndexImgToDisplay();
    checkLiveAlarms(nextAlarmTime);
  }
  if(alarm.name === 'newDayAlarm'){
    chrome.storage.sync.set({"CAN_RETRIEVE_IMGS":true});
  }
});

chrome.runtime.onMessage.addListener((message,sender,sendResponse)=>
  {
    if(message.type === "getInLoadingState"){
      console.log('In loading state');
      chrome.storage.sync.set({"isLoadingImgs":true});
      displayLoadingState(true);
      
    }
    return true;
  }
)
chrome.storage.sync.set({"isLoadingImgs":false});
setRightToRetrieveImgs()
setIndexImgToDisplay()
checkLiveAlarms(nextAlarmTime)
autoLaunchImagesRetrieval()

