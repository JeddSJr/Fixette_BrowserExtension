var MUSEUMIMAGEDISPLAYED = null;
var CANDISPLAYINFO = false;
var ISLOADINGSTATE = false;
var ADDINFOLISTELEMENTS = document.createElement("ul")
ADDINFOLISTELEMENTS.className = "list-group "
var orientation = "landscape";

window.addEventListener('load', function () {

    var zoomedImgContainer = document.getElementById("zoomedImgContainer");
    var newTabContainer = document.getElementById("newTabContainer");

    var dezoomedImgContainerL = document.getElementById("dezoomedImgContainerLandscape")
    var dezoomedImgContainerP = document.getElementById("dezoomedImgContainerPortrait")

    var dezoomedImgContainer = document.getElementById("dezoomedImgContainer")

    var additionalInfoDisplay = document.getElementById("additionalInfoDisplay")

    var hideSymbolsSpan = document.getElementById("hideSymbolsSpan")

    var darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

    var imgCaption = document.getElementById("imgCaption")

    function changeImageZoom() {
        var zoomedImgHidden = zoomedImgContainer.hasAttribute("hidden");

        if (zoomedImgHidden) {
            zoomedImgContainer.removeAttribute("hidden");
            newTabContainer.setAttribute("hidden", "hidden");
        } else {
            zoomedImgContainer.setAttribute("hidden", "hidden");
            newTabContainer.removeAttribute("hidden");
        }
    }

    function hideDisplayImage(){
        var closedEyeIcoDark = document.getElementById("closedEyeIcoDark")
        var closedEyeIcoLight = document.getElementById("closedEyeIcoLight")
        var openEyeIcoDark = document.getElementById("openEyeIcoDark")
        var openEyeIcoLight = document.getElementById("openEyeIcoLight")

        if(!closedEyeIcoDark.hasAttribute("hidden") || !closedEyeIcoLight.hasAttribute("hidden")){
            dezoomedImgContainer.style.visibility = "hidden"
            imgCaption.style.visibility = "hidden"
            additionalInfoDisplay.style.visibility = "hidden"
            if(darkMode){
                closedEyeIcoDark.setAttribute("hidden", "hidden")
                openEyeIcoDark.removeAttribute("hidden")
            }
            else {
                closedEyeIcoLight.setAttribute("hidden", "hidden")
                openEyeIcoLight.removeAttribute("hidden")
            }
        }
        else{
            dezoomedImgContainer.style.visibility = "visible"
            imgCaption.style.visibility = "visible"
            additionalInfoDisplay.style.visibility = "visible"
            if(darkMode){
                openEyeIcoDark.setAttribute("hidden", "hidden")
                closedEyeIcoDark.removeAttribute("hidden")
            }
            else {
                openEyeIcoLight.setAttribute("hidden", "hidden")
                closedEyeIcoLight.removeAttribute("hidden")
            }
        }
    }

    document.addEventListener('invalid',
        (() => {
            return function (e) { e.preventDefault(); };
        })
            (),
        true
    );

    if (dezoomedImgContainerL || dezoomedImgContainerP) {
        dezoomedImgContainerL.addEventListener("click", changeImageZoom)
        dezoomedImgContainerP.addEventListener("click", changeImageZoom)
    }



    if (zoomedImgContainer) {
        zoomedImgContainer.addEventListener(
            "click",
            changeImageZoom
        )
    }

    setUpTopSites()

    hideSymbolsSpan.addEventListener("click", () => {
        hideDisplayImage()
    })

    dezoomedImgContainer.addEventListener("mouseover", () => {
        switchInfoToImg("info")
    })

    additionalInfoDisplay.addEventListener("mouseleave", () => {
        switchInfoToImg("img")
    })

    additionalInfoDisplay.addEventListener("dblclick", () => {
        changeImageZoom()
    })
})

