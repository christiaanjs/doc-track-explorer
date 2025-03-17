import { DocJSON } from './docApi';
import { buildGPX, BaseBuilder } from 'gpx-builder';

const { Point, Metadata, Track, Segment } = BaseBuilder.MODELS;

export function convertToGpx(track: DocJSON): string {
    const points = track.line.flatMap(line =>
        line.map(coord => new Point(coord[1], coord[0]))
    );

    const gpxData = new BaseBuilder();
    gpxData.setMetadata(new Metadata({
        name: track.name
    }));
    gpxData.setTracks([
        new Track([
            new Segment(points)
        ], { name: track.name })
    ]);

    return buildGPX(gpxData.toObject());
}
