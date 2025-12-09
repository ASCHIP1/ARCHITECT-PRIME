import React, { useState, useRef, useEffect } from 'react';
import { Message, ProjectContext, VisualizationPayload } from './types';
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import VisualizationPanel from './components/VisualizationPanel';
import { streamGeminiResponse } from './services/geminiService';
import { extractVisualizationData, cleanResponseText } from './utils/parser';
import { generatePDFReport } from './utils/pdfGenerator';
import { Send, Loader2, Menu, PieChart, X } from 'lucide-react';

const INITIAL_CONTEXT: ProjectContext = {
  location: '',
  budgetCap: '',
  projectType: '',
  inflationMargin: '20' // Default 20% margin for Angola context
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: 'ArchTec-Integrator Prime online. \n\nEstou pronto para atuar como seu parceiro estratégico em Angola. Devido à volatilidade econômica atual, incluí um parâmetro de "Margem de Inflação" na barra lateral. \n\nPor favor, defina o escopo do projeto.',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [projectContext, setProjectContext] = useState<ProjectContext>(INITIAL_CONTEXT);
  const [visualization, setVisualization] = useState<VisualizationPayload | null>(null);
  
  // UI States for Mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileVizOpen, setIsMobileVizOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Open visualization automatically on mobile when new data arrives
  useEffect(() => {
    if (visualization && window.innerWidth < 1280) { // xl breakpoint
      setIsMobileVizOpen(true);
    }
  }, [visualization]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    // Close sidebar on mobile when sending
    setIsSidebarOpen(false);

    const botMessageId = (Date.now() + 1).toString();
    // Placeholder for streaming
    setMessages(prev => [...prev, {
      id: botMessageId,
      role: 'model',
      content: '',
      timestamp: Date.now()
    }]);

    await streamGeminiResponse(
      [...messages, userMessage],
      projectContext,
      (textChunk) => {
        // Real-time update
        setMessages(prev => prev.map(msg => 
          msg.id === botMessageId 
            ? { ...msg, content: cleanResponseText(textChunk) } 
            : msg
        ));
      },
      (fullText) => {
        // Completion
        const vizData = extractVisualizationData(fullText);
        if (vizData) {
          setVisualization(vizData);
        }
        
        setMessages(prev => prev.map(msg => 
          msg.id === botMessageId 
            ? { ...msg, content: cleanResponseText(fullText) } 
            : msg
        ));
        setIsLoading(false);
        // Focus back on input after response (small delay for mobile keyboard handling)
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    );
  };

  const handleEditMessage = async (id: string, newContent: string) => {
    if (isLoading) return;

    const msgIndex = messages.findIndex(m => m.id === id);
    if (msgIndex === -1) return;

    const previousHistory = messages.slice(0, msgIndex);

    const updatedUserMessage: Message = {
      ...messages[msgIndex],
      content: newContent,
      timestamp: Date.now()
    };

    const newMessages = [...previousHistory, updatedUserMessage];
    
    const botMessageId = (Date.now() + 1).toString();
    const botPlaceholder: Message = {
      id: botMessageId,
      role: 'model',
      content: '',
      timestamp: Date.now()
    };

    setMessages([...newMessages, botPlaceholder]);
    setIsLoading(true);

    await streamGeminiResponse(
      newMessages,
      projectContext,
      (textChunk) => {
        setMessages(prev => prev.map(msg => 
          msg.id === botMessageId 
            ? { ...msg, content: cleanResponseText(textChunk) } 
            : msg
        ));
      },
      (fullText) => {
        const vizData = extractVisualizationData(fullText);
        if (vizData) {
          setVisualization(vizData);
        }
        
        setMessages(prev => prev.map(msg => 
          msg.id === botMessageId 
            ? { ...msg, content: cleanResponseText(fullText) } 
            : msg
        ));
        setIsLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleExport = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      await generatePDFReport(projectContext, messages, visualization);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Falha ao gerar o relatório. Verifique o console para mais detalhes.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleNewChat = () => {
    if (window.confirm("Tem certeza que deseja iniciar um novo chat?")) {
      setMessages([
        {
          id: 'welcome-' + Date.now(),
          role: 'model',
          content: 'ArchTec-Integrator Prime online. \n\nNovo chat iniciado. Parâmetros resetados.',
          timestamp: Date.now()
        }
      ]);
      setProjectContext(INITIAL_CONTEXT);
      setVisualization(null);
      setInput('');
      setIsMobileVizOpen(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <div className="flex h-screen bg-arch-900 text-gray-100 font-sans overflow-hidden">
      
      {/* Mobile Sidebar Overlay (Drawer) */}
      <div 
        className={`fixed inset-0 bg-black/80 z-40 transition-opacity duration-300 md:hidden ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      />
      
      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-50 w-[85%] max-w-[320px] transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:w-auto md:max-w-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar 
          context={projectContext} 
          setContext={setProjectContext} 
          onExport={handleExport}
          onNewChat={handleNewChat}
          isGeneratingPdf={isGeneratingPdf}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative min-w-0 w-full">
        
        {/* Mobile Header */}
        <header className="md:hidden h-14 bg-arch-900 border-b border-arch-700 flex items-center justify-between px-4 sticky top-0 z-30 shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-arch-500 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <span className="font-bold text-gray-200 tracking-tight">ARCHTEC ANGOLA</span>

          <div className="w-10 flex justify-end">
            {visualization && (
              <button 
                onClick={() => setIsMobileVizOpen(true)}
                className="p-2 -mr-2 text-arch-accent animate-pulse"
                title="Ver Gráfico"
              >
                <PieChart className="w-6 h-6" />
              </button>
            )}
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth">
          <div className="max-w-4xl mx-auto space-y-6 pb-4">
            {messages.map((msg) => (
              <ChatMessage 
                key={msg.id} 
                message={msg} 
                onEdit={msg.role === 'user' ? handleEditMessage : undefined} 
              />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-arch-500 animate-pulse ml-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs font-mono">Processando Análise Integrada...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-3 sm:p-4 bg-arch-900 border-t border-arch-700 shrink-0">
          <div className="max-w-4xl mx-auto relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Descreva sua demanda..."
              disabled={isLoading}
              // text-base prevents iOS zooming on focus
              className="w-full bg-arch-800 border border-arch-600 text-white rounded-lg pl-4 pr-12 py-3 sm:py-4 shadow-lg focus:outline-none focus:border-arch-accent transition-all placeholder-arch-500 disabled:opacity-50 text-base"
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-arch-accent hover:text-white disabled:text-arch-600 transition-colors"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
          <div className="max-w-4xl mx-auto mt-2 text-center hidden sm:block">
             <p className="text-[10px] text-arch-600">
               ArchTec pode cometer erros. Verifique informações críticas com profissionais licenciados.
             </p>
          </div>
        </div>
      </div>

      {/* Desktop Visualization Panel */}
      <div className="w-96 hidden xl:block border-l border-arch-700 bg-arch-800 h-full shrink-0">
        <VisualizationPanel data={visualization} />
      </div>

      {/* Mobile Visualization Modal */}
      {isMobileVizOpen && visualization && (
        <div className="fixed inset-0 z-50 xl:hidden flex items-center justify-center bg-black/90 p-4">
          <div className="bg-arch-800 w-full max-w-lg rounded-lg border border-arch-600 shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-4 border-b border-arch-700">
              <h3 className="font-bold text-white">Visualização de Dados</h3>
              <button 
                onClick={() => setIsMobileVizOpen(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-auto min-h-[300px]">
              <VisualizationPanel data={visualization} />
            </div>
            <div className="p-4 border-t border-arch-700 text-center">
               <button 
                 onClick={() => setIsMobileVizOpen(false)}
                 className="text-sm text-arch-accent hover:underline"
               >
                 Voltar para o Chat
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}