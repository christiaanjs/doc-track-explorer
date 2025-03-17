export interface GeoJSONFeature {
    type: string;
    geometry: {
        type: "MultiLineString";
        coordinates: [number, number][][];
    };
    properties: object;
    id?: string | number; // id can be string or number
}

export interface CRS {
    type: string; // "name" or "link" (according to GeoJSON spec)
    properties: {
        name: string; // Name of the CRS, e.g., "EPSG:4326"
    };
}

export interface GeoJSON {
    type: "FeatureCollection";
    features: GeoJSONFeature[];
    crs?: CRS; // Optional CRS property
}