export function setMainImg(museumImage) {

    try {
        
        var displayedImgL = document.getElementById("displayImgL");
        var displayedImgP = document.getElementById("displayImgP");
        var imgCaption = document.getElementById("imgCaption")
        var dezoomedImgContainer = document.getElementById("dezoomedImgContainer")

        imgCaption.innerHTML = " "

        displayedImgL.onload = () => {
            checKOrientation(displayedImgL)
            displayLoadingState(false)
        }
        displayedImgP.onload = () => {
            checKOrientation(displayedImgP)
            displayLoadingState(false)
        }

        var zoomedImg = document.getElementById("zoomImg")

        let displayArtist = museumImage.artist === "" ? "Artist Unknown" : museumImage.artist

        let displayPeriod = museumImage.period === "" ? "Date Unknown" : museumImage.period
        var displayTitle = museumImage.title + " - " + displayArtist + " (" + displayPeriod + ")"

        imgCaption.appendChild(document.createTextNode(displayTitle))

        displayedImgL.src = museumImage.imgSrc
        displayedImgP.src = museumImage.imgSrc

        dezoomedImgContainer.style.visibility = "visible"

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
        alert("An error occured while setting the main image for display. Please reload the page or click on 'Paint!' again if this particular image is corrupted.")
        
    }
}

export function setBackgroundImage(canSetAsBackground = false, museumImage = MUSEUMIMAGEDISPLAYED) {
    var imgCaption = document.getElementById("imgCaption")
    var hideSymbolsDiv = document.getElementById("hideSymbolsDiv")
    if (canSetAsBackground && museumImage) {
        
        var body = document.body
        body.style.backgroundImage = "url('" + museumImage.imgSrc + "')"
        body.style.backgroundSize = "cover"
        body.style.backgroundRepeat = "no-repeat"
        body.style.backgroundAttachment = "fixed"
        body.style.backgroundPosition = "center"
        body.style.backgroundColor = "black"

        imgCaption.style.backgroundColor = "rgba(0,0,0,0.5)"
        imgCaption.style.color = "white"
        imgCaption.style.marginTop = "10px"

        hideSymbolsDiv.style.visibility = "visible"
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            let closedEyeIcoDark = document.getElementById("closedEyeIcoDark")
            closedEyeIcoDark.removeAttribute("hidden")
        }
        else{
            let closedEyeIcoLight = document.getElementById("closedEyeIcoLight")
            closedEyeIcoLight.removeAttribute("hidden")
        }

    } 
    else {
        document.body.removeAttribute("style")
        imgCaption.style.color = "#717171"
        imgCaption.style.removeProperty("background-color")
        imgCaption.style.removeProperty("margin-top")
        hideSymbolsDiv.style.visibility = "hidden"
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

    if (nWidth < nHeight) {
        dezoomedImgContainerP.removeAttribute("hidden")
        dezoomedImgContainerL.setAttribute("hidden", "hidden")
        orientation = "portrait"
    }
    else {
        dezoomedImgContainerL.removeAttribute("hidden")
        dezoomedImgContainerP.setAttribute("hidden", "hidden")
        orientation = "landscape"
    }
}

export function displayLoadingState(isLoading = false) {

    var dezoomedImgContainer = document.getElementById("dezoomedImgContainer")
    var spinnerDiv = document.getElementById("loadingSpinnerDiv")
    var dezoomedImgContainerL = document.getElementById("dezoomedImgContainerLandscape")
    var dezoomedImgContainerP = document.getElementById("dezoomedImgContainerPortrait")
    var additionalInfoDisplay = document.getElementById("additionalInfoDisplay")

    var imgCaption = document.getElementById("imgCaption")

    if (isLoading) {
        spinnerDiv.removeAttribute("hidden")
        dezoomedImgContainer.setAttribute("hidden", "hidden")
        dezoomedImgContainerL.setAttribute("hidden", "hidden")
        dezoomedImgContainerP.setAttribute("hidden", "hidden")
        additionalInfoDisplay.setAttribute("hidden", "hidden")
        imgCaption.innerHTML = " "
        imgCaption.style.visibility = "hidden"
        return 0;
    }
    else {
        spinnerDiv.setAttribute("hidden", "hidden")
        dezoomedImgContainer.removeAttribute("hidden")
        imgCaption.style.visibility = "visible"
        return 1;
    }
}

