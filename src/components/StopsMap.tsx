import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Stop } from '../types';

// Fix Leaflet's default icon paths broken by bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom brand-coloured marker for origin/destination
const makeIcon = (color: 'brand' | 'gray') =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:14px;height:14px;border-radius:50%;
      background:${color === 'brand' ? '#008BFF' : '#6b7280'};
      border:2.5px solid white;
      box-shadow:0 1px 4px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });

const brandIcon = makeIcon('brand');
const grayIcon = makeIcon('gray');

/** Auto-fits the map to show all markers */
const FitBounds = ({ positions }: { positions: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 1) {
      map.fitBounds(L.latLngBounds(positions), { padding: [32, 32] });
    } else if (positions.length === 1) {
      map.setView(positions[0], 13);
    }
  }, [map, positions]);
  return null;
};

interface StopsMapProps {
  stops: Stop[];
  className?: string;
}

/**
 * Renders an embedded OpenStreetMap showing all stops in order,
 * connected by a polyline. First and last stops use the brand colour.
 */
const StopsMap = ({ stops, className = '' }: StopsMapProps) => {
  if (stops.length === 0) return null;

  const sorted = [...stops].sort((a, b) => a.order - b.order);
  const positions: [number, number][] = sorted.map((s) => [s.lat, s.lng]);
  const center = positions[Math.floor(positions.length / 2)];

  return (
    <MapContainer
      center={center}
      zoom={9}
      scrollWheelZoom={false}
      className={`w-full rounded-2xl z-0 ${className}`}
      style={{ height: '260px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Route line */}
      <Polyline
        positions={positions}
        pathOptions={{ color: '#008BFF', weight: 3, opacity: 0.7, dashArray: '6 4' }}
      />

      {/* Stop markers */}
      {sorted.map((stop, i) => {
        const isEndpoint = i === 0 || i === sorted.length - 1;
        return (
          <Marker
            key={stop.id}
            position={[stop.lat, stop.lng]}
            icon={isEndpoint ? brandIcon : grayIcon}
          >
            <Popup>
              <span className="font-semibold text-sm">{stop.name}</span>
              {isEndpoint && (
                <span className="block text-xs text-gray-500 mt-0.5">
                  {i === 0 ? 'Origin' : 'Destination'}
                </span>
              )}
            </Popup>
          </Marker>
        );
      })}

      <FitBounds positions={positions} />
    </MapContainer>
  );
};

export default StopsMap;
