import React, { useState } from 'react';
import { WineItem } from '../types/wine';
import { ThreeBottleView } from './ThreeBottleView';
import { 
  X, Heart, Calendar, MapPin, Percent, DollarSign, 
  Sparkles, Wine, Utensils, Box, Edit3, Trash2, Rotate3d, Image as ImageIcon, ArrowLeft, FileText
} from 'lucide-react';

interface WineIdentityModalProps {
  wine: WineItem;
  onClose: () => void;
  onEdit?: (wine: WineItem) => void;
  onDelete?: (wineId: string) => void;
  onReplayArmadioAnimation?: (wine: WineItem) => void;
  onDrinkFromCellar?: (wine: WineItem) => void;
}

export function WineIdentityModal({
  wine,
  onClose,
  onEdit,
  onDelete,
  onReplayArmadioAnimation,
  onDrinkFromCellar
}: WineIdentityModalProps) {
  const [viewMode, setViewMode] = useState<'3d' | 'front' | 'back'>('3d');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const he = wine.coupleImpressions?.heRating ?? 5;
  const she = wine.coupleImpressions?.sheRating ?? 5;
  const avgRating = ((he + she) / 2).toFixed(1);
  const formattedDate = new Date(wine.tastedAt).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-[#150d11] border border-[#d4af37]/35 rounded-2xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-r from-[#2c131a] via-[#1a0c12] to-[#150d11] border-b border-[#d4af37]/20 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <button
              onClick={onClose}
              className="mt-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-[#d1b8ab] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Torna indietro"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Indietro
            </button>
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30">
                  {wine.type} {wine.denomination && `• ${wine.denomination}`}
                </span>
                {wine.sparklingMethod && wine.type === 'Bollicine' && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#722f37]/40 text-[#f5ebd7] border border-[#d4af37]/30">
                    {wine.sparklingMethod}
                  </span>
                )}
                {wine.sweetStyle && wine.type === 'Dolce' && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#722f37]/40 text-[#f5ebd7] border border-[#d4af37]/30">
                    {wine.sweetStyle}
                  </span>
                )}
                {wine.vintage && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-[#baa49c] border border-white/10">
                    Annata {wine.vintage}
                  </span>
                )}
                {wine.coupleImpressions.isFavorite && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/60 text-rose-300 border border-rose-700/50 flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-rose-400 text-rose-400" /> Il nostro vino del cuore
                  </span>
                )}
              </div>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white tracking-wide">
                {wine.name}
              </h2>
              <p className="text-sm sm:text-base text-[#d1b8ab] font-medium mt-1">
                {wine.winery} • <span className="text-[#d4af37]">{wine.region}, {wine.country}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#d1b8ab] hover:text-white transition-colors cursor-pointer"
            aria-label="Chiudi scheda"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 max-h-[75vh] overflow-y-auto">
          {/* Left Column: Visual Model / Photo Showcase */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full bg-gradient-to-b from-[#1c0f15] to-[#10080c] rounded-2xl border border-[#d4af37]/25 p-4 flex flex-col items-center relative overflow-hidden shadow-inner">
              {/* Toggle 3D / Real Front / Real Back Photo */}
              <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 mb-2 z-10 flex-wrap justify-center">
                <button
                  onClick={() => setViewMode('3d')}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === '3d'
                      ? 'bg-[#722f37] text-white shadow border border-[#d4af37]/30'
                      : 'text-[#baa49c] hover:text-white'
                  }`}
                >
                  <Rotate3d className="w-3.5 h-3.5" /> Modello 3D
                </button>
                {wine.photoUrl && (
                  <button
                    onClick={() => setViewMode('front')}
                    className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                      viewMode === 'front'
                        ? 'bg-[#722f37] text-white shadow border border-[#d4af37]/30'
                        : 'text-[#baa49c] hover:text-white'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> Fronte
                  </button>
                )}
                {wine.backPhotoUrl && (
                  <button
                    onClick={() => setViewMode('back')}
                    className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                      viewMode === 'back'
                        ? 'bg-[#722f37] text-white shadow border border-[#d4af37]/30'
                        : 'text-[#baa49c] hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-[#d4af37]" /> Retro
                  </button>
                )}
              </div>

              {viewMode === '3d' && (
                <div className="w-full h-80 flex items-center justify-center">
                  <ThreeBottleView
                    type={wine.type}
                    name={wine.name}
                    vintage={wine.vintage}
                    winery={wine.winery}
                    photoUrl={wine.photoUrl}
                    height={320}
                  />
                </div>
              )}

              {viewMode === 'front' && wine.photoUrl && (
                <div className="w-full h-80 flex flex-col items-center justify-center overflow-hidden rounded-xl bg-black/60 relative p-2">
                  <img
                    src={wine.photoUrl}
                    alt={`Fronte etichetta ${wine.name}`}
                    className="w-full h-full object-contain rounded-lg"
                  />
                  <div className="absolute bottom-2 inset-x-2 py-1 px-2.5 rounded-lg bg-black/80 backdrop-blur-md text-[10px] text-[#f5ebd7] text-center flex items-center justify-center gap-1.5 border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Etichetta fronte (visibile sul modello 3D)</span>
                  </div>
                </div>
              )}

              {viewMode === 'back' && wine.backPhotoUrl && (
                <div className="w-full h-80 flex flex-col items-center justify-center overflow-hidden rounded-xl bg-black/60 relative p-2">
                  <img
                    src={wine.backPhotoUrl}
                    alt={`Retro bottiglia ${wine.name}`}
                    className="w-full h-full object-contain rounded-lg"
                  />
                  <div className="absolute bottom-2 inset-x-2 py-1 px-2.5 rounded-lg bg-black/80 backdrop-blur-md text-[10px] text-[#f5ebd7] text-center flex items-center justify-center gap-1.5 border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-[#d4af37]"></span>
                    <span>Foto retro della bottiglia (non visibile sul 3D)</span>
                  </div>
                </div>
              )}

              {/* Armadio action */}
              {onReplayArmadioAnimation && (
                <button
                  onClick={() => {
                    onClose();
                    onReplayArmadioAnimation(wine);
                  }}
                  className="mt-3 w-full py-2 px-3 rounded-xl bg-[#26131c] hover:bg-[#381a29] border border-[#d4af37]/30 text-xs font-serif text-[#f5ebd7] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                  Guarda riposizione nell'armadio 3D
                </button>
              )}
            </div>

            {/* Cellar Inventory Status Badge */}
            {wine.inCellarInventory && (
              <div className="w-full mt-4 p-4 rounded-xl bg-[#211118]/80 border border-emerald-900/40 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5" /> In cantinetta personale
                  </span>
                  <p className="text-xs text-[#d1b8ab] mt-0.5">
                    Quantità: <strong className="text-white">{wine.cellarQuantity || 1} {wine.cellarQuantity === 1 ? 'bottiglia' : 'bottiglie'}</strong>
                  </p>
                </div>
                {onDrinkFromCellar && (wine.cellarQuantity ?? 0) > 0 && (
                  <button
                    onClick={() => onDrinkFromCellar(wine)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                  >
                    Stappa e degusta
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Identity Card Details */}
          <div className="lg:col-span-7 space-y-6">
            {/* Couple Impressions Card ("La nostra degustazione di coppia") */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#28121d] to-[#1a0c13] border border-[#d4af37]/30 shadow-lg">
              <div className="flex items-center justify-between mb-3 border-b border-[#d4af37]/15 pb-2">
                <span className="font-serif text-base font-bold text-[#f5ebd7] flex items-center gap-2">
                  <Wine className="w-4 h-4 text-[#d4af37]" /> La nostra degustazione di coppia
                </span>
                <span className="text-xs text-[#baa49c] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {formattedDate}
                </span>
              </div>

              {/* Special Moment / Occasion */}
              {wine.coupleImpressions.momentNotes && (
                <div className="mb-4 p-3 rounded-xl bg-black/40 border border-[#d4af37]/20">
                  <span className="text-[11px] font-semibold text-[#d4af37] uppercase tracking-wider block mb-1">
                    Il nostro momento speciale
                  </span>
                  <p className="text-sm text-[#f5ebd7] italic font-serif">
                    "{wine.coupleImpressions.momentNotes}"
                  </p>
                </div>
              )}

              {/* Ratings: Tato and Tata */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-xs text-[#d1b8ab] block mb-1 font-medium">Tato dice:</span>
                  <div className="flex items-center gap-1 text-[#d4af37] font-bold text-sm mb-1">
                    {'★'.repeat(Math.max(0, Math.min(5, Math.round(he))))}
                    <span className="text-white text-xs ml-1 font-sans font-semibold">
                      {he}/5
                    </span>
                  </div>
                  <p className="text-xs text-[#e8d5be] italic">
                    "{wine.coupleImpressions?.heNotes || 'Nessuna nota personale'}"
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-xs text-[#d1b8ab] block mb-1 font-medium">Tata dice:</span>
                  <div className="flex items-center gap-1 text-[#d4af37] font-bold text-sm mb-1">
                    {'★'.repeat(Math.max(0, Math.min(5, Math.round(she))))}
                    <span className="text-white text-xs ml-1 font-sans font-semibold">
                      {she}/5
                    </span>
                  </div>
                  <p className="text-xs text-[#e8d5be] italic">
                    "{wine.coupleImpressions?.sheNotes || 'Nessuna nota personale'}"
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#d1b8ab] pt-2 border-t border-white/10">
                <span>Voto medio di coppia:</span>
                <span className="text-lg font-serif font-bold text-gold-gradient">
                  {avgRating} / 5
                </span>
              </div>
            </div>

            {/* Technical Wine Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {wine.grapes && (
                <div className="p-3 rounded-xl bg-[#1c0f16] border border-white/5">
                  <span className="text-[11px] text-[#baa49c] uppercase font-semibold block">Vitigni</span>
                  <p className="text-xs font-medium text-white mt-1 line-clamp-2">{wine.grapes}</p>
                </div>
              )}
              {wine.alcohol && (
                <div className="p-3 rounded-xl bg-[#1c0f16] border border-white/5">
                  <span className="text-[11px] text-[#baa49c] uppercase font-semibold block">Gradazione alcolica</span>
                  <p className="text-xs font-medium text-white mt-1">{wine.alcohol}</p>
                </div>
              )}
              {wine.pricePaid !== undefined && (
                <div className="p-3 rounded-xl bg-[#1c0f16] border border-white/5">
                  <span className="text-[11px] text-[#baa49c] uppercase font-semibold block">Prezzo bottiglia</span>
                  <p className="text-xs font-medium text-white mt-1">{wine.pricePaid > 0 ? `${wine.pricePaid} €` : 'Regalo'}</p>
                </div>
              )}
              {wine.drinkingWindow && (
                <div className="col-span-2 sm:col-span-3 p-3 rounded-xl bg-[#1c0f16] border border-white/5">
                  <span className="text-[11px] text-[#baa49c] uppercase font-semibold block">Finestra di beva ottimale</span>
                  <p className="text-xs font-medium text-[#d4af37] mt-1">{wine.drinkingWindow}</p>
                </div>
              )}
            </div>

            {/* Tasting Notes: Visivo, Olfattivo, Gustativo */}
            <div className="space-y-3">
              <h4 className="font-serif text-sm font-bold text-[#f5ebd7] uppercase tracking-wider border-b border-[#d4af37]/20 pb-1">
                Profilo sensoriale
              </h4>
              
              {wine.visualNotes && (
                <div className="text-xs">
                  <strong className="text-[#d4af37] mr-1.5">Esame visivo:</strong>
                  <span className="text-[#e0d3cb]">{wine.visualNotes}</span>
                </div>
              )}

              {wine.aromaNotes && (
                <div className="text-xs">
                  <strong className="text-[#d4af37] mr-1.5">Esame olfattivo:</strong>
                  <span className="text-[#e0d3cb]">{wine.aromaNotes}</span>
                </div>
              )}

              {wine.tasteNotes && (
                <div className="text-xs">
                  <strong className="text-[#d4af37] mr-1.5">Esame gustativo:</strong>
                  <span className="text-[#e0d3cb]">{wine.tasteNotes}</span>
                </div>
              )}

              {wine.generalNotes && (
                <div className="text-xs bg-white/5 p-3 rounded-xl border border-white/5">
                  <strong className="text-[#f5ebd7] block mb-1">Impressioni generali:</strong>
                  <span className="text-[#baa49c] italic">{wine.generalNotes}</span>
                </div>
              )}
            </div>

            {/* Assaggiato insieme a... */}
            {wine.foodPairings && wine.foodPairings.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-[#baa49c] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Utensils className="w-3.5 h-3.5 text-[#d4af37]" /> Assaggiato insieme a...
                </span>
                <div className="flex flex-wrap gap-2">
                  {wine.foodPairings.map((p, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs bg-[#24131b] border border-[#d4af37]/20 text-[#f5ebd7]"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-[#11090d] border-t border-[#d4af37]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onDelete && (
              isConfirmingDelete ? (
                <div className="flex items-center gap-2 bg-rose-950/80 border border-rose-600/70 p-1.5 rounded-xl">
                  <span className="text-xs text-rose-200 pl-1 font-medium">Eliminare il calice?</span>
                  <button
                    onClick={() => {
                      onDelete(wine.id);
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Sì, elimina
                  </button>
                  <button
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[#d1b8ab] text-xs cursor-pointer transition-colors"
                  >
                    Annulla
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsConfirmingDelete(true)}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Elimina
                </button>
              )
            )}
            {onEdit && !isConfirmingDelete && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(wine);
                }}
                className="px-3 py-2 rounded-xl text-xs font-medium text-[#d1b8ab] hover:text-white hover:bg-white/5 border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" /> Modifica
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#722f37] to-[#8f2d40] text-white text-xs font-medium tracking-wide shadow hover:brightness-110 transition-all cursor-pointer"
          >
            Chiudi scheda
          </button>
        </div>
      </div>
    </div>
  );
}
