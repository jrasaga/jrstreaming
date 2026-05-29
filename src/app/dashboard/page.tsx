'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, UserCheck, UserX, Clock, LogOut, Menu, X, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Search, Sun, Moon, Play, XCircle, Smartphone, Monitor, Wifi, Calendar, Phone, Globe, MonitorSmartphone, Maximize2, Minimize2, Download, BarChart3, Copy, Check, ArrowUpDown, ArrowUp, ArrowDown, ScrollText, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, MessageCircle, StickyNote, Upload } from 'lucide-react';

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
  lastSeen: string;
  notes: string;
  watching: boolean;
  lastHeartbeat: any;
}

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [darkMode, setDarkMode] = useState(true);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<Client | null>(null);
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
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
    contato: '',
    notes: ''
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const container = document.createElement('div'); container.className = 'toast-container';
    const toastEl = document.createElement('div'); toastEl.className = `toast ${type}`; toastEl.textContent = message;
    container.appendChild(toastEl); document.body.appendChild(container);
    setTimeout(() => container.remove(), 3000);
  };

  const addLog = (action: string, clientName: string, details?: string) => {
    const stored = localStorage.getItem('activity_logs'); const logs = stored ? JSON.parse(stored) : [];
    logs.unshift({ id: Date.now().toString(), action, clientName, timestamp: new Date().toISOString(), details: details || '' });
    if (logs.length > 100) logs.pop(); localStorage.setItem('activity_logs', JSON.stringify(logs));
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => { setCopiedField(field); showToast('Copiado!'); setTimeout(() => setCopiedField(null), 2000); });
  };

  const getOnlineStatus = (client: Client) => {
  if (!client.lastHeartbeat) return { online: false, text: 'Offline', color: 'bg-gray-500', textColor: 'text-gray-400' };
  
  let lastTime: number;
  if (typeof client.lastHeartbeat === 'object' && (client.lastHeartbeat as any)._seconds) {
    lastTime = (client.lastHeartbeat as any)._seconds * 1000;
  } else {
    lastTime = new Date(client.lastHeartbeat as string).getTime();
  }
  
  const diffSeconds = (Date.now() - lastTime) / 1000;
  
  if (diffSeconds < 120) return { online: true, text: 'Online', color: 'bg-emerald-400 animate-pulse', textColor: 'text-emerald-400' };
  return { online: false, text: 'Offline', color: 'bg-gray-500', textColor: 'text-gray-400' };
};

  const getLastSeenText = (lastSeen: string) => {
    if (!lastSeen) return 'Nunca';
    const diffMinutes = Math.floor((Date.now() - new Date(lastSeen).getTime()) / 60000);
    if (diffMinutes < 1) return 'Agora'; if (diffMinutes < 60) return `Há ${diffMinutes} min`;
    const diffHours = Math.floor(diffMinutes / 60); if (diffHours < 24) return `Há ${diffHours}h`;
    return `Há ${Math.floor(diffHours / 24)} dias`;
  };

  const exportToCSV = () => {
    const headers = ['Nome', 'Usuário', 'Senha', 'Device ID', 'MAC', 'URL Servidor', 'User-Agent', 'Status', 'Validade', 'Contato', 'Observações', 'Último Acesso'];
    const csvData = clients.map(c => [c.name, c.username, c.password, c.deviceId, c.mac, c.serverUrl, c.userAgent, c.status === 'active' ? 'Ativo' : c.status === 'blocked' ? 'Bloqueado' : 'Expirado', c.validade, c.contato, c.notes, getLastSeenText(c.lastSeen)]);
    const csvContent = [headers, ...csvData].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showToast('Clientes exportados!');
};

  const backupData = () => {
    const backup = { version: '1.0', date: new Date().toISOString(), clients: clients.map(({ id, ...rest }) => rest), logs: JSON.parse(localStorage.getItem('activity_logs') || '[]') };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }); const link = document.createElement('a');
    link.href = URL.createObjectURL(blob); link.download = `backup_jr_${new Date().toISOString().split('T')[0]}.json`; link.click(); showToast('Backup criado!');
  };

  const restoreData = () => {
    const input = document.createElement('input'); input.type = 'file'; input.accept = '.json';
    input.onchange = async (e: any) => {
      try {
        const file = e.target.files[0]; const text = await file.text(); const backup = JSON.parse(text);
        if (!backup.clients || !Array.isArray(backup.clients)) return showToast('Arquivo inválido', 'error');
        if (!confirm(`Importar ${backup.clients.length} clientes?`)) return;
        for (const c of clients) { await fetch(`/api/clients/${c.id}`, { method: 'DELETE' }); }
        for (const c of backup.clients) { await fetch('/api/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(c) }); }
        if (backup.logs) localStorage.setItem('activity_logs', JSON.stringify(backup.logs));
        showToast('Dados restaurados!'); loadClients();
      } catch { showToast('Erro ao importar', 'error'); }
    };
    input.click();
  };

  const getExpiryInfo = (validade: string, status: string) => {
    if (!validade) return { text: 'Sem data', color: 'text-gray-400' };
    const today = new Date(); today.setHours(0,0,0,0); const expiry = new Date(validade + 'T00:00:00');
    if (isNaN(expiry.getTime())) return { text: new Date(validade).toLocaleDateString('pt-BR'), color: 'text-gray-400' };
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / 86400000);
    if (status === 'expired' || diffDays < 0) return { text: `Expirado há ${Math.abs(diffDays)} dias`, color: 'text-red-400' };
    if (diffDays === 0) return { text: 'Expira hoje', color: 'text-amber-400' };
    if (diffDays <= 7) return { text: `Expira em ${diffDays} dias`, color: 'text-amber-400' };
    return { text: `Expira em ${diffDays} dias`, color: 'text-gray-400' };
  };

  const toggleSelect = (id: string) => { const ns = new Set(selectedClients); ns.has(id) ? ns.delete(id) : ns.add(id); setSelectedClients(ns); };
  const toggleSelectAll = () => { if (selectAll) { setSelectedClients(new Set()); setSelectAll(false); } else { setSelectedClients(new Set(paginatedClients.map(c => c.id))); setSelectAll(true); } };
  const bulkAction = async (action: 'activate' | 'block' | 'delete') => {
    if (selectedClients.size === 0) return showToast('Nenhum selecionado', 'error');
    if (!confirm(`${action === 'delete' ? 'Excluir' : action === 'activate' ? 'Ativar' : 'Bloquear'} ${selectedClients.size} clientes?`)) return;
    for (const id of selectedClients) {
      try {
        if (action === 'delete') { await fetch(`/api/clients/${id}`, { method: 'DELETE' }); addLog('deleted', clients.find(c => c.id === id)?.name || id); }
        else { const s = action === 'activate' ? 'active' : 'blocked'; const c = clients.find(cl => cl.id === id); if (!c) continue; await fetch(`/api/clients/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...c, status: s }) }); addLog(s === 'active' ? 'activated' : 'blocked', c.name); }
      } catch {}
    }
    showToast('Ação concluída!'); setSelectedClients(new Set()); setSelectAll(false); loadClients();
  };

  useEffect(() => {
  if (!localStorage.getItem('admin_logged')) { router.push('/login'); return; }
  loadClients();
  const t = localStorage.getItem('theme');
  if (t) setDarkMode(t === 'dark');
  const interval = setInterval(() => loadClients(), 10000);
  return () => clearInterval(interval);
}, []);
  useEffect(() => { localStorage.setItem('theme', darkMode ? 'dark' : 'light'); }, [darkMode]);
  const loadClients = async () => { try { const r = await fetch('/api/clients'); setClients(await r.json()); } catch (e) {} };
  const handleLogout = () => { localStorage.removeItem('admin_logged'); localStorage.removeItem('admin_token'); router.push('/login'); };
  const openNewModal = () => { setEditingClient(null); setFormData({ deviceId: '', name: '', mac: '', serverUrl: '', username: '', password: '', userAgent: '', status: 'active', validade: '', contato: '', notes: '' }); setModalOpen(true); };
  const openEditModal = (c: Client) => { setViewingClient(null); setEditingClient(c); setFormData({ deviceId: c.deviceId, name: c.name, mac: c.mac, serverUrl: c.serverUrl || '', username: c.username || '', password: c.password || '', userAgent: c.userAgent || '', status: c.status, validade: c.validade, contato: c.contato || '', notes: c.notes || '' }); setModalOpen(true); };
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); try { const url = editingClient ? `/api/clients/${editingClient.id}` : '/api/clients'; const method = editingClient ? 'PUT' : 'POST'; const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) }); if (!r.ok) throw new Error('Erro'); showToast(editingClient ? 'Cliente atualizado!' : 'Cliente criado!'); addLog(editingClient ? 'updated' : 'created', formData.name); setModalOpen(false); loadClients(); } catch { showToast('Erro ao salvar', 'error'); } };
  const toggleStatus = async (c: Client) => { const ns = c.status === 'active' ? 'blocked' : 'active'; try { const r = await fetch(`/api/clients/${c.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deviceId: c.deviceId, name: c.name, mac: c.mac, serverUrl: c.serverUrl, username: c.username, password: c.password, userAgent: c.userAgent, status: ns, validade: c.validade, contato: c.contato, notes: c.notes }) }); if (!r.ok) throw new Error('Erro'); showToast(`Cliente ${ns === 'active' ? 'ativado' : 'bloqueado'}!`); addLog(ns === 'active' ? 'activated' : 'blocked', c.name); loadClients(); } catch { showToast('Erro', 'error'); } };
  const handleDelete = (c: Client) => setDeleteModal(c);
  const confirmDelete = async () => { if (!deleteModal) return; try { const r = await fetch(`/api/clients/${deleteModal.id}`, { method: 'DELETE' }); if (r.ok) { setViewingClient(null); showToast('Cliente excluído!'); addLog('deleted', deleteModal.name); loadClients(); } } catch { showToast('Erro', 'error'); } setDeleteModal(null); };

  const getStatusColor = (s: string) => ({ active: 'bg-emerald-500/10 text-emerald-400', blocked: 'bg-red-500/10 text-red-400', expired: 'bg-amber-500/10 text-amber-400' }[s] || 'bg-gray-500/10 text-gray-400');
  const getStatusDot = (s: string) => ({ active: 'bg-emerald-400', blocked: 'bg-red-400', expired: 'bg-amber-400' }[s] || 'bg-gray-400');
  const getStatusText = (s: string) => ({ active: 'Ativo', blocked: 'Bloqueado', expired: 'Expirado' }[s] || s);
  const handleSort = (field: string) => { if (sortField === field) setSortDirection(d => d === 'asc' ? 'desc' : 'asc'); else { setSortField(field); setSortDirection('asc'); } setCurrentPage(1); };

  const filteredClients = clients.filter(c => { const ms = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.username.toLowerCase().includes(searchTerm.toLowerCase()) || c.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) || c.mac.toLowerCase().includes(searchTerm.toLowerCase()) || c.contato.toLowerCase().includes(searchTerm.toLowerCase()) || (c.notes && c.notes.toLowerCase().includes(searchTerm.toLowerCase())); return ms && (statusFilter === 'all' || c.status === statusFilter); });
  const sortedClients = [...filteredClients].sort((a, b) => { if (!sortField) return 0; const av = a[sortField as keyof Client] || '', bv = b[sortField as keyof Client] || ''; return sortDirection === 'asc' ? (av < bv ? -1 : av > bv ? 1 : 0) : (av < bv ? 1 : av > bv ? -1 : 0); });
  const totalPages = Math.ceil(sortedClients.length / itemsPerPage);
  const paginatedClients = sortedClients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const activeClients = clients.filter(c => c.status === 'active').length;
  const blockedClients = clients.filter(c => c.status === 'blocked').length;
  const expiredClients = clients.filter(c => c.status === 'expired').length;
  const stats = [
    { label: 'Total Clientes', value: clients.length, icon: Users, color: 'blue' },
    { label: 'Ativos', value: activeClients, icon: UserCheck, color: 'emerald' },
    { label: 'Bloqueados', value: blockedClients, icon: UserX, color: 'red' },
    { label: 'Expirados', value: expiredClients, icon: Clock, color: 'amber' },
  ];

  const bgColor = darkMode ? 'bg-gray-900' : 'bg-gray-50'; const sidebarBg = darkMode ? 'bg-gray-800' : 'bg-white'; const headerBg = darkMode ? 'bg-gray-800' : 'bg-white'; const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = darkMode ? 'text-white' : 'text-gray-900'; const textGray = darkMode ? 'text-gray-400' : 'text-gray-500'; const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  const inputBg = darkMode ? 'bg-gray-700' : 'bg-gray-50'; const inputBorder = darkMode ? 'border-gray-600' : 'border-gray-300'; const hoverBg = darkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50';

