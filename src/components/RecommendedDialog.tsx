import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, useTheme, useMediaQuery, Box, Typography, Grid, CircularProgress, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import L from 'leaflet';
import { getUserLocation, getWeatherData, getRecommendations } from '../utils/api';
import { getVenueHours } from '../utils/serpapi';
import './RecommendedDialog.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export type MarkerColor = 'default' | 'green' | 'red' | 'blue' | 'yellow';

interface MarkerIconUrls {
  default: {
    icon: string;
    shadow: string;
  };
  green: {
    icon: string;
    shadow: string;
  };
  red: {
    icon: string;
    shadow: string;
  };
  blue: {
    icon: string;
    shadow: string;
  };
  yellow: {
    icon: string;
    shadow: string;
  };
}

// Custom marker icons
const markerIconUrls: MarkerIconUrls = {
  default: {
    icon: window.location.origin + '/markers/marker-icon-2x-blue.png',
    shadow: window.location.origin + '/markers/marker-shadow.png'
  },
  green: {
    icon: window.location.origin + '/markers/marker-icon-2x-green.png',
    shadow: window.location.origin + '/markers/marker-shadow.png'
  },
  red: {
    icon: window.location.origin + '/markers/marker-icon-2x-red.png',
    shadow: window.location.origin + '/markers/marker-shadow.png'
  },
  blue: {
    icon: window.location.origin + '/markers/marker-icon-2x-blue.png',
    shadow: window.location.origin + '/markers/marker-shadow.png'
  },
  yellow: {
    icon: window.location.origin + '/markers/marker-icon-2x-yellow-new.png',
    shadow: window.location.origin + '/markers/marker-shadow.png'
  }
};

// Fix for default marker icons in React-Leaflet
L.Icon.Default.mergeOptions({
  iconUrl: window.location.origin + '/markers/marker-icon-2x-blue.png',
  shadowUrl: window.location.origin + '/markers/marker-shadow.png',
  iconRetinaUrl: window.location.origin + '/markers/marker-icon-2x-blue.png'
});

