import {retrieveImages} from './retrieveImages.js'

export function manuallyLaunchImagesRetrieval(){
    var inputs = document.getElementById("musOptions").getElementsByTagName("input")
    var museumToUse = inputs[0].checked ? "Met" : "Louvre"
    var ppOpt ={
        museum : museumToUse,
        //medium:null
    }
    retrieveImages(ppOpt)
    storeOptions(ppOpt)
}

var callButton = document.getElementById("callButton")

callButton.addEventListener(
    "click",
    manuallyLaunchImagesRetrieval
)



function storeOptions(value){
    //console.log('Storing object');
    chrome.storage.sync.set({"options": value})
        .then(()=>{
            //console.log('Object of PopUp Options has been stored with value');
            //console.log(value);
        })
}
   