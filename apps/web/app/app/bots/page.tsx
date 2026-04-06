"use client";
import { Button, Card, EmptyState, Modal, Input } from '@botforge/ui';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ApiService } from '../../../lib/api';

export default function BotsPage() {
  const router = useRouter();
  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBotName, setNewBotName] = useState('');

  const fetchBots = async () => {
    try {
      const data = await ApiService.fetch('/api/bots');
      setBots(data);
    } catch (error) {
      console.error(error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBots();
  }, []);

  const handleCreateBot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBotName) return;
    try {
      await ApiService.fetch('/api/bots', {
        method: 'POST',
        body: JSON.stringify({ name: newBotName })
      });
      setNewBotName('');
      setIsModalOpen(false);
      fetchBots();
    } catch (err) {
      alert("Error al crear bot");
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Cargando tus bots...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Mis Bots</h1>
        <Button onClick={() => setIsModalOpen(true)}>Crear Bot</Button>
      </div>
      
      {bots.length === 0 ? (
        <EmptyState 
          title="Aún no tienes bots" 
          description="Crea tu primer bot para empezar a automatizar tu negocio en WhatsApp."
          action={<Button onClick={() => setIsModalOpen(true)}>Crear mi primer Bot</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots.map((bot) => (
            <Card key={bot.id} className="p-6">
              <h3 className="font-semibold text-lg mb-2">{bot.name}</h3>
              <p className="text-sm text-slate-500 mb-4 flex items-center">
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${bot.status === 'active' ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                Status: {bot.status}
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={() => router.push(`/app/bots/${bot.id}/inbox`)}
                  variant="secondary" size="sm" className="bg-slate-100 text-slate-900 border"
                >
                  Inbox
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Crear nuevo Bot">
        <form onSubmit={handleCreateBot} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Nombre del Bot</label>
            <Input 
              placeholder="Ej. Soporte Ventas" 
              value={newBotName}
              onChange={(e) => setNewBotName(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">Guardar y Crear</Button>
        </form>
      </Modal>
    </div>
  );
}
