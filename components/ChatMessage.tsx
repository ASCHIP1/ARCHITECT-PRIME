import React, { useState } from 'react';
import { Message } from '../types';
import { Bot, User, Pencil, Check, X, CheckCheck } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  onEdit?: (id: string, newContent: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onEdit }) => {
  const isUser = message.role === 'user';
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);

  const handleSave = () => {
    if (editedContent.trim() !== message.content) {
      onEdit?.(message.id, editedContent);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedContent(message.content);
    setIsEditing(false);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 group`}>
      <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded mb-1 flex items-center justify-center border ${
          isUser 
            ? 'bg-arch-700 border-arch-600' 
            : 'bg-arch-accent/10 border-arch-accent/30'
        }`}>
          {isUser ? (
            <User className="w-5 h-5 text-gray-300" />
          ) : (
            <Bot className="w-5 h-5 text-arch-accent" />
          )}
        </div>

        {/* Bubble & Actions Container */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>

          {/* Bubble */}
          <div className={`relative p-4 rounded-lg shadow-sm border ${
            isUser 
              ? 'bg-arch-700 border-arch-600 text-gray-100 rounded-br-none' 
              : 'bg-arch-800 border-arch-700 text-gray-200 rounded-bl-none'
          }`}>
            {isEditing ? (
              <div className="flex flex-col gap-2 min-w-[280px] sm:min-w-[400px]">
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full bg-arch-900 border border-arch-600 rounded p-2 text-sm text-gray-100 focus:outline-none focus:border-arch-accent resize-none font-mono"
                  rows={4}
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={handleCancel}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-400 hover:text-white hover:bg-arch-600 transition-colors"
                  >
                    <X className="w-3 h-3" /> Cancelar
                  </button>
                  <button 
                    onClick={handleSave}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-arch-accent hover:bg-arch-accentHover text-white transition-colors"
                  >
                    <Check className="w-3 h-3" /> Salvar
                  </button>
                </div>
              </div>
            ) : (
              <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap font-sans leading-relaxed">
                {message.content}
              </div>
            )}
          </div>

          {/* Metadata Row */}
          <div className={`flex items-center gap-2 mt-1 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
             <span className="text-[10px] text-arch-500 font-mono tracking-tight">
              {formatTime(message.timestamp)}
            </span>
            {isUser && !isEditing && (
              <>
                 <div title="Lido / Processado">
                   <CheckCheck className="w-3 h-3 text-arch-success" />
                 </div>
                 {onEdit && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-arch-500 hover:text-arch-accent"
                    title="Editar mensagem"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ChatMessage;