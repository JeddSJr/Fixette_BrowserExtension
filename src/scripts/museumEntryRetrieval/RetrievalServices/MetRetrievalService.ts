/**
 * Museum retrieval service for the Metropolitan Museum in New York City
 * @extends {IMuseumRetrievalService}
 * Implementation of the IMuseumRetrievalService interface to fetch atworks info from the Met's oepn API and return 
 * an array of formatted MuseumEntries for use by the rest of the extension
 * 
 * @throws {Error} - Fails if API calls fails or there isn't sufficient data 
 * @use Met API documentation {@link https://metmuseum.github.io/}
 */

import { apiFetchMethod, shuffleArray } from "../../utilities/utilities";
import MuseumEntry from "../museumEntryModel";
import AMuseumRetrievalService from "./AbstractMuseumRetrievalService";


export default class MetRetrievalService extends AMuseumRetrievalService {

    private apiFetchMethod: apiFetchMethod;
    protected static readonly rqstForIds = 'https://collectionapi.metmuseum.org/public/collection/v1/objects?';
    protected static readonly rqstForObject = "https://collectionapi.metmuseum.org/public/collection/v1/objects/";
    museumEntries: MuseumEntry[] = [];
    objectsIDs: string[] = [];

    /**
     * Constructor of the class
     * @param implementedFetchMethod apiFetchMethod - implementation of the fetch method that is injected as dependency to allow to change implementation if needs be
     */
    constructor(implementedFetchMethod: apiFetchMethod) {
        super() //needed in TypeScript when using extends
        this.apiFetchMethod = implementedFetchMethod;
    }

    /**
     * Returns a randomized subset of an arrays because the Met API always returns elements in the same order
     * and we want random entries
     * @protected
     * @param array  E[] - An array of generic type 
     * @param num_elements  number - The number of elements we want 
     * @returns  E[] - An array of the same type as the parameter  
     */
    protected getNRandomIdsFromArray<E>(array: E[], num_elements: number): E[] {
        if (num_elements == 0 || array.length == 0 || num_elements > array.length) {
            return [];
        }
        let shuffledArray = shuffleArray(array)
        let reducedArray = shuffledArray.slice(0, num_elements);
        return reducedArray;
    }

    /**
     * Fetch call to retrieve ids of API resources that represent artworks 
     * @async @protected
     * @returns Promise<string[]>
     */
    protected override async getAllAvailableObjectIds(): Promise<string[]> {
        let fetchResponseForIds = await this.apiFetchMethod(MetRetrievalService.rqstForIds);
        let returnedObjectIds: number[] = fetchResponseForIds.objectIDs; // key according to the documentation
        let idsArray = returnedObjectIds.map(String);
        return idsArray;
    }

    /**
     * Fetches and stores museum entries from the Met API by casting raw API responses
     * into MuseumEntry objects with valid images and public domain availability
     * 
     * @async @protected
     * @param objectIDs 
     * @param numEntriesToRetrieve 
     * @use {@link MuseumEntry}
     * @returns Promise<void>
     */
    protected override async setMuseumEntriesFromObjects(objectIDs: string[], numEntriesToRetrieve: number): Promise<void> {

        //Build an array of fetch requests for all objects id to be resolved concurrently with Promise.all()
        var requestsForObjects: Promise<Response>[] = [];
        objectIDs.forEach(
            (id) => {
                requestsForObjects.push(
                    fetch(MetRetrievalService.rqstForObject + id))
            }
        )
        var responsesToRequests = await Promise.all(requestsForObjects);

        //We then build an array of responses to those requests that will also be resolved concurrently with Promise.all into json objects 
        var responsesJson: Promise<any>[] = []
        responsesToRequests.forEach(
            (response) => {
                responsesJson.push(response.json())
            }
        );
        var objectsData = await Promise.all(responsesJson); // the array of json objects representing actual data from the metmuseum

        for (let i = 0; i < objectsData.length && this.museumEntries.length < numEntriesToRetrieve; i++) {
            const museumPieceData = objectsData[i];

            // We have to filter out non valid entries ie those without an image to display on the front-end and those who aren't public domain
            if (museumPieceData.primaryImage.trim().length !== 0 && museumPieceData.isPublicDomain) {
                //We map the object data to Museum Entry
                this.museumEntries.push({
                    artist_name: museumPieceData.artistDisplayName,
                    image_source: museumPieceData.primaryImage,
                    medium: museumPieceData.medium,
                    artist_period: museumPieceData.objectDate,
                    title: museumPieceData.title,
                    source_url: museumPieceData.objectURL,
                    measurements: museumPieceData.measurements,
                    museum_department: museumPieceData.department,
                    museum_classification: museumPieceData.classification,
                    museum_creditline: museumPieceData.creditLine
                } as MuseumEntry)
            }
        }
        return;
    }

    /**
     * Public entry point of the class that orchestrate the retrieval of the museum entries we want to display
     * It fetches avaialble ids of artworks resources then randomly select a subset of it to finally fetches 
     * data of those artworks until we have enough 
     * @async @public
     * @param numEntriesToRetrieve number - the number of entries we want
     * @returns Promise<MuseumEntry[]> - array of valid entries we want to store
     */
    override async getMuseumEntries(numEntriesToRetrieve: number): Promise<MuseumEntry[]> {
        try {
            let ids = await this.getAllAvailableObjectIds();
            if (ids.length < 1) {
                throw new Error("Not enough images for display");
            }
            do {
                let nRandomSelectedIds = this.getNRandomIdsFromArray(ids, numEntriesToRetrieve - this.museumEntries.length);
                await this.setMuseumEntriesFromObjects(nRandomSelectedIds, numEntriesToRetrieve)
            } while (this.museumEntries.length < numEntriesToRetrieve);

            return this.museumEntries;
        } catch (error: any) {
            throw new Error(error)
        }

    }
}