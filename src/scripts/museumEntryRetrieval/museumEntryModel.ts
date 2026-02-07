/**
 * Inteface that serves as the model for the museum entry objects 
 * we use throughout the extension.
 * 
 * It's heavily based off what the Met's museum returns and subject 
 * to change as I find more interesting properties to add.
 */

export default interface MuseumEntry {
    artist_name?: string;
    artist_period?: string;
    image_source: string;
    title?: string;
    medium?: string;
    art_movement?: string;
    measurements?: string;
    museum_department?: string;
    museum_classification?: string;
    museum_creditline?: string;
    source_url: string;
}