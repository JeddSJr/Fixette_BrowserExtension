/*

*/
import MuseumImage from  './museumImage.js'
/*
Function to fetch the urls of imgs of artworks from the Louvre
*/
const MaxDailyImgs = 12;

async function LouvreAPIRetrieveImgs() {
  callLouvreApi();
  async function callLouvreApi() {
    //alert("Not implemented yet");
    console.log("Not implemented yet");
  }
}

/*
Function to fetch the urls of imgs of artworks from the MetMuseum
*/
async function MetAPIRetrieveImgs(metOptions,numDailyImgs) {
  
  var idsRqst = 'https://collectionapi.metmuseum.org/public/collection/v1/objects?';
  var objRqst = "https://collectionapi.metmuseum.org/public/collection/v1/objects/";

  var imgsArr = []
  
  async function APICall(){
    try {
      let response = await fetch(idsRqst);
      if(response.ok){
        let result = response.json();
        return result;
      }
      else {
        handleError("img");
        setDefaultImgs();
      }
    } 
    catch (error) {
      console.log(error);
      console.error(error);
    }
  }

  async function GetNIds(APIresponse,n=10){
    
    if (APIresponse.total < 4) {
      useDefautImgs();
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
    
    for (let i = 0; i < objects.length && imgsArr.length <numDailyImgs; i++) {
      const objData = objects[i];
      if(objData.primaryImage.trim().length !== 0 && objData.isPublicDomain){
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

  while(imgsArr.length<numDailyImgs){
    let ids = await GetNIds(response,numDailyImgs-imgsArr.length)
    await GetImgRqstMet(ids)
  }
  return imgsArr;
}

/*
* Main function of the module
* Retrieve images from the museums databases by calling their respective API, transforming the data if needed then storing it in the chrome storage
* ppOpt:dict{museum:string,metOptions:dict,lvrOptions} // Options from the pop-up interfaces that defines where and what we want to retrieve
*/
async function ApiSelection(ppOpt,numDailyImgs){
  var apiRqst;
  if (ppOpt.museum === "Louvre") {
    return (await LouvreAPIRetrieveImgs());
  } 
  else if (ppOpt.museum === "Met") {
    var metOptions = {
      medium: null,
      //medium: "Watercolor"
    }
    metOptions.medium = ppOpt.medium;
    return (await MetAPIRetrieveImgs(metOptions,numDailyImgs));
  }
}

export async function retrieveImages(ppOpt,numDailyImgs=MaxDailyImgs) {
 
  const dailyImgs = await ApiSelection(ppOpt,numDailyImgs);
  
  //console.log("Images retrieved");
  //console.log(dailyImgs);
  storeImgs(dailyImgs)
  var remainingImgsNum = MaxDailyImgs - dailyImgs.length;
  if(remainingImgsNum>0){
    var remainingImgs = await ApiSelection(ppOpt,remainingImgsNum);
    dailyImgs.push(...remainingImgs);
    storeImgs(dailyImgs);
  }

}
  
function storeImgs(imgs){
  
  let dailyImgs = {    };
  for (let i = 0; i < imgs.length; i++) {
    dailyImgs[i] = imgs[i]       
  }
  chrome.storage.sync.set({"DAILY_IMGS_KEY": dailyImgs})
    .then(()=>{
      chrome.storage.sync.set({"isLoadingImgs":false})
  });
    
}



