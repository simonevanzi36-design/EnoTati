export type WineType = 'Rosso' | 'Bianco' | 'Rosato' | 'Bollicine' | 'Dolce';

export interface CoupleImpressions {
  heRating: number;      // 1 to 5 (Voto di Tato)
  sheRating: number;     // 1 to 5 (Voto di Tata)
  heNotes?: string;      // "Cosa ne pensa Tato"
  sheNotes?: string;     // "Cosa ne pensa Tata"
  momentNotes?: string;  // "Il nostro momento / occasione speciale"
  isFavorite?: boolean;  // Vino del cuore di coppia
  boughtTogether?: boolean;
}

export interface WineItem {
  id: string;
  name: string;
  winery: string;
  vintage?: number | null;
  type: WineType;
  denomination?: string; // DOCG, DOC, IGT, etc.
  grapes?: string;
  region: string;
  country: string;
  alcohol?: string;
  photoUrl?: string;
  backPhotoUrl?: string; // Foto del retro della bottiglia (non visibile sul modello 3D)
  
  // Specific subtypes
  sparklingMethod?: string; // Metodo classico, Metodo Martinotti / Charmat, Prosecco, Metodo ancestrale
  sweetStyle?: string;      // Rosso dolce, Bianco dolce / passito, Frizzante dolce
  
  // Sensory notes
  visualNotes?: string;
  aromaNotes?: string;
  tasteNotes?: string;
  generalNotes?: string;
  
  // Pairings & food tasted with
  foodPairings?: string[]; // "Assaggiato insieme a..."
  pricePaid?: number;
  
  // Couple ratings & memories
  coupleImpressions: CoupleImpressions;
  tastedAt: string; // ISO date string
  
  // 3D Cabinet position & Cellar Inventory
  shelfSlot?: number;
  inCellarInventory?: boolean;
  cellarQuantity?: number;
  drinkingWindow?: string;
}

export interface WineryVisit {
  id: string;
  wineryName: string;
  region: string;
  location: string;
  visitDate: string;
  photos: string[];
  hospitalityRating: number; // 1-5
  experienceNotes: string;
  coupleMemories: string;
  winesTastedNames: string[];
}

export interface WineFilterState {
  searchQuery: string;
  typeFilter: WineType | 'ALL';
  regionFilter: string;
  minRating: number;
  onlyFavorites: boolean;
  sortBy: 'date-desc' | 'date-asc' | 'rating-desc' | 'name-asc' | 'price-desc';
}

export interface Milestone {
  level: number;
  title: string;
  badge: string;
  targetCount: number;
  unlocked: boolean;
  description: string;
}
