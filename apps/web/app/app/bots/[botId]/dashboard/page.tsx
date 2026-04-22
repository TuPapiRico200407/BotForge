export const runtime = 'edge';
'use client';
import { useEffect, useState } from 'react';
import { ApiService } from '../../../../../lib/api';

interface Metrics {
  incomingMessagesCount: number;
  outgoingMessagesCount: number;
  handoffsCount: number;
  aiRepliesCount: number;
  pendingHumanCount: number;
  date: string;
}

function KpiCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`rounded-xl p-5 border shadow-sm bg-white flex flex-col gap-1`}>
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
      <span className={`text-4xl font-bold ${color}`}>{value}</span>
    </div>
  );
}

export default function DashboardPage({ params }: { params: { botId: string } }) {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Fecha actual en UTC (YYYY-MM-DD)
  const todayUTC = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    ApiService.fetch(`/api/bots/${params.botId}/metrics/daily?date=${todayUTC}`)
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setMetrics(data);
      })
      .catch((e: any) => setError(e.message || 'Error cargando métricas'))
      .finally(() => setLoading(false));
  }, [params.botId, todayUTC]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        Cargando métricas del día…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Métricas del día{' '}
          <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-sm">
            {todayUTC} UTC
          </span>
          {' '}— aisladas por este bot.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KpiCard
          label="Mensajes Recibidos"
          value={metrics!.incomingMessagesCount}
          color="text-blue-600"
        />
        <KpiCard
          label="Mensajes Enviados"
          value={metrics!.outgoingMessagesCount}
          color="text-emerald-600"
        />
        <KpiCard
          label="Respuestas IA"
          value={metrics!.aiRepliesCount}
          color="text-indigo-600"
        />
        <KpiCard
          label="Derivaciones a Humano"
          value={metrics!.pendingHumanCount}
          color="text-rose-500"
        />
        <KpiCard
          label="Handoffs (Total)"
          value={metrics!.handoffsCount}
          color="text-amber-500"
        />
      </div>

      <div className="bg-slate-50 border rounded-xl p-4 text-sm text-slate-500">
        <strong>Nota de zona horaria:</strong> Todos los contadores se agrupan por día en <strong>UTC</strong>.
        Si tu operación es en UTC-4, los mensajes enviados antes de medianoche UTC
        cuentan en el día anterior de la tabla.
      </div>
    </div>
  );
}
