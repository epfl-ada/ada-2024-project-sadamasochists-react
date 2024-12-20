import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { InfoModal } from '../modals/InfoModal';
import { Panel } from './panel';

interface WordData {
  text: string;
  value: number;
}

interface WordCloudPanelProps {
  countryName: string;
  onClose: () => void;
  position?: string;
  className?: string;
}

const WordCloudPanel: React.FC<WordCloudPanelProps> = ({
  countryName,
  onClose,
  position,
  className
}) => {
  const [words, setWords] = useState<WordData[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWords = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/out/${countryName.toLowerCase().replace(/ /g, '_')}/top25.txt`);
        const text = await response.text();

        const wordData = text.trim().split('\n')
          .map(line => {
            const [word, count] = line.split(' ');
            return {
              text: word,
              value: parseInt(count)
            };
          })
          .sort((a, b) => b.value - a.value);

        setWords(wordData);
      } catch (error) {
        console.error('Error loading word data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWords();
  }, [countryName]);

  // Calculate font sizes
  const maxCount = Math.max(...words.map(w => w.value));
  const minCount = Math.min(...words.map(w => w.value));
  const getFontSize = (count: number) => {
    const minSize = 14;
    const maxSize = 48;
    const scale = (count - minCount) / (maxCount - minCount);
    return Math.round(minSize + (maxSize - minSize) * scale);
  };

  const getColor = (index: number) => {
    // Beer-themed colors: ambers, browns, and golds
    const colors = [
      'text-amber-700', // Dark amber
      'text-yellow-700', // Golden brown
      'text-amber-600', // Medium amber
      'text-yellow-600', // Light golden
      'text-amber-800', // Deep amber
      'text-orange-700', // Copper
      'text-amber-500', // Light amber
      'text-yellow-800'  // Dark golden
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <Panel
        title="Common Words in Reviews"
        onClose={onClose}
        position={position}
        className={className}
      >
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-600" />
        </div>
      </Panel>
    );
  }

  return (
    <>
      <Panel
        title={
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-amber-500">Common Words in Reviews</h2>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowInfo(true);
              }}
              className="text-gray-400 hover:text-amber-500 bg-gray-800 rounded-full w-6 h-6 flex items-center justify-center text-sm"
            >
              <Info size={14} />
            </button>
          </div>
        }
        onClose={onClose}
        position={position}
        className={className}
      >
        <div className="flex flex-wrap gap-0 justify-start">
          {words.map((word, index) => (
            <div
              key={word.text}
              className={`
                ${getColor(index)} 
                transition-all duration-100 
                hover:text-amber-400 
                cursor-default 
                px-1
              `}
              style={{
                fontSize: `${getFontSize(word.value)}px`,
              }}
              title={`Used ${word.value.toLocaleString()} times`}
            >
              {word.text}
            </div>
          ))}
        </div>
      </Panel>

      {showInfo && (
        <InfoModal
          title="About the Word Cloud"
          onClose={() => setShowInfo(false)}
        >
          <div className="space-y-4">
            <p>
              This word cloud shows the 25 most frequently used words in beer reviews from {countryName}.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Size:</strong> The size of each word indicates how frequently it appears in reviews.
                Larger words are used more often.
              </li>
              <li>
                <strong>Colors:</strong> Words are shown in various beer-inspired shades of amber and gold,
                creating a warm, thematic appearance.
              </li>
              <li>
                <strong>Hover:</strong> Hover over any word to see exactly how many times it appears
                in reviews.
              </li>
            </ul>
            <p>
              This visualization helps identify the most common descriptors, characteristics, and themes
              in beer reviews from this country.
            </p>
          </div>
        </InfoModal>
      )}
    </>
  );
};

export default WordCloudPanel;