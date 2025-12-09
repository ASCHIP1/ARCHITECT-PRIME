import React from 'react';
import { ProjectContext } from '../types';
import { Settings, MapPin, Wallet, Layout, FileDown, Plus, X, TrendingUp } from 'lucide-react';

interface SidebarProps {
  context: ProjectContext;
  setContext: React.Dispatch<React.SetStateAction<ProjectContext>>;
  onExport: () => void;
  onNewChat: () => void;
  isGeneratingPdf: boolean;
  onClose?: () => void; // Added for mobile
}

const Sidebar: React.FC<SidebarProps> = ({ context, setContext, onExport, onNewChat, isGeneratingPdf, onClose }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setContext(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full md:w-80 bg-arch-900 border-r border-arch-700 flex flex-col h-full overflow-y-auto relative">
      {/* Mobile Close Button */}
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-arch-500 hover:text-white md:hidden z-10"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      <div className="p-6 border-b border-arch-700">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <div className="w-3 h-3 bg-arch-accent rounded-full animate-pulse"></div>
          ARCHTEC
          <span className="text-xs font-normal text-arch-500 ml-auto md:hidden">Mobile</span>
        </h1>
        <p className="text-xs text-arch-500 mt-1 uppercase tracking-widest hidden md:block">Integrated Systems AO</p>
      </div>

      <div className="p-6 pb-0">
        <button
          onClick={() => {
            onNewChat();
            onClose?.();
          }}
          className="w-full flex items-center justify-center gap-2 bg-arch-accent hover:bg-arch-accentHover text-white text-sm font-medium py-3 rounded shadow-lg shadow-arch-accent/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Novo Chat
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2 text-arch-accent mb-2">
          <Settings className="w-4 h-4" />
          <h2 className="text-sm font-semibold uppercase tracking-wider">Parâmetros</h2>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-arch-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Localização
            </label>
            <input
              type="text"
              name="location"
              value={context.location}
              onChange={handleChange}
              placeholder="Ex: Luanda"
              className="w-full bg-arch-800 border border-arch-600 rounded px-3 py-3 md:py-2 text-base md:text-sm text-white focus:outline-none focus:border-arch-accent transition-colors placeholder-arch-600"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-arch-500 flex items-center gap-1">
              <Layout className="w-3 h-3" />
              Tipologia
            </label>
            <input
              type="text"
              name="projectType"
              value={context.projectType}
              onChange={handleChange}
              placeholder="Ex: Condomínio"
              className="w-full bg-arch-800 border border-arch-600 rounded px-3 py-3 md:py-2 text-base md:text-sm text-white focus:outline-none focus:border-arch-accent transition-colors placeholder-arch-600"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-arch-500 flex items-center gap-1">
              <Wallet className="w-3 h-3" />
              Budget Cap
            </label>
            <input
              type="text"
              name="budgetCap"
              value={context.budgetCap}
              onChange={handleChange}
              placeholder="Ex: 500.000.000 AOA"
              className="w-full bg-arch-800 border border-arch-600 rounded px-3 py-3 md:py-2 text-base md:text-sm text-white focus:outline-none focus:border-arch-accent transition-colors placeholder-arch-600"
            />
          </div>

          <div className="space-y-1 pt-2 border-t border-arch-700/50">
            <label className="text-xs text-arch-warning flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3 h-3" />
              Risco / Inflação (%)
            </label>
            <input
              type="number"
              name="inflationMargin"
              value={context.inflationMargin}
              onChange={handleChange}
              placeholder="Ex: 25"
              className="w-full bg-arch-900 border border-arch-warning/50 rounded px-3 py-3 md:py-2 text-base md:text-sm text-arch-warning focus:outline-none focus:border-arch-warning transition-colors placeholder-arch-600"
            />
            <p className="text-[10px] text-arch-500 mt-1">Margem de segurança para variação cambial.</p>
          </div>
        </div>
      </div>
      
      <div className="px-6 pb-2 mt-auto">
        <button
          onClick={() => {
            onExport();
            onClose?.();
          }}
          disabled={isGeneratingPdf}
          className="w-full flex items-center justify-center gap-2 bg-arch-700 hover:bg-arch-600 text-white text-sm py-3 rounded border border-arch-600 hover:border-arch-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <FileDown className="w-4 h-4 group-hover:text-arch-accent transition-colors" />
          {isGeneratingPdf ? "Gerando..." : "PDF Relatório"}
        </button>
      </div>

      <div className="p-6 border-t border-arch-700">
        <div className="text-xs text-arch-600 space-y-2">
          <p>
            <strong className="text-arch-500">Status:</strong> <span className="text-arch-success">Online (Luanda)</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;