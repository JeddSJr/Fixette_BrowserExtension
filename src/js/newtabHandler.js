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

        var zoomedImg = document.getElementById("zoomImg")
    
        console.log(museumImage.title)

        let displayArtist = museumImage.artist === "" ? "Artist Unknown" : museumImage.artist

        var displayTitle = museumImage.title + " - " + displayArtist + " (" + museumImage.period + ")"

        displayedImgL.src = museumImage.imgSrc
        displayedImgP.src = museumImage.imgSrc

        checKOrientation(displayedImgL)

        displayedImgP.title = displayTitle
        displayedImgP.alt = museumImage.title;
         
        zoomedImg.src = museumImage.imgSrc
        zoomedImg.title = displayTitle
        zoomedImg.alt = museumImage.title;

        
    } catch (error) {
        console.log(error);
    }
    
    /*
    displayedMainImg.alt = museumImage.title;
    displayedMainImg.title = museumImage.title;
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

    console.log(nWidth,nHeight)

    if(nWidth < nHeight){ 
        dezoomedImgContainerP.removeAttribute("hidden")
        dezoomedImgContainerL.setAttribute("hidden","hidden")
    }
    else{ 
        dezoomedImgContainerL.removeAttribute("hidden")
        dezoomedImgContainerP.setAttribute("hidden","hidden")
    }
}