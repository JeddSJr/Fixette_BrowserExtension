var MUSEUMIMAGEDISPLAYED = null;
var CANDISPLAYINFO = false;
var ISLOADINGSTATE = false;
var ADDINFOLISTELEMENTS = document.createElement("ul")
ADDINFOLISTELEMENTS.className = "list-group "
var ORIENTATION = "landscape";

window.addEventListener('load', function() {
    
    var zoomedImgContainer = document.getElementById("zoomedImgContainer");
    var newTabContainer = document.getElementById("newTabContainer");

    var dezoomedImgContainerL = document.getElementById("dezoomedImgContainerLandscape")
    var dezoomedImgContainerP = document.getElementById("dezoomedImgContainerPortrait")

    var dezoomedImgContainer = document.getElementById("dezoomedImgContainer")

    var additionalInfoDisplay = document.getElementById("additionalInfoDisplay")

    function changeImageZoom() {
        var zoomedImgHidden = zoomedImgContainer.getAttribute("hidden");
        if (zoomedImgHidden) {
            zoomedImgContainer.removeAttribute("hidden");
            newTabContainer.setAttribute("hidden","hidden");
            document.body.style.backgroundColor = "black";
        } else {
            zoomedImgContainer.setAttribute("hidden","hidden");
            newTabContainer.removeAttribute("hidden");
            document.body.removeAttribute("style");
        }
    }

    document.addEventListener('invalid', 
        (()=>{
            return function(e) {e.preventDefault();};
            })
        (), 
        true
    );

    if(dezoomedImgContainerL || dezoomedImgContainerP){
        dezoomedImgContainerL.addEventListener("click",changeImageZoom)
        dezoomedImgContainerP.addEventListener("click",changeImageZoom)
    }

    if(zoomedImgContainer){
        zoomedImgContainer.addEventListener(
            "click",
            changeImageZoom
        )
    }

    setUpTopSites()

    dezoomedImgContainer.addEventListener("mouseover",()=>{
        switchInfoToImg("info")
    })

    additionalInfoDisplay.addEventListener("mouseleave",()=>{
        switchInfoToImg("img")
    })
    
    additionalInfoDisplay.addEventListener("dblclick",()=>{
        changeImageZoom()
    })
})

export function setMainImg(museumImage) {
    
    try {
        console.log(museumImage);
        
        var displayedImgL = document.getElementById("displayImgL");
        var displayedImgP = document.getElementById("displayImgP");
        var imgCaption = document.getElementById("imgCaption")

        imgCaption.innerHTML = " "
        
        displayedImgL.onload = ()=>{
            checKOrientation(displayedImgL)
            displayLoadingState(false)
        }
        displayedImgP.onload = ()=>{
            checKOrientation(displayedImgP)
            displayLoadingState(false)
        }
        
        var zoomedImg = document.getElementById("zoomImg")
        
        let displayArtist = museumImage.artist === "" ? "Artist Unknown" : museumImage.artist

        let displayPeriod = museumImage.period === "" ? "Date Unknown" : museumImage.period 
        var displayTitle = museumImage.title + " - " + displayArtist + " (" + displayPeriod+ ")"

        imgCaption.appendChild(document.createTextNode(displayTitle))

        displayedImgL.src = museumImage.imgSrc
        displayedImgP.src = museumImage.imgSrc

        displayedImgP.title, displayedImgL.title = displayTitle
        displayedImgP.alt, displayedImgL.alt = museumImage.title;
         
        zoomedImg.src = museumImage.imgSrc
        zoomedImg.title = displayTitle
        zoomedImg.alt = museumImage.title;

        displayedImgP.dataset.Title = displayedImgL.dataset.Title = museumImage.title === "" ? "(Untitled)" : museumImage.title;
        displayedImgP.dataset.Artist = displayedImgL.dataset.Artist = displayArtist;
        displayedImgP.dataset.Year = displayedImgL.dataset.Year = displayPeriod;
        displayedImgP.dataset.Medium = displayedImgL.dataset.Medium = museumImage.medium;
        displayedImgP.dataset.Classification = displayedImgL.dataset.Classification = museumImage.classification;
        //displayedImgP.dataset.Measurements = displayedImgL.dataset.Measurements = museumImage.measurements;
        displayedImgP.dataset.Department = displayedImgL.dataset.Department = museumImage.department;
        displayedImgP.dataset.Credits = displayedImgL.dataset.Credits = museumImage.creditLine;  
        displayedImgP.dataset.Link = displayedImgL.dataset.Link = museumImage.objectURL;

        MUSEUMIMAGEDISPLAYED = museumImage;
        
    } catch (error) {
        console.log(error);
    }
}

/*
$('.search-bar-form').submit(function(event) {
        event.preventDefault()
    })
*/

function checKOrientation(img) {
    
    var dezoomedImgContainerL = document.getElementById("dezoomedImgContainerLandscape")
    var dezoomedImgContainerP = document.getElementById("dezoomedImgContainerPortrait")
    
    var nWidth = img.naturalWidth
    var nHeight = img.naturalHeight

    if(nWidth < nHeight){ 
        dezoomedImgContainerP.removeAttribute("hidden")
        dezoomedImgContainerL.setAttribute("hidden","hidden")
        ORIENTATION = "portrait"
    }
    else{ 
        dezoomedImgContainerL.removeAttribute("hidden")
        dezoomedImgContainerP.setAttribute("hidden","hidden")
        ORIENTATION = "landscape"
    }
}

