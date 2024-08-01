import {retrieveImages} from './retrieveImages.js'

const numberDailyImgs = [1,2,3,4,6,8,12]
const searchOptionsIds = ["NumImgsOptions","EnableAIOptions"]
const searchOptionsInputs = ["musOptions","numDailyImgsRange","enableAISelect"]

window.addEventListener('load', async function() {
    var callButton = document.getElementById("callButton")
    var numDailyImgsRange = document.getElementById("numDailyImgsRange")
    var numDailyImgsRangeText = document.getElementById("numDailyImgsRangeText")
    var searchOptionsSelect = document.getElementById("searchOptionsSelect")
    var searchOptButton = document.getElementById("searchOptButton")
    var enableAISelect = document.getElementById("enableAISelect")

    var storedOptions = await chrome.storage.sync.get("options")
    storedOptions = storedOptions["options"]

    callButton.addEventListener(
        "click",
        manuallyLaunchImagesRetrieval
    )

    searchOptButton.addEventListener(
        "click",
        validateSearchOptions
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
        showSelectedSearchOption
    )

    if(storedOptions !== undefined){
        numDailyImgsRange.value = numberDailyImgs.indexOf(storedOptions["numDailyImgsRange"])
        numDailyImgsRangeText.innerText = "Number of images per day : "+storedOptions["numDailyImgsRange"]
        enableAISelect.checked = storedOptions["enableAISelect"]
    }

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
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type:"getInLoadingState"}, (response)=>{
        });
    })
    buttonLoadingState(true)
    var ppOpt = validateSearchOptions()
    retrieveImages(ppOpt)
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

    searchOptionsInputs.forEach((inputId,i)=>{
        switch(inputId){
            case "musOptions":
                ppOpt["museum"] = document.querySelector("input[name='"+ inputId+"']:checked").value
                break
            case "numDailyImgsRange":
                ppOpt[inputId] = numberDailyImgs[document.getElementById(inputId).value]
                break
            case "enableAISelect":
                ppOpt[inputId] = document.getElementById(inputId).checked
                break
        }
    })

    console.log(ppOpt)
    storeOptions(ppOpt)
    return ppOpt
}

function showSelectedSearchOption(event){
    searchOptionsIds.forEach((optId,id)=>{
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
