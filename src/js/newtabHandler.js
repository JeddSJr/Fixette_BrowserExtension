var zoomedImgContainer = document.getElementById("zoomedImgContainer");
var newTabContainer = document.getElementById("newTabContainer");
var displayedMainImg = document.getElementById("displayedMainImg");
var dezoomedImgContainer = document.getElementById("dezoomedImgContainer");

zoomedImgContainer.addEventListener(
    "click",
    changeImageZoom
)

dezoomedImgContainer.addEventListener(
    "click",
    changeImageZoom
)

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

