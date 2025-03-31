import L from 'leaflet';
import GeoJson from 'geojson';
import { useEffect, useState, useRef, useContext, createContext } from 'react';
import { MapContainer, TileLayer, GeoJSON as GeoJSONComponent, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import TrackSelect from './TrackSelect';
import './App.css';
import { ProgressSpinner } from 'primereact/progressspinner';

// Helper function to get the center of a GeoJSON feature
const getGeoJsonCentre = (geoJsonFeature: GeoJson.GeoJsonObject): [number, number] => {
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
  const [trackData, setTrackData] = useState<GeoJson.GeoJsonObject>();
  const [mapCenter, setMapCenter] = useState<[number, number]>([-36.8485, 174.7633]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loadingMap, setLoadingMap] = useState(false);
  const geoJsonRef = useRef<L.GeoJSON | null>(null);

  const backendHost = import.meta.env.VITE_BACKEND_HOST || "";

  const handleTrackIdSelection = async (id: string) => {
    try {
      setLoadingMap(true); // Set loading to true before fetching data
      const response = await fetch(`${backendHost}/api/trackData/${id}`);
      const data = await response.json();
      setTrackData(data);
      setSelectedTrackId(id);
      setDownloadUrl(`${backendHost}/api/downloadGpx/${id}`);

      const firstFeature = data.features[0];
      const center = getGeoJsonCentre(firstFeature);
      setMapCenter(center);
    } catch (error) {
      console.error("Error fetching filtered GeoJSON:", error);
    } finally {
      setLoadingMap(false); // Set loading to false after data is fetched
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
      <div className="map-container">
        <MapContainer center={mapCenter} zoom={12} style={{ height: '500px' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {trackData && <GeoJSONComponent ref={geoJsonRef} data={trackData} />}
          <MapUpdater mapCenter={mapCenter} />
        </MapContainer>
        {loadingMap && (
          <div className="loading-overlay">
            <ProgressSpinner />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
