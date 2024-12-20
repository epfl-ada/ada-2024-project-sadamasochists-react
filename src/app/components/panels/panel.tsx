
import React from 'react';
import { useState, useRef, useEffect } from 'react';

interface PanelProps {
  title: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'bottom-center';
  className?: string;
}

const Panel: React.FC<PanelProps> = ({
  title,
  onClose,
  children,
  position = 'top-right',
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position_, setPosition] = useState({ x: 0, y: 0 });
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  };

  useEffect(() => {
    if (!panelRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const dx = e.clientX - initialPos.x;
      const dy = e.clientY - initialPos.y;

      setPosition({
        x: dx,
        y: dy
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, initialPos]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.no-drag')) return;

    setIsDragging(true);
    setInitialPos({
      x: e.clientX - position_.x,
      y: e.clientY - position_.y
    });
  };

  return (
    <div
      ref={panelRef}
      className={`fixed ${positionClasses[position]} w-96 bg-black bg-opacity-80 text-white p-6 rounded-lg shadow-lg z-10 ${className} ${isDragging ? 'cursor-grabbing' : ''}`}
      style={{
        transform: `translate(${position_.x}px, ${position_.y}px)`,
        userSelect: isDragging ? 'none' : 'auto'
      }}
    >
      <div
        className={`flex justify-between items-center mb-4 cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
        onMouseDown={handleMouseDown}
      >
        {typeof title === 'string' ? <h2 className="text-xl font-bold">{title}</h2> : title}
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-2xl no-drag"
          aria-label="Close panel"
        >
          ×
        </button>
      </div>
      <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
        {children}
      </div>
    </div>
  );
};


const PANEL_POSITIONS = {
  PRIMARY: 'top-right',
  SECONDARY: 'top-left',
  TERTIARY: 'bottom-left',
  QUATERNARY: 'bottom-right',
  CENTER: 'bottom-center'
} as const;

type PanelPosition = typeof PANEL_POSITIONS[keyof typeof PANEL_POSITIONS];

interface PanelLayoutProps {
  children: React.ReactNode;
}

const PanelLayout: React.FC<PanelLayoutProps> = ({ children }) => {
  const childArray = React.Children.toArray(children);

  return (
    <>
      {React.Children.map(childArray, (child, index) => {
        if (!React.isValidElement(child)) return null;

        // Assign positions based on panel order
        const position = Object.values(PANEL_POSITIONS)[index % 4] as PanelPosition;

        return React.cloneElement(child, {
          position,
          className: `transform ${index >= 4 ? `translate-y-${(Math.floor(index / 4) * 24)}` : ''}`
        });
      })}
    </>
  );
};

export { Panel, PanelLayout, PANEL_POSITIONS };