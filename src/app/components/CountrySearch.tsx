// components/CountrySearch.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';
import countriaze from './utils';

interface CountrySearchProps {
  onCountrySelect: (countryInfo: {
    name: string;
    code: string;
    coordinates: [number, number];
  }) => void;
}

interface CountryOption {
  name: string;
  hasData: boolean;
}

const CountrySearch: React.FC<CountrySearchProps> = ({ onCountrySelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load and check available countries
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const response = await fetch(
          'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson'
        );
        const { features } = await response.json();

        // Check which countries have data
        const countryList = await Promise.all(
          features.map(async (feature: any) => {
            const name = feature.properties.ADMIN || feature.properties.name;
            try {
              const response = await fetch(`/out/${countriaze(name)}/output.json`, { method: 'HEAD' });
              return {
                name,
                hasData: response.ok
              };
            } catch {
              return {
                name,
                hasData: false
              };
            }
          })
        );

        setCountries(countryList);
      } catch (error) {
        console.error('Error loading countries:', error);
      }
    };

    loadCountries();
  }, []);

  // Filter countries based on search term
  const filteredCountries = countries
    .filter(country =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) && country.hasData
    )
    .slice(0, 5); // Limit to top 5 results

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountrySelect = (countryName: string) => {
    setSearchTerm('');
    setIsOpen(false);
    onCountrySelect({
      name: countryName,
      code: 'Unknown',
      coordinates: [0, 0]
    });
  };

  return (
    <div
      ref={containerRef}
      className="absolute top-4 left-1/2 transform -translate-x-1/2 w-96 z-20"
    >
      <div className="relative">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search for a country..."
            className="w-full bg-black bg-opacity-80 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {isOpen && searchTerm && filteredCountries.length > 0 && (
          <div className="absolute w-full mt-2 bg-black bg-opacity-80 rounded-lg shadow-lg overflow-hidden">
            {filteredCountries.map((country) => (
              <button
                key={country.name}
                onClick={() => handleCountrySelect(country.name)}
                className="w-full px-4 py-3 text-left text-white hover:bg-blue-500 hover:bg-opacity-20 flex items-center space-x-2"
              >
                <MapPin size={16} className="text-gray-400" />
                <span>{country.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CountrySearch;