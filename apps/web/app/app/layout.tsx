export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar Placeholder */}
      <aside className="w-64 bg-slate-900 text-slate-300 p-4">
        <div className="mb-8 font-bold text-white text-xl">BotForge</div>
        <nav className="space-y-2">
          <a href="/app/bots" className="block p-2 rounded hover:bg-slate-800 text-white">Mis Bots</a>
          <a href="#" className="block p-2 rounded hover:bg-slate-800">Métricas globales</a>
          <a href="#" className="block p-2 rounded hover:bg-slate-800">Ajustes</a>
        </nav>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-slate-50">
        <header className="h-14 border-b bg-white flex items-center px-6">
          <div className="ml-auto flex items-center space-x-4">
            <span className="text-sm">Admin Auth</span>
          </div>
        </header>
        <div className="p-6 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