const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) return numbers.length ? `(${numbers}` : '';
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)})${numbers.slice(2)}`;
  if (numbers.length <= 11) return `(${numbers.slice(0, 2)})${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  return `(${numbers.slice(0, 2)})${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
};

  return (
    <div className={`min-h-screen ${bgColor} flex transition-colors duration-200`}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      {!fullscreen && (
        <div className={`fixed lg:static inset-y-0 left-0 z-30 w-64 ${sidebarBg} border-r ${borderColor} transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8"><div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20"><Play size={20} className="text-white" fill="white" /></div><div><button onClick={() => { setSidebarOpen(false); window.location.reload(); }} className={`text-sm font-bold ${textColor} hover:text-blue-400 transition-colors`}>JR STREAMING</button><p className="text-xs text-gray-400">Painel</p></div><button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white ml-auto"><X size={24} /></button></div>
            <nav className="space-y-1">
              <button onClick={() => window.location.reload()} className="flex items-center gap-3 px-4 py-3 bg-blue-600/20 text-blue-400 rounded-xl w-full text-left"><Users size={20} /><span className="font-medium">Clientes</span></button>
              <a href="/dashboard/estatisticas" className={`flex items-center gap-3 px-4 py-3 ${textGray} hover:text-white rounded-xl ${hoverBg} transition-colors`}><BarChart3 size={20} /><span>Estatísticas</span></a>
              <a href="/dashboard/logs" className={`flex items-center gap-3 px-4 py-3 ${textGray} hover:text-white rounded-xl ${hoverBg} transition-colors`}><ScrollText size={20} /><span>Logs</span></a>
              <a href="#" onClick={e => { e.preventDefault(); backupData(); }} className={`flex items-center gap-3 px-4 py-3 ${textGray} hover:text-white rounded-xl ${hoverBg} transition-colors`}><Download size={20} /><span>Backup</span></a>
              <a href="#" onClick={e => { e.preventDefault(); restoreData(); }} className={`flex items-center gap-3 px-4 py-3 ${textGray} hover:text-white rounded-xl ${hoverBg} transition-colors`}><Upload size={20} /><span>Restaurar</span></a>
            </nav>
          </div>
          <div className={`absolute bottom-0 left-0 right-0 p-6 border-t ${borderColor}`}>
            <button onClick={() => setDarkMode(!darkMode)} className={`flex items-center gap-3 px-4 py-3 ${textGray} hover:${textColor} w-full rounded-xl ${hoverBg} transition-colors mb-2`}>{darkMode ? <Sun size={20} /> : <Moon size={20} />}<span>{darkMode ? 'Tema Claro' : 'Tema Escuro'}</span></button>
            <button onClick={handleLogout} className={`flex items-center gap-3 px-4 py-3 ${textGray} hover:text-red-400 w-full rounded-xl ${hoverBg} transition-colors`}><LogOut size={20} /><span>Sair</span></button>
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col min-h-screen">
        {!fullscreen && <header className={`${headerBg} border-b ${borderColor} p-4`}><div className="flex items-center justify-between"><button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white"><Menu size={24} /></button><h2 className={`text-lg font-semibold ${textColor} lg:hidden`}>Dashboard</h2><div className="hidden lg:block"></div></div></header>}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {!fullscreen && <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">{stats.map((s, i) => (<div key={i} className={`${cardBg} rounded-xl p-4 lg:p-6 border ${borderColor}`}><div className="flex items-center gap-3 lg:gap-4"><div className={`p-2 lg:p-3 rounded-lg bg-${s.color}-500/10`}><s.icon className={`text-${s.color}-400`} size={20} /></div><div><p className={`text-xs lg:text-sm ${textGray}`}>{s.label}</p><p className={`text-lg lg:text-2xl font-bold ${textColor}`}>{s.value}</p></div></div></div>))}</div>}
          <div className={`${cardBg} rounded-xl border ${borderColor} ${fullscreen ? 'fixed inset-0 z-50 overflow-auto rounded-none' : ''}`}>
            <div className="p-4 lg:p-6 border-b border-gray-700">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  <h3 className={`text-lg font-semibold ${textColor}`}>Clientes</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative"><Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textGray}`} /><input type="text" placeholder="Buscar cliente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={`w-full sm:w-64 pl-10 pr-4 py-2 ${inputBg} border ${inputBorder} rounded-xl ${textColor} placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm`} /></div>
                    <button onClick={exportToCSV} className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"><Download size={18} /></button>
                    <button onClick={() => setFullscreen(!fullscreen)} className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors">{fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}</button>
                    <button onClick={openNewModal} className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap"><Plus size={18} /><span className="hidden sm:inline">Novo Cliente</span></button>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => { setStatusFilter('all'); setCurrentPage(1); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${statusFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Todos</button>
                  <button onClick={() => { setStatusFilter('active'); setCurrentPage(1); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${statusFilter === 'active' ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Ativos</button>
                  <button onClick={() => { setStatusFilter('blocked'); setCurrentPage(1); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${statusFilter === 'blocked' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Bloqueados</button>
                  <button onClick={() => { setStatusFilter('expired'); setCurrentPage(1); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${statusFilter === 'expired' ? 'bg-amber-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Expirados</button>
                </div>
              </div>
            </div>
            {selectedClients.size > 0 && (<div className="flex items-center gap-3 p-3 bg-blue-600/10 border-b border-blue-600/20"><span className={`text-sm ${textColor} font-medium`}>{selectedClients.size} selecionados</span><button onClick={() => bulkAction('activate')} className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs">Ativar</button><button onClick={() => bulkAction('block')} className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs">Bloquear</button><button onClick={() => bulkAction('delete')} className="px-3 py-1 bg-red-700 text-white rounded-lg text-xs">Excluir</button><button onClick={() => { setSelectedClients(new Set()); setSelectAll(false); }} className="px-3 py-1 bg-gray-600 text-white rounded-lg text-xs">Limpar</button></div>)}
            <div className="overflow-x-auto">
              {sortedClients.length === 0 ? (<div className="text-center py-12 text-gray-400"><Users size={48} className="mx-auto mb-4 opacity-50" /><p>{searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado ainda'}</p></div>) : (
                <table className="w-full">
                  <thead><tr className={`border-b ${borderColor}`}>
                    <th className="p-3 lg:p-4 w-10"><input type="checkbox" checked={selectAll} onChange={toggleSelectAll} className="w-4 h-4 rounded border-gray-500 bg-gray-700" /></th>
                    <th onClick={() => handleSort('name')} className={`text-left p-3 lg:p-4 text-sm font-medium ${textGray} cursor-pointer hover:text-white`}><div className="flex items-center gap-1">Nome{sortField === 'name' ? (sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-30" />}</div></th>
                    <th onClick={() => handleSort('username')} className={`text-left p-3 lg:p-4 text-sm font-medium ${textGray} cursor-pointer hover:text-white hidden sm:table-cell`}><div className="flex items-center gap-1">Usuário{sortField === 'username' ? (sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-30" />}</div></th>
                    <th className={`text-left p-3 lg:p-4 text-sm font-medium ${textGray} hidden md:table-cell`}>Device ID</th>
                    <th className={`text-left p-3 lg:p-4 text-sm font-medium ${textGray} hidden lg:table-cell`}>MAC</th>
                    <th className={`text-left p-3 lg:p-4 text-sm font-medium ${textGray} hidden xl:table-cell`}>Validade</th>
                    <th onClick={() => handleSort('status')} className={`text-left p-3 lg:p-4 text-sm font-medium ${textGray} cursor-pointer hover:text-white hidden md:table-cell`}><div className="flex items-center gap-1">Status{sortField === 'status' ? (sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} className="opacity-30" />}</div></th>
                    <th className={`text-left p-3 lg:p-4 text-sm font-medium ${textGray} hidden md:table-cell`}>Online</th>
                    <th className={`text-left p-3 lg:p-4 text-sm font-medium ${textGray}`}>Ações</th>
                  </tr></thead>
                  <tbody>
                    {paginatedClients.map(c => (
                      <tr key={c.id} className={`border-b ${borderColor} ${hoverBg} transition-colors cursor-pointer`} onClick={() => setViewingClient(c)}>
                        <td className="p-3 lg:p-4" onClick={e => e.stopPropagation()}><input type="checkbox" checked={selectedClients.has(c.id)} onChange={() => toggleSelect(c.id)} className="w-4 h-4 rounded border-gray-500 bg-gray-700" /></td>
                        <td className={`p-3 lg:p-4 ${textColor}`}><span className="font-medium">{c.name}</span>{(() => { const s = getOnlineStatus(c); return s.online && <span className="inline-flex items-center ml-2 md:hidden"><div className={`w-2 h-2 rounded-full ${s.color}`}></div></span>; })()}{c.notes && <span title={c.notes}><StickyNote size={14} className="inline ml-2 text-yellow-400" /></span>}{c.contato && <a href={`https://wa.me/55${c.contato.replace(/\D/g, '')}`} target="_blank" onClick={e => e.stopPropagation()} className="inline-flex items-center ml-2 text-green-400 hover:text-green-300"><MessageCircle size={14} /></a>}</td>
                        <td className="p-3 lg:p-4 text-gray-300 hidden sm:table-cell">{c.username}</td>
                        <td className="p-3 lg:p-4 text-gray-300 hidden md:table-cell text-xs font-mono"><div className="flex items-center gap-2"><span>{c.deviceId}</span><button onClick={e => { e.stopPropagation(); copyToClipboard(c.deviceId, `device-${c.id}`); }}>{copiedField === `device-${c.id}` ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-gray-400 hover:text-white" />}</button></div></td>
                        <td className="p-3 lg:p-4 text-gray-300 hidden lg:table-cell text-sm font-mono"><div className="flex items-center gap-2"><span>{c.mac}</span><button onClick={e => { e.stopPropagation(); copyToClipboard(c.mac, `mac-${c.id}`); }}>{copiedField === `mac-${c.id}` ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-gray-400 hover:text-white" />}</button></div></td>
                        <td className="p-3 lg:p-4 hidden xl:table-cell">{(() => { const info = getExpiryInfo(c.validade, c.status); return <div><span className={info.color}>{info.text}</span><p className="text-xs text-gray-500">{new Date(c.validade).toLocaleDateString('pt-BR')}</p></div>; })()}</td>
                        <td className="p-3 lg:p-4 hidden md:table-cell" onClick={e => e.stopPropagation()}><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(c.status)}`}>{getStatusText(c.status)}</span></td>
                        <td className="p-3 lg:p-4 hidden md:table-cell" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            {(() => { const s = getOnlineStatus(c); return <><div className={`w-2 h-2 rounded-full ${s.color}`}></div><span className={`text-xs font-medium ${s.textColor}`}>{s.text}</span></>; })()}
                          </div>
                        </td>
                        <td className="p-3 lg:p-4" onClick={e => e.stopPropagation()}><div className="flex gap-1 lg:gap-2"><button onClick={() => toggleStatus(c)} className={`p-1.5 lg:p-2 rounded-lg ${c.status === 'active' ? 'text-emerald-400 hover:bg-emerald-400/10' : 'text-red-400 hover:bg-red-400/10'}`}>{c.status === 'active' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}</button><button onClick={() => openEditModal(c)} className="p-1.5 lg:p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg"><Pencil size={16} /></button><button onClick={e => { e.stopPropagation(); handleDelete(c); }} className="p-1.5 lg:p-2 text-red-400 hover:bg-red-400/10 rounded-lg"><Trash2 size={16} /></button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {sortedClients.length > itemsPerPage && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-gray-700">
                <div className="flex items-center gap-2"><span className={`text-sm ${textGray}`}>Itens:</span><select value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className={`px-2 py-1 ${inputBg} border ${inputBorder} rounded-lg ${textColor} text-sm`}><option value="10">10</option><option value="25">25</option><option value="50">50</option><option value="100">100</option></select></div>
                <div className="flex items-center gap-2"><span className={`text-sm ${textGray}`}>{((currentPage-1)*itemsPerPage)+1}-{Math.min(currentPage*itemsPerPage, sortedClients.length)} de {sortedClients.length}</span>
                  <div className="flex gap-1">
                    <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className={`p-1.5 rounded-lg ${currentPage === 1 ? 'text-gray-600' : `${textGray} hover:text-white hover:bg-gray-700`}`}><ArrowLeft size={16} /></button>
                    <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className={`p-1.5 rounded-lg ${currentPage === 1 ? 'text-gray-600' : `${textGray} hover:text-white hover:bg-gray-700`}`}><ChevronLeft size={16} /></button>
                    {Array.from({length: totalPages}, (_,i) => i+1).filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1).map((page, idx, arr) => (<div key={page} className="flex gap-1">{idx > 0 && arr[idx-1] !== page-1 && <span className={`px-1 ${textGray}`}>...</span>}<button onClick={() => setCurrentPage(page)} className={`w-8 h-8 rounded-lg text-sm font-medium ${currentPage === page ? 'bg-blue-600 text-white' : `${textGray} hover:text-white hover:bg-gray-700`}`}>{page}</button></div>))}
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className={`p-1.5 rounded-lg ${currentPage === totalPages ? 'text-gray-600' : `${textGray} hover:text-white hover:bg-gray-700`}`}><ChevronRight size={16} /></button>
                    <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className={`p-1.5 rounded-lg ${currentPage === totalPages ? 'text-gray-600' : `${textGray} hover:text-white hover:bg-gray-700`}`}><ArrowRight size={16} /></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {viewingClient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewingClient(null)}>
          <div className={`${cardBg} rounded-2xl border ${borderColor} w-full max-w-md overflow-hidden shadow-2xl`} onClick={e => e.stopPropagation()}>
            <div className={`p-6 border-b ${borderColor} flex items-center justify-between`}><div className="flex items-center gap-3"><div className={`w-3 h-3 rounded-full ${getStatusDot(viewingClient.status)} animate-pulse`} /><h3 className={`text-lg font-semibold ${textColor}`}>{viewingClient.name}</h3></div><button onClick={() => setViewingClient(null)} className={`p-1.5 rounded-lg ${hoverBg} ${textGray} hover:text-red-400`}><XCircle size={20} /></button></div>
            <div className="p-6 space-y-4">
              {[
  { icon: Smartphone, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Device ID', value: viewingClient.deviceId, field: 'view-device' },
  { icon: Monitor, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'MAC Address', value: viewingClient.mac, field: 'view-mac' },
  { icon: Globe, color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'URL do Servidor', value: viewingClient.serverUrl, field: 'view-url' },
  { icon: Wifi, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Usuário / Senha', value: `${viewingClient.username || '—'} / ${viewingClient.password || '—'}`, field: '' },
  { icon: MonitorSmartphone, color: 'text-indigo-400', bg: 'bg-indigo-500/10', label: 'User-Agent', value: viewingClient.userAgent, field: 'view-useragent' },
  { icon: Calendar, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Validade', value: new Date(viewingClient.validade).toLocaleDateString('pt-BR'), field: '' },
  { icon: Phone, color: 'text-rose-400', bg: 'bg-rose-500/10', label: 'Contato', value: viewingClient.contato, field: 'view-contato' }
].map((item, i) => (
  <div key={i} className="flex items-center gap-3">
    <div className={`p-2 rounded-lg ${item.bg}`}><item.icon size={18} className={item.color} /></div>
    <div className="flex-1">
      <p className={`text-xs ${textGray}`}>{item.label}</p>
      <div className="flex items-center gap-2">
        <p className={`text-sm ${item.field ? 'font-mono' : ''} ${textColor} ${item.label === 'URL do Servidor' || item.label === 'User-Agent' ? 'break-all' : ''}`}>{item.value || '—'}</p>
        {item.field && item.value && <button onClick={() => copyToClipboard(item.value, item.field)} className="text-gray-400 hover:text-white flex-shrink-0">{copiedField === item.field ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}</button>}
      </div>
    </div>
  </div>
))}
              {viewingClient.notes && (<div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-yellow-500/10"><StickyNote size={18} className="text-yellow-400" /></div><div className="flex-1"><p className={`text-xs ${textGray}`}>Observações</p><p className={`text-sm ${textColor}`}>{viewingClient.notes}</p></div></div>)}
              <div className="flex items-center gap-3"><div className={`p-2 rounded-lg ${getStatusColor(viewingClient.status)}`}><div className={`w-4 h-4 rounded-full ${getStatusDot(viewingClient.status)}`} /></div><div className="flex-1"><p className={`text-xs ${textGray}`}>Status</p><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(viewingClient.status)}`}>{getStatusText(viewingClient.status)}</span></div></div>
            </div>
            <div className={`p-4 border-t ${borderColor} flex gap-3`}><button onClick={() => openEditModal(viewingClient)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium"><Pencil size={16} />Editar</button><button onClick={() => setViewingClient(null)} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 ${inputBg} border ${inputBorder} ${textColor} rounded-xl text-sm font-medium ${hoverBg}`}><XCircle size={16} />Fechar</button></div>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`${cardBg} rounded-2xl border ${borderColor} w-full max-w-sm p-6 shadow-2xl`}><div className="text-center"><div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={24} className="text-red-400" /></div><h3 className={`text-lg font-semibold ${textColor} mb-2`}>Excluir Cliente</h3><p className={`text-sm ${textGray} mb-6`}>Tem certeza que deseja excluir <strong className={textColor}>{deleteModal.name}</strong>?</p></div><div className="flex gap-3"><button onClick={() => setDeleteModal(null)} className={`flex-1 px-4 py-2 ${inputBg} border ${inputBorder} ${textColor} rounded-xl text-sm font-medium ${hoverBg}`}>Cancelar</button><button onClick={confirmDelete} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium">Excluir</button></div></div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`${cardBg} rounded-xl border ${borderColor} w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 border-b ${borderColor}`}><h3 className={`text-lg font-semibold ${textColor}`}>{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</h3></div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className={`block text-sm font-medium ${textGray} mb-1`}>Nome</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-lg ${textColor} focus:outline-none focus:border-blue-500`} required /></div>
              <div><label className={`block text-sm font-medium ${textGray} mb-1`}>Device ID</label><input type="text" value={formData.deviceId} onChange={e => setFormData({...formData, deviceId: e.target.value})} className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-lg ${textColor} focus:outline-none focus:border-blue-500`} required /></div>
              <div><label className={`block text-sm font-medium ${textGray} mb-1`}>MAC</label><input type="text" value={formData.mac} onChange={e => setFormData({...formData, mac: e.target.value})} className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-lg ${textColor} focus:outline-none focus:border-blue-500`} placeholder="00:00:00:00:00:00" /></div>
              <div><label className={`block text-sm font-medium ${textGray} mb-1`}>URL do Servidor</label><input type="text" value={formData.serverUrl} onChange={e => setFormData({...formData, serverUrl: e.target.value})} className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-lg ${textColor} focus:outline-none focus:border-blue-500`} placeholder="http://exemplo.com:8080" /></div>
              <div className="grid grid-cols-2 gap-4"><div><label className={`block text-sm font-medium ${textGray} mb-1`}>Usuário</label><input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-lg ${textColor} focus:outline-none focus:border-blue-500`} /></div><div><label className={`block text-sm font-medium ${textGray} mb-1`}>Senha</label><input type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-lg ${textColor} focus:outline-none focus:border-blue-500`} /></div></div>
              <div><label className={`block text-sm font-medium ${textGray} mb-1`}>User-Agent</label><input type="text" value={formData.userAgent} onChange={e => setFormData({...formData, userAgent: e.target.value})} className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-lg ${textColor} focus:outline-none focus:border-blue-500`} placeholder="Ex: Mozilla/5.0..." /></div>
              <div className="grid grid-cols-2 gap-4"><div><label className={`block text-sm font-medium ${textGray} mb-1`}>Status</label><select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-lg ${textColor} focus:outline-none focus:border-blue-500`}><option value="active">Ativo</option><option value="blocked">Bloqueado</option><option value="expired">Expirado</option></select></div><div><label className={`block text-sm font-medium ${textGray} mb-1`}>Validade</label><input type="date" value={formData.validade} onChange={e => setFormData({...formData, validade: e.target.value})} className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-lg ${textColor} focus:outline-none focus:border-blue-500`} required /></div></div>
              <div><label className={`block text-sm font-medium ${textGray} mb-1`}>Contato</label>
              <input
  type="text"
  value={formData.contato}
  onChange={e => setFormData({...formData, contato: formatPhone(e.target.value)})}
  className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-lg ${textColor} focus:outline-none focus:border-blue-500`}
  placeholder="(81)9.9999-9999"
  maxLength={15}
/></div>
              <div><label className={`block text-sm font-medium ${textGray} mb-1`}>Observações</label><textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={3} className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-lg ${textColor} focus:outline-none focus:border-blue-500 resize-none`} placeholder="Notas sobre o cliente..." /></div>
              <div className="flex gap-3 pt-4"><button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">Cancelar</button><button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg">{editingClient ? 'Salvar' : 'Adicionar'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}