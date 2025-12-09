import React, { useState, useRef, useEffect } from 'react';
import { Message, ProjectContext, VisualizationPayload } from './types';
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import VisualizationPanel from './components/VisualizationPanel';
import { streamGeminiResponse } from './services/geminiService';
import { extractVisualizationData, cleanResponseText } from './utils/parser';
import { generatePDFReport } from './utils/pdfGenerator';
import { Send, Loader2 } from 'lucide-react';

const INITIAL_CONTEXT: ProjectContext = {
  location: '',
  budgetCap: '',
  projectType: ''
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: 'ArchTec-Integrator Prime online. \n\nEstou pronto para atuar como seu parceiro estratégico. Por favor, defina os parâmetros iniciais do projeto na barra lateral ou descreva sua demanda para iniciarmos a análise integrada de Arquitetura, Custos e Cronograma.',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [projectContext, setProjectContext] = useState<ProjectContext>(INITIAL_CONTEXT);
  const [visualization, setVisualization] = useState<VisualizationPayload | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        // Focus back on input after response
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    );
  };

  const handleEditMessage = async (id: string, newContent: string) => {
    if (isLoading) return;

    const msgIndex = messages.findIndex(m => m.id === id);
    if (msgIndex === -1) return;

    // Remove this message and everything after it
    const previousHistory = messages.slice(0, msgIndex);

    // Create updated user message
    const updatedUserMessage: Message = {
      ...messages[msgIndex],
      content: newContent,
      timestamp: Date.now()
    };

    const newMessages = [...previousHistory, updatedUserMessage];
    
    // Prepare bot placeholder
    const botMessageId = (Date.now() + 1).toString();
    const botPlaceholder: Message = {
      id: botMessageId,
      role: 'model',
      content: '',
      timestamp: Date.now()
    };

    // Update state immediately to show new conversation path
    setMessages([...newMessages, botPlaceholder]);
    setIsLoading(true);

    // Re-trigger API with new history
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
    if (window.confirm("Tem certeza que deseja iniciar um novo chat? O histórico e os parâmetros do projeto serão apagados.")) {
      setMessages([
        {
          id: 'welcome-' + Date.now(),
          role: 'model',
          content: 'ArchTec-Integrator Prime online. \n\nNovo chat iniciado. Parâmetros resetados. Estou pronto para atuar como seu parceiro estratégico em um novo projeto.',
          timestamp: Date.now()
        }
      ]);
      setProjectContext(INITIAL_CONTEXT);
      setVisualization(null);
      setInput('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <div className="flex h-screen bg-arch-900 text-gray-100 font-sans overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar 
        context={projectContext} 
        setContext={setProjectContext} 
        onExport={handleExport}
        onNewChat={handleNewChat}
        isGeneratingPdf={isGeneratingPdf}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative min-w-0">
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
        <div className="p-4 bg-arch-900 border-t border-arch-700">
          <div className="max-w-4xl mx-auto relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Descreva sua demanda arquitetônica, questão de custo ou desafio de gestão..."
              disabled={isLoading}
              className="w-full bg-arch-800 border border-arch-600 text-white rounded-lg pl-4 pr-12 py-4 shadow-lg focus:outline-none focus:border-arch-accent transition-all placeholder-arch-500 disabled:opacity-50"
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-arch-accent hover:text-white disabled:text-arch-600 transition-colors"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
          <div className="max-w-4xl mx-auto mt-2 text-center">
             <p className="text-[10px] text-arch-600">
               ArchTec pode cometer erros. Verifique informações críticas com profissionais licenciados.
             </p>
          </div>
        </div>
      </div>

      {/* Right Visualization Panel (Responsive: Hidden on small screens or toggleable - sticking to fixed width for desktop for now) */}
      <div className="w-96 hidden xl:block border-l border-arch-700 bg-arch-800 h-full">
        <VisualizationPanel data={visualization} />
      </div>
    </div>
  );
}