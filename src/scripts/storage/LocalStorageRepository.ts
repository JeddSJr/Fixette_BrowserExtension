import MuseumEntry from "../museumEntryRetrieval/museumEntryModel";
import { AStorageRepo } from "./AStorageRepository";

export class LocalStorage implements AStorageRepo{
   /**
    *
    */
   constructor() {
      
   }
    storeMuseumEntries(museumEntries: MuseumEntry[]): unknown {
        throw new Error("Method not implemented.");
    }
}