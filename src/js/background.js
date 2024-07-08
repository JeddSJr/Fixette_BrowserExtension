import { launchImagesRetrieval } from './popupHandler.js';
import { setMainImg } from './newtabHandler.js';
import MuseumImage from './museumImage.js';

const PPOPT_DICT_SKEY = 'PPOPT_DICT';
const DAILY_IMGS_SKEY = 'DAILY_IMGS_SKEY';
const CHANGE_IMG_ALARM_SKEY = 'changeImgAlarm';
const INDEX_IMG_TO_DISPLAY = 'indexImgToDisplay';
var IMGS_READY_TO_BE_SET = false;

var nextAlarmTime = 0;

var launchTime = new Date()

//launchImagesRetrieval();

const changeImgAlarmStored = chrome.storage.sync.get("changeImgAlarm");
const alarm = chrome.alarms.get('changeImgAlarm');

chrome.storage.sync.set({"INDEX_IMG_TO_DISPLAY":3}).then(()=>{console.log("Value is set");});

function setDisplayImg(imgs,indexImg){
  if(!indexImg){indexImg = 0}
  console.log(indexImg);
  let museumImage = imgs[indexImg]
  
  setMainImg(mimg);
}

function setIndexImgToDisplay(){ //Make it a do while loop
  console.log('launchTime: '+launchTime.getHours()+':'+launchTime.getMinutes());
  try{
    [6,12,18,24].forEach((hourChange,i)=>{
      let launchHour = launchTime.getHours();
      if(launchHour<hourChange){

        chrome.storage.sync.set({"INDEX_IMG_TO_DISPLAY":i}).then(()=>{console.log("Value is set");});
        nextAlarmTime = (hourChange-launchHour)*60-launchTime.getMinutes(); //We also calculate when should be the next alarm  to change the index
        
      }
      throw new Error('ForEach loop Break');
    })
  }catch(e){
    console.log(e);
  }
}

async function verifyAlarm(nextAlarmTime){
  console.log('Next Alarm is in '+nextAlarmTime+' minutes');
  if (changeImgAlarmStored) {
    if (!alarm) {
      await chrome.alarms.create('changeImgAlarm', {
        delayInMinutes: nextAlarmTime,
        periodInMinutes: 6*60
      });    
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
  setIndexImgToDisplay();
  verifyAlarm();
});

setIndexImgToDisplay();
verifyAlarm(nextAlarmTime);

let mimg = new MuseumImage(
  "Jedd","../imgs/DT47.jpg","oil","who cares","Neato","meh.com","lowkey 9 inches"
)

setDisplayImg([mimg,mimg,mimg,mimg],0);