function storeObject(key,value){
    console.log(key,value);
    chrome.storage.sync.set({key: value})
        .then(()=>{
            console.log('Object of key'+key+'has been stored with value'+value);
        });
        
    /*if (objectWasModified(key)){
        if(key === PPOPT_DICT_SKEY){
            retrieveImages(value)
        }
        
        chrome.storage.sync.set(
            {
            key: value
            },function(){
            console.log('Object of key'+key+'has been stored with value'+value);
            }
        );
        
    }*/
}

function storeDailyImgs(key="IMGS_ARRAY",imgs){
    let dailyImgs = {    };
    for (let i = 0; i < imgs.length; i++) {
         dailyImgs[i] = imgs[i]       
    }
    chrome.storage.sync.set({key: dailyImgs})
        .then(()=>{
            console.log("Value is set");
        });
}
function getObject(key,value){
    chrome.storage.sync.get(
        [key],function(res) {
            console.log('Value currently is' + res.key);
        }
    );
}

function objectWasModified(key) {
    return true;
}