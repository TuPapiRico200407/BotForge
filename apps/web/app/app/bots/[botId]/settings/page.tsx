'use client';
import { useState, useEffect } from 'react';
import { Button } from '@botforge/ui';

export default function BotConfigPage({ params }: { params: { botId: string } }) {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/bots/${params.botId}/config`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => r.json())
      .then(d => {
        if (!d.error) setConfig(d);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setError('Error cargando configuración. Compruebe la red.');
        setLoading(false);
      });
  }, [params.botId]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/bots/${params.botId}/config`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          botActive: config.botActive,
          automationEnabled: config.automationEnabled,
          aiEnabled: config.aiEnabled,
          intentionThreshold: Number(config.intentionThreshold)
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Error al guardar');
      }
    } catch (e: any) {
      setError(e.message);
    }
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Cargando configuración...</div>;
  if (!config) return <div className="p-8 text-center text-red-500">{error || 'No se encontró la configuración técnica del bot.'}</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 mt-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Configuración Operativa (Sprint 05)</h1>
        <p className="text-slate-500">Administra los master switches que controlan cómo reacciona tu bot a los eventos de WhatsApp.</p>
      </div>

      <div className="bg-white border rounded-xl shadow-sm divide-y">
        
        {/* Toggle 1: Bot Active */}
        <div className="p-6 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-slate-900">Bot Activo (Kill Switch)</h3>
            <p className="text-slate-500 mt-1 max-w-lg text-sm">
              Si se apaga, el bot dejará de procesar automáticamente cualquier webhook. 
              Los mensajes se registrarán en la bandeja, pero no habrá auto-respuesta ni IA.
            </p>
          </div>
          <div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={config.botActive} 
                     onChange={(e) => setConfig({...config, botActive: e.target.checked})} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>
        </div>

        {/* Toggle 2: Automation */}
        <div className="p-6 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-slate-900">Automatización Clásica</h3>
            <p className="text-slate-500 mt-1 max-w-lg text-sm">
              Habilita las respuestas automáticas a través de coincidencia exacta de palabras (Keywords). 
              Si se apaga, solo humanos podrán responder (Modo Manual).
            </p>
          </div>
          <div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={config.automationEnabled} 
                     onChange={(e) => setConfig({...config, automationEnabled: e.target.checked})} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>

        {/* Toggle 3: AI Engine */}
        <div className="p-6 flex items-start justify-between opacity-100">
          <div>
            <h3 className="text-lg font-medium text-slate-900">Motor de IA (Voz a Texto / Intenciones)</h3>
            <p className="text-slate-500 mt-1 max-w-lg text-sm">
              Habilita la interpretación de notas de Voz mediante <strong>Whisper</strong> y análisis de intenciones por <strong>Cerebras</strong>.
              <br/>
              <em>Nota: Requiere que la automatización esté encendida para emitir respuestas, de lo contrario solo transcribirá y anotará la intención.</em>
            </p>
          </div>
          <div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={config.aiEnabled} 
                     onChange={(e) => setConfig({...config, aiEnabled: e.target.checked})} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>

        {/* Threshold Slider (only if AI is on) */}
        {config.aiEnabled && (
          <div className="p-6 bg-slate-50">
            <h3 className="text-md font-medium text-slate-800">Umbral de Certeza (% Confianza Requerida)</h3>
            <p className="text-sm text-slate-500 mb-4">Si la red neuronal clasifica una intención de los clientes por debajo de este %, el robot se asustará y derivará a la bandeja en modo <span className="font-mono text-xs font-semibold text-rose-500 bg-rose-100 px-1 rounded">pending_human</span>.</p>
            <div className="flex items-center gap-4">
              <input type="range" min="0" max="100" className="flex-1 accent-indigo-600" 
                     value={config.intentionThreshold} 
                     onChange={(e) => setConfig({...config, intentionThreshold: e.target.value})} />
              <span className="font-bold text-slate-700 w-12 text-center">{config.intentionThreshold}%</span>
            </div>
            
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>0% (Rebelde/Riesgoso)</span>
              <span>100% (Robótico/Exigente)</span>
            </div>
          </div>
        )}

      </div>

      <div className="flex items-center justify-end space-x-4 pt-4 border-t">
        {error && <span className="text-red-500 text-sm flex items-center font-medium">⚠️ {error}</span>}
        {success && <span className="text-green-500 text-sm flex items-center font-medium">✅ ¡Cambios replicados al Hub!</span>}
        
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Aplicando...' : 'Aplicar Cambios Operativos'}
        </Button>
      </div>

    </div>
  );
}
