import {retrieveImages} from './retrieveImages.js'
import { setMainImg } from './newtabHandler.js';
import MuseumImage from './museumImage.js';

const PPOPT_DICT_SKEY = 'options';
const DAILY_IMGS_SKEY = 'DAILY_IMGS_SKEY';
const CHANGE_IMG_ALARM_SKEY = 'changeImgAlarm';
const INDEX_IMG_TO_DISPLAY = 'indexImgToDisplay';
var IMGS_READY_TO_BE_SET = false;

var nextAlarmTime = 0;

var launchTime = new Date()

//launchImagesRetrieval();

async function autoLaunchImagesRetrieval(){
  let ppOpt = await chrome.storage.sync.get("options") //add default pop up options
  ppOpt = ppOpt["options"];
  retrieveImages(ppOpt);
}

function setDisplayImg(imgs,indexImg){
  if(!indexImg){indexImg = 0}
  console.log(indexImg);
  console.log(imgs);
  let museumImage = imgs[indexImg]
  setMainImg(museumImage);
}

function setIndexImgToDisplay(){ //Make it a do while loop
  console.log('launchTime: '+launchTime.getHours()+':'+launchTime.getMinutes());
  let launchHour = launchTime.getHours();
  let hoursChange = [6,12,18,24];
  let indexImg = 0;
  while (launchHour>hoursChange[indexImg]) {indexImg++}
  chrome.storage.sync.set({"INDEX_IMG_TO_DISPLAY":indexImg}).then(()=>{console.log("Value is set");});
  nextAlarmTime = (hoursChange[indexImg]-launchHour)*60-launchTime.getMinutes(); //We also calculate when should be the next alarm  to change the index
  console.log('Next Alarm is in '+nextAlarmTime+' minutes');
  
}

async function verifyAlarm(nextAlarmTime){
  const changeImgAlarmStored = await chrome.storage.sync.get("changeImgAlarm");

  if (changeImgAlarmStored) {
    const alarm = await chrome.alarms.get('changeImgAlarm');

    if (!alarm) {
      console.log('Alarm is not set, setting it now')
      var storedAlarm = await chrome.alarms.create('changeImgAlarm', {
        delayInMinutes: nextAlarmTime,
        periodInMinutes: 6*60
      });
      chrome.storage.sync.set({"changeImgAlarm":storedAlarm}); 
    }
  }
}

chrome.storage.onChanged.addListener(async (changes, storageArea) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(key)
    if(key === "DAILY_IMGS_KEY"){
      console.log('Images are ready to be set');
      let indexImg = await chrome.storage.sync.get("INDEX_IMG_TO_DISPLAY");
      indexImg = indexImg["INDEX_IMG_TO_DISPLAY"];
      setDisplayImg(newValue,indexImg)
    }
    if(key === "INDEX_IMG_TO_DISPLAY"){
      console.log('Changing the indx of img on display');
      let imgs = await chrome.storage.sync.get("DAILY_IMGS_KEY");
      imgs = imgs["DAILY_IMGS_KEY"];
      setDisplayImg(imgs,newValue)
    }
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  console.log('Alarm fired');
  console.log(alarm);
  setIndexImgToDisplay();
  verifyAlarm();
});



setIndexImgToDisplay();
autoLaunchImagesRetrieval();
verifyAlarm(nextAlarmTime);


//setDisplayImg([mimg,mimg,mimg,mimg],0);
 
//autoLaunchImagesRetrieval();