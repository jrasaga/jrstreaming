'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Smartphone, Check } from 'lucide-react';

export default function ConfiguracoesPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [versionCode, setVersionCode] = useState('25');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const logged = localStorage.getItem('admin_logged');
    if (!logged) { router.push('/login'); return; }
    const t = localStorage.getItem('theme');
    if (t) setDarkMode(t === 'dark');
    
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setVersionCode(String(data?.versionCode || '25'));
        setDownloadUrl(data?.downloadUrl || '');
      }
    } catch (error) {}
  };

  const saveConfig = async () => {
    setLoading(true);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageName: 'com.jr.streaming',
          versionCode,
          downloadUrl
        })
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      alert('Erro ao salvar');
    }
    setLoading(false);
  };

  const bgColor = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = darkMode ? 'text-white' : 'text-gray-900';
  const textGray = darkMode ? 'text-gray-400' : 'text-gray-500';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  const inputBg = darkMode ? 'bg-gray-700' : 'bg-gray-50';
  const inputBorder = darkMode ? 'border-gray-600' : 'border-gray-300';

  return (
    <div className={`min-h-screen ${bgColor} p-4 lg:p-8`}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push('/dashboard')} className={`p-2 rounded-xl ${cardBg} border ${borderColor} ${textColor} hover:text-blue-400`}>
            <ArrowLeft size={20} />
          </button>
          <h1 className={`text-2xl font-bold ${textColor}`}>Configurações de Update</h1>
        </div>

        <div className={`${cardBg} rounded-xl p-6 border ${borderColor}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Smartphone size={24} className="text-blue-400" />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${textColor}`}>Atualização do APK</h2>
              <p className={`text-sm ${textGray}`}>Configure a versão e link de download</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${textGray} mb-1`}>Version Code (número)</label>
              <input
                type="number"
                value={versionCode}
                onChange={(e) => setVersionCode(e.target.value)}
                className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-lg ${textColor}`}
                placeholder="Ex: 25"
              />
              <p className={`text-xs ${textGray} mt-1`}>Deve ser maior que o versionCode atual do APK (24)</p>
            </div>

            <div>
              <label className={`block text-sm font-medium ${textGray} mb-1`}>URL do APK (Dropbox com dl=1)</label>
              <input
                type="text"
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                className={`w-full px-3 py-2 ${inputBg} border ${inputBorder} rounded-lg ${textColor}`}
                placeholder="https://www.dropbox.com/scl/fi/...&dl=1"
              />
            </div>

            <button
              onClick={saveConfig}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl font-medium disabled:opacity-50"
            >
              {saved ? <Check size={18} /> : <Save size={18} />}
              {saved ? 'Salvo!' : loading ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}