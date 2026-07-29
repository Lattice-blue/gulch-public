import { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';

// CONFLICT ZONES (ISO 2-letter codes)
const CONFLICT_COUNTRIES = ['UA', 'RU', 'SD', 'SY', 'YE', 'IL', 'PS', 'MM'];

// RADAR BEACONS (Pulsing Rings)
const RADAR_NODES = [
  { lat: 9.3068, lng: 123.3038, maxR: 6, propagationSpeed: 1.8, repeatPeriod: 1200, color: '#39ff14' },   // NORSU (Green Base)
  { lat: 40.4168, lng: -3.7038, maxR: 8, propagationSpeed: 1.5, repeatPeriod: 1800, color: '#ffaa00' },   // Spain (Amber)
  { lat: 39.7392, lng: -104.9903, maxR: 8, propagationSpeed: 1.8, repeatPeriod: 1400, color: '#00f0ff' }, // Palantir HQ (Denver, CO) - Cyan
  { lat: 50.4501, lng: 30.5234, maxR: 10, propagationSpeed: 1.2, repeatPeriod: 2000, color: '#ff3333' }    // Eastern Europe (Red)
];

// SLEEK LASER NEEDLES (Slimmed down from 0.4 to 0.12 for precision)
const SPIKE_NODES = [
  { lat: 9.3068, lng: 123.3038, size: 0.12, color: '#39ff14', altitude: 0.18 },  // NORSU
  { lat: 40.4168, lng: -3.7038, size: 0.12, color: '#ffaa00', altitude: 0.22 },    // Spain
  { lat: 39.7392, lng: -104.9903, size: 0.12, color: '#00f0ff', altitude: 0.22 },  // Palantir HQ (Denver, CO)
  { lat: 50.4501, lng: 30.5234, size: 0.15, color: '#ff3333', altitude: 0.25 },   // Eastern Europe
  { lat: 51.5074, lng: -0.1278, size: 0.10, color: '#00f0ff', altitude: 0.15 }    // London Node
];

export default function GlobeBackground() {
  const globeRef = useRef();
  const [countries, setCountries] = useState({ features: [] });

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(data => setCountries(data))
      .catch(err => console.error('Failed to load country boundaries:', err));
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.35;
      controls.enableZoom = false;
      
      globeRef.current.pointOfView({ lat: 15, lng: 120, altitude: 2.2 });
    }
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <Globe
        ref={globeRef}
        backgroundColor="rgba(0,0,0,0)"
        
        // --- 1. HIGH-RES DARK TEXTURE & TOPOGRAPHIC BUMP MAP ---
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        
        // --- 2. ATMOSPHERIC HALO ---
        showAtmosphere={true}
        atmosphereColor="#00f0ff"
        atmosphereAltitude={0.18}

        // --- 3. PULSING RADAR RINGS ---
        ringsData={RADAR_NODES}
        ringColor="color"
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"

        // --- 4. SLEEK 3D LASER NEEDLES ---
        pointsData={SPIKE_NODES}
        pointColor="color"
        pointAltitude="altitude"
        pointRadius="size"
        pointResolution={12}

        // --- 5. VECTOR COUNTRY OUTLINES (GIS MESH) ---
        polygonsData={countries.features}
        polygonCapColor={d => 
          CONFLICT_COUNTRIES.includes(d.properties.ISO_A2) 
            ? 'rgba(255, 30, 30, 0.35)' 
            : 'rgba(0, 0, 0, 0.0)'
        }
        polygonSideColor={() => 'rgba(0, 0, 0, 0)'}
        polygonStrokeColor={d => 
          CONFLICT_COUNTRIES.includes(d.properties.ISO_A2) 
            ? 'rgba(255, 50, 50, 0.8)' 
            : 'rgba(0, 240, 255, 0.12)' // Thin cyan vector outlines for ALL countries!
        }
        polygonAltitude={d => 
          CONFLICT_COUNTRIES.includes(d.properties.ISO_A2) ? 0.012 : 0.003
        }
      />
    </div>
  );
}