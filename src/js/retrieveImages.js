/*

*/
import MuseumImage from './museumImage.js'
/*
Function to fetch the urls of imgs of artworks from the Louvre
*/
const MaxImgsBatchSize = 12;

async function setDefaultImgs() {

  try {
    const defaultJson = await fetch("../imgs/default/defaultResponse.json").then(response => response.json());

    var defaultImgsShuffled = defaultJson.defaultImgs.sort(() => 0.5 - Math.random()); //Shuffle the default images so that chrome storage note that as a change
    var imgsArr = []

    for(let i = 0; i <  MaxImgsBatchSize; i++){
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

async function LouvreAPIRetrieveImgs() {
  callLouvreApi();
  async function callLouvreApi() {
    //CHECK IF THE LOUVRE HAS AN API : NOT REALLY
    console.log("Not implemented yet");
  }
}

/*
Function that fetch imgs of artworks and their info from the Met Museum by calling it's API
returns an array of MuseumImage objects
*/
async function MetAPIRetrieveImgs(metOptions, numImgsBatch) {

  var idsRqst = 'https://collectionapi.metmuseum.org/public/collection/v1/objects?';
  var objRqst = "https://collectionapi.metmuseum.org/public/collection/v1/objects/";

  var imgsArr = []

  async function APICall() {
    try {
      let response = await fetch(idsRqst);
      if (response.ok) {
        let result = response.json();
        return result;
      }
      else {
        setDefaultImgs();
      }
    }
    catch (error) {
      console.log(error);
      alert("An error occured on the Met Museum end while trying to call for their artworks. \n You should try again later, for now we will display some default images we have in store.");
      setDefaultImgs();
    }
  }

  async function GetNIds(APIresponse, n = 10) {

    if (APIresponse.total < 4) {
      setDefaultImgs();
    }
    else {
      var shuffle = APIresponse.objectIDs.sort(() => 0.5 - Math.random());
      var ids = shuffle.slice(0, n);
      return ids;
    }
  }

  async function GetImgRqstMet(imgsIds) {
    var rqstArr = []
    imgsIds.forEach(
      (id) => {
        var objUrl = "https://collectionapi.metmuseum.org/public/collection/v1/objects/";
        objUrl += id;
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

  var response = await APICall()

  while (imgsArr.length < numImgsBatch) {
    let ids = await GetNIds(response, numImgsBatch - imgsArr.length)
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
  if (ppOpt.museum === "Louvre") {
    return (await LouvreAPIRetrieveImgs());
  }
  else if (ppOpt.museum === "Met") {
    var metOptions = {
      medium: null,
    }
    metOptions.medium = ppOpt.medium;
    return (await MetAPIRetrieveImgs(metOptions, numImgsBatch));
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
      //console.log("Images retrieved");
      //console.log(dailyImgs);
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



