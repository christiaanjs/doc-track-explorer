import L from 'leaflet';
import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import TrackSelect from './TrackSelect';

const getGeoJsonCentre = (geoJsonFeature: any): [number, number] => {
  const geojsonLayer = L.geoJSON(geoJsonFeature);
  const bounds = geojsonLayer.getBounds();
  const center = bounds.getCenter();  // Gets the middle point of the bounds
  return [center.lat, center.lng]; // Return as [latitude, longitude]
};

const MapUpdater = ({ mapCenter }: { mapCenter: [number, number] }) => {
  const map = useMap();

  useEffect(() => {
    if (map) {
      map.setView(mapCenter, map.getZoom());  // Update the map's center
    }
  }, [mapCenter, map]);

  return null; // This component doesn't render anything to the DOM
};


const App = () => {
  // const [trackId, setTrackId] = useState<number | null>(null);
  const [trackData, setTrackData] = useState<any>();
  const [mapCenter, setMapCenter] = useState<[number, number]>([-36.8485, 174.7633]);
  const geoJsonRef = useRef<L.GeoJSON | null>(null);

  const handleTrackIdSelection = async (id: number) => {
    // setTrackId(id);
    try {
      // Make the API call to filter GeoJSON by the selected ID
      const response = await fetch(`http://localhost:4000/trackData/${id}`);
      const data = await response.json();
      setTrackData(data);

      const firstFeature = data.features[0];
      const center = getGeoJsonCentre(firstFeature); // Use the helper function to get the center
      setMapCenter(center); // Update map center with centroid
    } catch (error) {
      console.error("Error fetching filtered GeoJSON:", error);
    }
  };

  useEffect(() => {
    if (geoJsonRef.current && trackData) {
      // Clear the previous GeoJSON layer
      geoJsonRef.current.clearLayers();

      // Add new GeoJSON data
      geoJsonRef.current.addData(trackData);
    }
  }, [trackData]);


  return (
    <div>
      <h1>DoC Track Explorer</h1>
      <TrackSelect updateSelectedTrackId={handleTrackIdSelection} />
      <MapContainer center={mapCenter} zoom={12} style={{ height: '500px' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <GeoJSON ref={geoJsonRef} data={trackData} />
        <MapUpdater mapCenter={mapCenter} />
      </MapContainer>
    </div>
  );
};

export default App;
