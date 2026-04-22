"use client";
import { useState, useEffect } from 'react';
import { Card, Input, Button } from '@botforge/ui';
import { ApiService } from '../../../../../../lib/api';

export default function WhatsAppSettingsPage({ params }: { params: { botId: string } }) {
  const [config, setConfig] = useState({
    whatsappPhoneNumberId: '',
    whatsappBusinessAccountId: '',
    whatsappToken: '',
    isActive: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    ApiService.fetch(`/api/bots/${params.botId}/config/whatsapp`)
      .then(data => {
        if (data) setConfig(data);
      })
      .finally(() => setLoading(false));
  }, [params.botId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await ApiService.fetch(`/api/bots/${params.botId}/config/whatsapp`, {
        method: 'PATCH',
        body: JSON.stringify(config)
      });
      alert('Configuración guardada exitosamente.');
    } catch (err) {
      alert('Error guardando configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Cargando settings...</div>;

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">WhatsApp Cloud API</h1>
      <p className="text-slate-500 mb-8">Configura las credenciales de tu aplicación de Meta para permitir envío y recepción reales en este Bot.</p>

      <Card className="p-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number ID</label>
            <Input 
              placeholder="Ej. 12903810293" 
              value={config.whatsappPhoneNumberId || ''} 
              onChange={e => setConfig({...config, whatsappPhoneNumberId: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Business Account ID</label>
            <Input 
              placeholder="Ej. 90123912093" 
              value={config.whatsappBusinessAccountId || ''} 
              onChange={e => setConfig({...config, whatsappBusinessAccountId: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Permanent Token</label>
            <Input 
              type="password"
              placeholder="EAAAAUa......" 
              value={config.whatsappToken || ''} 
              onChange={e => setConfig({...config, whatsappToken: e.target.value})}
              required
            />
          </div>
          <div className="flex items-center mt-4 mb-4">
             <input type="checkbox" id="is_active" className="mr-2" 
               checked={config.isActive} 
               onChange={e => setConfig({...config, isActive: e.target.checked})} 
             />
             <label htmlFor="is_active" className="text-sm font-medium">Activar integración WhatsApp (Webhook listo)</label>
          </div>
          <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar Configuración'}</Button>
        </form>
      </Card>
      
      <div className="mt-8 p-4 bg-slate-50 rounded border text-sm text-slate-700">
        <strong>URL de tu Webhook para Meta:</strong> <br />
        <code className="text-blue-600 block mt-1">https://tu-dominio.com/api/webhooks/whatsapp</code>
        <p className="mt-2 text-xs">Verify Token: <code>{process.env.NEXT_PUBLIC_WHATSAPP_VERIFY_TOKEN || 'test_botforge_sprint02'}</code></p>
      </div>
    </div>
  );
}
