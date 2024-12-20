import { useState } from "react";
import { Panel } from "./panel";
import { InfoModal } from "../modals/InfoModal";

interface SimilarCountry {
  country: string;
  similarity: number;
}

interface SimilarCountriesPanelProps {
  countries: SimilarCountry[];
  onClose: () => void;
  onCountryClick?: (country: string) => void;
}

const SimilarCountriesPanel: React.FC<SimilarCountriesPanelProps> = ({
  countries,
  onClose,
  onCountryClick
}) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <Panel
        title={
          <div className="flex items-center gap-2">
            Countries with Similar Beer Reviews
            <button
              onClick={() => setShowInfo(true)}
              className="ml-2 text-gray-400 hover:text-white bg-gray-800 rounded-full w-6 h-6 flex items-center justify-center text-sm"
            >
              ?
            </button>
          </div>
        }
        onClose={onClose}
        position="top-left"
      >
        {countries.map((country, index) => (
          <div
            key={index}
            className="border border-gray-700 rounded p-4 hover:border-blue-500 cursor-pointer transition-colors"
            onClick={() => onCountryClick?.(country.country)}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{country.country}</span>
              <span className="px-2 py-1 bg-blue-500 rounded text-sm">
                {(country.similarity * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </Panel>

      {showInfo && (
        <InfoModal
          title="How is similarity calculated?"
          onClose={() => setShowInfo(false)}
        >
          <div className="space-y-4">
            <p>
              Country similarity is calculated based on beer review language analysis:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                We process all beer reviews for each country using  natural
                language processing (NLP) techniques. Each review is transformed into a
                384-dimensional vector embedding that captures the semantic meaning of
                its text.
              </li>
              <li>
                These embeddings for all reviews in a given country are averaged to form
                a single "country-level" embedding, representing the typical language
                and sentiments used by reviewers of that country.
              </li>
              <li>
                Once we have an average embedding for each country, we calculate
                similarity scores between countries using cosine similarity. This
                involves taking the dot product of two country-level embeddings and
                dividing by the product of their magnitudes.
              </li>
              <li>
                Countries with higher similarity scores have reviewers who describe
                their beers in similar ways, indicating comparable beer styles,
                traditions, or characteristics.
              </li>
            </ul>
          </div>
        </InfoModal>

      )}
    </>
  );
};

export { SimilarCountriesPanel };
