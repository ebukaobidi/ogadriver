import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getErrorUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Map = ({ 
  center = [6.5244, 3.3792], // Default to Lagos, Nigeria
  zoom = 12,
  markers = [],
  circles = [],
  onMarkerClick = null,
  height = '400px',
}) => {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width: '100%' }}
      className="rounded-lg shadow-md"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {markers.map((marker, index) => (
        <Marker
          key={`marker-${index}`}
          position={marker.position}
          eventHandlers={{
            click: () => onMarkerClick && onMarkerClick(marker),
          }}
        >
          <Popup>
            <div>
              <h3 className="font-semibold">{marker.title || 'Location'}</h3>
              {marker.description && <p className="text-sm">{marker.description}</p>}
              {marker.info && (
                <div className="mt-2 text-sm">
                  {Object.entries(marker.info).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-medium">{key}:</span> {value}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      {circles.map((circle, index) => (
        <Circle
          key={`circle-${index}`}
          center={circle.center}
          radius={circle.radius || 1000}
          pathOptions={{
            color: circle.color || '#3388ff',
            fillColor: circle.fillColor || '#3388ff',
            fillOpacity: circle.fillOpacity || 0.2,
          }}
        >
          {circle.popup && (
            <Popup>
              <div>
                <h3 className="font-semibold">{circle.popup.title || 'Area'}</h3>
                {circle.popup.description && <p className="text-sm">{circle.popup.description}</p>}
              </div>
            </Popup>
          )}
        </Circle>
      ))}
    </MapContainer>
  );
};

export default Map;
