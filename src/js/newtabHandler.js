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
            changeSpinnerVisibility(true)
        }
        displayedImgP.onload = ()=>{
            checKOrientation(displayedImgP)
            changeSpinnerVisibility(true)
        }
        
        var zoomedImg = document.getElementById("zoomImg")
        
        let displayArtist = museumImage.artist === "" ? "Artist Unknown" : museumImage.artist

        let displayPeriod = museumImage.period === "" ? "Date Unknown" : museumImage.period 
        var displayTitle = museumImage.title + " - " + displayArtist + " (" + displayPeriod+ ")"

        imgCaption.appendChild(document.createTextNode(displayTitle))

        displayedImgL.src = museumImage.imgSrc
        displayedImgP.src = museumImage.imgSrc

        displayedImgP.title = displayTitle
        displayedImgP.alt = museumImage.title;
        displayedImgL.title = displayTitle
        displayedImgL.alt = museumImage.title;
         
        zoomedImg.src = museumImage.imgSrc
        zoomedImg.title = displayTitle
        zoomedImg.alt = museumImage.title;
        
    } catch (error) {
        console.log(error);
    }
    
    /*
    displayedMainImg.alt = museumImage.title;
    displayedMainImg.dataset.artist = museumImage.artistDisplayName;
    displayedMainImg.dataset.medium = museumImage.medium;
    displayedMainImg.dataset.objectDate = museumImage.objectDate;
    displayedMainImg.dataset.objectURL = museumImage.objectURL;
    displayedMainImg.dataset.measurements = museumImage.measurements;*/
    
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

export function changeSpinnerVisibility(hidden=false){
   
    var dezoomedImgContainer = document.getElementById("dezoomedImgContainer")
    var spinnerDiv = document.getElementById("loadingSpinnerDiv")
    var dezoomedImgContainerL = document.getElementById("dezoomedImgContainerLandscape")
    var dezoomedImgContainerP = document.getElementById("dezoomedImgContainerPortrait")

    var imgCaption = document.getElementById("imgCaption")
    
    if(hidden){
        spinnerDiv.setAttribute("hidden","hidden")
        dezoomedImgContainer.removeAttribute("hidden")
        return 1;
    }
    else{
        spinnerDiv.removeAttribute("hidden")
        dezoomedImgContainer.setAttribute("hidden","hidden")
        dezoomedImgContainerL.setAttribute("hidden","hidden")
        dezoomedImgContainerP.setAttribute("hidden","hidden")
        imgCaption.innerHTML = " "
        return 0;
    }
}

