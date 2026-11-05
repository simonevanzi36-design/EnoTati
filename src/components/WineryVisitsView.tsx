import React, { useState } from 'react';
import { WineryVisit } from '../types/wine';
import { 
  Compass, MapPin, Calendar, Star, Heart, Plus, Wine, Image as ImageIcon, X, ArrowLeft, Trash2 
} from 'lucide-react';

interface WineryVisitsViewProps {
  visits: WineryVisit[];
  onAddVisit: (newVisit: Omit<WineryVisit, 'id'>) => void;
  onDeleteVisit: (visitId: string) => void;
  onGoBack?: () => void;
}

export function WineryVisitsView({
  visits,
  onAddVisit,
  onDeleteVisit,
  onGoBack
}: WineryVisitsViewProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingVisitId, setDeletingVisitId] = useState<string | null>(null);

  // Form State
  const [wineryName, setWineryName] = useState('');
  const [region, setRegion] = useState('Toscana');
  const [location, setLocation] = useState('');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [hospitalityRating, setHospitalityRating] = useState(5.0);
  const [experienceNotes, setExperienceNotes] = useState('');
  const [coupleMemories, setCoupleMemories] = useState('');
  const [winesTastedInput, setWinesTastedInput] = useState('');
  const [photoInput, setPhotoInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wineryName.trim()) return;

    const winesList = winesTastedInput
      .split(',')
      .map(w => w.trim())
      .filter(Boolean);

    const photosList = photoInput.trim()
      ? [photoInput.trim()]
      : ['https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&auto=format&fit=crop&q=80'];

    onAddVisit({
      wineryName: wineryName.trim(),
      region: region.trim(),
      location: location.trim(),
      visitDate,
      hospitalityRating,
      experienceNotes: experienceNotes.trim(),
      coupleMemories: coupleMemories.trim(),
      winesTastedNames: winesList,
      photos: photosList
    });

    setIsAddModalOpen(false);
    // Reset
    setWineryName('');
    setLocation('');
    setExperienceNotes('');
    setCoupleMemories('');
    setWinesTastedInput('');
    setPhotoInput('');
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#29121b] via-[#1a0b12] to-[#12080d] border border-[#d4af37]/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          {onGoBack && (
            <button
              onClick={onGoBack}
              className="mt-1 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-[#d1b8ab] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Torna indietro"
            >
              <ArrowLeft className="w-4 h-4" />
              Indietro
            </button>
          )}
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 uppercase tracking-wider mb-2">
              <Compass className="w-3.5 h-3.5" /> Enoturismo e terroir di coppia
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide">
              Le nostre visite in cantina
            </h2>
            <p className="text-sm text-[#d1b8ab] mt-1 max-w-xl">
              I weekend tra i filari, le passeggiate nelle barricaie storiche e le degustazioni guidate vissute insieme nelle più belle cantine d'Italia.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#8a1c2f] to-[#b32b43] text-white text-xs font-semibold tracking-wide flex items-center gap-2 shadow-lg hover:brightness-110 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#d4af37]" /> Registra nuova visita
        </button>
      </div>

      {/* Visits List */}
      {visits.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#170c12] border border-[#d4af37]/15">
          <Compass className="w-10 h-10 text-[#d4af37]/40 mx-auto mb-3" />
          <h4 className="font-serif text-lg font-bold text-white">Nessuna visita registrata</h4>
          <p className="text-xs text-[#d1b8ab] mt-1 max-w-sm mx-auto mb-4">
            Aggiungete il vostro prossimo tour o weekend enologico per conservare ricordi, foto e calici!
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#722f37] text-white text-xs font-semibold"
          >
            Aggiungi la prima visita
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {visits.map((visit) => {
            const formattedDate = new Date(visit.visitDate).toLocaleDateString('it-IT', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            });

            return (
              <div
                key={visit.id}
                className="rounded-2xl bg-gradient-to-b from-[#221018] to-[#140b0f] border border-[#d4af37]/25 overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12"
              >
                {/* Photo showcase */}
                <div className="lg:col-span-5 relative h-64 lg:h-auto min-h-[260px] overflow-hidden">
                  <img
                    src={visit.photos[0] || 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&auto=format&fit=crop&q=80'}
                    alt={visit.wineryName}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                    <div className="text-xs text-[#e8d5be] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#d4af37]" /> {formattedDate}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                      <span className="text-xs font-semibold text-[#d4af37] uppercase tracking-wider flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {visit.location || visit.region}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs text-[#d4af37] bg-black/40 px-2.5 py-1 rounded-full border border-white/10">
                          <Star className="w-3.5 h-3.5 fill-[#d4af37]" />
                          <span>Ospitalità: {visit.hospitalityRating}/5</span>
                        </div>
                        {deletingVisitId === visit.id ? (
                          <div className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-600/70 px-2 py-1 rounded-xl text-xs">
                            <span className="text-rose-200 text-[11px] font-medium">Eliminare?</span>
                            <button
                              onClick={() => {
                                onDeleteVisit(visit.id);
                                setDeletingVisitId(null);
                              }}
                              className="px-2 py-0.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-[11px] cursor-pointer"
                            >
                              Sì
                            </button>
                            <button
                              onClick={() => setDeletingVisitId(null)}
                              className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#d1b8ab] text-[11px] cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeletingVisitId(visit.id)}
                            className="p-1.5 rounded-xl bg-white/5 hover:bg-rose-950/50 border border-white/10 hover:border-rose-900/50 text-[#baa49c] hover:text-rose-400 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                            title="Elimina questa visita"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="text-[11px] hidden sm:inline">Elimina</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <h3 className="font-serif text-2xl font-bold text-white">
                      {visit.wineryName}
                    </h3>

                    {/* Experience Notes */}
                    {visit.experienceNotes && (
                      <p className="text-xs sm:text-sm text-[#d1b8ab] mt-3 leading-relaxed">
                        {visit.experienceNotes}
                      </p>
                    )}

                    {/* Couple Memories */}
                    {visit.coupleMemories && (
                      <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-[#2e1320] to-[#1a0c13] border border-rose-900/30">
                        <span className="text-[11px] font-semibold text-rose-300 uppercase tracking-wider flex items-center gap-1 mb-1">
                          <Heart className="w-3 h-3 fill-rose-400 text-rose-400" /> Il Nostro Ricordo di Coppia:
                        </span>
                        <p className="text-xs sm:text-sm text-[#f5ebd7] italic font-serif">
                          "{visit.coupleMemories}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Wines Tasted During the Tour */}
                  {visit.winesTastedNames && visit.winesTastedNames.length > 0 && (
                    <div className="pt-4 border-t border-white/10">
                      <span className="text-xs font-semibold text-[#baa49c] uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                        <Wine className="w-3.5 h-3.5 text-[#d4af37]" /> Calici Assaggiati al Banco di Degustazione:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {visit.winesTastedNames.map((w, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg text-xs bg-[#2b1420] border border-[#d4af37]/20 text-[#f5ebd7]"
                          >
                            {w}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Visit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div 
            className="relative w-full max-w-2xl bg-[#150d11] border border-[#d4af37]/35 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-4">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#d4af37]" /> Registra Degustazione in Cantina
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#d1b8ab] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#d1b8ab] mb-1">
                  Nome della Cantina / Tenuta *
                </label>
                <input
                  type="text"
                  required
                  value={wineryName}
                  onChange={(e) => setWineryName(e.target.value)}
                  placeholder="es. Antinori nel Chianti Classico"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#d1b8ab] mb-1">Regione</label>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="es. Toscana, Piemonte, Veneto..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#d1b8ab] mb-1">Località / Comune</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="es. Bargino (FI)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#d1b8ab] mb-1">Data della visita</label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#d1b8ab] mb-1">Voto ospitalità (1-5)</label>
                  <select
                    value={hospitalityRating}
                    onChange={(e) => setHospitalityRating(parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1d0e15] border border-white/10 text-white text-sm outline-none"
                  >
                    <option value="5.0">5.0 ★★★★★ - Esperienza memorabile</option>
                    <option value="4.5">4.5 ★★★★☆ - Ottima accoglienza</option>
                    <option value="4.0">4.0 ★★★★☆ - Molto buona</option>
                    <option value="3.5">3.5 ★★★☆☆ - Piacevole</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#d1b8ab] mb-1">
                  Racconto della visita (barricaia, terroir, sommelier)
                </label>
                <textarea
                  rows={2}
                  value={experienceNotes}
                  onChange={(e) => setExperienceNotes(e.target.value)}
                  placeholder="Com'era la tenuta? La spiegazione del produttore, il tour delle vigne..."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#d1b8ab] mb-1 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-400" /> Il nostro ricordo speciale di coppia
                </label>
                <textarea
                  rows={2}
                  value={coupleMemories}
                  onChange={(e) => setCoupleMemories(e.target.value)}
                  placeholder="Il momento più dolce vissuto insieme durante la visita..."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#d1b8ab] mb-1">
                  Vini assaggiati (separati da virgola)
                </label>
                <input
                  type="text"
                  value={winesTastedInput}
                  onChange={(e) => setWinesTastedInput(e.target.value)}
                  placeholder="es. Chianti Classico Riserva, Gran Selezione, Tignanello"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#d1b8ab] mb-1">
                  Foto della tenuta (URL opzionale)
                </label>
                <input
                  type="text"
                  value={photoInput}
                  onChange={(e) => setPhotoInput(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-xs text-[#d1b8ab] cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8a1c2f] to-[#b32b43] text-white text-xs font-semibold shadow hover:brightness-110 cursor-pointer"
                >
                  Salva visita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
