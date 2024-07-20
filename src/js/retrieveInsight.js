async function retrieveWikipediaInsight(parameters) {
    try {
        for (const parameter of parameters) {
            const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(parameter)}`);
            const data = await response.json();
            
            // Process the retrieved data here
            console.log(data);
        }
    } catch (error) {
        console.error(error);
    }
}

function retrieveInsight(retrievedImgs){
const sourcesNames = ["WIKI","LLAMA"]
if(retrievedImgs === undefined){

retrievedImgs = await chrome.storage.sync.get("DAILY_IMGS_KEY")
retrievedImgs = retrievedImgs["DAILY_IMGS_KEY"]

}

var sourcesEnabled = getInsightSources()

var imgsInfo = getImgsInfo(retrievedImgs)

sourcesNames.forEach((sn) => {
 if(sn == "WIKI" && sourcesEnabled[sn]){
   retrieveWikipediaInsight(imgs)
 }
})


}