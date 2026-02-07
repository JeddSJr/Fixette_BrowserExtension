

/** Basic implementation of a fetch method with erro handling */
export type apiFetchMethod = (request: string) => any;
export const basicFetchOperation: apiFetchMethod = async (url: string) => {
    let response = await fetch(url);
    if (response.ok) {
        let result = await response.json();
        return result;
    }
    else {
        throw new Error("Response not ok to call of " + url);
    }
}


/** Basic implementation of array shuffling. 
 * @TODO - Implements a better shuffling algorithm
 * */
export function shuffleArray<E>(array:E[]):E[]{
    return array.sort(() => 0.5 - Math.random());
}

/**
 * Verifies if the browser has internet
 * @todo - Implements this wesh  
 * @returns {boolean} 
 */
export function browserHasInternet():boolean{
    return true;
}
