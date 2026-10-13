export interface Location {
  id?: string;
  name: string;
  region: string;
  country?: string;
  lat: number;
  lng: number;
}

export interface SavedLocation extends Location {
  id: string;
  addedAt: number;
}

export interface SearchResult extends Location {
  id: string;
  saved?: boolean;
}