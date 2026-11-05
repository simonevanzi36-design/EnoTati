import React, { useState, useEffect } from 'react';
import { WineItem, WineryVisit, WineType } from './types/wine';
import { INITIAL_WINES, INITIAL_WINERY_VISITS } from './data/initialData';
import { ThreeArmadioShowcase } from './components/ThreeArmadioShowcase';
import { WineCatalogView } from './components/WineCatalogView';
import { CellarInventoryView } from './components/CellarInventoryView';
import { WineryVisitsView } from './components/WineryVisitsView';
import { SommelierRecommender } from './components/SommelierRecommender';
import { WineIdentityModal } from './components/WineIdentityModal';
import { WineCatalogFormModal } from './components/WineCatalogFormModal';
import { ArtisticLogo } from './components/ArtisticLogo';
import { CoupleAuthGate } from './components/CoupleAuthGate';
import { 
  Wine, Box, Compass, Sparkles, Plus, BookOpen, Undo2, CheckCircle2, LogOut, X, Heart
} from 'lucide-react';

type TabType = 'armadio' | 'catalogo' | 'cantinetta' | 'visite' | 'sommelier';

export default function App() {
  // Couple Authentication State (ITATI / IBBINO)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('enotati_auth') === 'true';
    } catch {
      return false;
    }
  });

  const handleLogout = () => {
    try {
      localStorage.removeItem('enotati_auth');
    } catch (e) {
      console.error(e);
    }
    setIsAuthenticated(false);
  };

  // Navigation with previous tab tracking for "Indietro" button
  const [activeTab, setActiveTab] = useState<TabType>('armadio');
  const [prevTab, setPrevTab] = useState<TabType | null>(null);

  const navigateToTab = (newTab: TabType) => {
    if (newTab !== activeTab) {
      setPrevTab(activeTab);
      setActiveTab(newTab);
    }
  };

  const handleGoBack = () => {
    if (prevTab && prevTab !== activeTab) {
      setActiveTab(prevTab);
    } else {
      setActiveTab('armadio');
    }
  };

  // App Data with localStorage persistence
  const [wines, setWines] = useState<WineItem[]>(() => {
    try {
      const saved = localStorage.getItem('enotati_wines');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_WINES;
  });

  const [wineryVisits, setWineryVisits] = useState<WineryVisit[]>(() => {
    try {
      const saved = localStorage.getItem('enotati_visits');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_WINERY_VISITS;
  });

  // Undo notification state for accidental changes
  const [undoToast, setUndoToast] = useState<{
    message: string;
    action: () => void;
  } | null>(null);

  // Auto-dismiss undo notification after 7 seconds
  useEffect(() => {
    if (!undoToast) return;
    const timer = setTimeout(() => {
      setUndoToast(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, [undoToast]);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('enotati_wines', JSON.stringify(wines));
  }, [wines]);

  useEffect(() => {
    localStorage.setItem('enotati_visits', JSON.stringify(wineryVisits));
  }, [wineryVisits]);

  // Selected Wine for Identity Modal
  const [selectedWine, setSelectedWine] = useState<WineItem | null>(null);

  // Form Modal (Add / Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [wineToEdit, setWineToEdit] = useState<WineItem | null>(null);

  // 3D Placing Animation
  const [animatingWineId, setAnimatingWineId] = useState<string | null>(null);

  // Handlers
  const handleSaveWine = (wineData: Omit<WineItem, 'id'>, isEditingId?: string) => {
    if (isEditingId) {
      // Update existing with undo option
      const previousState = wines.find(w => w.id === isEditingId);
      setWines(prev => prev.map(w => w.id === isEditingId ? { ...wineData, id: isEditingId } : w));
      if (selectedWine?.id === isEditingId) {
        setSelectedWine({ ...wineData, id: isEditingId });
      }

      if (previousState) {
        setUndoToast({
          message: `Modifiche salvate per "${wineData.name}".`,
          action: () => {
            setWines(prev => prev.map(w => w.id === isEditingId ? previousState : w));
            setUndoToast(null);
          }
        });
      }
    } else {
      // Add new
      const newId = `wine-${Date.now()}`;
      const newWine: WineItem = {
        ...wineData,
        id: newId,
        shelfSlot: wines.length
      };
      setWines(prev => [newWine, ...prev]);

      // Switch to Collezione and trigger placement animation!
      setActiveTab('armadio');
      setAnimatingWineId(newId);

      setUndoToast({
        message: `"${wineData.name}" aggiunto alla collezione!`,
        action: () => {
          setWines(prev => prev.filter(w => w.id !== newId));
          setUndoToast(null);
        }
      });
    }

    setIsFormOpen(false);
    setWineToEdit(null);
  };

  const handleDeleteWine = (wineId: string) => {
    const deletedWine = wines.find(w => w.id === wineId);
    setWines(prev => prev.filter(w => w.id !== wineId));
    if (selectedWine?.id === wineId) {
      setSelectedWine(null);
    }

    if (deletedWine) {
      setUndoToast({
        message: `"${deletedWine.name}" eliminato.`,
        action: () => {
          setWines(prev => [deletedWine, ...prev]);
          setUndoToast(null);
        }
      });
    }
  };

  const handleUpdateCellarQuantity = (wineId: string, newQty: number) => {
    setWines(prev => prev.map(w => {
      if (w.id === wineId) {
        return {
          ...w,
          inCellarInventory: newQty > 0,
          cellarQuantity: newQty
        };
      }
      return w;
    }));
  };

  const handleDrinkCellarBottle = (wine: WineItem) => {
    const currentQty = wine.cellarQuantity ?? 0;
    if (currentQty <= 0) return;

    handleUpdateCellarQuantity(wine.id, currentQty - 1);
  };

  // Flow: "Stappa e degusta" opens pre-filled review card
  const handleStappaEDegustaFlow = (cellarWine: WineItem) => {
    setWineToEdit({
      id: '', // Will create a new tasted entry or update review
      name: cellarWine.name,
      winery: cellarWine.winery,
      vintage: cellarWine.vintage,
      type: cellarWine.type,
      denomination: cellarWine.denomination,
      sparklingMethod: cellarWine.sparklingMethod,
      sweetStyle: cellarWine.sweetStyle,
      grapes: cellarWine.grapes,
      region: cellarWine.region,
      country: cellarWine.country,
      alcohol: cellarWine.alcohol,
      photoUrl: cellarWine.photoUrl,
      backPhotoUrl: cellarWine.backPhotoUrl,
      pricePaid: cellarWine.pricePaid,
      visualNotes: cellarWine.visualNotes || '',
      aromaNotes: cellarWine.aromaNotes || '',
      tasteNotes: cellarWine.tasteNotes || '',
      foodPairings: cellarWine.foodPairings || [],
      tastedAt: new Date().toISOString(),
      coupleImpressions: {
        heRating: 5,
        sheRating: 5,
        heNotes: '',
        sheNotes: '',
        momentNotes: `Stappato insieme dalla nostra cantinetta`,
        isFavorite: cellarWine.coupleImpressions?.isFavorite || false,
        boughtTogether: true
      },
      // In cellar: reduce quantity by 1
      inCellarInventory: (cellarWine.cellarQuantity ?? 1) > 1,
      cellarQuantity: Math.max(0, (cellarWine.cellarQuantity ?? 1) - 1),
      drinkingWindow: cellarWine.drinkingWindow
    });
    setIsFormOpen(true);
  };

  const handleReplayArmadioAnimation = (wine: WineItem) => {
    setActiveTab('armadio');
    setAnimatingWineId(wine.id);
  };

  const handleAddFromRecommendation = (rec: any) => {
    setWineToEdit({
      id: '',
      name: rec.name,
      winery: rec.winery,
      vintage: rec.vintage || null,
      type: (rec.type as WineType) || 'Rosso',
      denomination: 'DOCG',
      grapes: rec.grapes,
      region: rec.region.split(',')[0] || 'Italia',
      country: 'Italia',
      pricePaid: 30,
      tastedAt: new Date().toISOString(),
      visualNotes: '',
      aromaNotes: '',
      tasteNotes: '',
      generalNotes: rec.whyForCouple,
      foodPairings: rec.pairingIdea ? [rec.pairingIdea] : [],
      coupleImpressions: {
        heRating: 5,
        sheRating: 5,
        momentNotes: 'Consigliato dal sommelier e provato insieme!',
        isFavorite: false
      }
    });
    setIsFormOpen(true);
  };

  const handleAddWineryVisit = (newVisit: Omit<WineryVisit, 'id'>) => {
    const v: WineryVisit = {
      ...newVisit,
      id: `visit-${Date.now()}`
    };
    setWineryVisits(prev => [v, ...prev]);
  };

  const handleDeleteWineryVisit = (visitId: string) => {
    const deleted = wineryVisits.find(v => v.id === visitId);
    setWineryVisits(prev => prev.filter(v => v.id !== visitId));
    if (deleted) {
      setUndoToast({
        message: `Visita a "${deleted.wineryName}" eliminata.`,
        action: () => {
          setWineryVisits(prev => [deleted, ...prev]);
          setUndoToast(null);
        }
      });
    }
  };

  if (!isAuthenticated) {
    return <CoupleAuthGate onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#0f0a0d] text-[#f3ebe6] flex flex-col font-sans selection:bg-[#722f37] selection:text-white">
      {/* Top Luxury Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#140b0f]/95 border-b border-[#d4af37]/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Stylized & Artistic Logo and Brand: EnoTati */}
          <div 
            onClick={() => navigateToTab('armadio')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <ArtisticLogo className="w-11 h-11 sm:w-12 sm:h-12 transition-transform duration-300 group-hover:scale-105" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-cinzel text-2xl sm:text-3xl font-bold tracking-wider text-[#f5ebd7]">
                  Eno<span className="text-[#d4af37] font-serif italic">Tati</span>
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider rounded-full bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30">
                  <Heart className="w-2.5 h-2.5 fill-[#d4af37]" />
                  Tato & Tata
                </span>
              </div>
              <p className="text-[11px] text-[#baa49c] font-serif italic truncate max-w-[200px] sm:max-w-none">
                I nostri calici, le recensioni e la cantinetta insieme
              </p>
            </div>
          </div>

          {/* Quick Actions: New Wine & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                setWineToEdit(null);
                setIsFormOpen(true);
              }}
              className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#8a1c2f] via-[#a8253d] to-[#722f37] text-white text-xs sm:text-sm font-semibold tracking-wide flex items-center gap-1.5 sm:gap-2 shadow-lg hover:brightness-110 border border-[#d4af37]/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#d4af37]" />
              <span className="hidden sm:inline">Nuovo calice</span>
              <span className="sm:hidden text-xs">Nuovo</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#baa49c] hover:text-[#f3ebe6] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Esci da EnoTati"
              aria-label="Disconnetti"
            >
              <LogOut className="w-4 h-4 text-[#d4af37]" />
              <span className="hidden md:inline">Esci</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar - Visible on desktop and tablet, bottom bar on mobile */}
        <div className="hidden sm:flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5 items-center gap-1 sm:gap-2 overflow-x-auto py-2">
          <button
            onClick={() => navigateToTab('armadio')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'armadio'
                ? 'bg-[#722f37] text-white shadow-md border border-[#d4af37]/40'
                : 'text-[#baa49c] hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#d4af37]" />
            Collezione
          </button>

          <button
            onClick={() => navigateToTab('catalogo')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'catalogo'
                ? 'bg-[#722f37] text-white shadow-md border border-[#d4af37]/40'
                : 'text-[#baa49c] hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#d4af37]" />
            Archivio
          </button>

          <button
            onClick={() => navigateToTab('cantinetta')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'cantinetta'
                ? 'bg-[#722f37] text-white shadow-md border border-[#d4af37]/40'
                : 'text-[#baa49c] hover:text-white hover:bg-white/5'
            }`}
          >
            <Box className="w-4 h-4 text-[#d4af37]" />
            La nostra cantinetta
          </button>

          <button
            onClick={() => navigateToTab('visite')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'visite'
                ? 'bg-[#722f37] text-white shadow-md border border-[#d4af37]/40'
                : 'text-[#baa49c] hover:text-white hover:bg-white/5'
            }`}
          >
            <Compass className="w-4 h-4 text-[#d4af37]" />
            Visite in cantina ({wineryVisits.length})
          </button>

          <button
            onClick={() => navigateToTab('sommelier')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'sommelier'
                ? 'bg-[#722f37] text-white shadow-md border border-[#d4af37]/40'
                : 'text-[#baa49c] hover:text-white hover:bg-white/5'
            }`}
          >
            <Wine className="w-4 h-4 text-[#d4af37]" />
            Consigli del sommelier
          </button>
        </div>
      </header>

      {/* Floating Undo Notification with explicit X dismiss button */}
      {undoToast && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-auto z-50 p-3 sm:p-4 rounded-2xl bg-[#29131d]/95 border border-[#d4af37]/40 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300 max-w-md">
          <div className="flex items-center gap-2 text-xs text-[#f5ebd7] min-w-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">{undoToast.message}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={undoToast.action}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#d4af37] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Undo2 className="w-3.5 h-3.5" />
              Annulla
            </button>
            <button
              onClick={() => setUndoToast(null)}
              className="p-1.5 rounded-xl text-[#baa49c] hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              title="Chiudi notifica"
              aria-label="Chiudi notifica"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-28 sm:pb-8">
        {activeTab === 'armadio' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <ThreeArmadioShowcase
              wines={wines}
              onSelectWine={(w) => setSelectedWine(w)}
              onAddNewWine={() => {
                setWineToEdit(null);
                setIsFormOpen(true);
              }}
              onGoBack={handleGoBack}
              animatingWineId={animatingWineId}
              onAnimationComplete={() => setAnimatingWineId(null)}
            />

            {/* Quick summary below armadio with sentence case */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#1a0e14] border border-white/5 text-center">
                <span className="text-[11px] text-[#baa49c] uppercase font-semibold block">Totale calici</span>
                <span className="text-2xl font-serif font-bold text-white mt-1 block">{wines.length}</span>
              </div>
              <div className="p-4 rounded-xl bg-[#1a0e14] border border-white/5 text-center">
                <span className="text-[11px] text-[#baa49c] uppercase font-semibold block">Vini del cuore ❤️</span>
                <span className="text-2xl font-serif font-bold text-rose-300 mt-1 block">
                  {wines.filter(w => w.coupleImpressions.isFavorite).length}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-[#1a0e14] border border-white/5 text-center">
                <span className="text-[11px] text-[#baa49c] uppercase font-semibold block">In cantinetta</span>
                <span className="text-2xl font-serif font-bold text-emerald-400 mt-1 block">
                  {wines.reduce((sum, w) => sum + (w.inCellarInventory ? (w.cellarQuantity || 0) : 0), 0)}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-[#1a0e14] border border-white/5 text-center">
                <span className="text-[11px] text-[#baa49c] uppercase font-semibold block">Visite tenute</span>
                <span className="text-2xl font-serif font-bold text-[#d4af37] mt-1 block">{wineryVisits.length}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'catalogo' && (
          <div className="animate-in fade-in duration-300">
            <WineCatalogView
              wines={wines}
              onSelectWine={(w) => setSelectedWine(w)}
              onAddNewWine={() => {
                setWineToEdit(null);
                setIsFormOpen(true);
              }}
              onViewInArmadio={() => {
                navigateToTab('armadio');
              }}
              onDeleteWine={handleDeleteWine}
              onGoBack={handleGoBack}
            />
          </div>
        )}

        {activeTab === 'cantinetta' && (
          <div className="animate-in fade-in duration-300">
            <CellarInventoryView
              wines={wines}
              onUpdateQuantity={handleUpdateCellarQuantity}
              onDrinkBottle={handleDrinkCellarBottle}
              onStappaEDegusta={handleStappaEDegustaFlow}
              onOpenIdentityCard={(w) => setSelectedWine(w)}
              onAddNewBottle={() => {
                setWineToEdit(null);
                setIsFormOpen(true);
              }}
              onGoBack={handleGoBack}
            />
          </div>
        )}

        {activeTab === 'visite' && (
          <div className="animate-in fade-in duration-300">
            <WineryVisitsView
              visits={wineryVisits}
              onAddVisit={handleAddWineryVisit}
              onDeleteVisit={handleDeleteWineryVisit}
              onGoBack={handleGoBack}
            />
          </div>
        )}

        {activeTab === 'sommelier' && (
          <div className="animate-in fade-in duration-300">
            <SommelierRecommender
              tastedWines={wines}
              onAddAsTasted={handleAddFromRecommendation}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 py-6 text-center text-xs text-[#baa49c] bg-[#12080c] mb-16 sm:mb-0">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-serif italic text-sm text-[#e8d5be]">
            "Il vino aggiunge un sorriso all'amicizia ed una scintilla all'amore."
          </p>
          <p className="text-[11px] text-[#8e7a72]">
            EnoTati • Diario enologico di coppia & collezione 3D
          </p>
        </div>
      </footer>

      {/* Mobile Fixed Bottom Navigation Bar (Optimized for Android smartphones and Apple iPad/iPhone touch) */}
      <nav 
        aria-label="Navigazione mobile"
        className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-[#140b0f]/95 border-t border-[#d4af37]/25 backdrop-blur-xl px-1.5 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom,0.5rem))] flex items-center justify-around shadow-[0_-8px_25px_rgba(0,0,0,0.7)]"
      >
        <button
          onClick={() => navigateToTab('armadio')}
          className={`flex-1 py-1 px-1 flex flex-col items-center justify-center gap-1 text-[10px] transition-all rounded-xl cursor-pointer ${
            activeTab === 'armadio'
              ? 'text-[#d4af37] font-semibold'
              : 'text-[#baa49c] hover:text-white'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'armadio' ? 'bg-[#722f37] text-white shadow-md border border-[#d4af37]/40' : ''}`}>
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="truncate max-w-[56px]">Collezione</span>
        </button>

        <button
          onClick={() => navigateToTab('catalogo')}
          className={`flex-1 py-1 px-1 flex flex-col items-center justify-center gap-1 text-[10px] transition-all rounded-xl cursor-pointer ${
            activeTab === 'catalogo'
              ? 'text-[#d4af37] font-semibold'
              : 'text-[#baa49c] hover:text-white'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'catalogo' ? 'bg-[#722f37] text-white shadow-md border border-[#d4af37]/40' : ''}`}>
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="truncate max-w-[56px]">Archivio</span>
        </button>

        <button
          onClick={() => navigateToTab('cantinetta')}
          className={`flex-1 py-1 px-1 flex flex-col items-center justify-center gap-1 text-[10px] transition-all rounded-xl cursor-pointer ${
            activeTab === 'cantinetta'
              ? 'text-[#d4af37] font-semibold'
              : 'text-[#baa49c] hover:text-white'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'cantinetta' ? 'bg-[#722f37] text-white shadow-md border border-[#d4af37]/40' : ''}`}>
            <Box className="w-4 h-4" />
          </div>
          <span className="truncate max-w-[56px]">Cantinetta</span>
        </button>

        <button
          onClick={() => navigateToTab('visite')}
          className={`flex-1 py-1 px-1 flex flex-col items-center justify-center gap-1 text-[10px] transition-all rounded-xl cursor-pointer ${
            activeTab === 'visite'
              ? 'text-[#d4af37] font-semibold'
              : 'text-[#baa49c] hover:text-white'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'visite' ? 'bg-[#722f37] text-white shadow-md border border-[#d4af37]/40' : ''}`}>
            <Compass className="w-4 h-4" />
          </div>
          <span className="truncate max-w-[56px]">Visite</span>
        </button>

        <button
          onClick={() => navigateToTab('sommelier')}
          className={`flex-1 py-1 px-1 flex flex-col items-center justify-center gap-1 text-[10px] transition-all rounded-xl cursor-pointer ${
            activeTab === 'sommelier'
              ? 'text-[#d4af37] font-semibold'
              : 'text-[#baa49c] hover:text-white'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'sommelier' ? 'bg-[#722f37] text-white shadow-md border border-[#d4af37]/40' : ''}`}>
            <Wine className="w-4 h-4" />
          </div>
          <span className="truncate max-w-[56px]">Sommelier</span>
        </button>
      </nav>

      {/* Wine Identity Card Modal */}
      {selectedWine && (
        <WineIdentityModal
          wine={selectedWine}
          onClose={() => setSelectedWine(null)}
          onEdit={(w) => {
            setWineToEdit(w);
            setIsFormOpen(true);
          }}
          onDelete={handleDeleteWine}
          onReplayArmadioAnimation={handleReplayArmadioAnimation}
          onDrinkFromCellar={handleDrinkCellarBottle}
        />
      )}

      {/* Wine Catalog / Add / Edit Form Modal */}
      {isFormOpen && (
        <WineCatalogFormModal
          wineToEdit={wineToEdit}
          onClose={() => {
            setIsFormOpen(false);
            setWineToEdit(null);
          }}
          onSave={handleSaveWine}
        />
      )}
    </div>
  );
}
