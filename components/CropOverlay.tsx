
import React, { useState, useRef, useEffect } from 'react';
import { CropData } from '../types';

interface CropOverlayProps {
  onCropChange: (crop: CropData) => void;
  scale: number;
}

export const CropOverlay: React.FC<CropOverlayProps> = ({ onCropChange, scale }) => {
  // Crop state in percentages (0-1)
  const [crop, setCrop] = useState<CropData>({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ 
    startX: number; 
    startY: number; 
    startCrop: CropData; 
    type: 'move' | 'nw' | 'ne' | 'sw' | 'se' 
  } | null>(null);

  useEffect(() => {
    onCropChange(crop);
  }, [crop, onCropChange]);

  const handleMouseDown = (e: React.MouseEvent, type: 'move' | 'nw' | 'ne' | 'sw' | 'se') => {
    e.stopPropagation();
    e.preventDefault();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startCrop: { ...crop },
      type
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current || !containerRef.current) return;
      e.preventDefault();

      const { startX, startY, startCrop, type } = dragRef.current;
      const rect = containerRef.current.getBoundingClientRect();
      
      // Calculate delta in percentage relative to container size
      // We must divide by scale because the container size is affected by the CSS scale transform
      // Wait, getBoundingClientRect returns the SCALED size.
      // So deltaX pixels on screen corresponds to deltaX / width percentage.
      // BUT, since we want the percentage of the *original* unscaled image size (which the internal divs use),
      // we need to be careful.
      // Actually, if we use percentages of the container's client rect, it should work regardless of scale
      // because the mouse movement is also in screen pixels.
      
      const dx = (e.clientX - startX) / rect.width;
      const dy = (e.clientY - startY) / rect.height;

      let newCrop = { ...startCrop };

      if (type === 'move') {
        newCrop.x = Math.max(0, Math.min(1 - newCrop.width, startCrop.x + dx));
        newCrop.y = Math.max(0, Math.min(1 - newCrop.height, startCrop.y + dy));
      } else {
        // Resize logic
        if (type.includes('w')) { // West (Left)
          const newWidth = Math.max(0.05, startCrop.width - dx);
          const newX = Math.max(0, Math.min(startCrop.x + startCrop.width - 0.05, startCrop.x + dx));
          if (newX !== 0 || dx > 0) { // Constraint check
             newCrop.x = newX;
             newCrop.width = newWidth;
          }
        }
        if (type.includes('e')) { // East (Right)
          newCrop.width = Math.max(0.05, Math.min(1 - startCrop.x, startCrop.width + dx));
        }
        if (type.includes('n')) { // North (Top)
          const newHeight = Math.max(0.05, startCrop.height - dy);
          const newY = Math.max(0, Math.min(startCrop.y + startCrop.height - 0.05, startCrop.y + dy));
           if (newY !== 0 || dy > 0) {
             newCrop.y = newY;
             newCrop.height = newHeight;
           }
        }
        if (type.includes('s')) { // South (Bottom)
          newCrop.height = Math.max(0.05, Math.min(1 - startCrop.y, startCrop.height + dy));
        }
      }

      setCrop(newCrop);
    };

    const handleMouseUp = () => {
      dragRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 select-none">
      {/* Dimmed Areas using box-shadow trick on the selection box */}
      <div 
        className="absolute cursor-move border border-white/50 box-content z-10"
        style={{
          left: `${crop.x * 100}%`,
          top: `${crop.y * 100}%`,
          width: `${crop.width * 100}%`,
          height: `${crop.height * 100}%`,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)'
        }}
        onMouseDown={(e) => handleMouseDown(e, 'move')}
      >
        {/* Grid Lines (Rule of Thirds) */}
        <div className="absolute inset-0 flex flex-col pointer-events-none opacity-50">
          <div className="flex-1 border-b border-white/30"></div>
          <div className="flex-1 border-b border-white/30"></div>
          <div className="flex-1"></div>
        </div>
        <div className="absolute inset-0 flex pointer-events-none opacity-50">
          <div className="flex-1 border-r border-white/30"></div>
          <div className="flex-1 border-r border-white/30"></div>
          <div className="flex-1"></div>
        </div>

        {/* Handles */}
        <div 
          className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-indigo-500 border-2 border-white rounded-full cursor-nw-resize hover:scale-125 transition-transform"
          onMouseDown={(e) => handleMouseDown(e, 'nw')}
        />
        <div 
          className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-indigo-500 border-2 border-white rounded-full cursor-ne-resize hover:scale-125 transition-transform"
          onMouseDown={(e) => handleMouseDown(e, 'ne')}
        />
        <div 
          className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-indigo-500 border-2 border-white rounded-full cursor-sw-resize hover:scale-125 transition-transform"
          onMouseDown={(e) => handleMouseDown(e, 'sw')}
        />
        <div 
          className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-indigo-500 border-2 border-white rounded-full cursor-se-resize hover:scale-125 transition-transform"
          onMouseDown={(e) => handleMouseDown(e, 'se')}
        />
      </div>
    </div>
  );
};
