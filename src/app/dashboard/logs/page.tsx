
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, User, Pencil, Trash2, ToggleLeft, ToggleRight, Plus } from 'lucide-react';

interface LogEntry {
  id: string;
  action: string;
  clientName: string;
  timestamp: string;
  details: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [darkMode, setDarkMode] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const logged = localStorage.getItem('admin_logged');
    if (!logged) {
      router.push('/login');
    } else {
      loadLogs();
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) setDarkMode(savedTheme === 'dark');
    }
  }, [router]);

  const loadLogs = () => {
    const stored = localStorage.getItem('activity_logs');
    if (stored) {
      setLogs(JSON.parse(stored));
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return <Plus size={16} className="text-emerald-400" />;
      case 'updated': return <Pencil size={16} className="text-blue-400" />;
      case 'deleted': return <Trash2 size={16} className="text-red-400" />;
      case 'blocked': return <ToggleLeft size={16} className="text-red-400" />;
      case 'activated': return <ToggleRight size={16} className="text-emerald-400" />;
      default: return <Clock size={16} className="text-gray-400" />;
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'created': return 'Criou';
      case 'updated': return 'Editou';
      case 'deleted': return 'Excluiu';
      case 'blocked': return 'Bloqueou';
      case 'activated': return 'Ativou';
      default: return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'bg-emerald-500/10';
      case 'updated': return 'bg-blue-500/10';
      case 'deleted': return 'bg-red-500/10';
      case 'blocked': return 'bg-red-500/10';
      case 'activated': return 'bg-emerald-500/10';
      default: return 'bg-gray-500/10';
    }
  };

  const clearLogs = () => {
    if (confirm('Limpar todo o histórico?')) {
      localStorage.removeItem('activity_logs');
      setLogs([]);
    }
  };

  const bgColor = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = darkMode ? 'text-white' : 'text-gray-900';
  const textGray = darkMode ? 'text-gray-400' : 'text-gray-500';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${bgColor} p-4 lg:p-8`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className={`p-2 rounded-xl ${cardBg} border ${borderColor} ${textColor} hover:text-blue-400 transition-colors`}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className={`text-2xl font-bold ${textColor}`}>Log de Atividades</h1>
          </div>
          {logs.length > 0 && (
            <button
              onClick={clearLogs}
              className="px-4 py-2 bg-red-600/10 text-red-400 rounded-xl text-sm hover:bg-red-600/20 transition-colors"
            >
              Limpar Histórico
            </button>
          )}
        </div>

        {logs.length === 0 ? (
          <div className={`${cardBg} rounded-xl p-12 border ${borderColor} text-center`}>
            <Clock size={48} className="mx-auto mb-4 text-gray-500 opacity-50" />
            <p className={`text-lg ${textGray}`}>Nenhuma atividade registrada</p>
            <p className={`text-sm ${textGray} mt-1`}>As ações realizadas nos clientes aparecerão aqui</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log, index) => (
              <div
                key={index}
                className={`${cardBg} rounded-xl p-4 border ${borderColor} flex items-center gap-4 hover:bg-gray-700/30 transition-colors`}
              >
                <div className={`p-2 rounded-lg ${getActionColor(log.action)}`}>
                  {getActionIcon(log.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${textColor}`}>
                    <span className="font-medium">{getActionText(log.action)}</span>
                    {' '}
                    <span className="font-medium text-blue-400">{log.clientName}</span>
                    {log.details && (
                      <span className={`text-xs ${textGray}`}> - {log.details}</span>
                    )}
                  </p>
                  <p className={`text-xs ${textGray} mt-1`}>
                    {new Date(log.timestamp).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}