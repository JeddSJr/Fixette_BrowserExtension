import MuseumEntry from "../museumEntryRetrieval/museumEntryModel";

export interface AStorageRepo{
    storeMuseumEntries(museumEntries: MuseumEntry[]): unknown;

}