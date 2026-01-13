
import React, { useState, useRef, useEffect } from 'react';
import { GridOverlay } from './GridOverlay';
import { CropOverlay } from './CropOverlay';
import { CropData } from '../types';
import { translations, Language } from '../translations';

interface ImagePreviewProps {
  imageSrc: string;
  rows: number;
  cols: number;
  selectedTiles: Set<number>;
  onToggleTile: (index: number) => void;
  isCropping: boolean;
  onUpdateCrop: (crop: CropData) => void;
  onReset: () => void;
  lang: Language;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ 
  imageSrc, rows, cols, selectedTiles, onToggleTile, isCropping, onUpdateCrop, onReset, lang
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const dragOccurred = useRef(false);
  const t = translations[lang];

  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [imageSrc, isCropping]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || isCropping) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setScale(s => Math.max(0.1, Math.min(5, s + (-e.deltaY > 0 ? 0.1 : -0.1))));
    };
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [isCropping]);

  return (
    <div className="relative h-[500px] lg:h-[600px] w-full">
      <div 
        ref={containerRef}
        className={`w-full h-full bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden relative select-none ${!isCropping ? 'cursor-grab active:cursor-grabbing' : ''}`}
        onMouseDown={(e)=>{if(isCropping||e.button!==0)return; e.preventDefault(); setIsDragging(true); dragOccurred.current=false; setDragStart({x:e.clientX-position.x, y:e.clientY-position.y})}}
        onMouseMove={(e)=>{if(isDragging&&!isCropping){e.preventDefault(); dragOccurred.current=true; setPosition({x:e.clientX-dragStart.x, y:e.clientY-dragStart.y})}}}
        onMouseUp={()=>setIsDragging(false)}
        onMouseLeave={()=>setIsDragging(false)}
      >
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40" style={{ backgroundImage: 'conic-gradient(#ddd 25%, transparent 0 50%, #ddd 0 75%, transparent 0)', backgroundSize: '20px 20px' }}></div>

        <div 
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          className="relative shadow-2xl origin-center z-10"
        >
          <img src={imageSrc} alt="Preview" className="max-h-[60vh] max-w-full object-contain block pointer-events-none" />
          {isCropping ? <CropOverlay onCropChange={onUpdateCrop} scale={scale} /> : <GridOverlay rows={rows} cols={cols} selectedTiles={selectedTiles} onToggleTile={(i)=>!dragOccurred.current && onToggleTile(i)} lang={lang} />}
        </div>
      </div>

      {!isCropping && (
        <>
          <button onClick={onReset} className="absolute top-4 right-4 z-50 p-2.5 bg-white text-slate-400 hover:text-red-500 rounded-full shadow-sm border border-slate-200 transition-all cursor-pointer"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg></button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/95 shadow-lg rounded-full p-1.5 z-50 border border-slate-200">
            <button onClick={()=>setScale(s=>Math.max(0.1,s-0.25))} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg></button>
            <span className="text-xs font-semibold text-slate-700 w-12 text-center tabular-nums">{Math.round(scale * 100)}%</span>
            <button onClick={()=>setScale(s=>Math.min(5,s+0.25))} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg></button>
          </div>
        </>
      )}
    </div>
  );
};
