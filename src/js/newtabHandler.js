var MUSEUMIMAGEDISPLAYED = null;
window.addEventListener('load', function() {
    
    var zoomedImgContainer = document.getElementById("zoomedImgContainer");
    var newTabContainer = document.getElementById("newTabContainer");

    var dezoomedImgContainerL = document.getElementById("dezoomedImgContainerLandscape")
    var dezoomedImgContainerP = document.getElementById("dezoomedImgContainerPortrait")

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
    }
    else{ 
        dezoomedImgContainerL.removeAttribute("hidden")
        dezoomedImgContainerP.setAttribute("hidden","hidden")
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

export async function displayAdditionalInfo(canDisplay=true,isLoading=false){
    var additionalInfoDisplay = document.getElementById("additionalInfoDisplay")
    var displayedImgL = document.getElementById("displayImgL");
    var displayedImgP = document.getElementById("displayImgP"); 
    additionalInfoDisplay.textContent = ' '

    if(canDisplay && isLoading === false){
        additionalInfoDisplay.removeAttribute("hidden")
        var listElement = document.createElement("ul")
        listElement.className = "list-group "
        let data = await displayedImgP.dataset
        let paragraphs = domStringMapToListElements(data)
        paragraphs.forEach((paragraph)=>{
            listElement.appendChild(paragraph)
        })
        additionalInfoDisplay.appendChild(listElement)
    }
    else{
        additionalInfoDisplay.setAttribute("hidden","hidden")
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

function setUpTopSites(){

    var artInfoDivRight = document.getElementById("artInfoDivRight")
    
    
    chrome.topSites.get((topSites)=>{
        var cardsSection = "<div class='container'><div class='row row-cols-md-3'>"
        topSites.forEach((site)=>{
            cardsSection += '<div class="col mb-4">'
            cardsSection += '<div class="card topSitesCard" style="width:100px;height:100px" title="'+site.title+'">'
            cardsSection += '<div class="topSitesCardImgSection" >'
            cardsSection += '<img src="http://www.google.com/s2/favicons?domain_url='+site.url+'" class="img-fluid" alt="'+site.title+'" style="width:40%">'
            cardsSection += '</div>'
            cardsSection += '<a href="'+site.url+'" target="_blank" class="stretched-link"></a>'
            cardsSection += '<div class="card-body" >'
            cardsSection += '<p class="card-text topSitesCardBody" style="font-size:11px;overflow:hidden;white-space: nowrap;text-overflow: ellipsis;">'+site.title+'</p>'
            cardsSection += '</div>'
            cardsSection += '</div>'   
            cardsSection += '</div>'  
        })
        cardsSection += "</div></div>"
        artInfoDivRight.innerHTML += cardsSection
        console.log(document.getElementsByClassName("topSitesCard"))
    })
}