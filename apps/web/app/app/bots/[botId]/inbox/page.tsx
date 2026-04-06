"use client";
import { useEffect, useState, useRef } from 'react';
import { EmptyState, ChatBubble, Composer, ConversationListCard } from '@botforge/ui';
import { ApiService } from '../../../../../lib/api';

export default function InboxPage({ params }: { params: { botId: string } }) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [feed, setFeed] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [sending, setSending] = useState(false);
  // Filtros persistidos en URL
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      // Construir query params de filtros (siempre aislado por botId en backend)
      const qp = new URLSearchParams();
      if (statusFilter) qp.set('status', statusFilter);
      if (typeFilter) qp.set('messageType', typeFilter);
      const qs = qp.toString() ? `?${qp.toString()}` : '';

      const data = await ApiService.fetch(`/api/bots/${params.botId}/conversations${qs}`);
      setConversations(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFeed = async (convId: string) => {
    try {
      const data = await ApiService.fetch(`/api/conversations/${convId}/feed?botId=${params.botId}`);
      if (data && data.data) {
         setFeed(data.data);
      }
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // Limpiar filtros al cambiar de bot para evitar estado cruzado entre bots
    setStatusFilter('');
    setTypeFilter('');
    setActiveConvId(null);
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.botId]);

  // Refetch cuando cambian los filtros
  useEffect(() => {
    fetchConversations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    if (activeConvId) {
      fetchFeed(activeConvId);
      const interval = setInterval(() => fetchFeed(activeConvId), 3000); // Polling Mensajes MVS
      return () => clearInterval(interval);
    }
  }, [activeConvId]);

  const handleSend = async (text: string) => {
    if (!activeConvId) return;
    setSending(true);
    // Optimistic UI updates could go here.
    try {
      // Obtenemos a qué número enviar de la lista cargada
      const conv = conversations.find(c => c.id === activeConvId);
      await ApiService.fetch(`/api/conversations/${activeConvId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ botId: params.botId, content: text, toPhone: conv?.contact?.phoneNumber })
      });
      fetchFeed(activeConvId);
      fetchConversations(); // to reflect 'manual' status
    } catch (err: any) {
      alert("Error enviando: " + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-full w-full bg-white divide-x">
      {/* Left Sidebar: Conversations List */}
      <div className="w-1/3 min-w-[300px] max-w-[400px] flex flex-col h-full bg-slate-50/50">
        <div className="p-4 border-b bg-white space-y-2">
          <input 
            type="search" 
            placeholder="Buscar conversaciones..." 
            className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-slate-800"
          />
          {/* Filtros */}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 text-xs border border-slate-200 rounded-md px-2 py-1 outline-none focus:border-slate-600 bg-white"
            >
              <option value="">Todos los estados</option>
              <option value="open">Abiertas</option>
              <option value="pending_human">Pendiente humano</option>
              <option value="manual">Manual</option>
              <option value="closed">Cerradas</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="flex-1 text-xs border border-slate-200 rounded-md px-2 py-1 outline-none focus:border-slate-600 bg-white"
            >
              <option value="">Todos los tipos</option>
              <option value="audio">Audios</option>
              <option value="text">Texto</option>
              <option value="image">Imágenes</option>
            </select>
          </div>
          {(statusFilter || typeFilter) && (
            <button
              onClick={() => { setStatusFilter(''); setTypeFilter(''); }}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              × Limpiar filtros
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 && (
            <div className="p-4 flex items-center justify-center text-slate-400 text-sm italic">
              No hay conversaciones activas
            </div>
          )}
          {conversations.map(c => (
            <ConversationListCard 
              key={c.id}
              name={c.contact.name}
              phone={c.contact.phoneNumber}
              status={c.status}
              time={new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              isActive={activeConvId === c.id}
              onClick={() => setActiveConvId(c.id)}
            />
          ))}
        </div>
      </div>

      {/* Right Area: Messages */}
      <div className="flex-1 flex flex-col bg-slate-50 relative">
        {!activeConvId ? (
          <EmptyState 
            title="Ningún chat seleccionado" 
            description="Selecciona una conversación a la izquierda para interactuar en tiempo real."
          />
        ) : (
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 flex flex-col relative w-full h-full">
              <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                {feed.length === 0 && (
                  <div className="text-center text-slate-400 mt-10">Cargando histórico...</div>
                )}
                {feed.map(item => {
                  if (item._type === 'message') {
                    return (
                      <ChatBubble 
                        key={`msg-${item.id}`}
                        direction={item.direction}
                        type={item.type}
                        content={item.content}
                        storagePath={item.storagePath}
                        transcriptionText={item.transcriptionText}
                        time={new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      />
                    );
                  } else {
                    // EVENT Render (Hybrid Timeline)
                    return (
                      <div 
                         key={`evt-${item.id}`} 
                         onClick={() => setSelectedEvent(item)}
                         className="flex justify-center my-4 opacity-80 hover:opacity-100 cursor-pointer transition-opacity"
                      >
                        <div className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-slate-200 text-slate-600 border border-slate-300 flex items-center shadow-sm">
                          ⏱ {item.eventLabel}
                        </div>
                      </div>
                    );
                  }
                })}
                <div ref={bottomRef} />
              </div>
              
              {/* Status Indicator / Resume Bot action */}
              {conversations.find(c => c.id === activeConvId)?.status === 'manual' && (
                 <div className="bg-amber-100 border-t border-amber-200 px-4 py-2 flex justify-between items-center text-sm">
                   <span className="text-amber-800 font-medium">⚠️ Has intervenido. Autómata e IA bloqueados temporalmente.</span>
                   <button 
                     onClick={async () => {
                       await ApiService.fetch(`/api/conversations/${activeConvId}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'open' }) });
                       fetchConversations();
                     }}
                     className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded shadow-sm"
                   >
                     Activar Flow Automático
                   </button>
                 </div>
              )}

              {conversations.find(c => c.id === activeConvId)?.status === 'pending_human' && (
                 <div className="bg-rose-100 border-t border-rose-200 px-4 py-2 flex justify-between items-center text-sm">
                   <span className="text-rose-800 font-medium">🚨 Derivado a Humano. La IA no pudo encajar una respuesta de confianza.</span>
                   <button 
                     onClick={async () => {
                       await ApiService.fetch(`/api/conversations/${activeConvId}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'manual' }) });
                       fetchConversations();
                     }}
                     className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1 rounded shadow-sm flex-shrink-0"
                   >
                     Tomar Control (Manual)
                   </button>
                 </div>
              )}
              
              <Composer onSend={handleSend} disabled={sending} />
            </div>

            {/* Right Audit Sidebar */}
            {selectedEvent && (
              <div className="w-64 border-l border-slate-200 bg-white flex flex-col shadow-inner">
                <div className="p-3 border-b bg-slate-50 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Log del Evento</h3>
                  <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-slate-600 text-lg">&times;</button>
                </div>
                <div className="p-4 flex-1 overflow-y-auto">
                   <div className="mb-4">
                     <span className="text-[10px] text-slate-400 block uppercase">Timestamp</span>
                     <span className="text-xs text-slate-700 font-mono">{new Date(selectedEvent.createdAt).toLocaleString()}</span>
                   </div>
                   <div className="mb-4">
                     <span className="text-[10px] text-slate-400 block uppercase">Type</span>
                     <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{selectedEvent.eventType}</span>
                   </div>
                   <div className="mb-4">
                     <span className="text-[10px] text-slate-400 block uppercase mb-1">Raw Payload</span>
                     <pre className="text-[10px] bg-slate-900 text-green-400 p-2 rounded overflow-x-auto">
                       {selectedEvent.payload ? JSON.stringify(selectedEvent.payload, null, 2) : '{}'}
                     </pre>
                   </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
