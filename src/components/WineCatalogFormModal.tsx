import React, { useState, useRef, useMemo } from 'react';
import { WineItem, WineType } from '../types/wine';
import { ThreeBottleView } from './ThreeBottleView';
import { 
  X, Camera, Sparkles, Heart, Wine, Loader2, CheckCircle2, AlertCircle, Plus, ArrowLeft, Search,
  Image as ImageIcon, Trash2, FileText, Upload
} from 'lucide-react';

interface WineCatalogFormModalProps {
  wineToEdit?: WineItem | null;
  onClose: () => void;
  onSave: (wineData: Omit<WineItem, 'id'>, isEditingId?: string) => void;
}

const WINE_TYPES: WineType[] = ['Rosso', 'Bianco', 'Rosato', 'Bollicine', 'Dolce'];

const POPULAR_DENOMINATIONS = [
  'DOCG',
  'DOC',
  'IGT',
  'Franciacorta DOCG',
  'Trento DOC',
  'Champagne AOC',
  'Vino da tavola (VdT)',
  'Altro'
];

const COMMON_GRAPES = [
  'Sangiovese',
  'Nebbiolo',
  'Chardonnay',
  'Pinot nero',
  'Glera (Prosecco)',
  'Barbera',
  'Corvina',
  'Montepulciano',
  'Trebbiano',
  'Nero d\'Avola',
  'Primitivo',
  'Aglianico',
  'Sauvignon blanc',
  'Pinot grigio',
  'Cabernet sauvignon',
  'Merlot',
  'Syrah',
  'Vermentino',
  'Zibibbo',
  'Garganega',
  'Cortese',
  'Fiano',
  'Greco di Tufo',
  'Timorasso',
  'Carricante',
  'Nerello mascalese',
  'Dolcetto',
  'Cannonau'
];

const ALCOHOL_LEVELS = [
  '10.5%', '11.0%', '11.5%', '12.0%', '12.5%', '13.0%', '13.5%', '14.0%', '14.5%', '15.0%', '15.5%'
];

const DRINKING_WINDOW_OPTIONS = [
  'Pronto da bere subito',
  'Da bere entro 1-2 anni',
  'Maturazione ottimale (3-5 anni)',
  'Da lungo invecchiamento (5-10 anni)',
  'Da grande invecchiamento (oltre 10 anni)',
  'Da conservare per un\'occasione speciale',
  'Vino da meditazione (riposo indefinito)',
  'Altro (personalizzato)'
];

const SPARKLING_METHODS = [
  'Metodo classico / Champenoise',
  'Metodo Martinotti / Charmat',
  'Prosecco',
  'Metodo ancestrale',
  'Altro metodo'
];

const SWEET_STYLES = [
  'Rosso dolce',
  'Bianco dolce / passito',
  'Frizzante dolce'
];

// Technical sommelier descriptors (AIS / ONAV) dynamic per wine type
const SENSORY_DICTIONARY: Record<WineType, {
  visual: string[];
  aromas: string[];
  taste: string[];
}> = {
  Rosso: {
    visual: [
      'Rosso rubino',
      'Rosso granato',
      'Rosso aranciato',
      'Rosso porpora',
      'Limpido',
      'Consistente',
      'Molto consistente'
    ],
    aromas: [
      'Marasca',
      'Mora di rovo',
      'Prugna secca',
      'Ribes nero',
      'Mirtillo',
      'Violetta',
      'Rosa appassita',
      'Pepe nero',
      'Chiodi di garofano',
      'Cannella',
      'Vaniglia',
      'Tabacco biondo',
      'Cuoio',
      'Goudron',
      'Cacao amaro',
      'Caffè tostato',
      'Macchia mediterranea',
      'Eucalipto',
      'Sottobosco',
      'Grafite'
    ],
    taste: [
      'Secco',
      'Caldo',
      'Morbido',
      'Fresco',
      'Tannico',
      'Tannini setosi',
      'Sapido',
      'Di corpo',
      'Equilibrato',
      'Persistente',
      'Armonico'
    ]
  },
  Bianco: {
    visual: [
      'Giallo verdolino',
      'Giallo paglierino',
      'Giallo dorato',
      'Giallo ambrato',
      'Cristallino',
      'Limpido',
      'Consistente'
    ],
    aromas: [
      'Mela verde',
      'Pera Williams',
      'Pesca bianca',
      'Agrumi (lime e cedro)',
      'Pompelmo',
      'Fiori bianchi',
      'Gelsomino',
      'Biancospino',
      'Zagara',
      'Erba tagliata',
      'Foglia di pomodoro',
      'Salvia',
      'Pietra focaia',
      'Idrocarburo',
      'Burro fuso',
      'Crosta di pane',
      'Mandorla amara'
    ],
    taste: [
      'Secco',
      'Abboccato',
      'Fresco / acido',
      'Sapido / minerale',
      'Morbido',
      'Snello',
      'Di buon corpo',
      'Fine',
      'Persistente',
      'Elegante'
    ]
  },
  Rosato: {
    visual: [
      'Rosa tenue (buccia di cipolla)',
      'Rosa cerasuolo',
      'Rosa chiaretto',
      'Limpido',
      'Brillante',
      'Consistente'
    ],
    aromas: [
      'Lampone',
      'Fragolina di bosco',
      'Melagrana',
      'Ciliegia fresca',
      'Rosa canina',
      'Peonia',
      'Pompelmo rosa',
      'Timo',
      'Gesso',
      'Rabarbaro'
    ],
    taste: [
      'Secco',
      'Fresco e beverino',
      'Sapido',
      'Snello ed elegante',
      'Delicatamente tannico',
      'Morbido',
      'Persistente'
    ]
  },
  Bollicine: {
    visual: [
      'Giallo paglierino brillante',
      'Riflessi verdolini',
      'Perlage finissimo',
      'Perlage persistente',
      'Spuma soffice e cremosa',
      'Limpido'
    ],
    aromas: [
      'Crosta di pane',
      'Lievito fresco',
      'Brioche tostata',
      'Mela cotogna',
      'Mela renetta',
      'Agrumi canditi',
      'Fiori bianchi',
      'Glicine',
      'Nocciola tostata',
      'Gesso e calcare'
    ],
    taste: [
      'Extra brut / pas dosé',
      'Brut secco',
      'Acidità tagliente',
      'Cremoso',
      'Sapido',
      'Minerale',
      'Fine ed elegante',
      'Rinfrescante'
    ]
  },
  Dolce: {
    visual: [
      'Giallo dorato intenso',
      'Ambrato luminoso',
      'Topazio',
      'Rosso rubino impenetrabile',
      'Molto consistente',
      'Viscoso'
    ],
    aromas: [
      'Albicocca disidratata',
      'Fichi secchi',
      'Datteri',
      'Miele d\'acacia',
      'Scorza d\'arancia candita',
      'Zagara',
      'Uva passa',
      'Marmellata di ciliegie',
      'Cioccolato fondente',
      'Spezie orientali'
    ],
    taste: [
      'Dolce non stucchevole',
      'Avvolgente',
      'Morbido e vellutato',
      'Freschezza a contrasto',
      'Sapido sul finale',
      'Pieno',
      'Persistenza infinita'
    ]
  }
};

