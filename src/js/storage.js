function storeObject(key,value){
    chrome.storage.sync.set(
        {
            key: value
        },function(){
            console.log('Object of key'+key+'has been stored with value'+value);
        }
    );
}