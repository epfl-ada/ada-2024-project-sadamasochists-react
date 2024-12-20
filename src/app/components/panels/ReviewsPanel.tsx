import { useState } from "react";
import { Info } from 'lucide-react';
import { Panel } from "./panel";
import { InfoModal } from "../modals/InfoModal";

interface Review {
  text: string;
  similarity: number;
}

interface ReviewsPanelProps {
  reviews: Review[];
  onClose: () => void;
  position?: string;
  className?: string;
}

const ReviewsPanel: React.FC<ReviewsPanelProps> = ({
  reviews,
  onClose,
  position,
  className
}) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <Panel
        title={
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Representative Reviews</h2>
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
        {reviews.map((review, index) => (
          <div key={index} className="border border-gray-700 rounded p-4 hover:border-gray-600 transition-colors">
            <div className="text-sm mb-2">
              Similarity Score:
              <span className="ml-2 px-2 py-1 bg-blue-500 rounded">
                {(review.similarity * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-gray-300">{review.text}</p>
          </div>
        ))}
      </Panel>

      {showInfo && (
        <InfoModal
          title="About Representative Reviews"
          onClose={() => setShowInfo(false)}
        >
          <div className="space-y-4">
            <p>
              These reviews are selected as the most representative examples of how reviewers
              in this country describe all kinds of beers, capturing the language and
              perspectives that are most commonly reflected in their writing.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Underlying Data:</strong> Each review is transformed into a
                384-dimensional embedding, capturing the semantic meaning and nuances of
                its text.
              </li>
              <li>
                <strong>Country-Level Embedding:</strong> For each country, we compute an
                average embedding by aggregating and averaging the embeddings of all reviews
                associated with that country. This average embedding represents the typical
                language and sentiments reviewers use when describing beers.
              </li>
              <li>
                <strong>Representative Selection:</strong> We measure how closely each review’s
                embedding matches the country’s average embedding using cosine similarity.
                Reviews with the highest similarity scores are considered the most
                representative because they closely mirror the dominant themes and
                characteristics commonly expressed by reviewers from that country.
              </li>
              <li>
                <strong>Similarity Score:</strong> The displayed percentage indicates how well
                a given review aligns with the country-level embedding. Higher similarity
                scores mean the review more accurately reflects the way reviewers in that
                country typically describe beers.
              </li>
              <li>
                <strong>Purpose:</strong> By highlighting these representative reviews, we
                provide insights into the distinctive features of that country’s beer
                culture and highlight what local reviewers often focus on when describing a
                wide range of beers.
              </li>
            </ul>
          </div>
        </InfoModal>

      )}
    </>
  );
};

export { ReviewsPanel };
