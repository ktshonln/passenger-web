import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const telemetryBase = import.meta.env.VITE_TELEMETRY_URL ?? 'https://telemetry.katisha.online';

/** Animated bus marker using a brand-coloured div icon */
const busIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:18px;height:18px;border-radius:50%;
    background:#008BFF;
    border:3px solid white;
    box-shadow:0 2px 6px rgba(0,130,255,0.5);
    animation:pulse 1.5s infinite;
  "></div>
  <style>
    @keyframes pulse {
      0%,100%{box-shadow:0 2px 6px rgba(0,130,255,0.5);}
      50%{box-shadow:0 2px 16px rgba(0,130,255,0.9);}
    }
  </style>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -12],
});

/** Smoothly pan the map to a new position */
const PanTo = ({ position }: { position: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.panTo(position, { animate: true, duration: 0.8 });
  }, [position, map]);
  return null;
};

interface TelemetryFix {
  lat: number;
  lon: number;
  ts: string;
}

interface BusTrackerProps {
  busId: string;
  busPlate?: string;
}

/**
 * Shows a live-updating bus marker on a map.
 * Connects to GET {VITE_TELEMETRY_URL}/buses/{busId}/stream (SSE).
 * Falls back to GET /buses/{busId}/location for the initial position.
 */
const BusTracker = ({ busId, busPlate }: BusTrackerProps) => {
  const [fix, setFix] = useState<TelemetryFix | null>(null);
  const [error, setError] = useState(false);
  const [staleSince, setStaleSince] = useState<Date | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let mounted = true;

    const connect = async () => {
      // Seed with latest known fix first
      try {
        const res = await fetch(`${telemetryBase}/buses/${busId}/location`);
        if (res.ok) {
          const data: TelemetryFix = await res.json();
          if (mounted) setFix(data);
        }
      } catch {
        // no initial fix — that's ok, stream will provide one
      }

      // Open SSE stream
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch(`${telemetryBase}/buses/${busId}/stream`, {
          signal: controller.signal,
          headers: { Accept: 'text/event-stream' },
        });

        if (!response.ok || !response.body) {
          if (mounted) setError(true);
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (mounted) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (line.startsWith('data:')) {
              try {
                const payload: TelemetryFix = JSON.parse(line.slice(5).trim());
                if (mounted) {
                  setFix(payload);
                  setStaleSince(null);
                }
              } catch {
                // malformed line — skip
              }
            }
          }
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        if (mounted) {
          setError(true);
          setStaleSince(new Date());
        }
      }
    };

    connect();

    return () => {
      mounted = false;
      abortRef.current?.abort();
    };
  }, [busId]);

  if (!fix) {
    return (
      <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#111827] p-4 text-center">
        <p className="text-sm text-gray-400 dark:text-gray-600 animate-pulse">
          {error ? 'Live tracking unavailable' : 'Waiting for bus location…'}
        </p>
      </div>
    );
  }

  const position: [number, number] = [fix.lat, fix.lon];
  const lastSeen = new Date(fix.ts);
  const ageSeconds = Math.floor((Date.now() - lastSeen.getTime()) / 1000);
  const isStale = ageSeconds > 60;

  return (
    <div className="space-y-2">
      <MapContainer
        center={position}
        zoom={14}
        scrollWheelZoom={false}
        style={{ height: '220px' }}
        className="w-full rounded-2xl z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={busIcon}>
          <Popup>
            <p className="font-semibold text-sm">{busPlate ?? 'Bus'}</p>
            <p className="text-xs text-gray-500">
              {lastSeen.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </Popup>
        </Marker>
        <PanTo position={position} />
      </MapContainer>
      <p className={`text-xs text-center ${isStale ? 'text-amber-500 dark:text-amber-400' : 'text-gray-400 dark:text-gray-600'}`}>
        {isStale
          ? `Last update ${ageSeconds}s ago — signal may be lost`
          : `Live · updated ${ageSeconds < 5 ? 'just now' : `${ageSeconds}s ago`}`}
        {staleSince && ' (stream disconnected)'}
      </p>
    </div>
  );
};

export default BusTracker;
