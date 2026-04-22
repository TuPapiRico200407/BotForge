export const runtime = 'edge';
export default function BotEnvironmentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { botId: string };
}) {
  return (
    <div className="flex h-[calc(100vh-3.5rem)] -m-6 flex-col bg-white">
      {/* Bot Topbar local (dentro del dashboard) */}
      <div className="flex items-center px-4 py-2 border-b bg-slate-50">
        <h2 className="font-semibold text-slate-800 mr-4">Entorno de Bot</h2>
        <nav className="flex space-x-1">
          <a href={`/app/bots/${params.botId}/dashboard`} className="px-3 py-1 text-slate-500 hover:bg-slate-100 rounded text-sm transition-colors">Dashboard</a>
          <a href={`/app/bots/${params.botId}/inbox`} className="px-3 py-1 bg-slate-200 rounded text-sm font-medium hover:bg-slate-300 transition-colors">Inbox</a>
          <a href={`/app/bots/${params.botId}/automations`} className="px-3 py-1 text-slate-500 hover:bg-slate-100 rounded text-sm transition-colors">Automatizaciones</a>
          <a href={`/app/bots/${params.botId}/settings`} className="px-3 py-1 text-slate-500 hover:bg-slate-100 rounded text-sm transition-colors">Configuración</a>
          <a href={`/app/bots/${params.botId}/members`} className="px-3 py-1 text-slate-500 hover:bg-slate-100 rounded text-sm transition-colors">Miembros</a>
          <a href={`/app/bots/${params.botId}/settings/whatsapp`} className="px-3 py-1 text-slate-500 hover:bg-slate-100 rounded text-sm transition-colors">WhatsApp API</a>
        </nav>
      </div>
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
