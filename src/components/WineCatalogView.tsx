import React, { useState, useMemo } from 'react';
import { WineItem, WineType, WineFilterState } from '../types/wine';
import { filterWines } from '../utils/cellarStats';
import { 
  Search, Heart, Wine, Calendar, Plus, ArrowUpRight, Sparkles, ArrowLeft, Trash2 
} from 'lucide-react';

interface WineCatalogViewProps {
  wines: WineItem[];
  onSelectWine: (wine: WineItem) => void;
  onAddNewWine: () => void;
  onViewInArmadio: (wine: WineItem) => void;
  onDeleteWine?: (wineId: string) => void;
  onGoBack?: () => void;
}

export function WineCatalogView({
  wines,
  onSelectWine,
  onAddNewWine,
  onViewInArmadio,
  onDeleteWine,
  onGoBack
}: WineCatalogViewProps) {
  const [deletingWineId, setDeletingWineId] = useState<string | null>(null);
  const [filters, setFilters] = useState<WineFilterState>({
    searchQuery: '',
    typeFilter: 'ALL',
    regionFilter: 'ALL',
    minRating: 0,
    onlyFavorites: false,
    sortBy: 'date-desc'
  });

  // Extract unique regions dynamically from all wines (works seamlessly with free text entries!)
  const uniqueRegions = useMemo(() => {
    const set = new Set<string>();
    wines.forEach(w => {
      if (w.region && w.region.trim()) set.add(w.region.trim());
    });
    return Array.from(set).sort();
  }, [wines]);

  const filteredWines = useMemo(() => {
    return filterWines(wines, filters);
  }, [wines, filters]);

  return (
    <div className="space-y-6">
      {/* Section Header with Indietro button */}
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
              Archivio
            </h2>
            <p className="text-xs text-[#d1b8ab] mt-0.5">
              Tutte le carte d'identità dei vini che abbiamo degustato e recensito insieme ({wines.length} calici)
            </p>
          </div>
        </div>

        <button
          onClick={onAddNewWine}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8a1c2f] to-[#b32b43] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow hover:brightness-110 whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#d4af37]" /> Aggiungi calice
        </button>
      </div>

      {/* Top Filter and Search Bar */}
      <div className="p-5 rounded-2xl bg-[#1a0d13] border border-[#d4af37]/25 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search text input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-[#baa49c] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              placeholder="Cerca per nome, cantina, vitigno, ricordo..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-[#d4af37] transition-all"
            />
          </div>

          {/* Quick Buttons: Only Favorites & Add */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <button
              onClick={() => setFilters({ ...filters, onlyFavorites: !filters.onlyFavorites })}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border cursor-pointer ${
                filters.onlyFavorites
                  ? 'bg-rose-950/70 text-rose-300 border-rose-600 shadow'
                  : 'bg-white/5 text-[#baa49c] border-white/10 hover:text-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${filters.onlyFavorites ? 'fill-rose-400 text-rose-400' : ''}`} />
              Vini del cuore
            </button>

            <button
              onClick={onAddNewWine}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8a1c2f] to-[#b32b43] text-white text-xs font-semibold flex items-center gap-2 shadow hover:brightness-110 whitespace-nowrap transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#d4af37]" />
              Aggiungi calice
            </button>
          </div>
        </div>

        {/* Second Filter Row: Types, Region, Sort */}
        <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Types chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
            {(['ALL', 'Rosso', 'Bianco', 'Rosato', 'Bollicine', 'Dolce'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilters({ ...filters, typeFilter: t })}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border cursor-pointer ${
                  filters.typeFilter === t
                    ? 'bg-[#722f37] border-[#d4af37] text-white shadow'
                    : 'bg-white/5 border-white/10 text-[#baa49c] hover:text-white'
                }`}
              >
                {t === 'ALL' ? 'Tutte le tipologie' : t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Region dropdown */}
            <select
              value={filters.regionFilter}
              onChange={(e) => setFilters({ ...filters, regionFilter: e.target.value })}
              className="px-3 py-1.5 rounded-xl bg-[#23121b] border border-white/10 text-[#d1b8ab] text-xs outline-none focus:border-[#d4af37]"
            >
              <option value="ALL">Tutte le regioni</option>
              {uniqueRegions.map(reg => (
                <option key={reg} value={reg}>{reg}</option>
              ))}
            </select>

            {/* Sort By */}
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
              className="px-3 py-1.5 rounded-xl bg-[#23121b] border border-white/10 text-[#d1b8ab] text-xs outline-none focus:border-[#d4af37]"
            >
              <option value="date-desc">Data: più recenti</option>
              <option value="date-asc">Data: più vecchi</option>
              <option value="rating-desc">Voto coppia: più alto</option>
              <option value="name-asc">Nome: A - Z</option>
              <option value="price-desc">Prezzo: decrescente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Wine Cards Grid */}
      {filteredWines.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#170c12] border border-[#d4af37]/15">
          <Wine className="w-10 h-10 text-[#d4af37]/40 mx-auto mb-3" />
          <h4 className="font-serif text-lg font-bold text-white">Nessun calice trovato</h4>
          <p className="text-xs text-[#d1b8ab] mt-1 max-w-sm mx-auto">
            Provate a modificare i filtri di ricerca o catalogate una nuova bottiglia assaggiata insieme!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWines.map((wine) => {
            const heRating = wine.coupleImpressions?.heRating ?? 5;
            const sheRating = wine.coupleImpressions?.sheRating ?? 5;
            const avgRating = ((heRating + sheRating) / 2).toFixed(1);
            const dateStr = new Date(wine.tastedAt).toLocaleDateString('it-IT', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });

            return (
              <div
                key={wine.id}
                className="p-5 rounded-2xl bg-gradient-to-b from-[#221018] to-[#140b0f] border border-[#d4af37]/25 hover:border-[#d4af37]/50 shadow-xl flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30">
                        {wine.type} {wine.denomination && `• ${wine.denomination}`}
                      </span>
                      {wine.backPhotoUrl && (
                        <span className="text-[10px] text-[#baa49c] bg-white/5 px-2 py-0.5 rounded-full border border-white/10" title="Foto fronte e retro disponibili">
                          Fronte + retro
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#baa49c] flex items-center gap-1 font-serif">
                      <Calendar className="w-3.5 h-3.5 text-[#d4af37]" /> {dateStr}
                    </span>
                  </div>

                  <h3 
                    onClick={() => onSelectWine(wine)}
                    className="font-serif text-xl font-bold text-white hover:text-[#f4d068] cursor-pointer transition-colors line-clamp-1"
                  >
                    {wine.name}
                  </h3>
                  <p className="text-xs text-[#baa49c] mt-0.5">
                    {wine.winery} {wine.vintage && `(${wine.vintage})`} • <span className="text-[#d4af37]">{wine.region}</span>
                  </p>

                  {/* Couple Ratings breakdown: Tato and Tata */}
                  <div className="mt-4 p-3 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#d1b8ab]">Voto Tato: <strong className="text-white">{wine.coupleImpressions.heRating}/5</strong></span>
                      <span className="text-[#d1b8ab]">Voto Tata: <strong className="text-white">{wine.coupleImpressions.sheRating}/5</strong></span>
                      <span className="text-[#d4af37] font-bold">Media: {avgRating} ★</span>
                    </div>

                    {wine.coupleImpressions.momentNotes && (
                      <p className="text-xs text-[#baa49c] italic line-clamp-2 pt-1 border-t border-white/5">
                        "{wine.coupleImpressions.momentNotes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewInArmadio(wine)}
                      className="text-xs font-serif text-[#d4af37] hover:text-[#f7e1a0] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Armadio
                    </button>

                    {onDeleteWine && (
                      deletingWineId === wine.id ? (
                        <div className="flex items-center gap-1 bg-rose-950/80 border border-rose-600/70 px-2 py-0.5 rounded-lg text-xs">
                          <span className="text-rose-200 text-[10px]">Eliminare?</span>
                          <button
                            onClick={() => {
                              onDeleteWine(wine.id);
                              setDeletingWineId(null);
                            }}
                            className="px-1.5 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold text-[10px] cursor-pointer"
                          >
                            Sì
                          </button>
                          <button
                            onClick={() => setDeletingWineId(null)}
                            className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[#d1b8ab] text-[10px] cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingWineId(wine.id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-950/40 text-[#baa49c] hover:text-rose-400 text-xs transition-colors cursor-pointer"
                          title="Elimina calice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )
                    )}
                  </div>

                  <button
                    onClick={() => onSelectWine(wine)}
                    className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-[#722f37] border border-white/10 text-white text-xs font-medium flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap"
                  >
                    Carta d'identità <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