const COMMON_TASTED_WITH = [
  'Carni rosse e brace',
  'Tagliere salumi e formaggi',
  'Primi al ragù / pasta fresca',
  'Pesce e crudité',
  'Risotto cremoso',
  'Pizza gourmet',
  'Dessert e pasticceria',
  'Da solo / vino da meditazione'
];

export function WineCatalogFormModal({
  wineToEdit,
  onClose,
  onSave
}: WineCatalogFormModalProps) {
  // Form State
  const [name, setName] = useState(wineToEdit?.name || '');
  const [winery, setWinery] = useState(wineToEdit?.winery || '');
  const [vintage, setVintage] = useState<number | ''>(wineToEdit?.vintage ?? 2021);
  const [type, setType] = useState<WineType>(wineToEdit?.type || 'Rosso');
  const [denomination, setDenomination] = useState(wineToEdit?.denomination || 'DOCG');
  
  // Specific subtypes
  const [sparklingMethod, setSparklingMethod] = useState<string>(
    wineToEdit?.sparklingMethod || 'Metodo classico / Champenoise'
  );
  const [sweetStyle, setSweetStyle] = useState<string>(
    wineToEdit?.sweetStyle || 'Bianco dolce / passito'
  );

  // Grape search & selection
  const [grapeSearch, setGrapeSearch] = useState('');
  const [selectedGrapes, setSelectedGrapes] = useState<string[]>(() => {
    if (!wineToEdit?.grapes) return [];
    return wineToEdit.grapes.split(',').map(s => s.trim()).filter(Boolean);
  });
  const [customGrape, setCustomGrape] = useState('');

  // Region is a free-text input as requested
  const [region, setRegion] = useState(wineToEdit?.region || 'Toscana');
  const [country, setCountry] = useState(wineToEdit?.country || 'Italia');
  const [alcohol, setAlcohol] = useState(wineToEdit?.alcohol || '14.0%');
  const [pricePaid, setPricePaid] = useState<number | ''>(wineToEdit?.pricePaid ?? 35);
  const [photoUrl, setPhotoUrl] = useState(wineToEdit?.photoUrl || '');
  const [backPhotoUrl, setBackPhotoUrl] = useState(wineToEdit?.backPhotoUrl || '');

  // Sensory notes (Crocette)
  const [selectedVisual, setSelectedVisual] = useState<string[]>(() => {
    if (!wineToEdit?.visualNotes) return [];
    return wineToEdit.visualNotes.split(',').map(s => s.trim()).filter(Boolean);
  });
  const [customVisual, setCustomVisual] = useState('');

  const [selectedAromas, setSelectedAromas] = useState<string[]>(() => {
    if (!wineToEdit?.aromaNotes) return [];
    return wineToEdit.aromaNotes.split(',').map(s => s.trim()).filter(Boolean);
  });
  const [customAroma, setCustomAroma] = useState('');

  const [selectedTaste, setSelectedTaste] = useState<string[]>(() => {
    if (!wineToEdit?.tasteNotes) return [];
    return wineToEdit.tasteNotes.split(',').map(s => s.trim()).filter(Boolean);
  });
  const [customTaste, setCustomTaste] = useState('');

  // Assaggiato insieme a...
  const [selectedTastedWith, setSelectedTastedWith] = useState<string[]>(() => {
    return wineToEdit?.foodPairings || [];
  });
  const [customTastedWith, setCustomTastedWith] = useState('');

  // Free form reviews: Tato and Tata
  const [heRating, setHeRating] = useState<number>(wineToEdit?.coupleImpressions?.heRating ?? 4.5);
  const [sheRating, setSheRating] = useState<number>(wineToEdit?.coupleImpressions?.sheRating ?? 4.5);
  const [heNotes, setHeNotes] = useState(wineToEdit?.coupleImpressions?.heNotes || '');
  const [sheNotes, setSheNotes] = useState(wineToEdit?.coupleImpressions?.sheNotes || '');
  const [momentNotes, setMomentNotes] = useState(wineToEdit?.coupleImpressions?.momentNotes || '');
  const [isFavorite, setIsFavorite] = useState<boolean>(wineToEdit?.coupleImpressions?.isFavorite ?? false);
  const [tastedDate, setTastedDate] = useState(
    wineToEdit?.tastedAt ? wineToEdit.tastedAt.split('T')[0] : new Date().toISOString().split('T')[0]
  );

  // Cellar inventory
  const [inCellarInventory, setInCellarInventory] = useState<boolean>(wineToEdit?.inCellarInventory ?? false);
  const [cellarQuantity, setCellarQuantity] = useState<number>(wineToEdit?.cellarQuantity ?? 1);
  const initialWindow = wineToEdit?.drinkingWindow || 'Pronto da bere subito';
  const isPresetWindow = DRINKING_WINDOW_OPTIONS.slice(0, -1).includes(initialWindow);
  const [drinkingWindowOption, setDrinkingWindowOption] = useState<string>(
    isPresetWindow ? initialWindow : (wineToEdit?.drinkingWindow ? 'Altro (personalizzato)' : 'Pronto da bere subito')
  );
  const [customDrinkingWindow, setCustomDrinkingWindow] = useState<string>(
    isPresetWindow ? '' : (wineToEdit?.drinkingWindow || '')
  );

  // AI Recognition
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [aiStatusMessage, setAiStatusMessage] = useState('');
  const [aiSuccessMessage, setAiSuccessMessage] = useState('');
  const [aiError, setAiError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backFileInputRef = useRef<HTMLInputElement>(null);

  // Filtered grapes based on user search
  const filteredGrapes = useMemo(() => {
    const q = grapeSearch.trim().toLowerCase();
    if (!q) return COMMON_GRAPES;
    return COMMON_GRAPES.filter(g => g.toLowerCase().includes(q));
  }, [grapeSearch]);

  // Current sensory options based on wine type
  const currentSensory = SENSORY_DICTIONARY[type] || SENSORY_DICTIONARY.Rosso;

  // Toggle helpers
  const toggleItem = (list: string[], setList: (val: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleAddCustomGrape = () => {
    if (!customGrape.trim()) return;
    const clean = customGrape.trim();
    if (!selectedGrapes.includes(clean)) {
      setSelectedGrapes([...selectedGrapes, clean]);
    }
    setCustomGrape('');
  };

  const handleAddCustomTastedWith = () => {
    if (!customTastedWith.trim()) return;
    const clean = customTastedWith.trim();
    if (!selectedTastedWith.includes(clean)) {
      setSelectedTastedWith([...selectedTastedWith, clean]);
    }
    setCustomTastedWith('');
  };

  // Image upload & Gemini Sommelier AI
  const handleImageFile = async (file: File) => {
    setIsRecognizing(true);
    setAiError('');
    setAiSuccessMessage('');
    setAiStatusMessage('Lettura dell\'immagine dell\'etichetta...');

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        setPhotoUrl(base64Data);

        setAiStatusMessage('Analisi sommelier AI con Gemini...');

        const response = await fetch('/api/recognize-label', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Data })
        });

        const data = await response.json();

        if (data.success && data.wine) {
          const w = data.wine;
          if (w.name) setName(w.name);
          if (w.winery) setWinery(w.winery);
          if (w.vintage) setVintage(w.vintage);
          if (w.type && WINE_TYPES.includes(w.type)) setType(w.type);
          if (w.denomination) setDenomination(w.denomination);
          if (w.region) setRegion(w.region);
          if (w.country) setCountry(w.country);
          if (w.alcohol) setAlcohol(w.alcohol);
          if (w.grapes) {
            setSelectedGrapes([w.grapes]);
          }
          if (w.estimatedPrice) setPricePaid(w.estimatedPrice);

          setAiSuccessMessage('Etichetta riconosciuta con successo! Informazioni precompilate.');
        } else {
          setAiError('Non è stato possibile estrarre tutte le informazioni. Selezione manuale attiva.');
        }
      } catch (err) {
        console.error(err);
        setAiError('Errore durante la scansione dell\'etichetta. Selezione manuale attiva.');
      } finally {
        setIsRecognizing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBackPhotoFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      setBackPhotoUrl(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Combine standard selections + custom "Altro" entries
    const visualAll = [...selectedVisual];
    if (customVisual.trim() && !visualAll.includes(customVisual.trim())) {
      visualAll.push(customVisual.trim());
    }

    const aromasAll = [...selectedAromas];
    if (customAroma.trim() && !aromasAll.includes(customAroma.trim())) {
      aromasAll.push(customAroma.trim());
    }

    const tasteAll = [...selectedTaste];
    if (customTaste.trim() && !tasteAll.includes(customTaste.trim())) {
      tasteAll.push(customTaste.trim());
    }

    const tastedWithAll = [...selectedTastedWith];
    if (customTastedWith.trim() && !tastedWithAll.includes(customTastedWith.trim())) {
      tastedWithAll.push(customTastedWith.trim());
    }

    const wineData: Omit<WineItem, 'id'> = {
      name: name.trim(),
      winery: winery.trim() || 'Cantina selezionata',
      vintage: typeof vintage === 'number' ? vintage : null,
      type,
      denomination: denomination.trim() || undefined,
      sparklingMethod: type === 'Bollicine' ? sparklingMethod : undefined,
      sweetStyle: type === 'Dolce' ? sweetStyle : undefined,
      grapes: selectedGrapes.join(', ') || undefined,
      region: region.trim() || 'Italia',
      country: country.trim() || 'Italia',
      alcohol: alcohol.trim() || undefined,
      photoUrl: photoUrl.trim() || undefined,
      backPhotoUrl: backPhotoUrl.trim() || undefined,
      visualNotes: visualAll.join(', ') || undefined,
      aromaNotes: aromasAll.join(', ') || undefined,
      tasteNotes: tasteAll.join(', ') || undefined,
      generalNotes: undefined,
      foodPairings: tastedWithAll.length > 0 ? tastedWithAll : undefined,
      pricePaid: typeof pricePaid === 'number' ? pricePaid : 0,
      tastedAt: new Date(tastedDate).toISOString(),
      coupleImpressions: {
        heRating,
        sheRating,
        heNotes: heNotes.trim() || undefined,
        sheNotes: sheNotes.trim() || undefined,
        momentNotes: momentNotes.trim() || undefined,
        isFavorite,
        boughtTogether: true
      },
      inCellarInventory,
      cellarQuantity: inCellarInventory ? cellarQuantity : 0,
      drinkingWindow: inCellarInventory 
        ? (drinkingWindowOption === 'Altro (personalizzato)' ? (customDrinkingWindow.trim() || undefined) : drinkingWindowOption) 
        : undefined
    };

    onSave(wineData, wineToEdit?.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-[#140b0f] border border-[#d4af37]/30 rounded-2xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#291119] via-[#1a0c12] to-[#140b0f] border-b border-[#d4af37]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#d1b8ab] hover:text-white transition-colors cursor-pointer mr-1"
              title="Indietro / Annulla"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="p-2.5 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37]">
              <Wine className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide">
                {wineToEdit ? 'Modifica scheda calice' : 'Nuovo calice per EnoTati'}
              </h2>
              <p className="text-xs text-[#d1b8ab]">
                {wineToEdit ? 'Aggiorna recensioni e informazioni' : 'Seleziona le caratteristiche e annota i ricordi di Tato e Tata'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#d1b8ab] hover:text-white transition-colors cursor-pointer"
            aria-label="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleFormSubmit} className="p-5 sm:p-8 space-y-8 max-h-[80vh] overflow-y-auto">
          {/* AI Label Scanner Hero */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#241019] via-[#1f0e16] to-[#150a0f] border border-[#d4af37]/35 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30 uppercase tracking-wider mb-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Sommelier AI Vision
                </span>
                <h3 className="font-serif text-lg font-bold text-[#f5ebd7]">
                  Riconosci da foto etichetta
                </h3>
                <p className="text-xs text-[#d1b8ab] max-w-lg mt-0.5">
                  Carica la foto della bottiglia: l'AI compilerà automaticamente nome, cantina e tipologia, e mostrerà l'etichetta reale nel modello 3D!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImageFile(f);
                  }}
                />
                <input
                  type="file"
                  ref={backFileInputRef}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleBackPhotoFile(f);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isRecognizing}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#722f37] to-[#992c42] hover:brightness-110 text-white text-xs font-semibold tracking-wide flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isRecognizing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#d4af37]" />
                      {aiStatusMessage || 'Scansione in corso...'}
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 text-[#d4af37]" />
                      {photoUrl ? 'Cambia fronte (AI)' : 'Foto fronte (AI)'}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => backFileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#f5ebd7] text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer"
                  title="Aggiungi la foto del retro della bottiglia (non visibile sul 3D)"
                >
                  <FileText className="w-4 h-4 text-[#d4af37]" />
                  {backPhotoUrl ? 'Cambia foto retro' : 'Foto retro bottiglia'}
                </button>
              </div>
            </div>

            {aiSuccessMessage && (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-700/50 flex items-center gap-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{aiSuccessMessage}</span>
              </div>
            )}

            {aiError && (
              <div className="mt-3 p-2.5 rounded-xl bg-amber-950/60 border border-amber-700/50 flex items-center gap-2 text-xs text-amber-300">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{aiError}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Live 3D Preview Column & Photos */}
            <div className="lg:col-span-4 flex flex-col items-center">
              <div className="w-full sticky top-4 space-y-4">
                {/* 3D Bottle View */}
                <div className="w-full p-4 rounded-2xl bg-[#1b0e14] border border-[#d4af37]/25 flex flex-col items-center text-center">
                  <div className="w-full flex items-center justify-between mb-2">
                    <span className="text-[11px] font-serif text-[#d4af37] uppercase tracking-wider">
                      Anteprima bottiglia 3D
                    </span>
                    <span className="text-[10px] text-[#baa49c] bg-white/5 px-2 py-0.5 rounded-full">
                      Solo etichetta fronte
                    </span>
                  </div>
                  <div className="w-full h-60 flex items-center justify-center">
                    <ThreeBottleView
                      type={type}
                      name={name || 'EnoTati'}
                      vintage={typeof vintage === 'number' ? vintage : null}
                      winery={winery || 'Cantina'}
                      photoUrl={photoUrl}
                      height={240}
                    />
                  </div>
                  <div className="w-full mt-2 pt-3 border-t border-white/10 text-xs text-[#baa49c]">
                    Vetro e corona: <strong className="text-white">{type}</strong>
                    {type === 'Rosato' && ' (Rosa tenue con corona fucsia)'}
                    {type === 'Bollicine' && ' (Giallo chiarissimo con corona grigia)'}
                  </div>
                </div>

                {/* Bottle Photos Management (Front & Back) */}
                <div className="w-full p-4 rounded-2xl bg-[#170d12] border border-[#d4af37]/20 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h5 className="font-serif text-xs font-bold text-[#f5ebd7] uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#d4af37]" />
                      Foto bottiglia
                    </h5>
                    <span className="text-[10px] text-[#baa49c]">Fronte & retro</span>
                  </div>

                  {/* Front Photo Card */}
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        Etichetta fronte
                      </span>
                      <span className="text-[10px] text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded-md border border-[#d4af37]/20">
                        Visibile su 3D
                      </span>
                    </div>

                    {photoUrl ? (
                      <div className="flex items-center gap-3">
                        <img 
                          src={photoUrl} 
                          alt="Fronte etichetta" 
                          className="w-14 h-14 object-cover rounded-lg border border-white/10 shrink-0" 
                        />
                        <div className="flex-1 flex flex-col gap-1.5">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs text-[#d4af37] hover:underline flex items-center gap-1 text-left cursor-pointer"
                          >
                            <Camera className="w-3 h-3" /> Cambia fronte
                          </button>
                          <button
                            type="button"
                            onClick={() => setPhotoUrl('')}
                            className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 text-left cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" /> Rimuovi fronte
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2.5 px-3 rounded-lg border border-dashed border-white/20 hover:border-[#d4af37]/60 text-xs text-[#d1b8ab] hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-[#d4af37]" />
                        Carica foto fronte
                      </button>
                    )}
                  </div>

                  {/* Back Photo Card */}
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#d4af37]"></span>
                        Retro della bottiglia
                      </span>
                      <span className="text-[10px] text-[#baa49c] bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                        Non visibile su 3D
                      </span>
                    </div>

                    {backPhotoUrl ? (
                      <div className="flex items-center gap-3">
                        <img 
                          src={backPhotoUrl} 
                          alt="Retro etichetta" 
                          className="w-14 h-14 object-cover rounded-lg border border-white/10 shrink-0" 
                        />
                        <div className="flex-1 flex flex-col gap-1.5">
                          <button
                            type="button"
                            onClick={() => backFileInputRef.current?.click()}
                            className="text-xs text-[#d4af37] hover:underline flex items-center gap-1 text-left cursor-pointer"
                          >
                            <Camera className="w-3 h-3" /> Cambia retro
                          </button>
                          <button
                            type="button"
                            onClick={() => setBackPhotoUrl('')}
                            className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 text-left cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" /> Rimuovi retro
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => backFileInputRef.current?.click()}
                        className="w-full py-2.5 px-3 rounded-lg border border-dashed border-[#d4af37]/30 hover:border-[#d4af37] text-xs text-[#d1b8ab] hover:text-white flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-[#d4af37]" />
                          <span>Aggiungi foto del retro</span>
                        </div>
                        <span className="text-[10px] text-[#baa49c]">
                          Info tecniche, solfiti, gradazione per l'archivio
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields Column */}
            <div className="lg:col-span-8 space-y-6">
              {/* 1. Basic Info */}
              <div className="space-y-4">
                <h4 className="font-serif text-sm font-bold text-[#f5ebd7] uppercase tracking-wider border-b border-[#d4af37]/20 pb-1">
                  1. Dati del vino
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#d1b8ab] mb-1">
                      Nome del vino *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="es. Brunello di Montalcino DOCG"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#d4af37] text-white text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#d1b8ab] mb-1">
                      Cantina o produttore
                    </label>
                    <input
                      type="text"
                      value={winery}
                      onChange={(e) => setWinery(e.target.value)}
                      placeholder="es. Tenuta Il Poggione"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#d4af37] text-white text-sm outline-none"
                    />
                  </div>

                  {/* Annata a numeri */}
                  <div>
                    <label className="block text-xs font-medium text-[#d1b8ab] mb-1">
                      Annata (numero)
                    </label>
                    <input
                      type="number"
                      min="1900"
                      max="2099"
                      value={vintage}
                      onChange={(e) => {
                        const val = e.target.value;
                        setVintage(val === '' ? '' : parseInt(val, 10));
                      }}
                      placeholder="es. 2021 (vuoto per S.A.)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#23121b] border border-white/10 text-white text-sm outline-none focus:border-[#d4af37]"
                    />
                    <span className="text-[10px] text-[#baa49c] mt-0.5 block">
                      Lasciare vuoto se senza annata (S.A.)
                    </span>
                  </div>

                  {/* Wine Type Select */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#d1b8ab] mb-1.5">
                      Tipologia di vino
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {WINE_TYPES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setType(t)}
                          className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                            type === t
                              ? 'bg-[#722f37] border-[#d4af37] text-white shadow-lg'
                              : 'bg-white/5 border-white/10 text-[#baa49c] hover:text-white'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Condizionale Bollicine: Metodo di produzione (distingue prosecco e martinotti) */}
                  {type === 'Bollicine' && (
                    <div className="sm:col-span-2 p-3.5 rounded-xl bg-[#2a1320] border border-[#d4af37]/30">
                      <label className="block text-xs font-medium text-[#f5ebd7] mb-1.5">
                        Metodo di produzione delle bollicine *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {SPARKLING_METHODS.map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setSparklingMethod(m)}
                            className={`py-2 px-2 text-center rounded-xl text-xs font-medium transition-all border cursor-pointer ${
                              sparklingMethod === m
                                ? 'bg-[#722f37] border-[#d4af37] text-white shadow'
                                : 'bg-white/5 border-white/10 text-[#baa49c] hover:text-white'
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Condizionale Dolce: Stile di vino dolce (rosso, bianco, frizzante) */}
                  {type === 'Dolce' && (
                    <div className="sm:col-span-2 p-3.5 rounded-xl bg-[#2a1320] border border-[#d4af37]/30">
                      <label className="block text-xs font-medium text-[#f5ebd7] mb-1.5">
                        Stile del vino dolce *
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {SWEET_STYLES.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setSweetStyle(s)}
                            className={`py-2 px-2 text-center rounded-xl text-xs font-medium transition-all border cursor-pointer ${
                              sweetStyle === s
                                ? 'bg-[#722f37] border-[#d4af37] text-white shadow'
                                : 'bg-white/5 border-white/10 text-[#baa49c] hover:text-white'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Denominazione */}
                  <div>
                    <label className="block text-xs font-medium text-[#d1b8ab] mb-1">
                      Denominazione
                    </label>
                    <select
                      value={denomination}
                      onChange={(e) => setDenomination(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#23121b] border border-white/10 text-white text-sm outline-none focus:border-[#d4af37]"
                    >
                      {POPULAR_DENOMINATIONS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  {/* Regione - CAMPO DI SCRITTURA LIBERA */}
                  <div>
                    <label className="block text-xs font-medium text-[#d1b8ab] mb-1">
                      Regione (scrittura libera) *
                    </label>
                    <input
                      type="text"
                      required
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="es. Toscana, Langhe, Borgogna, Mendoza..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#d4af37] text-white text-sm outline-none"
                    />
                    <span className="text-[10px] text-[#baa49c] mt-0.5 block">
                      Potrai filtrare per questa regione nell'archivio
                    </span>
                  </div>

                  {/* Gradazione alcolica - CAMPO A SCRITTURA LIBERA */}
                  <div>
                    <label className="block text-xs font-medium text-[#d1b8ab] mb-1">
                      Gradazione alcolica (scrittura libera)
                    </label>
                    <input
                      type="text"
                      value={alcohol}
                      onChange={(e) => setAlcohol(e.target.value)}
                      placeholder="es. 14.5% o 13% vol"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#d4af37] text-white text-base sm:text-sm outline-none"
                    />
                  </div>

                  {/* Data degustazione */}
                  <div>
                    <label className="block text-xs font-medium text-[#d1b8ab] mb-1">
                      Data di degustazione
                    </label>
                    <input
                      type="date"
                      value={tastedDate}
                      onChange={(e) => setTastedDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none"
                    />
                  </div>
                </div>

                {/* Vitigni con ricerca e crocette */}
                <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                    <label className="block text-xs font-medium text-[#d1b8ab]">
                      Vitigni principali (seleziona con crocetta)
                    </label>
                    {/* Grape Search Bar */}
                    <div className="relative w-full sm:w-56">
                      <Search className="w-3.5 h-3.5 text-[#baa49c] absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={grapeSearch}
                        onChange={(e) => setGrapeSearch(e.target.value)}
                        placeholder="Cerca vitigno (es. Sangiovese)..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white outline-none focus:border-[#d4af37]"
                      />
                    </div>
                  </div>

                  {/* Chips grid */}
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 rounded-xl bg-black/40 border border-white/5">
                    {filteredGrapes.map(grape => {
                      const isSelected = selectedGrapes.includes(grape);
                      return (
                        <button
                          key={grape}
                          type="button"
                          onClick={() => toggleItem(selectedGrapes, setSelectedGrapes, grape)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-[#722f37] border-[#d4af37] text-white shadow-xs'
                              : 'bg-white/5 border-white/10 text-[#baa49c] hover:text-white'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                            isSelected ? 'border-white bg-[#d4af37] text-black font-bold' : 'border-white/30'
                          }`}>
                            {isSelected ? '✓' : ''}
                          </span>
                          {grape}
                        </button>
                      );
                    })}
                    {filteredGrapes.length === 0 && (
                      <p className="text-xs text-[#baa49c] p-2 italic">
                        Nessun vitigno trovato con questo nome. Aggiungilo come nuovo qui sotto!
                      </p>
                    )}
                  </div>

                  {/* Custom Grape add */}
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      value={customGrape}
                      onChange={(e) => setCustomGrape(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomGrape();
                        }
                      }}
                      placeholder="Altro vitigno personalizzato..."
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomGrape}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white cursor-pointer"
                    >
                      Aggiungi
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. DYNAMIC SOMMELIER SENSORY PROFILES (AIS / ONAV) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-1">
                  <h4 className="font-serif text-sm font-bold text-[#f5ebd7] uppercase tracking-wider">
                    2. Profilo sensoriale sommelier ({type})
                  </h4>
                  <span className="text-[11px] text-[#d4af37] italic">
                    Terminologia specifica per vini {type.toLowerCase()}
                  </span>
                </div>

                {/* Esame Visivo */}
                <div className="space-y-1.5">
                  <span className="block text-xs font-medium text-[#d1b8ab]">
                    Esame visivo:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentSensory.visual.map(t => {
                      const sel = selectedVisual.includes(t);
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleItem(selectedVisual, setSelectedVisual, t)}
                          className={`px-2.5 py-1 rounded-lg text-xs transition-all border cursor-pointer flex items-center gap-1.5 ${
                            sel ? 'bg-[#722f37] border-[#d4af37] text-white' : 'bg-white/5 border-white/10 text-[#baa49c]'
                          }`}
                        >
                          <span className={`w-3 h-3 rounded-xs border flex items-center justify-center text-[8px] ${sel ? 'bg-[#d4af37] border-white text-black font-bold' : 'border-white/30'}`}>
                            {sel ? '✓' : ''}
                          </span>
                          {t}
                        </button>
                      );
                    })}
                  </div>
                  {/* Visivo Altro */}
                  <input
                    type="text"
                    value={customVisual}
                    onChange={(e) => setCustomVisual(e.target.value)}
                    placeholder="Altro per l'esame visivo (scrittura libera)..."
                    className="w-full mt-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-[#d4af37]"
                  />
                </div>

                {/* Esame Olfattivo (Profumi singoli & tecnici) */}
                <div className="space-y-1.5">
                  <span className="block text-xs font-medium text-[#d1b8ab]">
                    Esame olfattivo (profumi e aromi tecnici):
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1.5 rounded-xl bg-black/20 border border-white/5">
                    {currentSensory.aromas.map(a => {
                      const sel = selectedAromas.includes(a);
                      return (
                        <button
                          key={a}
                          type="button"
                          onClick={() => toggleItem(selectedAromas, setSelectedAromas, a)}
                          className={`px-2.5 py-1 rounded-lg text-xs transition-all border cursor-pointer flex items-center gap-1.5 ${
                            sel ? 'bg-[#722f37] border-[#d4af37] text-white' : 'bg-white/5 border-white/10 text-[#baa49c]'
                          }`}
                        >
                          <span className={`w-3 h-3 rounded-xs border flex items-center justify-center text-[8px] ${sel ? 'bg-[#d4af37] border-white text-black font-bold' : 'border-white/30'}`}>
                            {sel ? '✓' : ''}
                          </span>
                          {a}
                        </button>
                      );
                    })}
                  </div>
                  {/* Aromi Altro */}
                  <input
                    type="text"
                    value={customAroma}
                    onChange={(e) => setCustomAroma(e.target.value)}
                    placeholder="Altri profumi o sentori specifici (scrittura libera)..."
                    className="w-full mt-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-[#d4af37]"
                  />
                </div>

                {/* Esame Gustativo */}
                <div className="space-y-1.5">
                  <span className="block text-xs font-medium text-[#d1b8ab]">
                    Esame gustativo (gusto e struttura):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentSensory.taste.map(ta => {
                      const sel = selectedTaste.includes(ta);
                      return (
                        <button
                          key={ta}
                          type="button"
                          onClick={() => toggleItem(selectedTaste, setSelectedTaste, ta)}
                          className={`px-2.5 py-1 rounded-lg text-xs transition-all border cursor-pointer flex items-center gap-1.5 ${
                            sel ? 'bg-[#722f37] border-[#d4af37] text-white' : 'bg-white/5 border-white/10 text-[#baa49c]'
                          }`}
                        >
                          <span className={`w-3 h-3 rounded-xs border flex items-center justify-center text-[8px] ${sel ? 'bg-[#d4af37] border-white text-black font-bold' : 'border-white/30'}`}>
                            {sel ? '✓' : ''}
                          </span>
                          {ta}
                        </button>
                      );
                    })}
                  </div>
                  {/* Gusto Altro */}
                  <input
                    type="text"
                    value={customTaste}
                    onChange={(e) => setCustomTaste(e.target.value)}
                    placeholder="Altro per l'esame gustativo (scrittura libera)..."
                    className="w-full mt-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-[#d4af37]"
                  />
                </div>

                {/* Assaggiato insieme a... */}
                <div className="space-y-1.5">
                  <span className="block text-xs font-medium text-[#d1b8ab]">
                    Assaggiato insieme a...
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_TASTED_WITH.map(p => {
                      const sel = selectedTastedWith.includes(p);
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => toggleItem(selectedTastedWith, setSelectedTastedWith, p)}
                          className={`px-2.5 py-1 rounded-lg text-xs transition-all border cursor-pointer flex items-center gap-1.5 ${
                            sel ? 'bg-[#722f37] border-[#d4af37] text-white' : 'bg-white/5 border-white/10 text-[#baa49c]'
                          }`}
                        >
                          <span className={`w-3 h-3 rounded-xs border flex items-center justify-center text-[8px] ${sel ? 'bg-[#d4af37] border-white text-black font-bold' : 'border-white/30'}`}>
                            {sel ? '✓' : ''}
                          </span>
                          {p}
                        </button>
                      );
                    })}
                  </div>
                  {/* Altro abbinamento o pietanza */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <input
                      type="text"
                      value={customTastedWith}
                      onChange={(e) => setCustomTastedWith(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomTastedWith();
                        }
                      }}
                      placeholder="Altra pietanza o piatto specifico..."
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomTastedWith}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white cursor-pointer"
                    >
                      Aggiungi
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. CAMPI DI SCRITTURA LIBERA: LE RECENSIONI DI COPPIA (TATO E TATA) */}
              <div className="space-y-4 p-5 rounded-2xl bg-gradient-to-br from-[#29131d] to-[#180c13] border border-[#d4af37]/35 shadow-lg">
                <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-2">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-[#f5ebd7] uppercase tracking-wider flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-400" /> 3. Le nostre recensioni di coppia
                    </h4>
                    <span className="text-[11px] text-[#d1b8ab]">
                      Spazio di scrittura libera per parole, sensazioni ed emozioni personali di Tato e Tata
                    </span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#f5ebd7]">
                    <input
                      type="checkbox"
                      checked={isFavorite}
                      onChange={(e) => setIsFavorite(e.target.checked)}
                      className="accent-[#d4af37] w-4 h-4 rounded cursor-pointer"
                    />
                    <span>Vino del cuore ❤️</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Recensione di Tato */}
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#d1b8ab]">Voto di Tato:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setHeRating(star)}
                            className={`text-base cursor-pointer ${star <= heRating ? 'text-[#d4af37]' : 'text-zinc-600'}`}
                          >
                            ★
                          </button>
                        ))}
                        <span className="text-xs text-white ml-1 font-semibold">{heRating}/5</span>
                      </div>
                    </div>
                    <textarea
                      rows={3}
                      value={heNotes}
                      onChange={(e) => setHeNotes(e.target.value)}
                      placeholder="Cosa ne pensa Tato (recensione libera)..."
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  {/* Recensione di Tata */}
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#d1b8ab]">Voto di Tata:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setSheRating(star)}
                            className={`text-base cursor-pointer ${star <= sheRating ? 'text-[#d4af37]' : 'text-zinc-600'}`}
                          >
                            ★
                          </button>
                        ))}
                        <span className="text-xs text-white ml-1 font-semibold">{sheRating}/5</span>
                      </div>
                    </div>
                    <textarea
                      rows={3}
                      value={sheNotes}
                      onChange={(e) => setSheNotes(e.target.value)}
                      placeholder="Cosa ne pensa Tata (recensione libera)..."
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#d1b8ab] mb-1">
                    Il nostro momento speciale o ricordo
                  </label>
                  <textarea
                    rows={2}
                    value={momentNotes}
                    onChange={(e) => setMomentNotes(e.target.value)}
                    placeholder="es. Cena per il nostro secondo anniversario a San Quirico d'Orcia, stappato a mezzanotte..."
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-[#d4af37] text-white text-xs outline-none"
                  />
                </div>
              </div>

              {/* Cellar Inventory Integration */}
              <div className="p-4 rounded-2xl bg-[#1b0f15] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-[#f5ebd7] block">
                      Aggiungi a la nostra cantinetta?
                    </span>
                    <span className="text-[11px] text-[#baa49c]">
                      Tiene traccia delle scorte fisiche presenti a casa
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={inCellarInventory}
                    onChange={(e) => setInCellarInventory(e.target.checked)}
                    className="accent-[#d4af37] w-5 h-5 rounded cursor-pointer"
                  />
                </div>

                {inCellarInventory && (
                  <div className="pt-3 border-t border-white/10 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-medium text-[#d1b8ab] mb-1">
                          Quantità in cantina
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={cellarQuantity}
                          onChange={(e) => setCellarQuantity(parseInt(e.target.value, 10) || 1)}
                          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-[#d4af37]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[#d1b8ab] mb-1">
                          Finestra di beva consigliata
                        </label>
                        <select
                          value={drinkingWindowOption}
                          onChange={(e) => setDrinkingWindowOption(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#1d0e15] border border-white/10 text-xs text-white outline-none focus:border-[#d4af37]"
                        >
                          {DRINKING_WINDOW_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {drinkingWindowOption === 'Altro (personalizzato)' && (
                      <div className="animate-in fade-in duration-200">
                        <label className="block text-[11px] font-medium text-[#d1b8ab] mb-1">
                          Specifica finestra di beva personalizzata
                        </label>
                        <input
                          type="text"
                          value={customDrinkingWindow}
                          onChange={(e) => setCustomDrinkingWindow(e.target.value)}
                          placeholder="es. Da stappare per l'anniversario 2028"
                          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-[#d4af37]"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-[#d4af37]/20 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-[#d1b8ab] hover:text-white text-xs font-medium hover:bg-white/5 transition-colors cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8a1c2f] to-[#b32b43] text-white text-xs font-semibold tracking-wide shadow-lg hover:brightness-110 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
              {wineToEdit ? 'Salva modifiche' : 'Archivia nella collezione'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
