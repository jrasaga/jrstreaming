'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, UserCheck, UserX, Clock, LogOut, Menu, X, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Search, Sun, Moon, Play, XCircle, Smartphone, Monitor, Wifi, Calendar, Phone, Globe, MonitorSmartphone } from 'lucide-react';

interface Client {
  id: string;
  deviceId: string;
  name: string;
  mac: string;
  serverUrl: string;
  username: string;
  password: string;
  userAgent: string;
  status: string;
  validade: string;
  contato: string;
}

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    deviceId: '',
    name: '',
    mac: '',
    serverUrl: '',
    username: '',
    password: '',
    userAgent: '',
    status: 'active',
    validade: '',
    contato: ''
  });

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

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const loadClients = async () => {
    try {
      const res = await fetch('/api/clients');
      const data = await res.json();
      setClients(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_logged');
    localStorage.removeItem('admin_token');
    router.push('/login');
  };

  const openNewModal = () => {
    setEditingClient(null);
    setFormData({
      deviceId: '',
      name: '',
      mac: '',
      serverUrl: '',
      username: '',
      password: '',
      userAgent: '',
      status: 'active',
      validade: '',
      contato: ''
    });
    setModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setViewingClient(null);
    setEditingClient(client);
    setFormData({
      deviceId: client.deviceId,
      name: client.name,
      mac: client.mac,
      serverUrl: client.serverUrl || '',
      username: client.username,
      password: client.password,
      userAgent: client.userAgent || '',
      status: client.status,
      validade: client.validade,
      contato: client.contato
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClient) {
        const res = await fetch(`/api/clients/${editingClient.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error('Erro ao atualizar');
      } else {
        const res = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error('Erro ao criar');
      }
      setModalOpen(false);
      loadClients();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert('Erro ao salvar cliente');
    }
  };

  const toggleStatus = async (client: Client) => {
    const newStatus = client.status === 'active' ? 'blocked' : 'active';
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: client.deviceId,
          name: client.name,
          mac: client.mac,
          serverUrl: client.serverUrl,
          username: client.username,
          password: client.password,
          userAgent: client.userAgent,
          status: newStatus,
          validade: client.validade,
          contato: client.contato
        })
      });
      if (!res.ok) throw new Error('Erro ao atualizar status');
      loadClients();
    } catch (error) {
      console.error('Erro ao alternar status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setViewingClient(null);
          loadClients();
        } else {
          const data = await res.json();
          alert(data.error || 'Erro ao excluir cliente');
        }
      } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        loadClients();
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/10 text-emerald-400';
      case 'blocked': return 'bg-red-500/10 text-red-400';
      case 'expired': return 'bg-amber-500/10 text-amber-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-400';
      case 'blocked': return 'bg-red-400';
      case 'expired': return 'bg-amber-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'blocked': return 'Bloqueado';
      case 'expired': return 'Expirado';
      default: return status;
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.mac.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contato.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeClients = clients.filter(c => c.status === 'active').length;
  const blockedClients = clients.filter(c => c.status === 'blocked').length;
  const expiredClients = clients.filter(c => c.status === 'expired').length;

  const stats = [
    { label: 'Total Clientes', value: clients.length, icon: Users, color: 'blue' },
    { label: 'Ativos', value: activeClients, icon: UserCheck, color: 'emerald' },
    { label: 'Bloqueados', value: blockedClients, icon: UserX, color: 'red' },
    { label: 'Expirados', value: expiredClients, icon: Clock, color: 'amber' },
  ];

  const bgColor = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const sidebarBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const headerBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = darkMode ? 'text-white' : 'text-gray-900';
  const textGray = darkMode ? 'text-gray-400' : 'text-gray-500';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  const inputBg = darkMode ? 'bg-gray-700' : 'bg-gray-50';
  const inputBorder = darkMode ? 'border-gray-600' : 'border-gray-300';
  const hoverBg = darkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50';

  return (
    <div className={`min-h-screen ${bgColor} flex transition-colors duration-200`}>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 ${sidebarBg} border-r ${borderColor}
        transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Play size={20} className="text-white" fill="white" />
            </div>
            <div>
              <button onClick={() => { setSidebarOpen(false); window.location.reload(); }} className={`text-sm font-bold ${textColor} hover:text-blue-400 transition-colors`}>
                Painel JR
              </button>
              <p className="text-xs text-gray-400">Streaming</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white ml-auto"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-3 px-4 py-3 bg-blue-600/20 text-blue-400 rounded-xl w-full text-left"
            >
              <Users size={20} />
              <span className="font-medium">Clientes</span>
            </button>
          </nav>
        </div>

        <div className={`absolute bottom-0 left-0 right-0 p-6 border-t ${borderColor}`}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`flex items-center gap-3 px-4 py-3 ${textGray} hover:${textColor} w-full rounded-xl ${hoverBg} transition-colors mb-2`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span>{darkMode ? 'Tema Claro' : 'Tema Escuro'}</span>
          </button>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-4 py-3 ${textGray} hover:text-red-400 w-full rounded-xl ${hoverBg} transition-colors`}
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className={`${headerBg} border-b ${borderColor} p-4`}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <Menu size={24} />
            </button>
            <h2 className={`text-lg font-semibold ${textColor} lg:hidden`}>Dashboard</h2>
            <div className="hidden lg:block"></div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`${cardBg} rounded-xl p-4 lg:p-6 border ${borderColor}`}
              >
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className={`p-2 lg:p-3 rounded-lg bg-${stat.color}-500/10`}>
                    <stat.icon className={`text-${stat.color}-400`} size={20} />
                  </div>
                  <div>
                    <p className={`text-xs lg:text-sm ${textGray}`}>{stat.label}</p>
                    <p className={`text-lg lg:text-2xl font-bold ${textColor}`}>{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={`${cardBg} rounded-xl border ${borderColor}`}>
            <div className="p-4 lg:p-6 border-b border-gray-700">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <h3 className={`text-lg font-semibold ${textColor}`}>Clientes</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textGray}`} />
                    <input
                      type="text"
                      placeholder="Buscar cliente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full sm:w-64 pl-10 pr-4 py-2 ${inputBg} border ${inputBorder} rounded-xl ${textColor} placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm`}
                    />
                  </div>
                  <button
                    onClick={openNewModal}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-600/20 whitespace-nowrap"
                  >
                    <Plus size={18} />
                    <span className="hidden sm:inline">Novo Cliente</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {filteredClients.length === 0 && searchTerm ? (
                <div className="text-center py-12 text-gray-400">
                  <Search size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Nenhum cliente encontrado</p>
                  <p className="text-sm mt-1">Tente outro termo de busca</p>
                </div>
              ) : clients.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Nenhum cliente cadastrado ainda</p>
                  <p className="text-sm mt-1">Clique em "Novo Cliente" para começar</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${borderColor}`}>
                      <th className={`text-left p-3 lg:p-4 text-sm font-medium ${textGray}`}>Nome</th>
                      <th className={`text-left p-3 lg:p-4 text-sm font-medium ${textGray} hidden sm:table-cell`}>Usuário</th>
                      <th className={`text-left p-3 lg:p-4 text-sm font-medium ${textGray} hidden md:table-cell`}>Device ID</th>
                      <th className={`text-left p-3 lg:p-4 text-sm font-medium ${textGray} hidden lg:table-cell`}>MAC</th>
                      <th className={`text-left p-3 lg:p-4 text-sm font-medium ${textGray} hidden xl:table-cell`}>Validade</th>
                      <th className={`text-left p-3 lg:p-4 text-sm font-medium ${textGray} hidden md:table-cell`}>Status</th>
                      <th className={`text-left p-3 lg:p-4 text-sm font-medium ${textGray}`}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map((client) => (
                      <tr 
                        key={client.id} 
                        className={`border-b ${borderColor} ${hoverBg} transition-colors cursor-pointer`}
                        onClick={() => setViewingClient(client)}
                      >
                        <td className={`p-3 lg:p-4 ${textColor}`}>
                          <span className="font-medium">{client.name}</span>
                          <p className={`text-xs ${textGray} sm:hidden`}>{client.username}</p>
                        </td>
                        <td className={`p-3 lg:p-4 text-gray-300 hidden sm:table-cell`}>{client.username}</td>
                        <td className={`p-3 lg:p-4 text-gray-300 hidden md:table-cell text-xs font-mono`}>{client.deviceId}</td>
                        <td className={`p-3 lg:p-4 text-gray-300 hidden lg:table-cell text-sm font-mono`}>{client.mac}</td>
                        <td className={`p-3 lg:p-4 text-gray-300 hidden xl:table-cell`}>
                          {new Date(client.validade).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-3 lg:p-4 hidden md:table-cell" onClick={(e) => e.stopPropagation()}>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                            {getStatusText(client.status)}
                          </span>
                        </td>
                        <td className="p-3 lg:p-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-1 lg:gap-2">
                            <button
                              onClick={() => toggleStatus(client)}
                              className={`p-1.5 lg:p-2 rounded-lg transition-colors ${
                                client.status === 'active'
                                  ? 'text-emerald-400 hover:bg-emerald-400/10'
                                  : 'text-red-400 hover:bg-red-400/10'
                              }`}
                              title={client.status === 'active' ? 'Bloquear' : 'Ativar'}
                            >
                              {client.status === 'active' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                            </button>
                            <button
                              onClick={() => openEditModal(client)}
                              className="p-1.5 lg:p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg"
                              title="Editar"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(client.id)}
                              className="p-1.5 lg:p-2 text-red-400 hover:bg-red-400/10 rounded-lg"
                              title="Excluir"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Card de Visualização do Cliente */}
      {viewingClient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewingClient(null)}>
          <div className={`${cardBg} rounded-2xl border ${borderColor} w-full max-w-md overflow-hidden shadow-2xl`} onClick={(e) => e.stopPropagation()}>
            <div className={`p-6 border-b ${borderColor} flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusDot(viewingClient.status)} animate-pulse`} />
                <h3 className={`text-lg font-semibold ${textColor}`}>{viewingClient.name}</h3>
              </div>
              <button
                onClick={() => setViewingClient(null)}
                className={`p-1.5 rounded-lg ${hoverBg} ${textGray} hover:text-red-400 transition-colors`}
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Smartphone size={18} className="text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className={`text-xs ${textGray}`}>Device ID</p>
                  <p className={`text-sm font-mono ${textColor}`}>{viewingClient.deviceId}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Monitor size={18} className="text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className={`text-xs ${textGray}`}>MAC Address</p>
                  <p className={`text-sm font-mono ${textColor}`}>{viewingClient.mac || '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <Globe size={18} className="text-cyan-400" />
                </div>
                <div className="flex-1">
                  <p className={`text-xs ${textGray}`}>URL do Servidor</p>
                  <p className={`text-sm ${textColor} break-all`}>{viewingClient.serverUrl || '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Wifi size={18} className="text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className={`text-xs ${textGray}`}>Usuário / Senha</p>
                  <p className={`text-sm ${textColor}`}>{viewingClient.username} / {viewingClient.password}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10">
                  <MonitorSmartphone size={18} className="text-indigo-400" />
                </div>
                <div className="flex-1">
                  <p className={`text-xs ${textGray}`}>User-Agent</p>
                  <p className={`text-sm ${textColor} break-all`}>{viewingClient.userAgent || '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Calendar size={18} className="text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className={`text-xs ${textGray}`}>Validade</p>
                  <p className={`text-sm ${textColor}`}>{new Date(viewingClient.validade).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-500/10">
                  <Phone size={18} className="text-rose-400" />
                </div>
                <div className="flex-1">
                  <p className={`text-xs ${textGray}`}>Contato</p>
                  <p className={`text-sm ${textColor}`}>{viewingClient.contato || '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getStatusColor(viewingClient.status)}`}>
                  <div className={`w-4 h-4 rounded-full ${getStatusDot(viewingClient.status)}`} />
                </div>
                <div className="flex-1">
                  <p className={`text-xs ${textGray}`}>Status</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(viewingClient.status)}`}>
                    {getStatusText(viewingClient.status)}
                  </span>
                </div>
              </div>
            </div>

            <div className={`p-4 border-t ${borderColor} flex gap-3`}>
              <button
                onClick={() => openEditModal(viewingClient)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
              >
                <Pencil size={16} />
                Editar
              </button>
              <button
                onClick={() => setViewingClient(null)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 ${inputBg} border ${inputBorder} ${textColor} rounded-xl text-sm font-medium ${hoverBg} transition-colors`}
              >
                <XCircle size={16} />
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição/Criação */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`${cardBg} rounded-xl border ${borderColor} w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${borderColor}`}>
              <h3 className={`text-lg font-semibold ${textColor}`}>
                {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textGray} mb-1`}>Nome</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-lg ${textColor} focus:outline-none focus:border-blue-500`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textGray} mb-1`}>Device ID</label>
                <input
                  type="text"
                  value={formData.deviceId}
                  onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                  className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-lg ${textColor} focus:outline-none focus:border-blue-500`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textGray} mb-1`}>MAC</label>
                <input
                  type="text"
                  value={formData.mac}
                  onChange={(e) => setFormData({ ...formData, mac: e.target.value })}
                  className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-lg ${textColor} focus:outline-none focus:border-blue-500`}
                  placeholder="00:00:00:00:00:00"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textGray} mb-1`}>URL do Servidor</label>
                <input
                  type="text"
                  value={formData.serverUrl}
                  onChange={(e) => setFormData({ ...formData, serverUrl: e.target.value })}
                  className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-lg ${textColor} focus:outline-none focus:border-blue-500`}
                  placeholder="http://exemplo.com:8080"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${textGray} mb-1`}>Usuário</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-lg ${textColor} focus:outline-none focus:border-blue-500`}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textGray} mb-1`}>Senha</label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-lg ${textColor} focus:outline-none focus:border-blue-500`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${textGray} mb-1`}>User-Agent</label>
                <input
                  type="text"
                  value={formData.userAgent}
                  onChange={(e) => setFormData({ ...formData, userAgent: e.target.value })}
                  className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-lg ${textColor} focus:outline-none focus:border-blue-500`}
                  placeholder="Ex: Mozilla/5.0..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${textGray} mb-1`}>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-lg ${textColor} focus:outline-none focus:border-blue-500`}
                  >
                    <option value="active">Ativo</option>
                    <option value="blocked">Bloqueado</option>
                    <option value="expired">Expirado</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textGray} mb-1`}>Validade</label>
                  <input
                    type="date"
                    value={formData.validade}
                    onChange={(e) => setFormData({ ...formData, validade: e.target.value })}
                    className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-lg ${textColor} focus:outline-none focus:border-blue-500`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${textGray} mb-1`}>Contato</label>
                <input
                  type="text"
                  value={formData.contato}
                  onChange={(e) => setFormData({ ...formData, contato: e.target.value })}
                  className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-lg ${textColor} focus:outline-none focus:border-blue-500`}
                  placeholder="WhatsApp, telefone..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className={`flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all"
                >
                  {editingClient ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}