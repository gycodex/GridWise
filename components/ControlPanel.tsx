
import React, { useEffect } from 'react';
import { ImageFormat, BackgroundConfig, EnhanceConfig } from '../types';
import { translations, Language } from '../translations';

interface ControlPanelProps {
  currentStep: 1 | 2 | 3;
  onStepChange: (step: 1 | 2 | 3) => void;
  rows: number;
  cols: number;
  onRowsChange: (val: number) => void;
  onColsChange: (val: number) => void;
  onReset: () => void;
  onDownload: () => void;
  isProcessing: boolean;
  format: ImageFormat;
  onFormatChange: (val: ImageFormat) => void;
  quality: number;
  onQualityChange: (val: number) => void;
  selectedCount: number;
  onDownloadSelected: () => void;
  isCropping: boolean;
  onToggleCrop: () => void;
  onApplyCrop: () => void;
  onCancelCrop: () => void;
  lang: Language;
  // Background Props
  bgConfig: BackgroundConfig;
  onBgConfigChange: (config: Partial<BackgroundConfig>) => void;
  onApplyBgRemoval: () => void;
  // Enhance Props
  enhanceConfig: EnhanceConfig;
  onEnhanceConfigChange: (config: Partial<EnhanceConfig>) => void;
  onApplyEnhance: () => void;
  isEnhanceApplied: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  currentStep, onStepChange,
  rows, cols, onRowsChange, onColsChange, onReset, onDownload, isProcessing, format, onFormatChange, quality, onQualityChange,
  selectedCount, onDownloadSelected, isCropping, onToggleCrop, onApplyCrop, onCancelCrop, lang,
  bgConfig, onBgConfigChange, onApplyBgRemoval,
  enhanceConfig, onEnhanceConfigChange, onApplyEnhance, isEnhanceApplied
}) => {
  const t = translations[lang];

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  if (isCropping) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6 h-fit sticky top-6 animate-fade-in">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 mb-1">{t.cropImage}</h2>
          <p className="text-sm text-slate-500">{t.dragHint}</p>
        </div>
        <div className="flex flex-col gap-3">
          <button onClick={onApplyCrop} className="w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
            {t.applyCrop}
          </button>
          <button onClick={onCancelCrop} className="w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">
            {t.cancel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6 h-fit sticky top-6 transition-all duration-300">
      
      {/* Stepper Header */}
      <div className="flex items-center justify-between relative mb-4">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-100 -z-10" />
        {[1, 2, 3].map((step) => {
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;
          return (
            <div key={step} className="flex flex-col items-center gap-1 bg-white px-2 cursor-pointer" onClick={() => step < currentStep && onStepChange(step as 1|2|3)}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2 ${isActive ? 'bg-indigo-600 border-indigo-600 text-white shadow-md scale-110' : isCompleted ? 'bg-indigo-50 border-indigo-600 text-indigo-600' : 'bg-white border-slate-200 text-slate-400'}`}>
                {isCompleted ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> : step}
              </div>
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                {step === 1 ? t.step1 : step === 2 ? t.step2 : t.step3}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step 1: Enhance */}
      {currentStep === 1 && (
         <div className="space-y-6 animate-fade-in">
            <div className="bg-violet-50 p-4 rounded-xl border border-violet-100 flex gap-3">
                <div className="text-violet-500 mt-0.5"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
                <p className="text-xs text-violet-700 leading-relaxed font-medium">{t.enhanceHint}</p>
            </div>

            <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700 block">{t.upscaleFactor}</label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 4].map((scale) => (
                    <button
                      key={scale}
                      onClick={() => onEnhanceConfigChange({ scale: scale as 1|2|4 })}
                      className={`py-2 rounded-lg text-xs font-bold border transition-all ${enhanceConfig.scale === scale ? 'bg-violet-600 border-violet-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      {scale}x
                    </button>
                  ))}
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-700">{t.detailSharpness}</label>
                    <span className="text-violet-600 font-bold bg-violet-50 px-2 py-0.5 rounded text-sm">{enhanceConfig.sharpness}%</span>
                </div>
                <input type="range" min="0" max="100" value={enhanceConfig.sharpness} onChange={(e) => onEnhanceConfigChange({ sharpness: Number(e.target.value) })} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600" />
            </div>

            <button 
                onClick={onApplyEnhance} 
                disabled={isProcessing} 
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 border ${isEnhanceApplied ? 'bg-green-50 text-green-700 border-green-200' : 'bg-violet-600 text-white border-violet-600 hover:bg-violet-700 shadow-violet-200'}`}
            >
                {isProcessing ? t.enhancing : isEnhanceApplied ? (
                    <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> {t.enhancedSuccess}</>
                ) : t.applyEnhance}
            </button>

            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
               <button onClick={onReset} className="flex-1 py-2.5 text-slate-500 hover:bg-slate-50 rounded-lg text-sm font-medium">{t.selectDifferent}</button>
               <button onClick={() => onStepChange(2)} className="flex-1 py-2.5 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 shadow-lg shadow-slate-200 flex items-center justify-center gap-1">
                   {t.nextStep} <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
               </button>
            </div>
         </div>
      )}

      {/* Step 2: BG Removal */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex gap-3">
              <div className="text-indigo-500 mt-0.5"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg></div>
              <p className="text-xs text-indigo-700 leading-relaxed font-medium">{t.bgHint}</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-700">{t.bgColor}</label>
                <div className="flex items-center gap-2">
                    <input type="color" value={bgConfig.targetColor} onChange={(e) => onBgConfigChange({ targetColor: e.target.value })} className="w-8 h-8 rounded-lg overflow-hidden border-0 cursor-pointer p-0 shadow-sm" />
                    <span className="text-xs font-mono text-slate-400 uppercase">{bgConfig.targetColor}</span>
                </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-700">{t.similarity}</label>
                <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded text-sm">{bgConfig.threshold}%</span>
            </div>
            <input type="range" min="0" max="100" value={bgConfig.threshold} onChange={(e) => onBgConfigChange({ threshold: Number(e.target.value) })} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 group cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors">
              <input type="checkbox" checked={bgConfig.removeOuterOnly} onChange={(e) => onBgConfigChange({ removeOuterOnly: e.target.checked })} className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-700">{t.deleteExternal}</span>
                <span className="text-[10px] text-slate-400 leading-tight">{t.deleteExternalDesc}</span>
              </div>
            </label>
          </div>

          <div className="h-px bg-slate-100"></div>

          <div className="space-y-4">
             <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors">
               <input type="checkbox" checked={bgConfig.smoothEdges} onChange={(e) => onBgConfigChange({ smoothEdges: e.target.checked })} className="w-5 h-5 rounded border-slate-300 text-indigo-600" />
               <span className="text-sm font-medium text-slate-700">{t.smoothBorder}</span>
             </label>
             {bgConfig.smoothEdges && (
                <div className="pl-8 space-y-2 animate-in slide-in-from-top-2">
                    <div className="flex justify-between items-center"><span className="text-xs text-slate-500">{t.smoothThickness}</span><span className="text-xs font-bold text-slate-700">{bgConfig.smoothingThickness}</span></div>
                    <input type="range" min="1" max="10" value={bgConfig.smoothingThickness} onChange={(e) => onBgConfigChange({ smoothingThickness: Number(e.target.value) })} className="w-full h-1 bg-slate-100 rounded-lg appearance-none accent-indigo-600" />
                </div>
             )}
          </div>

          <button onClick={onApplyBgRemoval} disabled={isProcessing} className="w-full py-2.5 bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2">
            {isProcessing ? <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full" /> : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
            {t.updatePreview}
          </button>

          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
               <button onClick={() => onStepChange(1)} className="flex-1 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium border border-slate-200">{t.prevStep}</button>
               <button onClick={() => onStepChange(3)} className="flex-1 py-2.5 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 shadow-lg shadow-slate-200 flex items-center justify-center gap-1">
                   {t.nextStep} <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
               </button>
            </div>
        </div>
      )}

      {/* Step 3: Split & Export */}
      {currentStep === 3 && (
        <div className="animate-fade-in space-y-6">
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex gap-3">
              <div className="text-emerald-500 mt-0.5"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
              <p className="text-xs text-emerald-700 leading-relaxed font-medium">{t.gridHint}</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center"><label className="text-sm font-medium text-slate-700">{t.rows}</label><span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-sm">{rows}</span></div>
            <input type="range" min="1" max="10" value={rows} onChange={(e) => onRowsChange(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center"><label className="text-sm font-medium text-slate-700">{t.cols}</label><span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-sm">{cols}</span></div>
            <input type="range" min="1" max="10" value={cols} onChange={(e) => onColsChange(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
          </div>

          <button onClick={onToggleCrop} className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 font-medium transition-all flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            {t.cropImage}
          </button>

          <div className="h-px bg-slate-100"></div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-800 mb-2">{t.exportSettings}</h3>
            <div className="grid grid-cols-3 gap-2">
              {(['PNG', 'JPG', 'WEBP'] as const).map((fmt) => {
                const mimeType = fmt === 'JPG' ? 'image/jpeg' : `image/${fmt.toLowerCase()}`;
                return (
                  <button key={fmt} onClick={() => onFormatChange(mimeType as ImageFormat)} className={`py-2 rounded-lg text-xs font-medium border transition-all ${format === mimeType ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{fmt}</button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            {selectedCount > 0 && (
            <button onClick={onDownloadSelected} disabled={isProcessing} className="w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200 shadow-md transform active:scale-[0.98] transition-all">
                {isProcessing ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                <span>{t.downloadSelected.replace('{count}', selectedCount.toString())}</span>
            </button>
            )}

            <button onClick={onDownload} disabled={isProcessing} className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-all shadow-md active:scale-[0.98] ${isProcessing ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-black shadow-slate-200'}`}>
            {isProcessing ? <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" /> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
            <span>{t.downloadAll}</span>
            </button>

             <button onClick={() => onStepChange(2)} className="w-full py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium border border-slate-200 mt-2">{t.prevStep}</button>
          </div>
        </div>
      )}
    </div>
  );
};