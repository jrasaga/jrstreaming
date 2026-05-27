'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('admin_logged', 'true');
        localStorage.setItem('admin_token', data.token);
        router.push('/dashboard');
      } else {
        setError(data.message || 'Email ou senha inválidos');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo JR STREAMING */}
        <div className="text-center mb-12">
          {/* Botão Play animado */}
          <div className="inline-flex items-center justify-center mb-8 relative">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <div className="relative w-16 h-16 rounded-full border-2 border-blue-500 flex items-center justify-center">
              <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[16px] border-l-blue-500 ml-1"></div>
            </div>
            {/* Anel girando */}
            <svg className="absolute w-20 h-20 animate-spin-slow" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="38" fill="none" stroke="rgba(59,130,246,0.2)" strokeWidth="1" strokeDasharray="10 5" />
            </svg>
          </div>

          {/* Texto JR estilizado */}
          <h1 className="text-5xl font-black tracking-tighter text-white mb-2">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              JR
            </span>
          </h1>
          
          {/* Streaming com efeito */}
          <div className="flex items-center justify-center gap-1">
            <span className="text-gray-500 text-sm font-light tracking-[0.3em] uppercase">Streaming</span>
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Card de login */}
        <div className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-blue-600 transition-all"
              placeholder="Email"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-blue-600 transition-all pr-12"
                placeholder="Senha"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <p className="text-red-400 text-xs text-center py-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-black text-sm font-medium py-3 px-4 rounded-xl transition-all duration-200"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}