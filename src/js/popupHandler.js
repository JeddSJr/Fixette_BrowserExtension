import {retrieveImages} from './retrieveImages.js'

const numberDailyImgs = [1,2,3,4,6,8,12,24]
const searchOptionsIds = ["NumImgsOptions","EnableAIOptions"]

window.addEventListener('load', async function() {
    var callButton = document.getElementById("callButton")
    var numDailyImgsRange = document.getElementById("numDailyImgsRange")
    var numDailyImgsRangeText = document.getElementById("numDailyImgsRangeText")
    var searchOptionsSelect = document.getElementById("searchOptionsSelect")


    callButton.addEventListener(
        "click",
        manuallyLaunchImagesRetrieval
    )

    numDailyImgsRange.addEventListener(
        "input",
        (event)=>{
            console.log(event.target.value)
            numDailyImgsRangeText.innerText = "Number of images per day : "+numberDailyImgs[event.target.value]
        }
    )

    searchOptionsSelect.addEventListener(
        "change",
        displayChosenSearchOption
    )

    console.log(searchOptionsSelect)

    var isLoadingImgs = await chrome.storage.sync.get("isLoadingImgs")
    isLoadingImgs = isLoadingImgs["isLoadingImgs"]
    console.log("isLoadingImgs: "+isLoadingImgs)
    buttonLoadingState(isLoadingImgs)
    
})

chrome.storage.onChanged.addListener(async function(changes, namespace) {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if(key === "isLoadingImgs"){
           buttonLoadingState(newValue)
        }
    }
})

export function manuallyLaunchImagesRetrieval(){
    console.log("Manually launching images retrieval")
    var inputs = document.getElementById("musOptions").getElementsByTagName("input")
    var museumToUse = inputs[0].checked ? "Met" : "Louvre"
    var ppOpt ={
        museum : museumToUse,
        //medium:null
    }

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type:"getInLoadingState"}, (response)=>{
        });
    })
    buttonLoadingState(true)
    retrieveImages(ppOpt)
    storeOptions(ppOpt)
}

function displayChosenSearchOption(event){
    console.log(event.target.value)
    searchOptionsIds.forEach((optId,id)=>{
        if(id == event.target.value){
            document.getElementById(optId).removeAttribute("hidden")
        }
        else{
            document.getElementById(optId).setAttribute("hidden","hidden")
        }
    })
        
}

export function buttonLoadingState(isLoading=false){
    var buttonSpinner = document.getElementById("buttonSpinner")
    
    if(isLoading === undefined){
        isLoading = false
    }

    callButton.disabled = isLoading

    if(isLoading){
        buttonSpinner.removeAttribute("hidden")
    }
    else{
        buttonSpinner.setAttribute("hidden","hidden")
    }
}

function storeOptions(value){
    //console.log('Storing object');
    chrome.storage.sync.set({"options": value})
        .then(()=>{
            //console.log('Object of PopUp Options has been stored with value');
            //console.log(value);
        })
}
   