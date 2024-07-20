import {retrieveImages} from './retrieveImages.js'
import { setMainImg } from './newtabHandler.js';

const PPOPT_DICT_SKEY = 'options';
const DAILY_IMGS_SKEY = 'DAILY_IMGS_SKEY';
const CHANGE_IMG_ALARM_SKEY = 'changeImgAlarm';
const INDEX_IMG_TO_DISPLAY = 'indexImgToDisplay';
var IMGS_READY_TO_BE_SET = false;

var nextAlarmTime = 0;
var newDayAlarmTime = 0;

var launchTime = new Date()


async function autoLaunchImagesRetrieval(canRetrieveImgs=false){
  if(canRetrieveImgs){
    let ppOpt = await chrome.storage.sync.get("options") //add default pop up options
    ppOpt = ppOpt["options"];
    retrieveImages(ppOpt);
    chrome.storage.sync.set({"CAN_RETRIEVE_IMGS":false}).then(()=>{ });
  }
  else{
    let indexImg = await chrome.storage.sync.get("INDEX_IMG_TO_DISPLAY");
    indexImg = indexImg["INDEX_IMG_TO_DISPLAY"];
    let imgs = await chrome.storage.sync.get("DAILY_IMGS_KEY");
    imgs = imgs["DAILY_IMGS_KEY"];
    setDisplayImg(imgs,indexImg);
  }
}

function setDisplayImg(imgs,indexImg){
  if(!indexImg){indexImg = 0}
  //console.log(indexImg);
  //console.log(imgs);
  let museumImage = imgs[indexImg]
  setMainImg(museumImage);
}

function setIndexImgToDisplay(){ //Make it a do while loop
  //console.log('launchTime: '+launchTime.getHours()+':'+launchTime.getMinutes());
  let launchHour = launchTime.getHours();
  let hoursChange = [6,12,18,24];
  let indexImg = 0;
  while (launchHour>=hoursChange[indexImg]) {indexImg++}
  chrome.storage.sync.set({"INDEX_IMG_TO_DISPLAY":indexImg}).then(()=>{}); //Can change the set to a get and if if they are costly
  nextAlarmTime = (hoursChange[indexImg]-launchHour)*60-launchTime.getMinutes(); //We also calculate when should be the next alarm  to change the index
  //console.log('Next Alarm is in '+nextAlarmTime+' minutes');
  
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
    //console.log(key)
    if(key === "DAILY_IMGS_KEY"){
      //console.log('Images are ready to be set');
      let indexImg = await chrome.storage.sync.get("INDEX_IMG_TO_DISPLAY");
      indexImg = indexImg["INDEX_IMG_TO_DISPLAY"];
      setDisplayImg(newValue,indexImg)
    }
    if(key === "INDEX_IMG_TO_DISPLAY"){
      //console.log('Changing the indx of img on display');
      let imgs = await chrome.storage.sync.get("DAILY_IMGS_KEY");
      imgs = imgs["DAILY_IMGS_KEY"];
      setDisplayImg(imgs,newValue)
    }
    if(key === "CAN_RETRIEVE_IMGS"){
      if(newValue){
        autoLaunchImagesRetrieval(newValue);
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

setRightToRetrieveImgs()
setIndexImgToDisplay()
checkLiveAlarms(nextAlarmTime)
autoLaunchImagesRetrieval()
