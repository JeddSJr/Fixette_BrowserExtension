import {retrieveImages} from './retrieveImages.js'
import { displayLoadingState as putNewTabInLoadingState,setAdditionalInfo, setMainImg as setNewTabImg} from './newtabHandler.js' ;

// Global variables
const DefaultPpOptions = {
  "museum": "Met",
  "medium": null,
  "numDailyImgsRange": 4,
  "enableAISelect": false,
  "enableImagesInfoSelect": true
}

var NextAlarmTime = 0;
var NewDayAlarmTime = 0;

var LaunchTime = new Date()

var CurrentlyRetrieving = false;

////////////////////////////////////////

async function backgroundCheck(params) {

  setRightToRetrieveImgs()
  setIndexImgToDisplay()
  checkLiveAlarms()
  autoLaunchImagesRetrieval()

}

async function setRightToRetrieveImgs(){
  let today = LaunchTime.getDate()
  let storedDay = await chrome.storage.sync.get("TODAY") //Hesitating between a set + listener or a get and if
  storedDay = storedDay["TODAY"];
  if(storedDay != today){
    chrome.storage.sync.set({"TODAY":today});
    chrome.storage.sync.set({"CAN_RETRIEVE_IMGS":true});
  }
}

async function setIndexImgToDisplay(numberImgs=undefined){ //Make it a do while loop
  //console.log('launchTime: '+launchTime.getHours()+':'+launchTime.getMinutes());
  let launchHour = LaunchTime.getHours();
  let hoursChange = await getHoursChange(numberImgs);
  let indexImg = 0;
  while (launchHour>=hoursChange[indexImg]) {indexImg++}
  chrome.storage.sync.set({"INDEX_IMG_TO_DISPLAY":indexImg}).then(()=>{}); //Can change the set to a get and if if they are costly
  NextAlarmTime = (hoursChange[indexImg]-launchHour)*60-LaunchTime.getMinutes(); //We also calculate when should be the next alarm  to change the index

}

async function checkLiveAlarms(){
  var changeImgAlarm = await chrome.alarms.get('changeImgAlarm');
  var newDayAlarm = await chrome.alarms.get('newDayAlarm');

  await chrome.alarms.clearAll();

  if (!changeImgAlarm) {
    var storedAlarm = await chrome.alarms.create('changeImgAlarm', {
      delayInMinutes: NextAlarmTime
    });
    chrome.storage.sync.set({"changeImgAlarm":storedAlarm}); 
  }

  let launchHour = LaunchTime.getHours();
  NewDayAlarmTime = (24-launchHour)*60-LaunchTime.getMinutes();
  
  if (!newDayAlarm) {
    
    var storedAlarm = await chrome.alarms.create('newDayAlarm', {
      delayInMinutes: NewDayAlarmTime,
      periodInMinutes: 24*60
    });
    chrome.storage.sync.set({"newDayAlarm":storedAlarm});
  }
}

async function autoLaunchImagesRetrieval(forceRetrieval=false){

  if(!CurrentlyRetrieving){

    var rightToRetrieveImgs = await chrome.storage.sync.get("CAN_RETRIEVE_IMGS");
    rightToRetrieveImgs = rightToRetrieveImgs["CAN_RETRIEVE_IMGS"];

    var indexImg = await chrome.storage.sync.get("INDEX_IMG_TO_DISPLAY");
    indexImg = indexImg["INDEX_IMG_TO_DISPLAY"];

    var imgs_batch = await chrome.storage.sync.get("DAILY_IMGS_KEY");
    imgs_batch = imgs_batch["DAILY_IMGS_KEY"];

    if(rightToRetrieveImgs || forceRetrieval || imgs_batch === undefined){

      CurrentlyRetrieving = true;
      let ppOpt = await chrome.storage.sync.get("options") //add default pop up options
      ppOpt = ppOpt["options"];
      if(ppOpt === undefined){ppOpt = DefaultPpOptions;}

      putNewTabInLoadingState(true)
      retrieveImages(ppOpt,ppOpt["numDailyImgsRange"]);
      await chrome.storage.sync.set({"CAN_RETRIEVE_IMGS":false}).then(()=>{ });

    }
    else{
      if(indexImg === undefined){
        setIndexImgToDisplay()
      }
      else{
        setDisplayImg(imgs_batch,indexImg);
      }
    }
  }
}

async function setDisplayImg(imgs_batch,indexImg){
  CurrentlyRetrieving = false;
  putNewTabInLoadingState(true)
  if(!indexImg){indexImg = 0}
  console.log(indexImg);
  console.log(imgs_batch);
  
  let museumImage = imgs_batch[indexImg]
  setNewTabImg(museumImage);
  
  var options = await chrome.storage.sync.get("options");
  options = options["options"];
  
  var canDisplayMoreInfos = options === undefined ? DefaultPpOptions.enableImagesInfoSelect : options.enableImagesInfoSelect;
  setAdditionalInfo(canDisplayMoreInfos)
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
    if(ppOpt === undefined){ppOpt = DefaultPpOptions;}
    numberImgs = ppOpt.numDailyImgsRange;
  }
  var hoursChange = schedule[numberImgs];
  
  return hoursChange;
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
          autoLaunchImagesRetrieval(true);
        });
      }
    }

    if(key === "options"){
      if(oldValue === undefined){
        setAdditionalInfo(newValue.enableImagesInfoSelect);
        setIndexImgToDisplay(newValue.numDailyImgsRange);
      }
      else if(newValue.numDailyImgsRange != oldValue.numDailyImgsRange){
        setIndexImgToDisplay(newValue.numDailyImgsRange);
      }
      else if(newValue.enableImagesInfoSelect != oldValue.enableImagesInfoSelect){
        setAdditionalInfo(newValue.enableImagesInfoSelect);
      }
    }
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if(alarm.name === 'changeImgAlarm'){
    setIndexImgToDisplay();
    checkLiveAlarms(NextAlarmTime);
  }
  if(alarm.name === 'newDayAlarm'){
    chrome.storage.sync.set({"CAN_RETRIEVE_IMGS":true});
  }
});

chrome.runtime.onMessage.addListener((message,sender,sendResponse)=>
  {
    if(message.type === "getInLoadingState"){
      chrome.storage.sync.set({"isLoadingImgs":true});
      putNewTabInLoadingState(true);
      CurrentlyRetrieving = true;
    }
    return true;
  }
)


backgroundCheck()