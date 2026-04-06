import React from 'react';

export interface ChatBubbleProps {
  direction?: 'incoming' | 'outgoing';
  type?: 'text' | 'audio' | 'system' | string;
  content: string;
  time?: string;
  storagePath?: string;
  transcriptionText?: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ direction = 'incoming', type = 'text', content, time, storagePath, transcriptionText }) => {
  const isOut = direction === 'outgoing';
  const isAudio = type === 'audio';
  const isSystem = type === 'system';
  
  return (
    <div className={`flex w-full mb-4 ${isOut ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col max-w-[75%] px-4 py-3 rounded-2xl ${
        isOut ? 'bg-slate-900 text-white rounded-br-none' : 
        isSystem ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-bl-none' :
        'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
      }`}>
        {isAudio && storagePath && (
          <div className="mb-2 w-[250px]">
             {/* Render con Auth token proxy (En un entorno real extraeria del store, aca pasamos mock de contexto o asume cookie) */}
             <audio controls className="w-full h-8" src={`http://localhost:3001/api/media/proxy?path=${storagePath}&token=dummyAuth123`} />
          </div>
        )}
        
        <span className="text-[15px] whitespace-pre-wrap leading-relaxed">{content}</span>
        
        {isAudio && transcriptionText && (
          <div className="mt-2 text-xs italic opacity-80 border-t pt-1 border-slate-200/50">
             "{transcriptionText}"
          </div>
        )}
        
        {time && (
          <span className={`text-[10px] mt-1 text-right ${isOut ? 'text-slate-300' : 'text-slate-400'}`}>
            {time}
          </span>
        )}
      </div>
    </div>
  );
};
