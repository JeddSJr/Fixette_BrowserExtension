import {retrieveImages} from "./retrieveImages.js"

function manuallySetImages(){
    var inputs = document.getElementById("musOptions").getElementsByTagName("input"); 
    var museumToUse = inputs[0].checked ? "Met" : "Louvre"
    var ppOpt ={
        museum : museumToUse,
        //medium:null
    }
    retrieveImages(ppOpt)
    storeObject(PPOPT_DICT_SKEY,ppOpt)
}

var callButton = document.getElementById("callButton")
   
callButton.addEventListener(
    "click",
    manuallySetImages
)