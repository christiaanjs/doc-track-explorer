import { test, expect } from 'vitest';
import { DocJSON } from './docApi';
import { mapDocTrackToTrack, mapDocTrackToGeoJson } from './index';

test('DoC track mapping', () => {
    const input: DocJSON[] = [
        { assetId: '1', name: 'Track 1', region: ['Region 1'], status: 'OPEN', y: 0, x: 0, line: [] },
        { assetId: '2', name: 'Track 2', region: ['Region 2'], status: 'CLSD', y: 0, x: 0, line: [] }
    ];
    const output = input.map(mapDocTrackToTrack);

    expect(output).toEqual([
        { id: '1', trackName: 'Track 1', region: ['Region 1'], status: 'Open' },
        { id: '2', trackName: 'Track 2', region: ['Region 2'], status: 'Closed' }
    ]);
});

test('DoC track to GeoJSON mapping', () => {
    const input: DocJSON = {
        assetId: '1',
        name: 'Track 1',
        region: ['Region 1'],
        status: 'OPEN',
        y: 0,
        x: 0,
        line: [[[0, 0], [1, 1]]]
    };
    const output = mapDocTrackToGeoJson(input);

    expect(output).toEqual({
        type: "FeatureCollection",
        features: [{
            type: "Feature",
            geometry: { type: "MultiLineString", coordinates: [[[0, 0], [1, 1]]] },
            properties: { name: 'Track 1', region: ['Region 1'], status: 'OPEN' },
            id: '1'
        }],
        crs: { type: "name", properties: { name: "EPSG:4326" } }
    });
});
