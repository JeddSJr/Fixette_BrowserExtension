/*

*/
import MuseumImage from  './museumImage.js'

/*
Function to fetch the urls of imgs of artworks from the Louvre
*/
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
async function MetAPIRetrieveImgs(metOptions) {
  
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
    

  }

  var response = await APICall(idsRqst)

  while(imgsArr.length<4){
    let ids = await GetNIds(response,1)
    await GetImgRqstMet(ids)
  }
  console.log(imgsArr)
  return imgsArr;
}

/*
* Main function of the module
* Retrieve images from the museums databases by calling their respective API, transforming the data if needed then storing it in the chrome storage
* ppOpt:dict{museum:string,metOptions:dict,lvrOptions} // Options from the pop-up interfaces that defines where and what we want to retrieve
*/
export async function retrieveImages(ppOpt) {

    const dailyImgs = await ApiSelection(ppOpt);
    
    async function ApiSelection(ppOpt) {

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
        return (await MetAPIRetrieveImgs(metOptions));
      }
    }
    
    console.log("Images retrieved");
    console.log(dailyImgs);
    storeImgs(dailyImgs)
}
  
function storeImgs(imgs){
  
  console.log('Storing daily images');
  let dailyImgs = {    };
  for (let i = 0; i < imgs.length; i++) {
    dailyImgs[i] = imgs[i]       
  }
  chrome.storage.sync.set({"DAILY_IMGS_KEY": dailyImgs})
    .then(()=>{
      console.log("Value is set");
  });
    
}



