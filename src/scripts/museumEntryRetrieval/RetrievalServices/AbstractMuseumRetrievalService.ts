/**
 * Abstract class of a museum data retrieval service
 * To use to implements services of specific museum with shared processes
 * 
 * @abstract
 * @field rqstForIds : string - static constant representing the specific url request of a museum API to get ids of resources that are artworks pieces
 * @field rqstForObjects : string - static constant representing the specific url request of a museum API to get data of an artwork piece with a given id
 * @field objectsIds : string[] - An array of ids of data objects of museum pieces we want to get
 * @field museumEntries : MuseumEntry[] - Array of museum entries we have formed from the objects we fetched, is to be returned by getMuseumEntries()
 * 
 * @method getAllAvailableObjectIds: () => Promise<string[]> - returns an array of available Ids of museum pieces from a museum api
 * @method setMuseumEntriesFromObjects: (objectIDs: string[], numEntriesToRetrieve: number) => Promise<void> - populates this.museumEntries with MuseumEntry instances filled from objects we fetched
 * @method getMuseumEntries: (numEntriesToRetrieve: number) => Promise<MuseumEntry[]> - public point of entry of the class that orchestrate the retrieval and return of museum  pieces information
 */

import MuseumEntry from "../museumEntryModel";

export default abstract class AMuseumRetrievalService {
    protected static readonly rqstForIds: string;
    protected static readonly rqstForObjects: string;
    protected abstract objectsIDs: string[];
    protected abstract museumEntries: MuseumEntry[];

    protected abstract getAllAvailableObjectIds(): Promise<string[]>;
    protected abstract setMuseumEntriesFromObjects(objectIDs: string[], numEntriesToRetrieve: number): Promise<void>;
    public abstract getMuseumEntries(numEntriesToRetrieve: number): Promise<MuseumEntry[]>;
}