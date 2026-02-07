/**
 * @module retrieveImages
 * 
 * @description
 * This module provides functions to retrieve, process, and store images of artworks from various museum APIs,
 * specifically the Metropolitan Museum of Art (Met) and the National Gallery of Art (NGADC) via Wikimedia Commons.
 * It handles API requests, data transformation into `MuseumImage` objects, error handling, and storage of images
 * in Chrome's synchronized storage. The module also provides fallback mechanisms to display default images in case
 * of network errors or insufficient data from the APIs. The main entry point is the `retrieveImages` function,
 * which orchestrates the retrieval and storage process based on user-selected options.
 */
import MuseumImage from './museumImage.js'

const MaxImgsBatchSize = 12;

/**
 * Loads a set of default artwork images from a local JSON file, shuffles them,
 * converts them into `MuseumImage` objects, and stores them in Chrome's synchronized storage.
 * This function serves as a fallback mechanism to ensure that images are available
 * when API requests fail or insufficient data is retrieved from external sources.
 *
 * @async
 * @function setDefaultImgs
 * @returns {Promise<void>} A promise that resolves when the default images have been stored.
 */
async function setDefaultImgs() {
  try {
    const defaultJson = await fetch("../imgs/default/defaultResponse.json").then(response => response.json());

    var defaultImgsShuffled = defaultJson.defaultImgs.sort(() => 0.5 - Math.random()); //Shuffle the default images so that chrome storage note that as a change
    var imgsArr = []

    for (let i = 0; i < MaxImgsBatchSize; i++) {
      var imgData = defaultImgsShuffled[i];
      var museumImg = new MuseumImage(
        imgData.artistDisplayName,
        imgData.primaryImage,
        imgData.medium,
        imgData.objectDate,
        imgData.title,
        imgData.objectURL,
        imgData.measurements,
        imgData.department,
        imgData.classification,
        imgData.creditLine
      )
      imgsArr.push(museumImg);
    }
    storeImgs(imgsArr);
  } catch (error) {
    //Maybe add a contact us button
    console.log(error)
  }

}


async function APICall(idsRqst) {
  try {
    let response = await fetch(idsRqst);
    if (response.ok) {
      let result = response.json();
      return result;
    }
    else {
      throw new Error("Response not ok to call of "+idsRqst);
    }
  }
  catch (error) {
    console.log(error);
    alert("An error occured while trying to ask museums for their artworks. \n You should try again later, for now we will display some default images we have in store.");
    
  }
}

async function GetNIds(IdsArray, n = 10) {
  console.log(IdsArray.length)
  if (IdsArray.length < 4) {
    alert("Less than 4 images were retrieved, setting default ones ")
    setDefaultImgs();
  }
  else {
    var shuffle = IdsArray.sort(() => 0.5 - Math.random());
    var ids = shuffle.slice(0, n);
    return ids;
  }
}


/**
 * Retrieves a batch of image metadata objects from the National Gallery of Art category on Wikimedia Commons.
 * 
 * This function fetches image IDs from the specified Wikimedia Commons category, then retrieves detailed metadata
 * for each image, and constructs an array of `MuseumImage` objects containing relevant information such as artist,
 * image source URL, period, title, and credit. The function continues fetching images until the requested batch size
 * (`numImgsBatch`) is reached.
 * 
 * @async
 * @param {number} numImgsBatch - The number of image metadata objects to retrieve in the batch.
 * @returns {Promise<MuseumImage[]>} A promise that resolves to an array of `MuseumImage` objects containing metadata for each image.
 */
