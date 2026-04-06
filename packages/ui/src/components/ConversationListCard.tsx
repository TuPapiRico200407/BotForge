import React from 'react';

export interface ConversationListCardProps {
  name: string;
  phone: string;
  lastMessageSnippet?: string;
  time?: string;
  isActive?: boolean;
  status?: string;
  onClick: () => void;
}

export const ConversationListCard: React.FC<ConversationListCardProps> = ({ 
  name, phone, lastMessageSnippet, time, isActive, status, onClick 
}) => {
  return (
    <div 
      onClick={onClick}
      className={`p-3 cursor-pointer border-b transition-colors ${
        isActive ? 'bg-slate-100 border-l-4 border-l-slate-900' : 'bg-transparent hover:bg-slate-50 border-l-4 border-l-transparent'
      }`}
    >
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-semibold text-sm truncate text-slate-900">{name || phone}</h4>
        {time && <span className="text-xs text-slate-400 whitespace-nowrap ml-2">{time}</span>}
      </div>
      <div className="text-xs text-slate-500 flex justify-between items-center">
        <p className="truncate mr-2 max-w-[80%]">{lastMessageSnippet || 'Ningún mensaje'}</p>
        {(status === 'pending_human' || status === 'manual') && (
          <span 
            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm ${status === 'pending_human' ? 'bg-rose-500' : 'bg-amber-500'}`} 
            title={status === 'pending_human' ? 'Derivado a Humano' : 'Atención Manual'}
          ></span>
        )}
      </div>
    </div>
  );
};
