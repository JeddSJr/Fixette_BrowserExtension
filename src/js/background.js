import {retrieveImages} from './retrieveImages.js'
import { setMainImg } from './newtabHandler.js';
import { displayLoadingState,displayAdditionalInfo } from './newtabHandler.js';


chrome.runtime.onInstalled.addListener((details)  => {
  console.log(details)
})


const DefaultOptions = {
  "museum": "Met",
  "medium": null,
  "numDailyImgsRange": 4,
  "enableAISelect": false,
  "enableImagesInfoSelect": true
}

var nextAlarmTime = 0;
var newDayAlarmTime = 0;

var launchTime = new Date()

var isRetrieving = false;


async function autoLaunchImagesRetrieval(forceRetrieval=false){
  var rightToRetrieveImgs = await chrome.storage.sync.get("CAN_RETRIEVE_IMGS");
  rightToRetrieveImgs = rightToRetrieveImgs["CAN_RETRIEVE_IMGS"];

  var indexImg = await chrome.storage.sync.get("INDEX_IMG_TO_DISPLAY");
  indexImg = indexImg["INDEX_IMG_TO_DISPLAY"];

  var imgs = await chrome.storage.sync.get("DAILY_IMGS_KEY");
  imgs = imgs["DAILY_IMGS_KEY"];
  if(!isRetrieving){
    if(rightToRetrieveImgs || forceRetrieval || imgs === undefined){
      isRetrieving = true;
      let ppOpt = await chrome.storage.sync.get("options") //add default pop up options
      ppOpt = ppOpt["options"];
      if(ppOpt === undefined){ppOpt = DefaultOptions;}

      displayLoadingState(true)
      retrieveImages(ppOpt,ppOpt["numDailyImgsRange"]);
      await chrome.storage.sync.set({"CAN_RETRIEVE_IMGS":false}).then(()=>{ });

    }
    else{
      if(indexImg === undefined){
        setIndexImgToDisplay()
      }
      else{
        setDisplayImg(imgs,indexImg);
      }
    }
  }
}

async function setDisplayImg(imgs,indexImg){
  isRetrieving = false;
  displayLoadingState(true)
  if(!indexImg){indexImg = 0}
  console.log(indexImg);
  console.log(imgs);
  
  let museumImage = imgs[indexImg]
  setMainImg(museumImage);
  
  var options = await chrome.storage.sync.get("options");
  options = options["options"];
  
  var canDisplayMoreInfos = options === undefined ? DefaultOptions.enableImagesInfoSelect : options.enableImagesInfoSelect;
  displayAdditionalInfo(canDisplayMoreInfos)
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

async function checkLiveAlarms(){
  var changeImgAlarm = await chrome.alarms.get('changeImgAlarm');
  var newDayAlarm = await chrome.alarms.get('newDayAlarm');

  await chrome.alarms.clearAll();
  if (!changeImgAlarm) {
    var storedAlarm = await chrome.alarms.create('changeImgAlarm', {
      delayInMinutes: nextAlarmTime
    });
    chrome.storage.sync.set({"changeImgAlarm":storedAlarm}); 
  }

  let launchHour = launchTime.getHours();
  newDayAlarmTime = (24-launchHour)*60-launchTime.getMinutes();
  
  if (!newDayAlarm) {
    
    var storedAlarm = await chrome.alarms.create('newDayAlarm', {
      delayInMinutes: newDayAlarmTime,
      periodInMinutes: 24*60
    });
    chrome.storage.sync.set({"newDayAlarm":storedAlarm});
  }
  
}

chrome.storage.onChanged.addListener(async (changes, storageArea) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {

    if(key === "DAILY_IMGS_KEY"){
      let indexImg = await chrome.storage.sync.get("INDEX_IMG_TO_DISPLAY");
      indexImg = indexImg["INDEX_IMG_TO_DISPLAY"];
      if(oldValue == undefined || (indexImg != undefined && JSON.stringify(newValue[0]) !== JSON.stringify(oldValue[0]))){
        setDisplayImg(newValue,indexImg)
      }
    }
    if(key === "INDEX_IMG_TO_DISPLAY"){
      let imgs = await chrome.storage.sync.get("DAILY_IMGS_KEY");
      imgs = imgs["DAILY_IMGS_KEY"];
      if(imgs != undefined){
        setDisplayImg(imgs,newValue)

      }    
    }
    if(key === "CAN_RETRIEVE_IMGS"){
      if(newValue){
        chrome.storage.sync.set({"CAN_RETRIEVE_IMGS":false}).then(()=>{
          console.log('is loading: '+isRetrieving); 
          console.log('Retrieving images');
          autoLaunchImagesRetrieval(true);
        });
      }
    }
    if(key === "options"){
      if(oldValue === undefined){
        displayAdditionalInfo(newValue.enableImagesInfoSelect);
        setIndexImgToDisplay(newValue.numDailyImgsRange);
      }
      else if(newValue.numDailyImgsRange != oldValue.numDailyImgsRange){
        setIndexImgToDisplay(newValue.numDailyImgsRange);
      }
      else if(newValue.enableImagesInfoSelect != oldValue.enableImagesInfoSelect){
        displayAdditionalInfo(newValue.enableImagesInfoSelect);
      }
    }
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
      chrome.storage.sync.set({"isLoadingImgs":true});
      displayLoadingState(true);
      isRetrieving = true;
    }
    return true;
  }
)

setRightToRetrieveImgs()
setIndexImgToDisplay()
checkLiveAlarms()
autoLaunchImagesRetrieval()