async function NGADCAPIRetrieveImgs(numImgsBatch) {
  const idsRqst = "https://commons.wikimedia.org/w/api.php?origin=*&action=query&format=json&list=categorymembers&formatversion=2&cmtitle=Category%3AImages_from_the_National_Gallery_of_Art&cmprop=ids%7Ctitle&cmtype=file&cmlimit=max"
  const objRqst = "https://commons.wikimedia.org/w/api.php?origin=*&action=query&format=json&prop=imageinfo&formatversion=2&iiprop=url|metadata|commonmetadata|extmetadata|mediatype"

  var imgsArr = []

  async function GetAllIds() {
    var continueOption = "";
    var categorymembers = []
    var ids = []
    var response = await APICall(idsRqst + continueOption);
    categorymembers = categorymembers.concat(response.query.categorymembers)

    while ("continue" in response) {
      continueOption = "&cmcontinue=" + response.continue.cmcontinue;
      response = await APICall(idsRqst + continueOption);
      categorymembers = categorymembers.concat(response.query.categorymembers)
    }

    categorymembers.forEach((cm) => { ids.push(cm.pageid) })
    return ids;
  }

  async function GetImgRqstNGADC(ids = []) {
    try {
      var pageIds = "&pageids=" + ids.join("|")
      let response = await fetch(objRqst + pageIds);
      if (response.ok) {
        let result = await response.json();
        let resultPages = result.query.pages;
        resultPages.forEach((page) => {
          let pageMetadata = page.imageinfo[0].extmetadata
          let objSrc = page.imageinfo[0].url
          let objUrl = page.imageinfo[0].descriptionshorturl
          let mockElement = document.createElement('html')

          mockElement.innerHTML = "ObjectName" in pageMetadata ? pageMetadata.ObjectName.value : "<div></div>";
          let objTitle = mockElement.innerText

          mockElement.innerHTML = "Artist" in pageMetadata ? pageMetadata.Artist.value : "<div></div>"
          let objArtist = mockElement.innerText

          mockElement.innerHTML = "DateTimeOriginal" in pageMetadata ? pageMetadata.DateTimeOriginal.value : "<div></div>"
          const regexTime = /date.+$/
          let objPeriod = mockElement.innerText
          objPeriod = objPeriod.replace(regexTime, "")

          mockElement.innerHTML = "Credit" in pageMetadata ? pageMetadata.Credit.value : "<div></div>"
          let objCredit = mockElement.innerText

          imgsArr.push(
            new MuseumImage(
              objArtist,
              objSrc,
              "",
              objPeriod,
              objTitle,
              objUrl,
              "",
              "",
              "",
              objCredit
            )
          )
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  var allIds = await GetAllIds()
  while (imgsArr.length < numImgsBatch) {
    var ids = await GetNIds(allIds, numImgsBatch - imgsArr.length)
    await GetImgRqstNGADC(ids)
  }

  return imgsArr
}

/**
 * Retrieves a batch of image metadata objects from the Met Museum Open API.
 * 
 * This function fetches image IDs from the API, then retrieves detailed metadata
 * for each image, and constructs an array of `MuseumImage` objects containing relevant information such as artist,
 * image source URL, period, title, department and credit. The function continues fetching images until the requested batch size
 * (`numImgsBatch`) is reached.
 * 
 * @async
 * @param {number} numImgsBatch - The number of image metadata objects to retrieve in the batch.
 * @returns {Promise<MuseumImage[]>} A promise that resolves to an array of `MuseumImage` objects containing metadata for each image.
 */
async function MetAPIRetrieveImgs(numImgsBatch) {

  const idsRqst = 'https://collectionapi.metmuseum.org/public/collection/v1/objects?';
  var objRqst = "https://collectionapi.metmuseum.org/public/collection/v1/objects/";

  var imgsArr = []

  async function GetImgRqstMet(imgsIds) {
    var rqstArr = []
    imgsIds.forEach(
      (id) => {
        var objUrl = objRqst + id;
        var objRqPromises = fetch(objUrl);
        rqstArr.push(objRqPromises);
      }); //Makes an array of promises to fetch objects with the given ID

    var objResponse = await Promise.all(rqstArr)
    var objectsJson = []
    objResponse.forEach(objR => {
      objectsJson.push(objR.json());
    }); //Makes an array of promises to resolves the json body of objects

    var objects = await Promise.all(objectsJson);
    console.log(objects)
    for (let i = 0; i < objects.length && imgsArr.length < numImgsBatch; i++) {
      const objData = objects[i];
      if (objData.primaryImage.trim().length !== 0 && objData.isPublicDomain) {
        imgsArr.push(new MuseumImage(
          objData.artistDisplayName,
          objData.primaryImage,
          objData.medium,
          objData.objectDate,
          objData.title,
          objData.objectURL,
          objData.measurements,
          objData.department,
          objData.classification,
          objData.creditLine
        ))
      }
    }
  }

  var response = await APICall(idsRqst)
  var idsArray = response.objectIDs
  while (imgsArr.length < numImgsBatch) {
    let ids = await GetNIds(idsArray, numImgsBatch - imgsArr.length)
    await GetImgRqstMet(ids)
  }
  return imgsArr;
}

/*
* Main function of the module
* Retrieve images from the museums databases by calling their respective API, transforming the data if needed then storing it in the chrome storage
* ppOpt:dict{museum:string,metOptions:dict,lvrOptions} // Options from the pop-up interfaces that defines where and what we want to retrieve
*/
async function RetrieveFromMuseum(ppOpt, numImgsBatch) {
  var apiRqst;
  if (ppOpt.museum === "NGADC") {
    return (await NGADCAPIRetrieveImgs(numImgsBatch));
  }
  else if (ppOpt.museum === "Met") {
    return (await MetAPIRetrieveImgs(numImgsBatch));
  }
}

export async function retrieveImages(ppOpt, numImgsBatch = MaxImgsBatchSize) {

  try {
    if (!window.navigator.onLine) {
      console.log("No internet connection");
      alert("There is no internet connection, please check your connection and try again. \nMeanwhile, we will display some default images we have in store. ");
      setDefaultImgs();
    }
    else {
      const imgsBatch = await RetrieveFromMuseum(ppOpt, numImgsBatch);
      storeImgs(imgsBatch)
      var remainingImgsNum = MaxImgsBatchSize - imgsBatch.length;
      if (remainingImgsNum > 0) {
        var remainingImgs = await RetrieveFromMuseum(ppOpt, remainingImgsNum);
        imgsBatch.push(...remainingImgs);
        storeImgs(imgsBatch);
      }
    }
  }
  catch (error) {
    console.error(error);
    setDefaultImgs();
  }

}

/*
* Store the array of MuseumImages in the chrome storage and set the isLoadingImgs flag to false
*/
function storeImgs(imgs) {

  let dailyImgs = {};
  for (let i = 0; i < imgs.length; i++) {
    dailyImgs[i] = imgs[i]
  }
  chrome.storage.sync.set({ "DAILY_IMGS_KEY": dailyImgs })
    .then(() => {
      chrome.storage.sync.set({ "isLoadingImgs": false })
    });

}



