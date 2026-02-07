/**
 * =============================================================================================================================
 * Main entry point of this module 
 * 
 * It validates that we have internet to call on the external APIs, choose the appropriate implementation of the museum service,
 * retrieves museum entries from the chosen museum and then stores them for other services to use.
 * =============================================================================================================================
 *
 * @async
 * @param museumName  MUSEUM_NAMES - Museum to retrieve informations from
 * @param numEntriesToRetrieve  number - Number of entries to retrieve 
 * @returns Promise<void>
 * 
 * @throws {Error} - If it fails at any point it sets default entries defined in the assets/ folder 
 * 
 * @example
 * await retrieveMuseumEntries('Metropolitan_NYC', 8);
 */

import errorHandler from "../error/errorHandler";
import { AStorageRepo } from "../storage/AStorageRepository";
import { LocalStorage } from "../storage/LocalStorageRepository";
import { browserHasInternet, basicFetchOperation } from "../utilities/utilities";
import MuseumEntry from "./museumEntryModel";
import AMuseumRetrievalService from "./RetrievalServices/AbstractMuseumRetrievalService";
import MetRetrievalService from "./RetrievalServices/MetRetrievalService";

/** Maximum number of entries we retrieve in one single batch request */
const MAXIMUM_NUM_ENTRIES_TO_RETRIEVE: number = 12;

/** Type alias of the names of pre-apporved museums  */
type MUSEUM_NAMES = "Metropolitan_NYC" | "NGA_WDC";

/** Type alias that defines the function signature of the method we will use for simple fetch */
type apiFetchMethod = (request: string) => any;


export function getDefaultMuseumEntries():MuseumEntry[]{
    return []; 
}

export default async function retrieveMuseumEntries(museumName: MUSEUM_NAMES, numEntriesToRetrieve: number = MAXIMUM_NUM_ENTRIES_TO_RETRIEVE): Promise<void> {
    const storageService: AStorageRepo = new LocalStorage();
    numEntriesToRetrieve = Math.min(numEntriesToRetrieve, MAXIMUM_NUM_ENTRIES_TO_RETRIEVE);

    try {
        if (!browserHasInternet()) {
            throw new Error("No Internet detected");
        }

        var museumRetrievalService: AMuseumRetrievalService;
        switch (museumName) {
            case 'Metropolitan_NYC':
                museumRetrievalService = new MetRetrievalService(basicFetchOperation);
                break;

            default:
                throw new Error("Not Implemented Yet");
        }
        const museumEntries: MuseumEntry[] = await museumRetrievalService.getMuseumEntries(numEntriesToRetrieve);
        console.log(museumEntries);
        storageService.storeMuseumEntries(museumEntries);
        return;
    } catch (error:any) {
        const museumEntries: MuseumEntry[] = getDefaultMuseumEntries();
        storageService.storeMuseumEntries(museumEntries);
        errorHandler(error);
        return;
    }
}