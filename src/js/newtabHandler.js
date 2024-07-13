window.addEventListener('load', function() {
    var zoomedImgContainer = document.getElementById("zoomedImgContainer");
    var newTabContainer = document.getElementById("newTabContainer");
    var dezoomedImgContainer = document.getElementById("dezoomedImgContainer");

    var displayedImg = document.getElementById("displayImg");

    function changeImageZoom() {
        var zoomedImgHidden = zoomedImgContainer.getAttribute("hidden");
        dezoomedImgContainer.src = "../imgs/default/DP215410.jpg";
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

    if(dezoomedImgContainer){dezoomedImgContainer.addEventListener(
        "click",
        changeImageZoom
    )}

    if(zoomedImgContainer){
        zoomedImgContainer.addEventListener(
            "click",
            changeImageZoom
        )
    }
})

export function setMainImg(museumImage) {
    
    try {
        //Make it so that the vertical images don't push back the bar
        console.log(museumImage);
        var displayedImg = document.getElementById("displayImg");
        var zoomedImg = document.getElementById("zoomImg")
        console.log(museumImage.title)

        let displayArtist = museumImage.artist === "" ? "Artist Unknown" : museumImage.artist

        var displayTitle = museumImage.title + " - " + displayArtist + " (" + museumImage.period + ")"

        displayedImg.src = museumImage.imgSrc

        let nWidth = displayedImg.naturalWidth
        let nHeight = displayedImg.naturalHeight
        if(nWidth > nHeight){ document.getElementById("dezoomedImgContainer").style.maxWidth = "80%"; }
        else{ document.getElementById("dezoomedImgContainer").style.maxWidth = "50%"; }

        displayedImg.title = displayTitle
        displayedImg.alt = museumImage.title;

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


