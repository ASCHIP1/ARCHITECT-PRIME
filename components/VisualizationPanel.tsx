import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { VisualizationPayload, VisualizationType } from '../types';
import { Briefcase, Clock, TrendingUp } from 'lucide-react';

interface VisualizationPanelProps {
  data: VisualizationPayload | null;
}

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const CustomTooltip = ({ active, payload, label, unit, currency }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-arch-800 border border-arch-600 p-2 rounded shadow-lg text-sm">
        <p className="font-semibold text-gray-200">{label}</p>
        <p className="text-arch-accent">
          {currency ? `${currency} ` : ''}
          {payload[0].value.toLocaleString()}
          {unit ? ` ${unit}` : ''}
        </p>
      </div>
    );
  }
  return null;
};

const VisualizationPanel: React.FC<VisualizationPanelProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-arch-500 p-6 text-center border-l border-arch-700 bg-arch-900/50">
        <TrendingUp className="w-12 h-12 mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">Painel de Visualização ArchTec</h3>
        <p className="text-sm max-w-xs">
          Os dados quantitativos de análise (Orçamento, Cronograma ou Financeiro) aparecerão aqui automaticamente quando gerados pelo consultor.
        </p>
      </div>
    );
  }

  const renderChart = () => {
    switch (data.type) {
      case VisualizationType.BUDGET:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip currency={data.currency} />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case VisualizationType.TIMELINE:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data.data}
              margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" width={100} stroke="#94a3b8" style={{ fontSize: '10px' }} />
              <Tooltip content={<CustomTooltip unit={data.unit} />} />
              <Bar dataKey="value" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case VisualizationType.FINANCIAL:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip content={<CustomTooltip currency={data.currency} />} />
              <Bar dataKey="value" fill="#10b981">
                 {data.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.value < 0 ? '#ef4444' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
        
      default:
        return <div>Tipo de gráfico não suportado.</div>;
    }
  };

  const getIcon = () => {
    switch (data.type) {
      case VisualizationType.BUDGET: return <Briefcase className="w-5 h-5" />;
      case VisualizationType.TIMELINE: return <Clock className="w-5 h-5" />;
      case VisualizationType.FINANCIAL: return <TrendingUp className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-arch-800 border-l border-arch-700">
      <div className="p-4 border-b border-arch-700 flex items-center space-x-2 bg-arch-900/30">
        <div className="text-arch-accent">
          {getIcon()}
        </div>
        <h2 className="font-semibold text-gray-100">{data.title}</h2>
      </div>
      {/* Added ID for PDF export capture */}
      <div id="visualization-export-container" className="flex-1 p-4 min-h-[300px] bg-arch-800">
        {renderChart()}
      </div>
      <div className="p-4 border-t border-arch-700 text-xs text-arch-500 font-mono">
        DATA SOURCE: ARCHTEC INTELLIGENCE ENGINE
      </div>
    </div>
  );
};

export default VisualizationPanel;