var zoomedImgContainer = document.getElementById("zoomedImgContainer");
var newTabContainer = document.getElementById("newTabContainer");
var dezoomedImgContainer = document.getElementById("dezoomedImgContainer");



var zoomedMainImg = document.getElementById("zoomedMainImg");


window.addEventListener("DOMContentLoaded", (event) => {

    if(zoomedImgContainer){
        zoomedImgContainer.addEventListener(
            "click",
            changeImageZoom
        )
    }
    
    if(dezoomedImgContainer){dezoomedImgContainer.addEventListener(
        "click",
        changeImageZoom
    )}
    
    document.addEventListener('invalid', 
        (()=>{
            return function(e) {e.preventDefault();};
        })
        (), 
        true
    );

    console.log('DOM fully loaded and parsed');
});


/*
$('.search-bar-form').submit(function(event) {
        event.preventDefault()
    })
*/

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

export function setMainImg(museumImage) {
    console.log(museumImage);
    try {
        if(document.readyState === "complete") {
            console.log('Document is ready');
            var displayedMainImg = document.getElementById("displayedMainImg");
            console.log(displayedMainImg);
            //displayedMainImg.src = museumImage.primaryImage;
        }
    } catch (error) {
        console.log(error);
    }
    
    /*d
    displayedMainImg.alt = museumImage.title;
    displayedMainImg.title = museumImage.title;
    displayedMainImg.dataset.artist = museumImage.artistDisplayName;
    displayedMainImg.dataset.medium = museumImage.medium;
    displayedMainImg.dataset.objectDate = museumImage.objectDate;
    displayedMainImg.dataset.objectURL = museumImage.objectURL;
    displayedMainImg.dataset.measurements = museumImage.measurements;*/
    
}

