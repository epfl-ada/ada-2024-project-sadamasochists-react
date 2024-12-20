'use client';

import React, { useEffect, useRef } from 'react';
import Globe from 'globe.gl';
import countriaze from '../utils';

interface GlobeProps {
  isSpinning?: boolean;
  onCountryClick?: (countryInfo: {
    name: string;
    code: string;
    coordinates: [number, number];
  } | null) => void;
  selectedCountry?: string | null;
  similarCountries?: string[];
  onCountryHover?: (content: string | null, x: number, y: number) => void;
}

const fixCountryName = (country: string): string => {
  const fixes = {
    'united states of america': 'United States',
    'czechia': 'Czech Republic',
    'fiji': 'Fiji Islands',
    'democratic republic of the congo': 'Dem Rep of Congo',
    'republic of serbia': 'Serbia',
    'united republic of tanzania': 'Tanzania',
    'the bahamas': 'Bahamas',
    'north macedonia': 'Macedonia',
  };

  return fixes[country.toLowerCase()] || country;
}

const GlobeComponent: React.FC<GlobeProps> = ({
  isSpinning = true,
  onCountryClick,
  selectedCountry,
  onCountryHover,
  similarCountries = []
}) => {
  const globeRef = useRef<HTMLDivElement>(null);
  const globeInstance = useRef<any>(null);
  const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countryDataCache = useRef<Map<string, boolean>>(new Map());

  let mousePosition = { x: 0, y: 0 };

  // Track mouse movement globally
  window.addEventListener('mousemove', (e) => {
    mousePosition.x = e.clientX;
    mousePosition.y = e.clientY;
  });

  // Initialize globe
  useEffect(() => {
    if (!globeRef.current) return;

    const globe = Globe()
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .showAtmosphere(true)
      .atmosphereColor('#1a237e')
      .atmosphereAltitude(0.1)
      .polygonAltitude(0.01)
      .polygonCapColor((feat: any) => feat.__color || '#6d6d6d')
      .polygonSideColor(() => '#232323')
      .polygonStrokeColor(() => '#111')
      .onPolygonClick(async (polygon: any, event: any, { lat, lng }) => {
        if (!polygon || !onCountryClick) return;

        const countryName = fixCountryName(polygon.properties.ADMIN || polygon.properties.name);
        const hasData = countryDataCache.current.get(countryName);

        if (hasData) {
          const countryInfo = {
            name: countryName,
            code: polygon.properties.ISO_A2 || polygon.properties.ISO_A3 || 'Unknown',
            coordinates: [lat, lng]
          };

          // Reset colors of the previous selection
          if (globeInstance.current) {
            const features = globeInstance.current.polygonsData();
            features.forEach((feat: any) => {
              const featCountryName = fixCountryName(feat.properties.ADMIN || feat.properties.name);
              const hasData = countryDataCache.current.get(featCountryName);
              feat.__color = hasData ? 'rgba(200, 200, 200, 0.3)' : 'rgba(100, 100, 100, 0.15)';
            });
            globeInstance.current.polygonsData([...features]);
          }

          onCountryClick(countryInfo);
        }
      })

      .onPolygonHover((polygon: any) => {
        if (!polygon) {
          // Reset cursor and clear tooltip
          document.body.style.cursor = 'default';
          if (typeof onCountryHover === 'function') {
            onCountryHover(null, 0, 0);
          }
          return;
        }

        console.log('Hovering over', polygon.properties.ADMIN || polygon.properties.name);

        // Change cursor style to pointer
        document.body.style.cursor = 'pointer';

        const countryName = fixCountryName(polygon.properties.ADMIN || polygon.properties.name);
        const hasData = countryDataCache.current.get(countryName);

        // Prepare tooltip content
        const tooltipContent = hasData
          ? `<strong>${countryName}</strong>`
          : `<strong>${countryName}</strong> - No data available for this country 😢`;

        // Call the hover callback with tooltip content and current mouse position
        if (typeof onCountryHover === 'function') {
          onCountryHover(tooltipContent, mousePosition.x, mousePosition.y);
        }
      });

    ;

    // Load countries data
    fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(async ({ features }) => {
        // Check data availability for all countries
        const checkedFeatures = await Promise.all(
          features.map(async (feat: any) => {
            const countryName = fixCountryName(feat.properties.ADMIN || feat.properties.name);
            try {
              const response = await fetch(`/out/${countriaze(countryName)}/output.json`, { method: 'HEAD' });
              const hasData = response.ok;
              countryDataCache.current.set(countryName, hasData);
              feat.__color = hasData ? 'rgba(200, 200, 200, 0.3)' : 'rgba(100, 100, 100, 0.15)';
            } catch {
              countryDataCache.current.set(countryName, false);
              feat.__color = 'rgba(100, 100, 100, 0.15)';
            }
            return feat;
          })
        );

        globe.polygonsData(checkedFeatures);
        globeInstance.current = globe(globeRef.current);

        // Set up controls
        const controls = globe.controls();
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controls.enablePan = false;
        controls.minDistance = 200;
        controls.maxDistance = 800;
        controls.rotateSpeed = 0.3;
        controls.zoomSpeed = 0.5;

        // Handle rotation
        controls.autoRotate = isSpinning;
        controls.autoRotateSpeed = 0.5;

        // Handle drag events
        controls.addEventListener('start', () => {
          if (spinTimeoutRef.current) {
            clearTimeout(spinTimeoutRef.current);
          }
          controls.autoRotate = false;
        });

        controls.addEventListener('end', () => {
          if (spinTimeoutRef.current) {
            clearTimeout(spinTimeoutRef.current);
          }
          if (isSpinning && !selectedCountry) {
            spinTimeoutRef.current = setTimeout(() => {
              controls.autoRotate = true;
            }, 3000);
          }
        });
      });

    return () => {
      if (globeInstance.current) {
        globeInstance.current._destructor();
      }
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
      }
    };
  }, []); // Only run on mount

  // Update colors based on selection and similar countries
  useEffect(() => {
    if (!globeInstance.current) return;

    const features = globeInstance.current.polygonsData();
    if (!features) return;

    features.forEach((feat: any) => {
      const countryName = fixCountryName(feat.properties.ADMIN || feat.properties.name);
      const hasData = countryDataCache.current.get(countryName);

      if (selectedCountry === countryName) {
        feat.__color = '#ff0000';
      } else if (similarCountries.includes(countryName)) {
        feat.__color = '#00ff00';
      } else {
        feat.__color = hasData ? 'rgba(200, 200, 200, 0.3)' : 'rgba(100, 100, 100, 0.15)';
      }
    });

    globeInstance.current.polygonsData([...features]);

    const controls = globeInstance.current.controls();
    if (controls) {
      controls.autoRotate = isSpinning && !selectedCountry;
    }
  }, [isSpinning, selectedCountry, similarCountries]);

  return (
    <div
      ref={globeRef}
      className="w-full h-full bg-black"
    />
  );
};

export default GlobeComponent;