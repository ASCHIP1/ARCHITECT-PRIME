import React from 'react';
import { ProjectContext } from '../types';
import { Settings, MapPin, Wallet, Layout, FileDown, Plus } from 'lucide-react';

interface SidebarProps {
  context: ProjectContext;
  setContext: React.Dispatch<React.SetStateAction<ProjectContext>>;
  onExport: () => void;
  onNewChat: () => void;
  isGeneratingPdf: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ context, setContext, onExport, onNewChat, isGeneratingPdf }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setContext(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-80 bg-arch-900 border-r border-arch-700 flex flex-col h-full overflow-y-auto">
      <div className="p-6 border-b border-arch-700">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <div className="w-3 h-3 bg-arch-accent rounded-full animate-pulse"></div>
          ARCHTEC PRIME
        </h1>
        <p className="text-xs text-arch-500 mt-1 uppercase tracking-widest">Integrated Systems</p>
      </div>

      <div className="p-6 pb-0">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-arch-accent hover:bg-arch-accentHover text-white text-sm font-medium py-3 rounded shadow-lg shadow-arch-accent/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Novo Chat
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2 text-arch-accent mb-2">
          <Settings className="w-4 h-4" />
          <h2 className="text-sm font-semibold uppercase tracking-wider">Parâmetros do Projeto</h2>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-arch-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Localização / Terreno
            </label>
            <input
              type="text"
              name="location"
              value={context.location}
              onChange={handleChange}
              placeholder="Ex: São Paulo, Zona Sul"
              className="w-full bg-arch-800 border border-arch-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-arch-accent transition-colors placeholder-arch-600"
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
              placeholder="Ex: Torre Residencial Alto Padrão"
              className="w-full bg-arch-800 border border-arch-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-arch-accent transition-colors placeholder-arch-600"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-arch-500 flex items-center gap-1">
              <Wallet className="w-3 h-3" />
              Budget Cap (Estimado)
            </label>
            <input
              type="text"
              name="budgetCap"
              value={context.budgetCap}
              onChange={handleChange}
              placeholder="Ex: R$ 15.000.000,00"
              className="w-full bg-arch-800 border border-arch-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-arch-accent transition-colors placeholder-arch-600"
            />
          </div>
        </div>
      </div>
      
      <div className="px-6 pb-2 mt-auto">
        <button
          onClick={onExport}
          disabled={isGeneratingPdf}
          className="w-full flex items-center justify-center gap-2 bg-arch-700 hover:bg-arch-600 text-white text-sm py-3 rounded border border-arch-600 hover:border-arch-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <FileDown className="w-4 h-4 group-hover:text-arch-accent transition-colors" />
          {isGeneratingPdf ? "Gerando Relatório..." : "Exportar Relatório PDF"}
        </button>
      </div>

      <div className="p-6 border-t border-arch-700">
        <div className="text-xs text-arch-600 space-y-2">
          <p>
            <strong className="text-arch-500">Status do Sistema:</strong> <span className="text-arch-success">Operacional</span>
          </p>
          <p>
            <strong className="text-arch-500">Engine:</strong> Gemini 2.5 Flash
          </p>
          <p className="italic opacity-50 mt-4">
            "A precisão é a única estética que perdura."
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;