
import React, { useState } from 'react';
import { translations, Language } from '../translations';

interface GridOverlayProps {
  rows: number;
  cols: number;
  selectedTiles: Set<number>;
  onToggleTile: (index: number) => void;
  lang: Language;
}

export const GridOverlay: React.FC<GridOverlayProps> = ({ rows, cols, selectedTiles, onToggleTile, lang }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const t = translations[lang];

  return (
    <div className="absolute inset-0 border border-[#4f46e5]/40 overflow-hidden rounded-lg">
      <div 
        className="w-full h-full"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`
        }}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {Array.from({ length: rows * cols }).map((_, i) => {
          const rowNum = Math.floor(i / cols) + 1;
          const colNum = (i % cols) + 1;
          const isHovered = i === hoveredIndex;
          const isSelected = selectedTiles.has(i);

          return (
            <div 
              key={i} 
              onMouseEnter={() => setHoveredIndex(i)}
              onClick={(e) => {
                e.stopPropagation();
                onToggleTile(i);
              }}
              className={`
                border-r border-b border-[#4f46e5] relative transition-all duration-150 cursor-pointer
                ${isSelected 
                  ? 'bg-indigo-500/40 border-indigo-400/80 shadow-[inset_0_0_15px_rgba(99,102,241,0.3)]' 
                  : isHovered 
                    ? 'bg-indigo-600/10' 
                    : 'hover:bg-indigo-600/5'
                }
              `}
              style={{
                  borderRightWidth: (i + 1) % cols === 0 ? '0px' : '1px',
                  borderBottomWidth: i >= (rows - 1) * cols ? '0px' : '1px'
              }}
            >
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-indigo-600 text-white rounded-full p-1 shadow-lg transform scale-75 sm:scale-100 animate-in fade-in zoom-in duration-200">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}

              {isHovered && !isSelected && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                   <div className="bg-slate-900/80 text-white text-[10px] sm:text-xs font-medium px-2 py-1 rounded-md shadow-lg backdrop-blur-sm transform scale-90 sm:scale-100 whitespace-nowrap">
                     {t.row} {rowNum}, {t.col} {colNum}
                   </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
