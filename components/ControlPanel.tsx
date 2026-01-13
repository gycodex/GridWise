
import React, { useState } from 'react';
import { ImageFormat, BackgroundConfig } from '../types';
import { translations, Language } from '../translations';

interface ControlPanelProps {
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
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  rows, cols, onRowsChange, onColsChange, onReset, onDownload, isProcessing, format, onFormatChange, quality, onQualityChange,
  selectedCount, onDownloadSelected, isCropping, onToggleCrop, onApplyCrop, onCancelCrop, lang,
  bgConfig, onBgConfigChange, onApplyBgRemoval
}) => {
  const [activeTab, setActiveTab] = useState<'grid' | 'bg'>('grid');
  const t = translations[lang];

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
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6 h-fit sticky top-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex gap-4 mb-4 border-b border-slate-100 pb-2">
            <button 
                onClick={() => setActiveTab('grid')}
                className={`text-sm font-semibold pb-1 transition-all ${activeTab === 'grid' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
                {t.gridSplitter}
            </button>
            <button 
                onClick={() => setActiveTab('bg')}
                className={`text-sm font-semibold pb-1 transition-all ${activeTab === 'bg' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
                {t.bgRemoval}
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'grid' ? (
        <>
          <div className="space-y-3">
            <div className="flex justify-between items-center"><label className="text-sm font-medium text-slate-700">{t.rows}</label><span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded text-sm">{rows}</span></div>
            <input type="range" min="1" max="10" value={rows} onChange={(e) => onRowsChange(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center"><label className="text-sm font-medium text-slate-700">{t.cols}</label><span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded text-sm">{cols}</span></div>
            <input type="range" min="1" max="10" value={cols} onChange={(e) => onColsChange(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
          </div>
        </>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-700">{t.bgColor}</label>
                <div className="flex items-center gap-2">
                    <input type="color" value={bgConfig.targetColor} onChange={(e) => onBgConfigChange({ targetColor: e.target.value })} className="w-8 h-8 rounded-lg overflow-hidden border-0 cursor-pointer p-0" />
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
            <label className="flex items-center gap-3 group cursor-pointer">
              <input type="checkbox" checked={bgConfig.removeOuterOnly} onChange={(e) => onBgConfigChange({ removeOuterOnly: e.target.checked })} className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-700">{t.deleteExternal}</span>
                <span className="text-[10px] text-slate-400 leading-tight">{t.deleteExternalDesc}</span>
              </div>
            </label>
          </div>

          <div className="h-px bg-slate-100"></div>

          <div className="space-y-4">
             <label className="flex items-center gap-3 cursor-pointer">
               <input type="checkbox" checked={bgConfig.smoothEdges} onChange={(e) => onBgConfigChange({ smoothEdges: e.target.checked })} className="w-5 h-5 rounded border-slate-300 text-indigo-600" />
               <span className="text-sm font-medium text-slate-700">{t.smoothBorder}</span>
             </label>
             {bgConfig.smoothEdges && (
                <div className="pl-8 space-y-2">
                    <div className="flex justify-between items-center"><span className="text-xs text-slate-500">{t.smoothThickness}</span><span className="text-xs font-bold text-slate-700">{bgConfig.smoothingThickness}</span></div>
                    <input type="range" min="1" max="10" value={bgConfig.smoothingThickness} onChange={(e) => onBgConfigChange({ smoothingThickness: Number(e.target.value) })} className="w-full h-1 bg-slate-100 rounded-lg appearance-none accent-indigo-600" />
                </div>
             )}
          </div>

          <button onClick={onApplyBgRemoval} className="w-full py-2.5 bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 rounded-xl text-sm font-bold transition-all shadow-sm">
             {t.applyRemoval}
          </button>
        </div>
      )}

      <div className="h-px bg-slate-100 my-2"></div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-800 mb-2">{t.exportSettings}</h3>
        <div className="grid grid-cols-3 gap-2">
          {(['PNG', 'JPG', 'WEBP'] as const).map((fmt) => {
            const mimeType = fmt === 'JPG' ? 'image/jpeg' : `image/${fmt.toLowerCase()}`;
            return (
              <button key={fmt} onClick={() => onFormatChange(mimeType as ImageFormat)} className={`py-2 rounded-lg text-xs font-medium border transition-all ${format === mimeType ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{fmt}</button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button onClick={onToggleCrop} className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 font-medium transition-all flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
          {t.cropImage}
        </button>

        {selectedCount > 0 && (
          <button onClick={onDownloadSelected} disabled={isProcessing} className="w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200 shadow-md transform active:scale-[0.98] transition-all">
            {isProcessing ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            <span>{t.downloadSelected.replace('{count}', selectedCount.toString())}</span>
          </button>
        )}

        <button onClick={onDownload} disabled={isProcessing} className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-all shadow-md active:scale-[0.98] ${isProcessing ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'}`}>
          {isProcessing ? <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" /> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
          <span>{t.downloadAll}</span>
        </button>

        <button onClick={onReset} className="w-full py-2.5 px-4 rounded-xl text-slate-600 hover:bg-slate-50 font-medium transition-colors text-sm">{t.selectDifferent}</button>
      </div>
    </div>
  );
};
