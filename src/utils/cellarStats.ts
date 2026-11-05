import { WineItem, WineType, WineFilterState, Milestone } from '../types/wine';

export const MILESTONES_TIERS: Array<{ level: number; title: string; badge: string; target: number; description: string }> = [
  { level: 1, title: 'Primi Brindisi', badge: '🥂', target: 3, description: 'L\'inizio del vostro diario di coppia!' },
  { level: 2, title: 'Calici Curiosi', badge: '🍇', target: 6, description: 'State scoprendo insieme nuovi terroir e profumi.' },
  { level: 3, title: 'Sommelier Affiatati', badge: '🍷', target: 12, description: 'Una vera collezione di ricordi e annate speciali.' },
  { level: 4, title: 'Conoscitori del Terroir', badge: '🏰', target: 24, description: 'Il vostro palato di coppia riconosce grandi sfumature!' },
  { level: 5, title: 'Maîtres de Cave', badge: '👑', target: 50, description: 'Un grande armadio cantina ricco di passione e magia.' }
];

export function getProgressionMilestones(totalTasted: number): {
  currentTier: Milestone;
  nextTier: Milestone | null;
  progressPercent: number;
  allTiers: Milestone[];
} {
  const allTiers: Milestone[] = MILESTONES_TIERS.map(tier => ({
    level: tier.level,
    title: tier.title,
    badge: tier.badge,
    targetCount: tier.target,
    unlocked: totalTasted >= tier.target,
    description: tier.description
  }));

  const unlockedTiers = allTiers.filter(t => t.unlocked);
  const currentTier = unlockedTiers.length > 0
    ? unlockedTiers[unlockedTiers.length - 1]
    : {
        level: 0,
        title: 'Appena Iniziato',
        badge: '✨',
        targetCount: 1,
        unlocked: false,
        description: 'Aggiungete il vostro primo calice insieme.'
      };

  const nextTier = allTiers.find(t => !t.unlocked) || null;

  let progressPercent = 100;
  if (nextTier) {
    const prevTarget = currentTier.level === 0 ? 0 : currentTier.targetCount;
    const range = nextTier.targetCount - prevTarget;
    const progressInRange = Math.max(0, totalTasted - prevTarget);
    progressPercent = Math.min(100, Math.round((progressInRange / range) * 100));
  }

  return {
    currentTier,
    nextTier,
    progressPercent,
    allTiers
  };
}

export interface WineColors {
  wineColor: number;      // Hex for Three.js
  glassColor: number;
  capsuleColor: number;
  cssBgColor: string;
  badgeBorder: string;
  labelBg: string;
  glowColor: string;
}

export function getWineColors(type: WineType): WineColors {
  switch (type) {
    case 'Rosso':
      return {
        wineColor: 0x580816,      // Deep rich ruby bordeaux
        glassColor: 0x141f17,     // Classic dark olive-green wine bottle glass
        capsuleColor: 0x821c2c,   // Burgundy foil
        cssBgColor: '#470d18',
        badgeBorder: 'border-rose-900/60',
        labelBg: 'bg-[#470d18]/40',
        glowColor: 'rgba(130, 28, 44, 0.4)'
      };
    case 'Bianco':
      return {
        wineColor: 0xd9c264,      // Golden straw yellow
        glassColor: 0x22361d,     // Pale antique green
        capsuleColor: 0xd4af37,   // Gold foil
        cssBgColor: '#6e5a1b',
        badgeBorder: 'border-amber-700/60',
        labelBg: 'bg-[#755f17]/40',
        glowColor: 'rgba(217, 194, 100, 0.35)'
      };
    case 'Rosato':
      return {
        wineColor: 0xf4b4c2,      // Rosa tenue (soft delicate pink)
        glassColor: 0xffedf1,     // Clear light blush glass
        capsuleColor: 0xdf167b,   // Corona in alto fucsia brillante
        cssBgColor: '#a81c5d',
        badgeBorder: 'border-fuchsia-800/60',
        labelBg: 'bg-[#a81c5d]/40',
        glowColor: 'rgba(223, 22, 123, 0.4)'
      };
    case 'Bollicine':
      return {
        wineColor: 0xf8f3c8,      // Giallo chiarissimo
        glassColor: 0xfbf8e6,     // Pale luminous champagne glass
        capsuleColor: 0x9ca3af,   // Corona in alto grigia metallica
        cssBgColor: '#4b5563',
        badgeBorder: 'border-slate-500/60',
        labelBg: 'bg-[#4b5563]/40',
        glowColor: 'rgba(156, 163, 175, 0.45)'
      };
    case 'Dolce':
      return {
        wineColor: 0xc97a18,      // Deep amber passito
        glassColor: 0x291f16,     // Warm amber glass
        capsuleColor: 0xb58032,   // Bronze gold
        cssBgColor: '#73410c',
        badgeBorder: 'border-amber-800/60',
        labelBg: 'bg-[#73410c]/40',
        glowColor: 'rgba(201, 122, 24, 0.4)'
      };
    default:
      return {
        wineColor: 0x4a0e17,
        glassColor: 0x1a261a,
        capsuleColor: 0xa8324a,
        cssBgColor: '#4a0e17',
        badgeBorder: 'border-rose-900/60',
        labelBg: 'bg-[#4a0e17]/40',
        glowColor: 'rgba(168, 50, 74, 0.3)'
      };
  }
}

