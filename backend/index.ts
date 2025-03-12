import express from 'express';
import cors from 'cors';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json());

interface Track {
    id: number;
    trackName: string;
}

interface GeoJSONFeature {
    type: string;
    geometry: object;
    properties: object;
    id?: string | number; // id can be string or number
}

interface CRS {
    type: string; // "name" or "link" (according to GeoJSON spec)
    properties: {
        name: string; // Name of the CRS, e.g., "EPSG:4326"
    };
}

interface GeoJSON {
    type: "FeatureCollection";
    features: GeoJSONFeature[];
    crs?: CRS; // Optional CRS property
}

const geojsonData: GeoJSON = JSON.parse(fs.readFileSync('../data/DOC_Tracks_EAM_2002748551359867855.geojson', 'utf-8'));
const tracks: Track[] = geojsonData.features.map((feature: any) => { return { id: feature.id, trackName: feature.properties.TechObjectName } })

const filterGeoJSONFeaturesById = (geojson: GeoJSON, id: number | string): GeoJSON => {
    const filteredFeatures = geojson.features.filter(feature => feature.id === id);
    return {
        type: "FeatureCollection", // Keep the type as "FeatureCollection"
        features: filteredFeatures,
        crs: geojson.crs, // Keep the CRS from the original GeoJSON
    };
}

app.get('/tracks', (req, res) => {
    res.json(tracks);
});


app.get('/trackData/:trackIdString', (req, res) => {
    const { trackIdString } = req.params;
    const trackId = parseInt(trackIdString);
    if (isNaN(trackId)) {
        res.status(400).json({ error: 'Invalid ID' });
    };
    const filtered = filterGeoJSONFeaturesById(geojsonData, trackId);
    res.json(filtered);
});

app.listen(4000, () => {
    console.log('Server running on http://localhost:4000');
});

