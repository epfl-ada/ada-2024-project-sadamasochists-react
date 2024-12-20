import { Suspense, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { PanelLayout, ReviewsPanel, SimilarCountriesPanel } from './panels';
import BreweriesPanel from './panels/BreweriesPanel';
import FunFact from './FunFact';
import countriaze from './utils';
import CountrySearch from './CountrySearch';
import WordCloudPanel from './panels/WorldCloudPanel';

const Globe = dynamic(
  () => import('./globe/globe'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full h-screen bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500" />
      </div>
    )
  }
);

export default function World() {
  const [isSpinning, setIsSpinning] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [countryData, setCountryData] = useState<CountryData | null>(null);
  const [breweryData, setBreweryData] = useState<Brewery[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ content: string; x: number; y: number } | null>(null);
  // Add state for panel visibility
  const [visiblePanels, setVisiblePanels] = useState({
    reviews: true,
    similar: true,
    wordCloud: true,
    breweries: true,
    funFact: true
  });


  // Function to handle closing individual panels
  const handlePanelClose = (panelName: keyof typeof visiblePanels) => {
    setVisiblePanels(prev => ({
      ...prev,
      [panelName]: false
    }));
  };


  const loadCountryData = useCallback(async (country: string) => {
    setLoading(true);
    setError(null);

    try {
      const countryResponse = await fetch(`/out/${countriaze(country)}/output.json`);
      if (!countryResponse.ok) {
        throw new Error('Failed to load country data');
      }
      const countryData = await countryResponse.json();
      setCountryData(countryData);

      const breweryResponse = await fetch(`/out/${countriaze(country)}/breweries.json`);
      if (!breweryResponse.ok) {
        throw new Error('Failed to load brewery data');
      }
      const breweryData = await breweryResponse.json();
      setBreweryData(breweryData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
      setCountryData(null);
      setBreweryData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset panel visibility when selecting a new country
  const handleCountryClick = async (countryInfo: {
    name: string;
    code: string;
    coordinates: [number, number];
  } | null) => {
    if (countryInfo && countryInfo.name === selectedCountry) {
      setSelectedCountry(null);
      setCountryData(null);
      setIsSpinning(true);
      return;
    }
    setSelectedCountry(countryInfo?.name || null);
    setIsSpinning(!countryInfo);

    if (countryInfo) {
      // Reset panel visibility when selecting a new country
      setVisiblePanels({
        reviews: true,
        similar: true,
        wordCloud: true,
        breweries: true,
        funFact: true
      });
      await loadCountryData(countryInfo.name);
    } else {
      setCountryData(null);
    }
  };

  const handleCountryHover = (content: string | null, x: number, y: number) => {
    if (content) {
      setTooltip({ content, x, y });
    } else {
      setTooltip(null);
    }
  };

  const handleClose = () => {
    handleCountryClick(null);
  };

  const handleSimilarCountryClick = async (country: string) => {
    handleCountryClick({
      name: country,
      code: 'Unknown',
      coordinates: [0, 0]
    });
  };

  return (
    <div className="relative w-full h-full">
      <Suspense fallback={
        <div className="flex items-center justify-center w-full h-screen bg-black">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500" />
        </div>
      }>
        <Globe
          isSpinning={isSpinning}
          onCountryClick={handleCountryClick}
          selectedCountry={selectedCountry}
          similarCountries={countryData?.similar_countries?.map(c => c.country) || []}
          onCountryHover={(content, x, y) => handleCountryHover(content, x, y)}
        />
      </Suspense>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute bg-black text-white text-sm p-2 rounded shadow-md pointer-events-none"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}


      {/* Country Search or Title */}
      {selectedCountry ? (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-4">
          <h1 className="text-2xl font-bold">{selectedCountry}</h1>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white text-2xl ml-4"
          >
            ×
          </button>
        </div>
      ) : (
        <CountrySearch onCountrySelect={handleCountryClick} />
      )}

      {/* Loading Error */}
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-900 bg-opacity-80 text-white px-6 py-3 rounded-lg shadow-lg">
          {error}
        </div>
      )}

      {/* Panels */}
      {/* {selectedCountry && <FunFact countryName={selectedCountry} />} */}


      {countryData && (
        <PanelLayout>
          {visiblePanels.reviews && (
            <ReviewsPanel
              reviews={countryData.reviews}
              onClose={() => handlePanelClose('reviews')}
            />
          )}
          {visiblePanels.similar && (
            <SimilarCountriesPanel
              countries={countryData.similar_countries}
              onClose={() => handlePanelClose('similar')}
              onCountryClick={handleSimilarCountryClick}
            />
          )}
          {breweryData && visiblePanels.breweries && (
            <BreweriesPanel
              breweries={breweryData}
              onClose={() => handlePanelClose('breweries')}
            />
          )}
          {visiblePanels.wordCloud && (
            <WordCloudPanel
              countryName={countryData.country}
              onClose={() => handlePanelClose('wordCloud')}
            />
          )}

        </PanelLayout>
      )}

      {/* Fun fact outside PanelLayout */}
      {selectedCountry && visiblePanels.funFact && (
        <FunFact
          countryName={selectedCountry}
          onClose={() => handlePanelClose('funFact')}
        />
      )}

      {/* Spin Control */}
      {!selectedCountry && (
        <div className="absolute bottom-4 right-4 space-x-4">
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={() => setIsSpinning(!isSpinning)}
          >
            {isSpinning ? 'Stop Rotation' : 'Start Rotation'}
          </Button>
        </div>
      )}
    </div>
  );
}
