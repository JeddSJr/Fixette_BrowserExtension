/*

*/
//import MuseumImage from  './museumImage.js'

function MuseumImage(artist,imgSrc,medium,period,title,measurement,url){
  this.artist = artist;
  this.imgSrc = imgSrc;
  this.medium = medium;
  this.period = period;
  this.tile = title;
  this.measurement = measurement;
  this.objectURL = url;
}

/*
Function to fetch the urls of imgs of artworks from the MetMuseum
*/
async function MetAPIRetrieveImgs(metOptions) {
  
  idsRqst = 'https://collectionapi.metmuseum.org/public/collection/v1/objects?';
  objRqst = "https://collectionapi.metmuseum.org/public/collection/v1/objects/";

  imgsArr = []
  
  async function GetImgRqstMet(imgsIds) {  
    var rqstArr = []
    imgsIds.forEach(
      (id) => {
        var objUrl = "https://collectionapi.metmuseum.org/public/collection/v1/objects/";
        objUrl += id;
        objRqPromises = fetch(objUrl); 
        rqstArr.push(objRqPromises);
      }); //Makes an array of promises to fetch objects with the given ID

    objResponse = await Promise.all(rqstArr)
    objectsJson = []
    objResponse.forEach(objR => {
      objectsJson.push(objR.json());
    }); //Makes an array of promises to resolves the json body of objects
    
    objects = await Promise.all(objectsJson);
    
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
          objData.objectURL,
          objData.measurements
        ))
      }
    }
    //console.log(imgsArr.length)
    
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

  while(imgsArr.length<4){
    ids = await GetNIds(response,1)
    await GetImgRqstMet(ids)
  }

}

/*
* Main function of the module
* Retrieve images from the museums databases by calling their respective API
* ppOpt:dict{museum:string,metOptions:dict,lvrOptions} // Options from the pop-up interfaces that defines where and what we want to retrieve
*/
async function retrieveImages(ppOpt) {
    //var dailyImg = ApiSelection(ppOpt);
    //dailyImg = await ApiSelection(ppOpt);
  
    await ApiSelection(ppOpt);
    
    async function ApiSelection(ppOpt) {
      var apiRqst;
      if (ppOpt.museum === "Louvre") {
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
  

console.log("Retrieving images")
popUpOptionsTesting = {
  museum: "Met",
  medium:null
}

retrieveImages(popUpOptionsTesting)

