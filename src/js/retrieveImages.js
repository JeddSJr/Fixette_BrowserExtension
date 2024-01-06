/*

*/
import {MuseumImage} from  './museumImage.js'


/*
Function to fetch the urls of imgs of artworks from the MetMuseum
*/
async function MetAPIRetrieveImgs(metOptions) {
  
  idsRqst = 'https://collectionapi.metmuseum.org/public/collection/v1/objects?';
  objRqst = "https://collectionapi.metmuseum.org/public/collection/v1/objects/";

  imgsArr = []
  

  async function GetImgRqstMet(imgsIds) {    
    console.log(imgsIds)
    var rqstArr = []
    imgsIds.forEach(
      (id) => {
        var objUrl = "https://collectionapi.metmuseum.org/public/collection/v1/objects/";
        objUrl += id;
        objRqPromises = fetch(objUrl); 
        rqstArr.push(objRqPromises);
      });

    objResponse = await Promise.all(rqstArr)
    objectsJson = []
    objResponse.forEach(objR => {
      objectsJson.push(objR.json());
    });
    
    objects = await Promise.all(objectsJson);
    console.log(objects)
    
    //objects = await
    for (let i = 0; i < objects.length && imgsArr.length <4; i++) {
      const objData = objects[i];
      if(objData.primaryImage.trim().length !== 0 && objData.isPublicDomain){
        imgsArr.push(new MuseumImage(
          objData.artistDisplayName,
          objData.primaryImage,
          objData.medium,
          objData.objectDate,
          objData.title,
          objData.objectURL
        ))
      }
    }
    console.log(imgsArr.length)
    //imgsProm = await Promise.all(rqstArr);
    //console.log("imgsProm",imgsProm);

    //storeObject("Array of images",imgsArr);

  }

  async function APICall(){
    try {
      response = await fetch(idsRqst);
      if(response.ok){
        result = response.json();
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
      setDefautImgs();
    } 
    else {
        var shuffle = APIresponse.objectIDs.sort(() => 0.5 - Math.random());
        var ids = shuffle.slice(0, n);
        return ids;
    }
  }
  

  response = await APICall(idsRqst)
  console.log(response)
  
  
  while(imgsArr.length<4){
    ids = await GetNIds(response,1)
    await GetImgRqstMet(ids)
  }

}

/*
*Function to retrieve images from the museums databases by calling their API
*/
async function retrieveImages(ppOpt) {
    //var dailyImg = ApiSelection(ppOpt);
    //dailyImg = await ApiSelection(ppOpt);
  
    await ApiSelection(ppOpt);
    
    async function ApiSelection(ppOpt) {
      var apiRqst;
      if (ppOpt.museum === "Louvre") {
        console.log("Louvre not implemented yet");
        return (await callLouvreApi());
      } 
      else if (ppOpt.museum === "Met") {
        var metOptions = {
          medium: null,
          //medium: "Watercolor"
        }
        metOptions.medium = ppOpt.medium;
        return (await MetAPIRetrieveImgs(metOptions));
      }
    }
  
    async function callLouvreApi() {
      //alert("Not implemented yet");
      console.log("Not implemented yet");
    }
  
    
}
  

console.log("running")
popUpOptionsTesting = {
  museum: "Met",
  medium:null
}

retrieveImages(popUpOptionsTesting)

