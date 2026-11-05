import React, { useState } from 'react';
import { WineItem } from '../types/wine';
import { Sparkles, Wine, Compass, Utensils, Heart, Plus, Loader2, ArrowRight } from 'lucide-react';

interface RecommendationItem {
  name: string;
  winery: string;
  vintage?: number;
  type: string;
  region: string;
  grapes: string;
  priceRange: string;
  whyForCouple: string;
  matchReason: string;
  pairingIdea: string;
}

interface SommelierRecommenderProps {
  tastedWines: WineItem[];
  onAddAsTasted: (rec: RecommendationItem) => void;
}

export function SommelierRecommender({ tastedWines, onAddAsTasted }: SommelierRecommenderProps) {
  const [occasion, setOccasion] = useState('');
  const [preferenceNote, setPreferenceNote] = useState('');
  const [budget, setBudget] = useState('Media (20€ - 50€)');
  
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string>(
    'Analizzando i vostri calici preferiti (tra cui grandi rossi toscani e piemontesi ed eleganti bollicine metodo classico), il nostro sommelier ha curato queste scoperte perfette per la vostra prossima serata.'
  );
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([
    {
      name: 'Rosso di Montalcino DOC',
      winery: 'Canalicchio di Sopra',
      vintage: 2021,
      type: 'Rosso',
      region: 'Toscana, Italia',
      grapes: 'Sangiovese 100%',
      priceRange: '24€ - 30€',
      whyForCouple: 'Ha tutta la nobiltà del Sangiovese toscano che già amate, ma con una freschezza vivace e beva irresistibile per una cena intima a casa.',
      matchReason: 'Ideale prosecuzione dopo aver adorato il Brunello di Montalcino.',
      pairingIdea: 'Pici al ragù toscano di cinta senese o tagliata con rosmarino.'
    },
    {
      name: 'Franciacorta Satèn Brut DOCG',
      winery: 'Bellavista',
      vintage: 2019,
      type: 'Bollicine',
      region: 'Lombardia, Italia',
      grapes: 'Chardonnay 100%',
      priceRange: '36€ - 44€',
      whyForCouple: 'La tipologia "Satèn" ha una pressione inferiore in bottiglia che regala una setosità e cremosità avvolgente unica, ideale per celebrare un traguardo di coppia.',
      matchReason: 'La vostra passione per la Cuvée Prestige di Ca\' del Bosco troverà in questa cuvée una sfumatura ancora più carezzevole.',
      pairingIdea: 'Risotto agli scampi, tartare di salmone e burrata pugliese.'
    },
    {
      name: 'Etna Rosso Contrada Rampante DOC',
      winery: 'Tasca d\'Almerita - Tenuta Tascante',
      vintage: 2020,
      type: 'Rosso',
      region: 'Sicilia (Etna), Italia',
      grapes: 'Nerello Mascalese 100%',
      priceRange: '28€ - 35€',
      whyForCouple: 'I vini dell\'Etna uniscono l\'eleganza del Nebbiolo con una mineralità vulcanica e note di arancia amara affascinanti da decifrare insieme calice dopo calice.',
      matchReason: 'Un\'evoluzione intrigante per il vostro palato abituato alla complessità del Barolo.',
      pairingIdea: 'Tonno scottato ai pistacchi, anatra o formaggi di malga.'
    }
  ]);

  const handleGenerateRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/recommend-wines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tastedWines,
          occasion,
          preferenceNote,
          budget
        })
      });
      const data = await response.json();
      if (data.recommendations && data.recommendations.length > 0) {
        setRecommendations(data.recommendations);
        if (data.summary) setSummary(data.summary);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Sommelier Intro Hero */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#2c131a] via-[#1f0e15] to-[#140b0f] border border-[#d4af37]/35 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Sommelier personale di coppia
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide">
            I vostri prossimi calici insieme
          </h2>
          <p className="text-sm text-[#d1b8ab] mt-2 leading-relaxed">
            Ogni bottiglia che avete archiviato racconta una sfumatura dei vostri gusti. Chiedete al sommelier consigli personalizzati per una cena speciale, un regalo o la scoperta di nuovi terroir!
          </p>
        </div>

        {/* Custom inquiry inputs */}
        <div className="mt-6 pt-6 border-t border-[#d4af37]/20 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#d1b8ab] mb-1">
              Occasione o atmosfera
            </label>
            <input
              type="text"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              placeholder="es. Cena romantica di sabato, anniversario..."
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-[#d4af37]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#d1b8ab] mb-1">
              Desiderio o piatto da abbinare
            </label>
            <input
              type="text"
              value={preferenceNote}
              onChange={(e) => setPreferenceNote(e.target.value)}
              placeholder="es. Risotto ai funghi, vino vulcanico, bollicina..."
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-[#d4af37]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#d1b8ab] mb-1">
              Fascia di prezzo
            </label>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#1d0e15] border border-white/10 text-white text-xs outline-none focus:border-[#d4af37]"
            >
              <option value="Quotidiana (12€ - 20€)">Quotidiana (12€ - 20€)</option>
              <option value="Media (20€ - 50€)">Media (20€ - 50€)</option>
              <option value="Prestigio (50€ - 120€)">Prestigio (50€ - 120€)</option>
              <option value="Grande Occasione (120€+)">Grande occasione (120€+)</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleGenerateRecommendations}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8a1c2f] to-[#b32b43] text-white text-xs font-semibold tracking-wide flex items-center gap-2 shadow-lg hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#d4af37]" />
                Il sommelier sta selezionando...
              </>
            ) : (
              <>
                <Compass className="w-4 h-4 text-[#d4af37]" />
                Aggiorna consigli su misura
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sommelier Taste Summary */}
      {summary && (
        <div className="p-4 rounded-xl bg-[#1d0e15] border border-[#d4af37]/25 flex items-start gap-3">
          <span className="text-xl shrink-0 mt-0.5">🍷</span>
          <p className="text-xs sm:text-sm text-[#f5ebd7] italic leading-relaxed">
            "{summary}"
          </p>
        </div>
      )}

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-gradient-to-b from-[#221018] to-[#140b0f] border border-[#d4af37]/25 hover:border-[#d4af37]/50 shadow-xl flex flex-col justify-between transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 uppercase">
                  {rec.type}
                </span>
                <span className="text-xs font-semibold text-[#f5ebd7] font-mono">
                  {rec.priceRange}
                </span>
              </div>

              <h3 className="font-serif text-xl font-bold text-white group-hover:text-[#f4d068] transition-colors">
                {rec.name}
              </h3>
              <p className="text-xs text-[#baa49c] mt-0.5 font-medium">
                {rec.winery} {rec.vintage && `(${rec.vintage})`} • <span className="text-[#d4af37]">{rec.region}</span>
              </p>

              <div className="mt-4 space-y-3 text-xs">
                {/* Why for couple */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[11px] font-semibold text-[#d4af37] uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-400" /> Perché è perfetto per voi:
                  </span>
                  <p className="text-[#e8d5be] italic">
                    "{rec.whyForCouple}"
                  </p>
                </div>

                {/* Match reason */}
                <div>
                  <strong className="text-[#baa49c] block text-[11px] uppercase">Legame con i vostri gusti:</strong>
                  <p className="text-[#d1b8ab] mt-0.5">{rec.matchReason}</p>
                </div>

                {/* Pairing */}
                {rec.pairingIdea && (
                  <div>
                    <strong className="text-[#baa49c] block text-[11px] uppercase flex items-center gap-1">
                      <Utensils className="w-3 h-3 text-[#d4af37]" /> Abbinamento consigliato:
                    </strong>
                    <p className="text-[#d1b8ab] mt-0.5">{rec.pairingIdea}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <button
                onClick={() => onAddAsTasted(rec)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#2e1420] hover:bg-[#722f37] border border-[#d4af37]/30 text-white text-xs font-medium tracking-wide flex items-center justify-center gap-2 transition-all shadow"
              >
                <Plus className="w-4 h-4 text-[#d4af37]" />
                L'abbiamo assaggiato! Cataloga
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
