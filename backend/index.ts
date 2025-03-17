import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fetchDocJsonData, DocJSON } from './docApi';
import { Cache } from './cache';
import { GeoJSON } from './geoJson';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

interface Track {
    id: string;
    trackName: string;
}

const ONE_DAY = 24 * 60 * 60 * 1000;
const docJsonCache = new Cache<Map<string, DocJSON>>(ONE_DAY, async () => {
    const data = await fetchDocJsonData();
    return new Map(data.map((track: DocJSON) => [track.assetId, track]));
});

app.get('/tracks', async (req, res) => {
    const docJsonData = await docJsonCache.getData();
    const tracks: Track[] = Array.from(docJsonData.values()).map((track: DocJSON) => ({
        id: track.assetId,
        trackName: track.name
    }));
    res.json(tracks);
});

app.get('/trackData/:trackIdString', async (req, res) => {
    const { trackIdString } = req.params;
    const docJsonData = await docJsonCache.getData();
    const track = docJsonData.get(trackIdString);
    if (!track) {
        res.status(404).json({ error: 'Track not found' });
    } else {
        const geojson: GeoJSON = {
            type: "FeatureCollection",
            features: [{
                type: "Feature",
                geometry: {
                    type: "MultiLineString",
                    coordinates: track.line
                },
                properties: {
                    name: track.name,
                    region: track.region,
                    status: track.status
                },
                id: track.assetId
            }],
            crs: {
                type: "name",
                properties: {
                    name: "EPSG:4326"
                }
            }
        };
        res.json(geojson);
    }
});

app.listen(4000, () => {
    console.log('Server running on http://localhost:4000');
});
