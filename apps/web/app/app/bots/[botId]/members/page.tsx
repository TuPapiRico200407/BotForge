export const runtime = 'edge';
'use client';
import { useEffect, useState, useCallback } from 'react';
import { ApiService } from '../../../../../lib/api';

export default function MembersPage({ params }: { params: { botId: string } }) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'AGENT' | 'CLIENT_ADMIN'>('AGENT');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchMembers = useCallback(async () => {
    try {
      const data = await ApiService.fetch(`/api/bots/${params.botId}/members`);
      if (!data.error) setMembers(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [params.botId]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleInvite = async () => {
    if (!newEmail.trim()) return;
    setSaving(true);
    setError('');
    try {
      const res = await ApiService.fetch(`/api/bots/${params.botId}/members`, {
        method: 'POST',
        body: JSON.stringify({ email: newEmail.trim(), role: newRole }),
      });
      if (res.error) throw new Error(res.error);
      setShowModal(false);
      setNewEmail('');
      fetchMembers();
    } catch (e: any) {
      setError(e.message || 'Error al invitar');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm('¿Eliminar este miembro del bot?')) return;
    try {
      const res = await ApiService.fetch(`/api/bots/${params.botId}/members/${memberId}`, {
        method: 'DELETE',
      });
      if (res.error) throw new Error(res.error);
      fetchMembers();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const roleBadge = (role: string) => {
    if (role === 'SUPER_ADMIN') return 'bg-purple-100 text-purple-700';
    if (role === 'CLIENT_ADMIN') return 'bg-blue-100 text-blue-700';
    return 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestión de Accesos</h1>
          <p className="text-slate-500 mt-1">Miembros con acceso a este bot. Aislado por bot_id.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Invitar miembro
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="text-slate-400 text-center py-12">Cargando miembros…</div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-slate-500 font-semibold">Email</th>
                <th className="text-left px-4 py-3 text-slate-500 font-semibold">Rol</th>
                <th className="text-left px-4 py-3 text-slate-500 font-semibold">Desde</th>
                <th className="text-left px-4 py-3 text-slate-500 font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-slate-400 py-8">
                    No hay miembros registrados aún.
                  </td>
                </tr>
              )}
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-slate-700">{m.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${roleBadge(m.role)}`}>
                      {m.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(m.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleRemove(m.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium transition-colors"
                    >
                      Revocar acceso
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Invitar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">Invitar nuevo miembro</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email del usuario existente
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-600"
              >
                <option value="AGENT">Agente</option>
                <option value="CLIENT_ADMIN">Admin de Bot</option>
              </select>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setShowModal(false); setError(''); setNewEmail(''); }}
                className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleInvite}
                disabled={saving}
                className="px-4 py-2 rounded-lg text-sm bg-slate-800 text-white hover:bg-slate-900 transition-colors disabled:opacity-50"
              >
                {saving ? 'Invitando…' : 'Invitar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
