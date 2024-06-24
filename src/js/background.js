
const PPOPT_DICT_SKEY = 'PPOPT_DICT';
const DAILY_IMGS_SKEY = 'DAILY_IMGS_SKEY';
var IMGS_READY_TO_BE_SET = false;
/*
chrome.runtime.onInstalled.addListener(async () => {
    

});
*/
chrome.storage.onChanged.addListener((changes, storageArea) => {
  if(changes[DAILY_IMGS_SKEY]?.newValue){
      console.log(
        `Storage key "${DAILY_IMGS_SKEY}" in namespace "${storageArea}" changed.`,
      );
      console.log(oldValue);
      console.log(newValue);
    }
  });
  
chrome.runtime.onMessage.addListener({});