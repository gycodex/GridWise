
import React, { useState, useRef } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { ImagePreview } from './components/ImagePreview';
import { splitImage, cropImage, processBackgroundRemoval } from './utils/imageProcessor';
import { AppState, ImageFormat, CropData, BackgroundConfig } from './types';
import { translations, Language } from './translations';

const DEFAULT_BG_CONFIG: BackgroundConfig = {
  targetColor: '#ffffff',
  threshold: 10,
  removeOuterOnly: false,
  smoothEdges: false,
  smoothingThickness: 1,
  previewBg: false
};

function App() {
  const [lang, setLang] = useState<Language>('zh');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('image.png');
  const [rows, setRows] = useState<number>(3);
  const [cols, setCols] = useState<number>(3);
  const [error, setError] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [format, setFormat] = useState<ImageFormat>('image/png');
  const [quality, setQuality] = useState<number>(0.92);
  const [selectedTiles, setSelectedTiles] = useState<Set<number>>(new Set());
  const [isCropping, setIsCropping] = useState(false);
  const [bgConfig, setBgConfig] = useState<BackgroundConfig>(DEFAULT_BG_CONFIG);
  const currentCrop = useRef<CropData | null>(null);

  const t = translations[lang];

  const handleBgRemoval = async () => {
    if (!originalImageSrc) return;
    setAppState(AppState.PROCESSING);
    try {
      const processed = await processBackgroundRemoval(originalImageSrc, bgConfig);
      setImageSrc(processed);
      setAppState(AppState.PREVIEW);
    } catch (err) {
      setError(t.bgProcessError);
      setAppState(AppState.PREVIEW);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError(t.invalidImage);
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const src = event.target.result as string;
        setImageSrc(src);
        setOriginalImageSrc(src);
        setFileName(file.name);
        setAppState(AppState.PREVIEW);
        setError(null);
        setSelectedTiles(new Set());
        setBgConfig(DEFAULT_BG_CONFIG);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCrop = async () => {
    if (!imageSrc || !currentCrop.current) return;
    try {
      const croppedImage = await cropImage(imageSrc, currentCrop.current);
      setImageSrc(croppedImage);
      setOriginalImageSrc(croppedImage);
      setIsCropping(false);
    } catch (err) {
      setError(t.cropError);
    }
  };

  const handleDownload = async () => {
    if (!imageSrc) return;
    setAppState(AppState.PROCESSING);
    try {
      await splitImage(imageSrc, rows, cols, fileName, format, quality);
    } catch (err) {
      setError(t.processError);
    } finally {
      setAppState(AppState.PREVIEW);
    }
  };

  const handleDownloadSelected = async () => {
    if (!imageSrc || selectedTiles.size === 0) return;
    setAppState(AppState.PROCESSING);
    try {
      await splitImage(imageSrc, rows, cols, fileName, format, quality, selectedTiles);
    } catch (err) {
      setError(t.selectedError);
    } finally {
      setAppState(AppState.PREVIEW);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-indigo-100">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
               <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">{t.title}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLang(l => l === 'zh' ? 'en' : 'zh')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 transition-all text-xs font-semibold text-slate-600"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {lang === 'zh' ? 'English' : '简体中文'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">{error}</div>}

        {appState === AppState.IDLE ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <label onDragOver={(e)=>{e.preventDefault(); setIsDraggingFile(true)}} onDragLeave={()=>setIsDraggingFile(false)} onDrop={(e)=>{e.preventDefault(); setIsDraggingFile(false); if(e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0])}}
              className={`group flex flex-col items-center justify-center w-full max-w-2xl h-80 border-2 border-dashed rounded-3xl cursor-pointer transition-all ${isDraggingFile ? 'border-indigo-500 bg-indigo-50' : 'bg-white border-slate-300 hover:border-indigo-500'}`}>
              <div className="flex flex-col items-center pt-5 pb-6">
                <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                <p className="text-xl font-medium text-slate-700">{t.clickToUpload}</p>
                <p className="text-sm text-slate-400 mt-2">{t.uploadSubtitle}</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={(e)=>e.target.files?.[0] && processFile(e.target.files[0])} />
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 xl:col-span-9 flex flex-col">
              {imageSrc && <ImagePreview imageSrc={imageSrc} rows={rows} cols={cols} selectedTiles={selectedTiles} onToggleTile={(i)=>setSelectedTiles(prev=>{const n=new Set(prev); n.has(i)?n.delete(i):n.add(i); return n})} isCropping={isCropping} onUpdateCrop={(c)=>currentCrop.current=c} onReset={()=>setAppState(AppState.IDLE)} lang={lang} />}
            </div>
            <div className="lg:col-span-4 xl:col-span-3">
              <ControlPanel rows={rows} cols={cols} onRowsChange={setRows} onColsChange={setCols} onReset={()=>setAppState(AppState.IDLE)} onDownload={handleDownload} isProcessing={appState === AppState.PROCESSING} format={format} onFormatChange={setFormat} quality={quality} onQualityChange={setQuality} selectedCount={selectedTiles.size} onDownloadSelected={handleDownloadSelected} isCropping={isCropping} onToggleCrop={()=>setIsCropping(true)} onApplyCrop={handleApplyCrop} onCancelCrop={()=>setIsCropping(false)} bgConfig={bgConfig} onBgConfigChange={(c)=>setBgConfig(p=>({...p, ...c}))} onApplyBgRemoval={handleBgRemoval} lang={lang} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