// Custom marker icons
function createCustomIcon(color: MarkerColor): L.Icon {
  console.log(`Creating ${color} marker icon with URL: ${color === 'default' ? 'default URL' : markerIconUrls[color].icon}`);
  
  // Special handling for yellow which seems problematic
  if (color === 'yellow') {
    console.log('Using local file for yellow marker');
    return new L.Icon({
      iconUrl: window.location.origin + '/markers/marker-icon-2x-yellow-new.png',
      shadowUrl: window.location.origin + '/markers/marker-shadow.png',
      iconSize: [30, 45],
      iconAnchor: [15, 45],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  }
  
  // Create the icon for other colors
  const icon = new L.Icon({
    iconUrl: color === 'default' 
      ? window.location.origin + '/markers/marker-icon-2x-blue.png'
      : markerIconUrls[color].icon,
    shadowUrl: markerIconUrls[color].shadow,
    iconSize: [30, 45],
    iconAnchor: [15, 45],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
  
  return icon;
}

interface Location {
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
}

interface Weather {
  temperature: number;
  description: string;
}

export type Venue = {
  id: number;
  name: string;
  type: 'restaurant' | 'concert' | 'sports' | 'sport event' | 'sports event';
  location: {
    latitude: number;
    longitude: number;
  };
  address?: string;
  hours?: string;
  category?: string;
  description?: string;
  distance?: string;
  placeId?: string;
  photos?: string[];
  simulatedHours?: string;
  simulatedRating?: string;
  simulatedVenue?: boolean;
  marker?: {
    lat: number;
    lng: number;
    color?: MarkerColor;
  };
};

interface DialogProps {
  open: boolean;
  onClose: () => void;
}

interface UserLocation {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  region?: string;
  usingDefaultLocation: boolean;
}

export function RecommendedDialog({ open, onClose }: DialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLocationAlert, setShowLocationAlert] = useState(false);
  const [locationSource, setLocationSource] = useState<'browser' | 'ip' | 'default' | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const getMarkerIcon = (type: Venue['type'] | string) => {
    console.log(`Getting marker icon for venue type: ${type}`);
    
    let color: MarkerColor;
    
    // Handle both 'sports' and 'sport event' for backward compatibility
    if (type === 'sport event' || type === 'sports' || type === 'sports event') {
      color = 'yellow';
    } else if (type === 'restaurant') {
      color = 'red';
    } else if (type === 'concert') {
      color = 'blue';
    } else {
      color = 'green';
    }
    
    console.log(`Selected color for ${type}: ${color}`);
    return createCustomIcon(color);
  };

  useEffect(() => {
    if (open) {
      setShowLocationAlert(true);
      setLoading(true);
      setError(null);
      
      const fetchData = async () => {
        try {
          // Get user location
          const userLocation = await getUserLocation();
          
          // If location is from browser geolocation, attempt to get the city name
          if (userLocation.city === 'Current Location') {
            try {
              const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation.latitude}&lon=${userLocation.longitude}&zoom=10`);
              if (response.ok) {
                const data = await response.json();
                if (data.address) {
                  userLocation.city = data.address.city || data.address.town || data.address.village || data.address.hamlet || 'Current Location';
                  userLocation.region = data.address.state || data.address.county || '';
                  userLocation.country = data.address.country || userLocation.country;
                }
              }
            } catch (error) {
              console.error('Error getting location name:', error);
            }
          }
          
          setLocation(userLocation);
          
          // Set the location source for user feedback
          if (userLocation.usingDefaultLocation) {
            setLocationSource('default');
          } else if (userLocation.city === 'Current Location') {
            setLocationSource('browser');
          } else {
            setLocationSource('ip');
          }

          // Get weather for the location
          const weatherData = await getWeatherData(userLocation);
          setWeather(weatherData);

          setLoadingRecommendations(true);
          // Get venue recommendations - but don't use simulated data fallback
          const recommendations = await getRecommendations(userLocation, weatherData);
          
          // Filter out any simulated venues
          const realVenues = recommendations.filter(venue => !venue.simulatedVenue);
          
          // If we have at least some real venues, use only those
          if (realVenues.length > 0) {
            setVenues(realVenues);
          } else {
            // Only if we have no real venues, show the simulated ones
            setVenues(recommendations);
          }
          setLoadingRecommendations(false);
          
        } catch (err) {
          console.error('Error fetching data:', err);
          setError('Failed to load recommendations. Please try again later.');
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [open]);

  // Initialize map
  useEffect(() => {
    if (!open || !location || !mapContainerRef.current || venues.length === 0) {
      return;
    }

    // Clean up any existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Create a delay to ensure the container is fully rendered
    const initMap = setTimeout(() => {
      if (!mapContainerRef.current) return;

      try {
        console.log('[RecommendedDialog] Initializing map...');
        
        // Initialize the map
        const map = L.map(mapContainerRef.current);
        
        // Create marker bounds to ensure all markers are visible
        const bounds = L.latLngBounds([]);
        
        // Add the user's location to the bounds
        bounds.extend([location.latitude, location.longitude]);
        
        // Add all venue locations to the bounds
        venues.forEach(venue => {
          const position = venue.marker 
            ? [venue.marker.lat, venue.marker.lng] 
            : [venue.location.latitude, venue.location.longitude];
          bounds.extend(position as [number, number]);
        });
        
        // Set view to bounds with padding
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        
        // Add the tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        // Add user marker
        L.marker([location.latitude, location.longitude], {
          icon: createCustomIcon('green')
        })
        .bindTooltip('You are here', { permanent: true })
        .addTo(map);
        
        // Add venue markers
        console.log(`Adding ${venues.length} venue markers to map`);
        venues.forEach((venue, index) => {
          // Determine venue type and assign appropriate marker
          let markerIcon;
          let venueType = venue.type;
          
          console.log(`Adding marker #${index + 1} for venue: ${venue.name}, type: ${venueType}`);
          
          if (venueType === 'restaurant') {
            markerIcon = createCustomIcon('red');
          } else if (venueType === 'concert') {
            markerIcon = createCustomIcon('blue');
          } else if (venueType === 'sports' || venueType === 'sport event' || venueType === 'sports event') {
            console.log('Creating a sports event marker with yellow icon');
            markerIcon = createCustomIcon('yellow');
          } else {
            console.log(`Unknown venue type: ${venueType}, using green marker`);
            markerIcon = createCustomIcon('green');
          }
          
          // Use marker position if provided, otherwise use location
          const position = venue.marker 
            ? [venue.marker.lat, venue.marker.lng] 
            : [venue.location.latitude, venue.location.longitude];
          
          console.log(`Creating marker at [${position[0]}, ${position[1]}]`);
          
          // Create the marker
          const marker = L.marker(position as [number, number], {
            icon: markerIcon
          });
          
          // Create initial popup content with loading state
          const initialPopupContent = `
            <h3>${venue.name}</h3>
            <p>Type: ${venue.type}</p>
            <p><i>Loading...</i></p>
          `;
          
          // Add initial popup content
          const popup = L.popup().setContent(initialPopupContent);
          marker.bindPopup(popup);
          
          // Add marker to map
          marker.addTo(map);
          console.log(`Marker for ${venue.name} added to map`);
          
          // Fetch venue hours asynchronously
          (async () => {
            try {
              console.log(`Fetching hours for ${venue.name}`);
              
              // Check if this is a simulated venue with pre-defined hours
              if (venue.simulatedVenue && venue.simulatedHours) {
                console.log(`Using simulated hours for ${venue.name}: ${venue.simulatedHours}`);
                
                // Update popup with simulated hours - simple version
                const simulatedContent = `
                  <h3>${venue.name}</h3>
                  <p>Type: ${venue.type}</p>
                  <p>${venue.simulatedHours.replace('Open Hours: ', '')}</p>
                `;
                
                popup.setContent(simulatedContent);
              } else {
                // Fetch real hours from SerpAPI
                const hoursInfo = await getVenueHours(
                  venue.name, 
                  location.city || '', 
                  venue.type
                );
                
                // Simple content without any special handling
                const updatedContent = `
                  <h3>${venue.name}</h3>
                  <p>Type: ${venue.type}</p>
                  <p>${hoursInfo}</p>
                `;
                
                popup.setContent(updatedContent);
                console.log(`Updated popup content for ${venue.name} with hours info`);
              }
            } catch (error) {
              console.error(`Failed to fetch hours for ${venue.name}:`, error);
              // Update popup with error message - simple version
              const errorContent = `
                <h3>${venue.name}</h3>
                <p>Type: ${venue.type}</p>
                <p>Hours not available</p>
              `;
              
              popup.setContent(errorContent);
            }
          })();
        });
        
        // Store the map instance for cleanup
        mapInstanceRef.current = map;
        
        // Force a resize after map is created
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
        
        console.log('[RecommendedDialog] Map initialized successfully');
      } catch (error) {
        console.error('[RecommendedDialog] Error initializing map:', error);
        setError('Failed to initialize map');
      }
    }, 300);

    // Cleanup function
    return () => {
      clearTimeout(initMap);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [open, location, venues]);

  // Debug: check if marker images are loading correctly
  useEffect(() => {
    // Check if marker images load correctly
    const checkImage = (url: string) => {
      const img = new Image();
      img.onload = () => console.log(`✅ Image loaded successfully: ${url}`);
      img.onerror = (err) => console.error(`❌ Failed to load image: ${url}`, err);
      img.src = url;
    };

    // Check all marker images
    console.log('Checking marker icon availability...');
    checkImage(markerIconUrls.green.icon);
    checkImage(markerIconUrls.red.icon);
    checkImage(markerIconUrls.blue.icon);
    checkImage(markerIconUrls.yellow.icon);
    checkImage(markerIconUrls.default.shadow);
  }, []);

  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: { minHeight: '600px' }
      }}
    >
      <DialogTitle>
        Recommended Places Near You
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500]
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      {showLocationAlert && (
        <Box sx={{ mx: 3, mb: 2, p: 1, bgcolor: 'primary.light', borderRadius: 1 }}>
          <Typography variant="body2" color="primary.contrastText">
            For the best experience, please allow location access when prompted.
            This helps us provide recommendations that are truly near you.
          </Typography>
        </Box>
      )}
      
      {location && weather && (
        <Box sx={{ px: 3, pb: 1 }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <WbSunnyIcon />
            </Grid>
            <Grid item>
              <Typography variant="body2">
                Current Location: {weather.temperature}°C, {weather.description}
              </Typography>
              <Typography variant="body2" color="primary" sx={{ fontWeight: 'medium' }}>
                {location.city}{location.region ? `, ${location.region}` : ''}
                {location.country ? `, ${location.country}` : ''}
              </Typography>
            </Grid>
            {loadingRecommendations && (
              <Grid item>
                <CircularProgress size={20} />
                <Typography variant="caption" sx={{ ml: 1 }}>
                  Getting recommendations...
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      )}
      
      {locationSource && !loading && location && !error && (
        <Alert severity={locationSource === 'default' ? 'warning' : 'info'} sx={{ mb: 2 }}>
          {locationSource === 'browser' && 'Using your browser location data.'}
          {locationSource === 'ip' && 'Using location based on your IP address.'}
          {locationSource === 'default' && 'Using default location. Please allow location access for better recommendations.'}
        </Alert>
      )}
      
      <DialogContent>
        <Box sx={{ height: '500px', position: 'relative' }}>
          {loading && (
            <div style={{ 
              textAlign: 'center', 
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%'
            }}>
              <CircularProgress size={40} />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Loading location and weather data...
              </Typography>
            </div>
          )}
          {error && (
            <div style={{ 
              textAlign: 'center', 
              padding: '20px', 
              color: 'red',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography variant="body1" color="error">
                {error}
              </Typography>
            </div>
          )}
          {!loading && !error && location && (
            <div style={{ position: 'relative', height: '100%' }}>
              <div 
                id="map" 
                ref={mapContainerRef}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  zIndex: 0,
                  position: 'relative' 
                }}
              ></div>
              
              {/* Map Legend */}
              <div className="map-legend">
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Map Legend</Typography>
                <div className="legend-item">
                  <div className="legend-color green"></div>
                  <span>Your Location</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color red"></div>
                  <span>Restaurants</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color blue"></div>
                  <span>Concerts</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color yellow"></div>
                  <span>Sports Events</span>
                </div>
              </div>
            </div>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default RecommendedDialog; 