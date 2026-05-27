'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, UserCheck, UserX, Clock, ArrowLeft } from 'lucide-react';

interface Client {
  id: string;
  status: string;
  validade: string;
  createdAt: any;
}

export default function EstatisticasPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [darkMode, setDarkMode] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const logged = localStorage.getItem('admin_logged');
    if (!logged) {
      router.push('/login');
    } else {
      loadClients();
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) setDarkMode(savedTheme === 'dark');
    }
  }, [router]);

  const loadClients = async () => {
    try {
      const res = await fetch('/api/clients');
      const data = await res.json();
      setClients(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const activeClients = clients.filter(c => c.status === 'active').length;
  const blockedClients = clients.filter(c => c.status === 'blocked').length;
  const expiredClients = clients.filter(c => c.status === 'expired').length;
  const total = clients.length || 1;

  const activePercent = (activeClients / total) * 100;
  const blockedPercent = (blockedClients / total) * 100;
  const expiredPercent = (expiredClients / total) * 100;

  const clientsByMonth = () => {
    const months: Record<string, number> = {};
    clients.forEach(client => {
      if (client.createdAt) {
        let date: Date;
        if (typeof client.createdAt === 'object' && client.createdAt._seconds) {
          date = new Date(client.createdAt._seconds * 1000);
        } else {
          date = new Date(client.createdAt);
        }
        if (!isNaN(date.getTime())) {
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          months[key] = (months[key] || 0) + 1;
        }
      }
    });
    return Object.entries(months).sort().slice(-6);
  };

  const monthData = clientsByMonth();
  const maxMonthValue = Math.max(...monthData.map(([, v]) => v), 1);

  const bgColor = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = darkMode ? 'text-white' : 'text-gray-900';
  const textGray = darkMode ? 'text-gray-400' : 'text-gray-500';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${bgColor} p-4 lg:p-8`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className={`p-2 rounded-xl ${cardBg} border ${borderColor} ${textColor} hover:text-blue-400 transition-colors`}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className={`text-2xl font-bold ${textColor}`}>Estatísticas</h1>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: clients.length, icon: Users, color: 'blue' },
            { label: 'Ativos', value: activeClients, icon: UserCheck, color: 'emerald' },
            { label: 'Bloqueados', value: blockedClients, icon: UserX, color: 'red' },
            { label: 'Expirados', value: expiredClients, icon: Clock, color: 'amber' },
          ].map((stat, i) => (
            <div key={i} className={`${cardBg} rounded-xl p-4 border ${borderColor}`}>
              <div className="flex items-center gap-3">
                <stat.icon className={`text-${stat.color}-400`} size={24} />
                <div>
                  <p className={`text-sm ${textGray}`}>{stat.label}</p>
                  <p className={`text-xl font-bold ${textColor}`}>{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={`${cardBg} rounded-xl p-6 border ${borderColor} mb-8`}>
          <h2 className={`text-lg font-semibold ${textColor} mb-6`}>Distribuição de Status</h2>
          <div className="flex h-8 rounded-full overflow-hidden bg-gray-700">
            <div style={{ width: `${activePercent}%` }} className="bg-emerald-500 transition-all duration-500"></div>
            <div style={{ width: `${blockedPercent}%` }} className="bg-red-500 transition-all duration-500"></div>
            <div style={{ width: `${expiredPercent}%` }} className="bg-amber-500 transition-all duration-500"></div>
          </div>
          <div className="flex gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className={`text-sm ${textGray}`}>Ativos ({activeClients})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className={`text-sm ${textGray}`}>Bloqueados ({blockedClients})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className={`text-sm ${textGray}`}>Expirados ({expiredClients})</span>
            </div>
          </div>
        </div>

        <div className={`${cardBg} rounded-xl p-6 border ${borderColor}`}>
          <h2 className={`text-lg font-semibold ${textColor} mb-6`}>Clientes por Mês</h2>
          {monthData.length === 0 ? (
            <p className={`${textGray} text-center py-8`}>Sem dados disponíveis</p>
          ) : (
            <div className="space-y-3">
              {monthData.map(([month, count]) => {
                const [year, m] = month.split('-');
                const monthName = new Date(parseInt(year), parseInt(m) - 1).toLocaleString('pt-BR', { month: 'short' });
                return (
                  <div key={month} className="flex items-center gap-3">
                    <span className={`text-sm ${textGray} w-12`}>{monthName}/{year.slice(2)}</span>
                    <div className="flex-1 h-6 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                        style={{ width: `${(count / maxMonthValue) * 100}%` }}
                      >
                        <span className="text-xs text-white font-medium">{count}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}