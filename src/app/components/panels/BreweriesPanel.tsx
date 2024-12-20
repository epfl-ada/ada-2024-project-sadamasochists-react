// panels/BreweriesPanel.tsx
'use client';

import { useState } from 'react';
import { Star, Search, Info } from 'lucide-react';
import { InfoModal } from '../modals/InfoModal';
import { Panel } from './panel';

const equalRatings = (a: number, b: number) => Math.abs(a - b) < 0.01;

interface Brewery {
  brewery: string;
  rating: number;
  rating_n: number;
  national_rating: number;
  national_rating_n: number;
}

interface BreweriesPanelProps {
  breweries: Brewery[];
  onClose: () => void;
}

const PartialStar: React.FC<{ fill: number }> = ({ fill }) => {
  return (
    <div className="relative w-4 h-4">
      <Star
        size={16}
        className="absolute fill-gray-400 text-gray-400"
      />
      <div className="absolute overflow-hidden" style={{ width: `${fill * 100}%` }}>
        <Star
          size={16}
          className="fill-yellow-400 text-yellow-400"
        />
      </div>
    </div>
  );
};

const RatingStars: React.FC<{ rating: number; }> = ({ rating }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => {
        const fill = Math.max(0, Math.min(1, rating - i));
        return <PartialStar key={i} fill={fill} />;
      })}
      <span className="ml-2 text-sm">
        {rating.toFixed(2)}
      </span>
    </div>
  );
};

const BreweriesPanel: React.FC<BreweriesPanelProps & { position?: string; className?: string }> = ({
  breweries,
  onClose,
  position,
  className
}) => {
  const [expandedBrewery, setExpandedBrewery] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInfo, setShowInfo] = useState(false);

  const filteredBreweries = breweries
    .filter(brewery =>
      brewery.brewery.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.rating - a.rating);

  return (
    <>
      <Panel
        title={
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Breweries</h2>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowInfo(true);
              }}
              className="text-gray-400 hover:text-white bg-gray-800 rounded-full w-6 h-6 flex items-center justify-center text-sm"
            >
              <Info size={14} />
            </button>
          </div>
        }
        onClose={onClose}
        position={position}
        className={className}
      >
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search breweries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900 text-white px-10 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-4">
          {filteredBreweries.map((brewery) => (
            <div
              key={brewery.brewery}
              className="border border-gray-700 rounded-lg p-4"
            >
              <button
                onClick={() => setExpandedBrewery(
                  expandedBrewery === brewery.brewery ? null : brewery.brewery
                )}
                className="w-full text-left"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold mb-2">{brewery.brewery}</h3>
                  <span className="text-sm text-blue-400">
                    {expandedBrewery === brewery.brewery ? '▼' : '▶'}
                  </span>
                </div>

                <div className="space-y-2">
                  {brewery.rating_n != brewery.national_rating_n && (
                    <div className="flex justify-between text-sm">
                      <span>Global Rating:</span>
                      <RatingStars rating={brewery.rating} />
                    </div>
                  )}
                  {brewery.national_rating_n > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Local Rating:</span>
                      <RatingStars rating={brewery.national_rating} />
                    </div>
                  )}
                </div>

                {expandedBrewery === brewery.brewery && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="text-sm text-gray-400 space-y-2">
                      {brewery.rating_n != brewery.national_rating_n ? (
                        <p>
                          This brewery has been rated {brewery.rating_n} times globally,
                          with an average rating of {brewery.rating.toFixed(2)}.
                        </p>
                      ) : (
                        <p>
                          This brewery has only received national ratings.
                        </p>
                      )}
                      {brewery.national_rating_n > 0 ? (
                        <>
                          <p>
                            Local reviewers have rated it {brewery.national_rating_n} times,
                            with an average of {brewery.national_rating.toFixed(2)}
                            {!equalRatings(brewery.national_rating, brewery.rating) && (
                              <>
                                {' '}
                                ({brewery.national_rating > brewery.rating ? 'higher' : 'lower'} than
                                the global rating by {Math.abs(brewery.national_rating - brewery.rating).toFixed(2)} points).
                              </>
                            )}
                          </p>
                        </>
                      ) : (
                        <p>
                          This brewery has not yet received any local ratings.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </button>
            </div>
          ))}
        </div>
      </Panel>

      {showInfo && (
        <InfoModal
          title="About Brewery Ratings"
          onClose={() => setShowInfo(false)}
        >
          <div className="space-y-4">
            <p>
              Brewery ratings are calculated using two different metrics:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Global Rating:</strong> The average rating across all beers produced by this brewery,
                based on {breweries.reduce((sum, b) => sum + b.rating_n, 0)} total reviews from users worldwide.
              </li>
              <li>
                <strong>Local Rating:</strong> The average rating from reviewers in the same country,
                helping to show how local consumers perceive the brewery compared to the global audience.
              </li>
              <li>
                The number in parentheses (n) shows how many ratings contribute to each average,
                giving you an idea of how well-established these ratings are.
              </li>
            </ul>
          </div>
        </InfoModal>
      )}
    </>
  );
};

export default BreweriesPanel;