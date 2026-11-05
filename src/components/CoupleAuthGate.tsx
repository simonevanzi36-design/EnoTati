import React, { useState } from 'react';
import { ArtisticLogo } from './ArtisticLogo';
import { Wine, Lock, KeyRound, Heart, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface CoupleAuthGateProps {
  onLoginSuccess: () => void;
}

export function CoupleAuthGate({ onLoginSuccess }: CoupleAuthGateProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const cleanUser = username.trim().toUpperCase();
    const cleanPass = password.trim().toUpperCase();

    // Check strict credentials as requested:
    // Username: ITATI
    // Password: IBBINO
    if (cleanUser === 'ITATI' && cleanPass === 'IBBINO') {
      try {
        localStorage.setItem('enotati_auth', 'true');
      } catch (err) {
        console.error(err);
      }
      setTimeout(() => {
        onLoginSuccess();
      }, 350);
    } else {
      setIsSubmitting(false);
      setErrorMessage('Credenziali non corrette. Questo diario è riservato esclusivamente a Tato & Tata!');
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full bg-[#0d070a] text-[#f5ebd7] flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background ambient cellar glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#722f37]/25 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#d4af37]/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#3a1523]/30 rounded-full blur-[100px]" />
      </div>

      {/* Top minimal bar */}
      <header className="relative z-10 w-full px-6 py-5 flex items-center justify-between border-b border-[#d4af37]/15">
        <div className="flex items-center gap-3">
          <ArtisticLogo className="w-10 h-10" />
          <div>
            <span className="font-cinzel text-xl font-bold tracking-wider text-[#f5ebd7]">
              Eno<span className="text-[#d4af37] font-serif italic">Tati</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/25 text-xs text-[#d4af37]">
          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
          <span className="font-serif">Diario di coppia</span>
        </div>
      </header>

      {/* Main card container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md bg-[#160c11]/90 backdrop-blur-xl border border-[#d4af37]/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-6">
          {/* Couple welcoming header */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-br from-[#722f37] to-[#3a131f] border border-[#d4af37]/40 shadow-inner mb-2">
              <Wine className="w-8 h-8 text-[#d4af37]" />
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-wide">
              Benvenuti in EnoTati
            </h1>

            <p className="text-xs sm:text-sm text-[#d1b8ab] font-sans leading-relaxed max-w-xs mx-auto">
              La nostra cantina privata, i calici assaggiati insieme e i ricordi più dolci di Tato e Tata.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold text-[#e8d5be] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#d4af37]" />
                Nome utente
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  autoComplete="username"
                  autoCapitalize="characters"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Inserisci username"
                  className="w-full px-4 py-3.5 rounded-xl bg-black/50 border border-white/15 focus:border-[#d4af37] text-white text-base outline-none transition-all placeholder:text-zinc-500"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-[#e8d5be] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#d4af37]" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Inserisci password"
                  className="w-full pl-4 pr-12 py-3.5 rounded-xl bg-black/50 border border-white/15 focus:border-[#d4af37] text-white text-base outline-none transition-all placeholder:text-zinc-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#baa49c] hover:text-white p-1 transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-600/60 text-xs text-rose-200 text-center animate-in fade-in duration-200">
                {errorMessage}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#8a1c2f] via-[#aa2740] to-[#722f37] hover:brightness-110 active:scale-[0.98] text-white text-sm font-semibold tracking-wide shadow-lg shadow-rose-950/50 border border-[#d4af37]/40 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-[#d4af37]" />
                  Apertura cantina...
                </>
              ) : (
                <>
                  <span>Entra nella nostra cantina</span>
                  <ArrowRight className="w-4 h-4 text-[#d4af37]" />
                </>
              )}
            </button>
          </form>

          {/* Discreet couple reminder */}
          <div className="pt-3 border-t border-white/10 text-center space-y-1">
            <p className="text-[11px] text-[#baa49c] font-sans">
              Accesso riservato alla coppia • <span className="text-[#d4af37]">Tato & Tata</span>
            </p>
          </div>
        </div>
      </main>

      {/* Footer quote */}
      <footer className="relative z-10 w-full py-4 text-center border-t border-[#d4af37]/10">
        <p className="text-[11px] text-[#baa49c] font-serif italic">
          "Un brindisi a noi, a ogni bottiglia aperta e a quelle ancora da scoprire insieme."
        </p>
      </footer>
    </div>
  );
}
