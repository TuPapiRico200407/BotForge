"use client";
import { useEffect, useState } from 'react';
import { Card, Button, Input, Modal } from '@botforge/ui';
import { ApiService } from '../../../../../lib/api';

export default function AutomationsPage({ params }: { params: { botId: string } }) {
  const [config, setConfig] = useState({ bot_active: true, automationEnabled: true });
  const [rules, setRules] = useState<any[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [newRule, setNewRule] = useState({ keyword: '', response: '', matchType: 'includes', linkUrl: '' });

  const fetchData = async () => {
    try {
      const conf = await ApiService.fetch(`/api/bots/${params.botId}/config`);
      setConfig(conf);
      const r = await ApiService.fetch(`/api/bots/${params.botId}/automations/keywords`);
      setRules(r);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchData(); }, [params.botId]);

  const updateToggles = async (key: string, val: boolean) => {
    const payload = { ...config, [key]: val };
    setConfig(payload);
    await ApiService.fetch(`/api/bots/${params.botId}/config`, {
      method: 'PATCH', body: JSON.stringify(payload)
    });
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.keyword || !newRule.response) return;
    
    await ApiService.fetch(`/api/bots/${params.botId}/automations/keywords`, {
      method: 'POST', body: JSON.stringify(newRule)
    });
    
    setModalOpen(false);
    setNewRule({ keyword: '', response: '', matchType: 'includes', linkUrl: '' });
    fetchData();
  };

  const handleDeleteRule = async (id: string) => {
    await ApiService.fetch(`/api/bots/${params.botId}/automations/keywords/${id}`, { method: 'DELETE' });
    fetchData();
  };

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-8">Automatizaciones y Reglas Base</h1>
      
      {/* Master Control */}
      <Card className="p-6 mb-8 border-l-4 border-l-slate-900">
        <h2 className="text-lg font-semibold mb-4">Control Maestro (Dumb Bot)</h2>
        <div className="flex flex-col gap-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" className="form-checkbox h-5 w-5 text-slate-900" 
              checked={config.bot_active} 
              onChange={e => updateToggles('bot_active', e.target.checked)} />
            <span className="font-medium">Bot Encendido (Permitir Entrada Webhooks)</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" className="form-checkbox h-5 w-5 text-slate-900" 
              checked={config.automationEnabled} 
              onChange={e => updateToggles('automationEnabled', e.target.checked)} />
            <span className="font-medium text-slate-700">Respuestas Automáticas Habilitadas (Keywords / Dumb Bot)</span>
          </label>
          {/* <label className="flex items-center space-x-3 cursor-not-allowed opacity-50">
             (AI Disabled for now Sprint 05 placeholder)
          </label> */}
        </div>
      </Card>

      {/* Rules Manager */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Reglas de Palabras Clave</h2>
        <Button onClick={() => setModalOpen(true)}>+ Añadir Regla</Button>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-800 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 font-medium">Condición</th>
              <th className="px-6 py-3 font-medium">Respuesta</th>
              <th className="px-6 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rules.length === 0 && (
               <tr><td colSpan={3} className="p-6 text-center italic text-slate-400">Ninguna regla configurada.</td></tr>
            )}
            {rules.map(rule => (
              <tr key={rule.id}>
                <td className="px-6 py-4">
                  <span className="bg-slate-200 text-slate-900 px-2 py-0.5 rounded mr-2 font-mono">{rule.keyword}</span>
                  <span className="text-xs text-slate-400 border px-1 rounded">{rule.matchType}</span>
                </td>
                <td className="px-6 py-4 max-w-xs truncate">
                  {rule.response}
                  {rule.linkUrl && <div className="text-blue-500 text-xs mt-1 truncate">{rule.linkUrl}</div>}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDeleteRule(rule.id)} className="text-red-500 hover:text-red-700 text-xs">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Nueva Regla de Automatización">
        <form onSubmit={handleCreateRule} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Palabra Clave o Intención</label>
            <Input required value={newRule.keyword} onChange={e => setNewRule({...newRule, keyword: e.target.value})} placeholder="Ej: precios" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Sensibilidad</label>
            <select 
               className="w-full border rounded p-2 text-sm"
               value={newRule.matchType} 
               onChange={e => setNewRule({...newRule, matchType: e.target.value})}
            >
              <option value="includes">Flexible (Si incluye la palabra)</option>
              <option value="exact">Exacto (Si dice literalmente esta palabra sola)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Texto de la Respuesta</label>
            <textarea required rows={4} className="w-full border rounded-md p-2 mt-1 text-sm bg-slate-50 focus:outline-none" value={newRule.response} onChange={e => setNewRule({...newRule, response: e.target.value})} placeholder="Nuestros precios son..."></textarea>
          </div>
          <div>
            <label className="text-sm font-medium">Enlace / URL Adjunto (Opcional)</label>
            <Input type="url" value={newRule.linkUrl} onChange={e => setNewRule({...newRule, linkUrl: e.target.value})} placeholder="https://tu-catalogo.com" />
          </div>
          <Button type="submit" className="w-full">Guardar Regla</Button>
        </form>
      </Modal>
    </div>
  );
}
