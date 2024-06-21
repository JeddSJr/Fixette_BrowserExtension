
const DAILY_IMGS_SKEY = 'IMGS_ARRAY';
const PPOPT_DICT_SKEY = 'PPOPT_DICT';
var IMGS_READY_TO_BE_SET = false;
/*
chrome.runtime.onInstalled.addListener(async () => {
    

});
*/
chrome.storage.onChanged.addListener((changes, namespace) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
      console.log(
        `Storage key "${key}" in namespace "${namespace}" changed.`,
        `Old value was "${oldValue}", new value is "${newValue}".`
      );
    }
  });
  