export function displayLoadingState(isLoading=false){
   
    var dezoomedImgContainer = document.getElementById("dezoomedImgContainer")
    var spinnerDiv = document.getElementById("loadingSpinnerDiv")
    var dezoomedImgContainerL = document.getElementById("dezoomedImgContainerLandscape")
    var dezoomedImgContainerP = document.getElementById("dezoomedImgContainerPortrait")
    var additionalInfoDisplay = document.getElementById("additionalInfoDisplay")

    var imgCaption = document.getElementById("imgCaption")
    
    if(isLoading){
        spinnerDiv.removeAttribute("hidden")
        dezoomedImgContainer.setAttribute("hidden","hidden")
        dezoomedImgContainerL.setAttribute("hidden","hidden")
        dezoomedImgContainerP.setAttribute("hidden","hidden")
        additionalInfoDisplay.setAttribute("hidden","hidden")
        imgCaption.innerHTML = " "
        return 0;
    }
    else{
        spinnerDiv.setAttribute("hidden","hidden")
        dezoomedImgContainer.removeAttribute("hidden")
        return 1;
    }
}

export async function setAdditionalInfo(canDisplay=true,isLoading=false){
    console.log("Setting additional info")
    CANDISPLAYINFO = canDisplay;
    ISLOADINGSTATE = isLoading;

    var additionalInfoDisplay = document.getElementById("additionalInfoDisplay")
    var displayedImgL = document.getElementById("displayImgL");
    var displayedImgP = document.getElementById("displayImgP"); 

    var dezoomedImgContainerL = document.getElementById("dezoomedImgContainerLandscape")
    var dezoomedImgContainerP = document.getElementById("dezoomedImgContainerPortrait")

    additionalInfoDisplay.innerHTML = " "
    ADDINFOLISTELEMENTS.innerHTML = " "
    
    if(canDisplay && isLoading === false){
        let data = await displayedImgP.dataset
        let paragraphs = domStringMapToListElements(data)
        paragraphs.forEach((paragraph)=>{
            ADDINFOLISTELEMENTS.appendChild(paragraph)
        })
        let themeColor = document.querySelector("meta[name=theme-color]").content
        displayedImgL.style.backgroundColor = themeColor
        displayedImgP.style.backgroundColor = themeColor
    }
    else{
        displayedImgL.style.backgroundColor = "white"
        displayedImgP.style.backgroundColor = "white"
    }
    
}

function switchInfoToImg(state){
    console.log("Switching info to img")
    if(!CANDISPLAYINFO){
        return}
    

    var dezoomedImgContainerL = document.getElementById("dezoomedImgContainerLandscape")
    var dezoomedImgContainerP = document.getElementById("dezoomedImgContainerPortrait")
    
    var displayedImgL = document.getElementById("displayImgL");
    var displayedImgP = document.getElementById("displayImgP"); 

    var additionalInfoDisplay = document.getElementById("additionalInfoDisplay")

    additionalInfoDisplay.innerHTML = " "

    dezoomedImgContainerL.setAttribute("hidden","hidden")
    dezoomedImgContainerP.setAttribute("hidden","hidden")
    additionalInfoDisplay.setAttribute("hidden","hidden")

    if(state === "info"){
        additionalInfoDisplay.innerHTML += ADDINFOLISTELEMENTS.outerHTML
        additionalInfoDisplay.removeAttribute("hidden")
    }
    if(state === "img"){
        if(ORIENTATION === "landscape"){ 
            dezoomedImgContainerL.removeAttribute("hidden")
        }
        else{ 
            dezoomedImgContainerP.removeAttribute("hidden")
        }
    }
}

function domStringMapToListElements(domStringMap){
    var paragraphs = []
    for (const [key, value] of Object.entries(domStringMap)) {
        let paragraph = document.createElement("li")
        paragraph.innerHTML = "<b>"+ key + "</b> : "
        if(key === "Link"){
            paragraph.innerHTML += "<a href='"+value+"' target='_blank'>"+value+"</a>"
        }
        else{paragraph.innerHTML += value }
        paragraph.className = "list-group-item"
        paragraphs.push(paragraph)
    }
    return paragraphs
}

function faviconURL(u) {
    const url = new URL(chrome.runtime.getURL("/_favicon/"));
    url.searchParams.set("pageUrl", u);
    url.searchParams.set("size", "32");
    return url.toString();
  }
  
function setUpTopSites(){
    var artInfoDivRight = document.getElementById("artInfoDivRight")
    
    chrome.topSites.get((topSites)=>{
        var cardsSection = "<div class='row row-cols-md-5'>"
        topSites.forEach((site)=>{
            var siteFavicon = faviconURL(site.url)
            cardsSection += '<div class="col mb-0">'
            cardsSection += '<div class="card topSitesCard d-flex justify-content-center ">'
            cardsSection += '<a href="'+site.url+'" target="_blank" class="stretched-link" title="'+site.title+'"></a>'
            //cardsSection += '<i class="bi bi-three-dots-vertical align-self-end start-100" fill="black" title="More options"></i>'
            cardsSection += '<div class="topSitesCardImgSection align-self-center d-flex justify-content-center align-items-center mt-1"><img src="'+siteFavicon+'"></div>'
            cardsSection += '<p class="topSitesTitle mt-2 ms-2 me-2" >'+site.title+'</p>'
            cardsSection += '</div>'
            cardsSection += '</div>'   
        })
        cardsSection += "</div>"
        artInfoDivRight.innerHTML += cardsSection
    })
}