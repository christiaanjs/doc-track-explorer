import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fetchDocJsonData, DocJSON } from './docApi';
import { Cache } from './cache';
import { GeoJSON } from './geoJson';
import { convertToGpx } from './gpxConverter';

dotenv.config();

const app = express();
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? 'https://doc-track-explorer.onrender.com'
        : 'http://localhost:5173'
}));
app.use(express.json());

interface Track {
    id: string;
    trackName: string;
    region: string[];
    status: string;
}

const ONE_DAY = 24 * 60 * 60 * 1000;
const docJsonCache = new Cache<Map<string, DocJSON>>(ONE_DAY, async () => {
    const data = await fetchDocJsonData();
    return new Map(data.map((track: DocJSON) => [track.assetId, track]));
});
const mapStatus = (status: string): string => {
    if (status === undefined) {
        return "Unknown";
    }
    switch (status) {
        case "OPEN":
            return "Open";
        case "CLSD":
            return "Closed";
        default:
            return status;
    }
};

app.get('/api/tracks', async (req, res) => {
    const docJsonData = await docJsonCache.getData();
    const tracks: Track[] = Array.from(docJsonData.values()).map((track: DocJSON) => ({
        id: track.assetId,
        trackName: track.name,
        region: track.region,
        status: mapStatus(track.status)
    }));
    res.json(tracks);
});

app.get('/api/trackData/:trackIdString', async (req, res) => {
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

app.get('/api/downloadGpx/:trackIdString', async (req, res) => {
    const { trackIdString } = req.params;
    const docJsonData = await docJsonCache.getData();
    const track = docJsonData.get(trackIdString);
    if (!track) {
        res.status(404).json({ error: 'Track not found' });
    } else {
        const gpx = convertToGpx(track);
        res.setHeader('Content-Disposition', `attachment; filename="${track.name}.gpx"`);
        res.setHeader('Content-Type', 'application/gpx+xml');
        res.send(gpx);
    }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
