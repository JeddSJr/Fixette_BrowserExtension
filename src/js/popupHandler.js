function saveOptions(){
    console.log("Saaaving")
    inputs = document.getElementById("musOptions").getElementsByTagName("input"); 
    console.log(inputs[0].checked);

    museumToUse = inputs[0].checked ? "Met" : "Louvre"

    ppOpt ={
        museum : museumToUse,
        medium:null
    }
    storeObject(PPOPT_DICT_SKEY,ppOpt)
}