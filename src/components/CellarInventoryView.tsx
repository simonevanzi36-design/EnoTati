import React, { useState } from 'react';
import { WineItem, WineType } from '../types/wine';
import { getCellarInventorySummary } from '../utils/cellarStats';
import { ThreeBottleView } from './ThreeBottleView';
import { 
  Box, Wine, Plus, Minus, Clock, MapPin, DollarSign, ArrowUpRight, Search, ArrowLeft, Rotate3d, Image as ImageIcon 
} from 'lucide-react';

interface CellarInventoryViewProps {
  wines: WineItem[];
  onUpdateQuantity: (wineId: string, newQty: number) => void;
  onDrinkBottle: (wine: WineItem) => void;
  onStappaEDegusta: (wine: WineItem) => void;
  onOpenIdentityCard: (wine: WineItem) => void;
  onAddNewBottle: () => void;
  onGoBack?: () => void;
}

export function CellarInventoryView({
  wines,
  onUpdateQuantity,
  onDrinkBottle,
  onStappaEDegusta,
  onOpenIdentityCard,
  onAddNewBottle,
  onGoBack
}: CellarInventoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<WineType | 'ALL'>('ALL');
  const [bottleViewModes, setBottleViewModes] = useState<Record<string, '3d' | 'photo'>>({});

  const inventorySummary = getCellarInventorySummary(wines);

  const filteredBottles = inventorySummary.items.filter((wine) => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match = wine.name.toLowerCase().includes(q) || 
        wine.winery.toLowerCase().includes(q) || 
        wine.region.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedType !== 'ALL' && wine.type !== selectedType) {
      return false;
    }
    return true;
  });

  const toggleBottleViewMode = (wineId: string) => {
    setBottleViewModes(prev => ({
      ...prev,
      [wineId]: prev[wineId] === 'photo' ? '3d' : 'photo'
    }));
  };

  return (
    <div className="space-y-8">
      {/* Top Section Header with Title and Indietro */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#26131c] via-[#1a0c13] to-[#12080d] border border-[#d4af37]/25 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onGoBack && (
            <button
              onClick={onGoBack}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-[#d1b8ab] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Torna indietro"
            >
              <ArrowLeft className="w-4 h-4" />
              Indietro
            </button>
          )}
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide">
              La nostra cantinetta
            </h2>
            <p className="text-xs text-[#d1b8ab] mt-0.5">
              Le bottiglie custodite a casa pronte per essere aperte nei nostri momenti speciali
            </p>
          </div>
        </div>

        <button
          onClick={onAddNewBottle}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8a1c2f] to-[#b32b43] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow hover:brightness-110 whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#d4af37]" /> Aggiungi bottiglia
        </button>
      </div>

      {/* Cellar Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#26131c] to-[#150a0f] border border-[#d4af37]/25 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#baa49c] uppercase tracking-wider block">
              Bottiglie custodite
            </span>
            <div className="text-3xl font-serif font-bold text-white mt-1">
              {inventorySummary.totalBottlesCount}
            </div>
            <p className="text-xs text-[#d1b8ab] mt-1">
              su {inventorySummary.uniqueLabels} etichette differenti
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37]">
            <Box className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#26131c] to-[#150a0f] border border-[#d4af37]/25 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#baa49c] uppercase tracking-wider block">
              Valore stimato cantina
            </span>
            <div className="text-3xl font-serif font-bold text-gold-gradient mt-1">
              {inventorySummary.totalValue.toLocaleString('it-IT')} €
            </div>
            <p className="text-xs text-[#d1b8ab] mt-1">
              patrimonio enologico della coppia
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#8a1c2f]/20 border border-[#8a1c2f]/40 text-[#f5ebd7]">
            <DollarSign className="w-6 h-6 text-[#d4af37]" />
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#26131c] to-[#150a0f] border border-[#d4af37]/25 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#baa49c] uppercase tracking-wider block">
              Pronti per il calice
            </span>
            <div className="text-3xl font-serif font-bold text-white mt-1">
              {inventorySummary.items.filter(w => (w.drinkingWindow || '').toLowerCase().includes('pronto')).length}
            </div>
            <p className="text-xs text-[#d1b8ab] mt-1">
              perfetti da stappare stasera
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-700/40 text-emerald-300">
            <Wine className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#1b0e14] border border-[#d4af37]/20 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#baa49c] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cerca nella cantina..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-[#d4af37]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {(['ALL', 'Rosso', 'Bianco', 'Rosato', 'Bollicine', 'Dolce'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border cursor-pointer ${
                selectedType === t
                  ? 'bg-[#722f37] border-[#d4af37] text-white shadow'
                  : 'bg-white/5 border-white/10 text-[#baa49c] hover:text-white'
              }`}
            >
              {t === 'ALL' ? 'Tutti i tipi' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Bottles Inventory Grid with 3D Models & Photo Toggle */}
      {filteredBottles.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#170c12] border border-[#d4af37]/15">
          <Box className="w-10 h-10 text-[#d4af37]/40 mx-auto mb-3" />
          <h4 className="font-serif text-lg font-bold text-white">Nessuna bottiglia trovata</h4>
          <p className="text-xs text-[#d1b8ab] mt-1 max-w-sm mx-auto">
            Aggiungete le bottiglie che avete a casa per visualizzarle in 3D e stapparle al momento perfetto!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBottles.map((wine) => {
            const qty = wine.cellarQuantity ?? 0;
            const currentMode = bottleViewModes[wine.id] || (wine.photoUrl ? 'photo' : '3d');

            return (
              <div
                key={wine.id}
                className="p-5 rounded-2xl bg-gradient-to-b from-[#221018] to-[#140b0f] border border-[#d4af37]/25 hover:border-[#d4af37]/50 shadow-xl flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30">
                      {wine.type}
                    </span>
                    <span className="text-xs text-[#baa49c] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#d4af37]" /> {wine.region}
                    </span>
                  </div>

                  <h3 
                    onClick={() => onOpenIdentityCard(wine)}
                    className="font-serif text-xl font-bold text-white hover:text-[#f4d068] cursor-pointer transition-colors line-clamp-1"
                  >
                    {wine.name}
                  </h3>
                  <p className="text-xs text-[#baa49c] mt-0.5">
                    {wine.winery} {wine.vintage && `(${wine.vintage})`} • <span className="text-[#d4af37]">{wine.region}</span>
                  </p>

                  {/* 3D Model / Real Photo Showcase inside Card */}
                  <div className="my-3 p-2 rounded-xl bg-black/40 border border-white/5 relative overflow-hidden flex flex-col items-center">
                    <div className="absolute top-2 right-2 z-10">
                      <button
                        type="button"
                        onClick={() => toggleBottleViewMode(wine.id)}
                        className="px-2 py-1 rounded-lg bg-black/60 hover:bg-black/80 border border-white/10 text-[10px] text-[#f5ebd7] flex items-center gap-1 backdrop-blur-xs transition-colors cursor-pointer"
                        title="Alterna tra 3D e foto reale"
                      >
                        {currentMode === '3d' ? (
                          <><ImageIcon className="w-3 h-3 text-[#d4af37]" /> Foto</>
                        ) : (
                          <><Rotate3d className="w-3 h-3 text-[#d4af37]" /> 3D</>
                        )}
                      </button>
                    </div>

                    {currentMode === '3d' ? (
                      <div className="w-full h-44 flex items-center justify-center">
                        <ThreeBottleView
                          type={wine.type}
                          name={wine.name}
                          vintage={wine.vintage}
                          winery={wine.winery}
                          photoUrl={wine.photoUrl}
                          height={170}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-44 rounded-lg overflow-hidden flex items-center justify-center">
                        <img
                          src={wine.photoUrl || 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format&fit=crop&q=80'}
                          alt={wine.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Drinking Window */}
                  {wine.drinkingWindow && (
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2 text-xs">
                      <Clock className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                      <span className="text-[#e8d5be]">{wine.drinkingWindow}</span>
                    </div>
                  )}

                  {wine.coupleImpressions?.momentNotes && (
                    <p className="mt-2 text-xs text-[#baa49c] italic line-clamp-1">
                      "{wine.coupleImpressions.momentNotes}"
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 space-y-3">
                  {/* Stock Quantity Controls */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#d1b8ab] font-medium">Scorta disponibile:</span>
                    <div className="flex items-center gap-2 bg-black/50 p-1 rounded-xl border border-white/10">
                      <button
                        onClick={() => onUpdateQuantity(wine.id, Math.max(0, qty - 1))}
                        disabled={qty <= 0}
                        className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 cursor-pointer"
                        title="Diminuisci scorta"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2 font-mono text-sm font-bold text-[#f5ebd7]">
                        {qty} {qty === 1 ? 'bottiglia' : 'bottiglie'}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(wine.id, qty + 1)}
                        className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white cursor-pointer"
                        title="Aumenta scorta"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Actions: Stappa e degusta (Opens Tasting Card) + Scheda */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onStappaEDegusta(wine)}
                      disabled={qty <= 0}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#722f37] to-[#8f2d40] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow hover:brightness-110 disabled:opacity-40 transition-all cursor-pointer"
                      title="Stappa la bottiglia e compila subito la scheda di degustazione!"
                    >
                      <Wine className="w-3.5 h-3.5 text-[#d4af37]" />
                      Stappa e degusta
                    </button>
                    <button
                      onClick={() => onOpenIdentityCard(wine)}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#baa49c] hover:text-white transition-colors cursor-pointer"
                      title="Apri carta d'identità"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