export async function setAdditionalInfo(canDisplay = CANDISPLAYINFO, isLoading = ISLOADINGSTATE) {
    
    CANDISPLAYINFO = canDisplay;
    ISLOADINGSTATE = isLoading;

    var additionalInfoDisplay = document.getElementById("additionalInfoDisplay")
    var displayedImgL = document.getElementById("displayImgL");
    var displayedImgP = document.getElementById("displayImgP");

    var dezoomedImgContainerL = document.getElementById("dezoomedImgContainerLandscape")
    var dezoomedImgContainerP = document.getElementById("dezoomedImgContainerPortrait")

    additionalInfoDisplay.innerHTML = " "
    ADDINFOLISTELEMENTS.innerHTML = " "

    if (canDisplay && isLoading === false) {
        let data = await displayedImgP.dataset
        let paragraphs = domStringMapToListElements(data)
        paragraphs.forEach((paragraph) => {
            ADDINFOLISTELEMENTS.appendChild(paragraph)
        })
        let themeColor = "white"
        if (window.matchMedia) {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                themeColor = document.querySelector("meta[name=dark-theme-color]").content
            } else {
                themeColor = document.querySelector("meta[name=light-theme-color]").content
            }
        }
        displayedImgL.style.backgroundColor = themeColor
        displayedImgP.style.backgroundColor = themeColor
    }
    else {
        displayedImgL.style.backgroundColor = "white"
        displayedImgP.style.backgroundColor = "white"
    }

}

function switchInfoToImg(state) {
    if (!CANDISPLAYINFO) {
        return
    }


    var dezoomedImgContainerL = document.getElementById("dezoomedImgContainerLandscape")
    var dezoomedImgContainerP = document.getElementById("dezoomedImgContainerPortrait")

    var displayedImgL = document.getElementById("displayImgL");
    var displayedImgP = document.getElementById("displayImgP");

    var additionalInfoDisplay = document.getElementById("additionalInfoDisplay")

    additionalInfoDisplay.innerHTML = " "

    dezoomedImgContainerL.setAttribute("hidden", "hidden")
    dezoomedImgContainerP.setAttribute("hidden", "hidden")
    additionalInfoDisplay.setAttribute("hidden", "hidden")

    if (state === "info") {
        additionalInfoDisplay.innerHTML += ADDINFOLISTELEMENTS.outerHTML
        additionalInfoDisplay.removeAttribute("hidden")
    }
    if (state === "img") {
        if (orientation === "landscape") {
            dezoomedImgContainerL.removeAttribute("hidden")
        }
        else {
            dezoomedImgContainerP.removeAttribute("hidden")
        }
    }
}

function domStringMapToListElements(domStringMap) {
    var paragraphs = []
    for (const [key, value] of Object.entries(domStringMap)) {
        let paragraph = document.createElement("li")
        paragraph.innerHTML = "<b>" + key + "</b> : "
        if (key === "Link") {
            paragraph.innerHTML += "<a href='" + value + "' target='_blank'>" + value + "</a>"
        }
        else { paragraph.innerHTML += value }
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

function faviconURLFirefox(u) {
    return "https://www.google.com/s2/favicons?sz=32&domain_url=" + u;
}

function setUpTopSites() {
    var topSitesSection = document.getElementById("topSitesSection")

    chrome.topSites.get((topSites) => {
        var cardsSection = "<div class='row row-cols-md-5'>"
        topSites.forEach((site,index) => {
            if(index > 9){
                return;
            }
            var siteFavicon = faviconURLFirefox(site.url)
            cardsSection += '<div class="col mb-0">'
            cardsSection += '<div class="card topSitesCard d-flex justify-content-center ">'
            cardsSection += '<a href="' + site.url + '" target="_blank" class="stretched-link" title="' + site.title + '"></a>'
            //cardsSection += '<i class="bi bi-three-dots-vertical align-self-end start-100" fill="black" title="More options"></i>'
            cardsSection += '<div class="topSitesCardImgSection align-self-center d-flex justify-content-center align-items-center mt-1"><img src="' + siteFavicon + '"></div>'
            cardsSection += '<p class="topSitesTitle ms-2 me-2" >' + site.title + '</p>'
            cardsSection += '</div>'
            cardsSection += '</div>'
        })
        cardsSection += "</div>"
        topSitesSection.innerHTML += cardsSection
    })
}