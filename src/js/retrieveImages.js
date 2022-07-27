/*

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
      } else if (ppOpt.museum === "Met") {
        var metOptions = {
          medium: null,
        }
        metOptions.medium = ppOpt.medium;
        return (await callMetApi(metOptions));
      }
    }
  
    async function callLouvreApi() {
      alert("Not implemented yet");
    }
  
    async function callMetApi(metOptions) {
  
  
      apiRqst = "https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=a";
      for (const opt in metOptions) {
        if (metOptions[opt]) {
          apiRqst += "&";
          apiRqst += opt;
          apiRqst += "=";
          apiRqst += metOptions[opt];
        }
      }
  
      console.log(apiRqst);
  
      fetch(apiRqst)
        .then((response) => {
          if (response.ok) {
            return (response.json());
          } else {
            handleError("img");
            setDefaultImgs();
          }
        })
        .then((data) => {
          if (data.total < 4) {
            setDefautImgs();
          } else {
            var shuffle = data.objectIDs.sort(() => 0.5 - Math.random());
            let ids = shuffle.slice(0, 10);
            imgRqst(ids);
          }
        })
        .catch((error) => {
          console.log(error);
          console.error(error);
        })
  
      async function imgRqst(ids) {
        console.log(ids);
        var rqstArr = [];
        var imgsArr = [];
        ids.forEach(
          (id) => {
            var imgUrl = "https://collectionapi.metmuseum.org/public/collection/v1/objects/";
            imgUrl += id;
            console.log(imgUrl);
            rqstArr.push(
              fetch(imgUrl)
              .then((response) =>
                response.json()
              )
            )
          });
        console.log(rqstArr);
        Promise.all(rqstArr).then(
          (imgsDatas) => {
            imgsDatas.forEach(imgData => {
              if (imgData.primaryImage && imgsArr.length < 4) {
                imgsArr.push(new MuseumImage(
                  imgData.artistDisplayName,
                  imgData.primaryImage,
                  imgData.medium,
                  imgData.objectDate,
                  imgData.title
                ));
              }
            });
            console.log(imgsArr);
            storeImgs(imgsArr);
          }
        )
      }
    }
  }
  



