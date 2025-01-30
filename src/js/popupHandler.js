import {retrieveImages} from './retrieveImages.js'

const NumberDailyImgs = [1,2,3,4,6,8,12]
const SearchOptionsIds = ["NumImgsOptions","EnableAIOptions","EnableImagesInfoOptions","SetBackgroundImageOptions","PinToThisImageOptions"]
const SearchOptionsInputs = ["musOptions","numDailyImgsRange","enableAISelect","enableImagesInfoSelect","setBackgroundImageSelect","pinToThisImageSelect"]
export const DefaultPpOptions = {
    "museum": "Met", 
    "medium": null, 
    "numDailyImgsRange": 4, 
    "enableAISelect": false, 
    "enableImagesInfoSelect": true,
    "setBackgroundImageSelect": true,
    "pinToThisImageSelect": false
}

window.addEventListener('DOMContentLoaded', async function() {
    var numDailyImgsRange = document.getElementById("numDailyImgsRange")
    var numDailyImgsRangeText = document.getElementById("numDailyImgsRangeText")
    var numberDailyImgsTextValue = document.getElementById("numberDailyImgsTextValue")
    var searchOptionsSelect = document.getElementById("searchOptionsSelect")
    var searchOptButton = document.getElementById("searchOptButton")
    var enableAISelect = document.getElementById("enableAISelect")
    var enableImagesInfoSelect = document.getElementById("enableImagesInfoSelect")
    var enableBackgroundImageSelect = document.getElementById("setBackgroundImageSelect")
    var enablePinToThisImageSelect = document.getElementById("pinToThisImageSelect")

    var callButton = document.getElementById("callButton")

    var storedOptions = await chrome.storage.sync.get("options")
    storedOptions = storedOptions["options"]

    searchOptButton.addEventListener(
        "click",
        validateSearchOptions
    )

    numDailyImgsRange.addEventListener(
        "input",
        (event)=>{
            numberDailyImgsTextValue.innerText = NumberDailyImgs[event.target.value]
        }
    )

    searchOptionsSelect.addEventListener(
        "change",
        showSelectedSearchOption
    )

    callButton.addEventListener(
        "click",
        manuallyLaunchImagesRetrieval
    )

    if(storedOptions !== undefined){
        numDailyImgsRange.value = NumberDailyImgs.indexOf(storedOptions["numDailyImgsRange"])
        numberDailyImgsTextValue.innerText = storedOptions["numDailyImgsRange"]
        enableAISelect.checked = storedOptions["enableAISelect"]
        enableImagesInfoSelect.checked = storedOptions["enableImagesInfoSelect"]
        enableBackgroundImageSelect.checked = storedOptions["setBackgroundImageSelect"]
        enablePinToThisImageSelect.checked = storedOptions["pinToThisImageSelect"]
    }

    var isLoadingImgs = await chrome.storage.sync.get("isLoadingImgs")
    isLoadingImgs = isLoadingImgs["isLoadingImgs"]
    
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
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type:"getInLoadingState"}, (response)=>{
        });
    })
    buttonLoadingState(true)
    var ppOpt = validateSearchOptions()
    retrieveImages(ppOpt,ppOpt["numDailyImgsRange"])
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

function validateSearchOptions(){
    var ppOpt ={ }

    SearchOptionsInputs.forEach((inputId,i)=>{
        switch(inputId){
            case "musOptions":
                ppOpt["museum"] = document.querySelector("input[name='"+ inputId+"']:checked").value
                break

            case "numDailyImgsRange":
                ppOpt[inputId] = NumberDailyImgs[document.getElementById(inputId).value]
                break

            case "enableAISelect":
                ppOpt[inputId] = document.getElementById(inputId).checked
                break

            case "enableImagesInfoSelect":
                ppOpt[inputId] = document.getElementById(inputId).checked
                break

            case "setBackgroundImageSelect":
                ppOpt[inputId] = document.getElementById(inputId).checked
                break

            case "pinToThisImageSelect":
                ppOpt[inputId] = document.getElementById(inputId).checked
                break
        }
    })
    storeOptions(ppOpt)
    return ppOpt
}

function showSelectedSearchOption(event){
    SearchOptionsIds.forEach((optId,id)=>{
        if(id == event.target.value){
            document.getElementById(optId).removeAttribute("hidden")
        }
        else{
            document.getElementById(optId).setAttribute("hidden","hidden")
        }
    })
}

function storeOptions(value){
    chrome.storage.sync.set({"options": value})
        .then(()=>{        })
}