export function filterWines(wines: WineItem[], filters: WineFilterState): WineItem[] {
  return wines.filter(wine => {
    // Search query matches name, winery, grapes, region
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchName = wine.name.toLowerCase().includes(q);
      const matchWinery = wine.winery.toLowerCase().includes(q);
      const matchGrapes = wine.grapes?.toLowerCase().includes(q) ?? false;
      const matchRegion = wine.region.toLowerCase().includes(q);
      const matchNotes = (wine.generalNotes || '').toLowerCase().includes(q) ||
        (wine.coupleImpressions.momentNotes || '').toLowerCase().includes(q);
      if (!matchName && !matchWinery && !matchGrapes && !matchRegion && !matchNotes) {
        return false;
      }
    }

    // Type filter
    if (filters.typeFilter !== 'ALL' && wine.type !== filters.typeFilter) {
      return false;
    }

    // Region filter
    if (filters.regionFilter && filters.regionFilter !== 'ALL' && wine.region !== filters.regionFilter) {
      return false;
    }

    // Min rating (based on couple average)
    const heRating = wine.coupleImpressions?.heRating ?? 5;
    const sheRating = wine.coupleImpressions?.sheRating ?? 5;
    const avgRating = (heRating + sheRating) / 2;
    if (avgRating < filters.minRating) {
      return false;
    }

    // Only favorites
    if (filters.onlyFavorites && !wine.coupleImpressions?.isFavorite) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'date-desc':
        return new Date(b.tastedAt).getTime() - new Date(a.tastedAt).getTime();
      case 'date-asc':
        return new Date(a.tastedAt).getTime() - new Date(b.tastedAt).getTime();
      case 'rating-desc': {
        const avgA = ((a.coupleImpressions?.heRating ?? 5) + (a.coupleImpressions?.sheRating ?? 5)) / 2;
        const avgB = ((b.coupleImpressions?.heRating ?? 5) + (b.coupleImpressions?.sheRating ?? 5)) / 2;
        return avgB - avgA;
      }
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'price-desc':
        return (b.pricePaid || 0) - (a.pricePaid || 0);
      default:
        return 0;
    }
  });
}

export interface ArmadioCoordinates {
  shelfIndex: number;
  colIndex: number;
  x: number;
  y: number;
  z: number;
}

export function calculateArmadioSlot(
  slotIndex: number,
  bottlesPerShelf = 6,
  shelfHeight = 1.35,
  bottleSpacing = 0.52
): ArmadioCoordinates {
  const shelfIndex = Math.floor(slotIndex / bottlesPerShelf);
  const colIndex = slotIndex % bottlesPerShelf;

  // Center horizontally around 0
  const startX = -((bottlesPerShelf - 1) * bottleSpacing) / 2;
  const x = startX + colIndex * bottleSpacing;
  
  // Shelves go from top to bottom or bottom to top
  // Shelf 0 at bottom shelf base y = -1.2, each shelf up adds shelfHeight
  const y = -1.1 + shelfIndex * shelfHeight;
  const z = 0; // In shelf slot

  return { shelfIndex, colIndex, x, y, z };
}

export function getWineTypesBreakdown(wines: WineItem[]): Record<WineType, number> {
  const initial: Record<WineType, number> = {
    Rosso: 0,
    Bianco: 0,
    Rosato: 0,
    Bollicine: 0,
    Dolce: 0
  };

  return wines.reduce((acc, wine) => {
    acc[wine.type] = (acc[wine.type] || 0) + 1;
    return acc;
  }, initial);
}

export function getCellarInventorySummary(wines: WineItem[]) {
  const inCellar = wines.filter(w => w.inCellarInventory && (w.cellarQuantity ?? 0) > 0);
  const totalBottlesCount = inCellar.reduce((sum, w) => sum + (w.cellarQuantity || 0), 0);
  const totalValue = inCellar.reduce((sum, w) => sum + ((w.cellarQuantity || 0) * (w.pricePaid || 0)), 0);

  return {
    uniqueLabels: inCellar.length,
    totalBottlesCount,
    totalValue,
    items: inCellar
  };
}
