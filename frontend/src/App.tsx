import L from 'leaflet';
import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import TrackSelect from './TrackSelect';
import './App.css';

// Helper function to get the center of a GeoJSON feature
const getGeoJsonCentre = (geoJsonFeature: any): [number, number] => {
  const geojsonLayer = L.geoJSON(geoJsonFeature);
  const bounds = geojsonLayer.getBounds();
  const center = bounds.getCenter();
  return [center.lat, center.lng];
};

// Component to update the map center
const MapUpdater = ({ mapCenter }: { mapCenter: [number, number] }) => {
  const map = useMap();

  useEffect(() => {
    if (map) {
      map.setView(mapCenter, map.getZoom());
    }
  }, [mapCenter, map]);

  return null;
};

const App = () => {
  const [trackData, setTrackData] = useState<any>();
  const [mapCenter, setMapCenter] = useState<[number, number]>([-36.8485, 174.7633]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const geoJsonRef = useRef<L.GeoJSON | null>(null);

  const handleTrackIdSelection = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:4000/trackData/${id}`);
      const data = await response.json();
      setTrackData(data);
      setSelectedTrackId(id);
      setDownloadUrl(`http://localhost:4000/downloadGpx/${id}`);

      const firstFeature = data.features[0];
      const center = getGeoJsonCentre(firstFeature);
      setMapCenter(center);
    } catch (error) {
      console.error("Error fetching filtered GeoJSON:", error);
    }
  };

  useEffect(() => {
    if (geoJsonRef.current && trackData) {
      geoJsonRef.current.clearLayers();
      geoJsonRef.current.addData(trackData);
    }
  }, [trackData]);

  return (
    <div>
      <h1>DoC Track Explorer</h1>
      <TrackSelect updateSelectedTrackId={handleTrackIdSelection} />
      <a href={downloadUrl || '#'} download>
        <button disabled={!selectedTrackId}>Download GPX</button>
      </a>
      <MapContainer center={mapCenter} zoom={12} style={{ height: '500px' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <GeoJSON ref={geoJsonRef} data={trackData} />
        <MapUpdater mapCenter={mapCenter} />
      </MapContainer>
    </div>
  );
};

export default App;
