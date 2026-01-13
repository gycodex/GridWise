
import React, { useState, useRef, useEffect } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { ImagePreview } from './components/ImagePreview';
import { splitImage, cropImage, processBackgroundRemoval } from './utils/imageProcessor';
import { processEnhancement } from './utils/tfEnhancer';
import { AppState, ImageFormat, CropData, BackgroundConfig, EnhanceConfig } from './types';
import { translations, Language } from './translations';

const DEFAULT_BG_CONFIG: BackgroundConfig = {
  targetColor: '#ffffff',
  threshold: 10,
  removeOuterOnly: false,
  smoothEdges: false,
  smoothingThickness: 1,
  previewBg: false
};

const DEFAULT_ENHANCE_CONFIG: EnhanceConfig = {
  scale: 2,
  sharpness: 20
};

interface PipelineState {
    original: string | null;
    step1Result: string | null; // Result of Enhance
    step2Result: string | null; // Result of BG Removal (applied on step1Result or original)
}

function App() {
  const [lang, setLang] = useState<Language>('zh');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  
  // Pipeline State
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [pipeline, setPipeline] = useState<PipelineState>({ original: null, step1Result: null, step2Result: null });
  const [isEnhanceApplied, setIsEnhanceApplied] = useState(false);

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
  const [enhanceConfig, setEnhanceConfig] = useState<EnhanceConfig>(DEFAULT_ENHANCE_CONFIG);
  const currentCrop = useRef<CropData | null>(null);

  const t = translations[lang];

  // Derive the current image to display based on step
  const getDisplayImage = () => {
      if (currentStep === 1) return pipeline.step1Result || pipeline.original;
      if (currentStep === 2) return pipeline.step2Result || pipeline.step1Result || pipeline.original;
      if (currentStep === 3) return pipeline.step2Result || pipeline.step1Result || pipeline.original;
      return pipeline.original;
  };

  const currentDisplayImage = getDisplayImage();

  // Reset pipeline when a new file is loaded
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError(t.invalidImage);
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const src = event.target.result as string;
        setPipeline({ original: src, step1Result: src, step2Result: src }); // Initialize all with original
        setFileName(file.name);
        setAppState(AppState.PREVIEW);
        setCurrentStep(1);
        setIsEnhanceApplied(false);
        setError(null);
        setSelectedTiles(new Set());
        setBgConfig(DEFAULT_BG_CONFIG);
        setEnhanceConfig(DEFAULT_ENHANCE_CONFIG);
      }
    };
    reader.readAsDataURL(file);
  };

  // Step 1: Enhancement Logic
  const handleEnhancement = async () => {
    if (!pipeline.original) return;
    setAppState(AppState.PROCESSING);
    try {
      const processed = await processEnhancement(pipeline.original, enhanceConfig);
      setPipeline(prev => ({ 
          ...prev, 
          step1Result: processed,
          // If we enhance, invalidate step 2 result effectively by resetting it or letting it remain?
          // For linear flow, we should propagate change. 
          // Since Step 2 hasn't been "applied" by user explicitly on this new image yet, 
          // we can reset step 2 to this new enhanced image OR re-apply existing BG config?
          // Let's reset step 2 to be the enhanced image to start fresh on step 2.
          step2Result: processed 
      }));
      setIsEnhanceApplied(true);
    } catch (err) {
      console.error(err);
      setError(t.enhanceError);
    } finally {
      setAppState(AppState.PREVIEW);
    }
  };

  // Step 2: BG Removal Logic
  // This is called when user tweaks params in Step 2.
  const handleBgRemoval = async () => {
    // Input for Step 2 is always Step 1 Result (or original if step 1 skipped/failed, handled by init)
    const inputImage = pipeline.step1Result || pipeline.original;
    if (!inputImage) return;
    
    setAppState(AppState.PROCESSING);
    try {
      const processed = await processBackgroundRemoval(inputImage, bgConfig);
      setPipeline(prev => ({ ...prev, step2Result: processed }));
    } catch (err) {
      setError(t.bgProcessError);
    } finally {
      setAppState(AppState.PREVIEW);
    }
  };

  // Step 3: Crop Logic
  // Apply Crop updates the pipeline for the FINAL step. 
  // Note: cropImage is currently destructive in valid session flow in old code.
  // Here, we update step2Result (the input to Step 3) with the cropped version.
  const handleApplyCrop = async () => {
    // Input is current display image (which is step2Result at this point)
    const inputImage = currentDisplayImage;
    if (!inputImage || !currentCrop.current) return;
    try {
      const croppedImage = await cropImage(inputImage, currentCrop.current);
      // We update step2Result because Step 3 uses it as input for Splitting.
      setPipeline(prev => ({ ...prev, step2Result: croppedImage }));
      setIsCropping(false);
    } catch (err) {
      setError(t.cropError);
    }
  };

  const handleDownload = async () => {
    const finalImage = currentDisplayImage;
    if (!finalImage) return;
    setAppState(AppState.PROCESSING);
    try {
      await splitImage(finalImage, rows, cols, fileName, format, quality);
    } catch (err) {
      setError(t.processError);
    } finally {
      setAppState(AppState.PREVIEW);
    }
  };

  const handleDownloadSelected = async () => {
    const finalImage = currentDisplayImage;
    if (!finalImage || selectedTiles.size === 0) return;
    setAppState(AppState.PROCESSING);
    try {
      await splitImage(finalImage, rows, cols, fileName, format, quality, selectedTiles);
    } catch (err) {
      setError(t.selectedError);
    } finally {
      setAppState(AppState.PREVIEW);
    }
  };

  const handleReset = () => {
      setPipeline({ original: null, step1Result: null, step2Result: null });
      setAppState(AppState.IDLE);
      setCurrentStep(1);
  };

  // Auto re-apply BG removal if we move to step 2 and have defaults? 
  // No, let the user click "Update Preview" or tweak slider. 
  // But initially, Step 2 Result = Step 1 Result (set in handleEnhancement or processFile).

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
              {currentDisplayImage && <ImagePreview imageSrc={currentDisplayImage} rows={rows} cols={cols} selectedTiles={selectedTiles} onToggleTile={(i)=>setSelectedTiles(prev=>{const n=new Set(prev); n.has(i)?n.delete(i):n.add(i); return n})} isCropping={isCropping} onUpdateCrop={(c)=>currentCrop.current=c} onReset={handleReset} lang={lang} />}
            </div>
            <div className="lg:col-span-4 xl:col-span-3">
              <ControlPanel 
                  currentStep={currentStep} onStepChange={setCurrentStep}
                  rows={rows} cols={cols} onRowsChange={setRows} onColsChange={setCols} 
                  onReset={handleReset} 
                  onDownload={handleDownload} isProcessing={appState === AppState.PROCESSING} 
                  format={format} onFormatChange={setFormat} 
                  quality={quality} onQualityChange={setQuality} 
                  selectedCount={selectedTiles.size} onDownloadSelected={handleDownloadSelected} 
                  isCropping={isCropping} onToggleCrop={()=>setIsCropping(true)} onApplyCrop={handleApplyCrop} onCancelCrop={()=>setIsCropping(false)} 
                  bgConfig={bgConfig} onBgConfigChange={(c)=>setBgConfig(p=>({...p, ...c}))} onApplyBgRemoval={handleBgRemoval} 
                  enhanceConfig={enhanceConfig} onEnhanceConfigChange={(c)=>setEnhanceConfig(p=>({...p, ...c}))} onApplyEnhance={handleEnhancement} isEnhanceApplied={isEnhanceApplied}
                  lang={lang} 
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;