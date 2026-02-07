class MuseumImage {
  constructor(artist, imgSrc, medium, period, title, url, measurements, department, classification, creditLine) {
    this.artist = artist;
    this.imgSrc = imgSrc;
    this.medium = medium;
    this.period = period;
    this.title = title;
    this.objectURL = url;
    this.measurements = measurements;
    this.department = department;
    this.classification = classification;
    this.creditLine = creditLine;
  }
}

export default MuseumImage
