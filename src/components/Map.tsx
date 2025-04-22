import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Tooltip, Popup } from 'react-leaflet';
import { MarkerColor } from './RecommendedDialog';

interface Location {
  latitude: number;
  longitude: number;
}

interface Venue {
  id: number;
  name: string;
  type: 'restaurant' | 'concert' | 'sports';
  location: Location;
}

interface MapProps {
  userLocation: Location;
  venues: Venue[];
  getMarkerIcon: (type: Venue['type']) => L.Icon;
  createCustomIcon: (color: MarkerColor) => L.Icon;
}

const Map = ({ userLocation, venues, getMarkerIcon, createCustomIcon }: MapProps) => {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(
        [userLocation.latitude, userLocation.longitude],
        13
      );
      // Force a resize event after the map is mounted
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 100);
    }
  }, [userLocation]);

  // Calculate the adjusted venue coordinates
  const adjustedVenues = venues.map(venue => ({
    ...venue,
    location: {
      latitude: userLocation.latitude + (venue.location.latitude / 100),
      longitude: userLocation.longitude + (venue.location.longitude / 100)
    }
  }));

  return (
    <div style={{ width: '100%', height: '600px', position: 'relative' }}>
      <MapContainer
        center={[userLocation.latitude, userLocation.longitude]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Marker 
          position={[userLocation.latitude, userLocation.longitude]}
          icon={createCustomIcon('green')}
        >
          <Tooltip permanent>You are here</Tooltip>
        </Marker>

        {adjustedVenues.map((venue) => (
          <Marker
            key={venue.id}
            position={[venue.location.latitude, venue.location.longitude]}
            icon={getMarkerIcon(venue.type)}
          >
            <Popup>
              <div>
                <h3>{venue.name}</h3>
                <p>Type: {venue.type}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map; 