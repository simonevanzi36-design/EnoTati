import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  getProgressionMilestones, 
  getWineColors, 
  filterWines, 
  calculateArmadioSlot,
  getWineTypesBreakdown,
  getCellarInventorySummary
} from './cellarStats';
import { WineItem, WineFilterState } from '../types/wine';

const mockWines: WineItem[] = [
  {
    id: 'wine-1',
    name: 'Brunello di Montalcino',
    winery: 'Biondi Santi',
    vintage: 2016,
    type: 'Rosso',
    region: 'Toscana',
    country: 'Italia',
    pricePaid: 120,
    coupleImpressions: {
      heRating: 5,
      sheRating: 4.8,
      isFavorite: true,
      momentNotes: 'Cena anniversario'
    },
    tastedAt: '2024-05-10T20:00:00.000Z',
    inCellarInventory: true,
    cellarQuantity: 2
  },
  {
    id: 'wine-2',
    name: 'Franciacorta Cuvée Prestige',
    winery: 'Ca\' del Bosco',
    vintage: null,
    type: 'Bollicine',
    region: 'Lombardia',
    country: 'Italia',
    pricePaid: 38,
    coupleImpressions: {
      heRating: 4.5,
      sheRating: 4.7,
      isFavorite: true,
      momentNotes: 'Brindisi Capodanno'
    },
    tastedAt: '2024-12-31T23:30:00.000Z',
    inCellarInventory: true,
    cellarQuantity: 3
  },
  {
    id: 'wine-3',
    name: 'Cervaro della Sala',
    winery: 'Antinori',
    vintage: 2021,
    type: 'Bianco',
    region: 'Umbria',
    country: 'Italia',
    pricePaid: 65,
    coupleImpressions: {
      heRating: 4.2,
      sheRating: 4.0,
      isFavorite: false,
      momentNotes: 'Pranzo sul lago'
    },
    tastedAt: '2024-07-15T13:00:00.000Z',
    inCellarInventory: false,
    cellarQuantity: 0
  }
];

test('getProgressionMilestones calculates tier unlocks and percentages correctly', () => {
  // 0 wines
  const zero = getProgressionMilestones(0);
  assert.equal(zero.currentTier.level, 0);
  assert.equal(zero.nextTier?.targetCount, 3);
  assert.equal(zero.progressPercent, 0);

  // 4 wines -> unlocks Tier 1 (target 3), working towards Tier 2 (target 6)
  const four = getProgressionMilestones(4);
  assert.equal(four.currentTier.level, 1);
  assert.equal(four.currentTier.title, 'Primi Brindisi');
  assert.equal(four.nextTier?.level, 2);
  // target 3 to 6: 1 wine out of 3 -> 33%
  assert.equal(four.progressPercent, 33);

  // 55 wines -> all unlocked
  const fiftyFive = getProgressionMilestones(55);
  assert.equal(fiftyFive.currentTier.level, 5);
  assert.equal(fiftyFive.nextTier, null);
  assert.equal(fiftyFive.progressPercent, 100);
});

test('getWineColors returns appropriate 3D hex values and CSS classes for each wine type', () => {
  const redColors = getWineColors('Rosso');
  assert.equal(typeof redColors.wineColor, 'number');
  assert.equal(redColors.wineColor, 0x580816);

  const whiteColors = getWineColors('Bianco');
  assert.equal(whiteColors.wineColor, 0xd9c264);

  const sparklingColors = getWineColors('Bollicine');
  assert.equal(sparklingColors.wineColor, 0xf8f3c8);
  assert.equal(sparklingColors.capsuleColor, 0x9ca3af);

  const roseColors = getWineColors('Rosato');
  assert.equal(roseColors.wineColor, 0xf4b4c2);
  assert.equal(roseColors.capsuleColor, 0xdf167b);
});

test('filterWines properly filters by text search, wine type, and favorites', () => {
  const defaultFilter: WineFilterState = {
    searchQuery: '',
    typeFilter: 'ALL',
    regionFilter: 'ALL',
    minRating: 0,
    onlyFavorites: false,
    sortBy: 'date-desc'
  };

  // All wines
  assert.equal(filterWines(mockWines, defaultFilter).length, 3);

  // Type filter: Rosso
  const rossoFiltered = filterWines(mockWines, { ...defaultFilter, typeFilter: 'Rosso' });
  assert.equal(rossoFiltered.length, 1);
  assert.equal(rossoFiltered[0].name, 'Brunello di Montalcino');

  // Text search "Antinori"
  const antinori = filterWines(mockWines, { ...defaultFilter, searchQuery: 'Antinori' });
  assert.equal(antinori.length, 1);
  assert.equal(antinori[0].winery, 'Antinori');

  // Only favorites
  const favorites = filterWines(mockWines, { ...defaultFilter, onlyFavorites: true });
  assert.equal(favorites.length, 2);
});

test('calculateArmadioSlot coordinates are symmetric and correctly stacked in 3D shelves', () => {
  // First bottle of shelf 0
  const slot0 = calculateArmadioSlot(0, 6, 1.35, 0.52);
  assert.equal(slot0.shelfIndex, 0);
  assert.equal(slot0.colIndex, 0);

  // Bottle 5 (last of shelf 0)
  const slot5 = calculateArmadioSlot(5, 6, 1.35, 0.52);
  assert.equal(slot5.shelfIndex, 0);
  assert.equal(slot5.colIndex, 5);
  // Symmetric x coordinate around 0
  assert.equal(Math.abs(slot0.x + slot5.x) < 0.001, true);

  // Bottle 6 (first of shelf 1)
  const slot6 = calculateArmadioSlot(6, 6, 1.35, 0.52);
  assert.equal(slot6.shelfIndex, 1);
  assert.equal(slot6.colIndex, 0);
  assert.equal(slot6.y > slot0.y, true);
});

test('getWineTypesBreakdown aggregates counts correctly', () => {
  const breakdown = getWineTypesBreakdown(mockWines);
  assert.equal(breakdown.Rosso, 1);
  assert.equal(breakdown.Bollicine, 1);
  assert.equal(breakdown.Bianco, 1);
  assert.equal(breakdown.Rosato, 0);
});

test('getCellarInventorySummary calculates bottle counts and stock values', () => {
  const summary = getCellarInventorySummary(mockWines);
  // mockWines has 2 bottles in stock for wine-1 and 3 for wine-2
  assert.equal(summary.uniqueLabels, 2);
  assert.equal(summary.totalBottlesCount, 5);
  // (2 * 120) + (3 * 38) = 240 + 114 = 354
  assert.equal(summary.totalValue, 354);
});

test('filterWines handles wines with backPhotoUrl and missing rating impressions safely', () => {
  const winesWithBackPhoto: WineItem[] = [
    ...mockWines,
    {
      id: 'wine-back-test',
      name: 'Test Back Photo Wine',
      winery: 'Cantina Test',
      type: 'Rosato',
      region: 'Puglia',
      country: 'Italia',
      photoUrl: 'https://example.com/front.jpg',
      backPhotoUrl: 'https://example.com/back.jpg',
      coupleImpressions: {
        heRating: 5,
        sheRating: 5
      },
      tastedAt: new Date().toISOString()
    }
  ];

  const defaultFilters: WineFilterState = {
    searchQuery: 'Test Back',
    typeFilter: 'ALL',
    regionFilter: 'ALL',
    minRating: 0,
    onlyFavorites: false,
    sortBy: 'date-desc'
  };

  const filtered = filterWines(winesWithBackPhoto, defaultFilters);
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].backPhotoUrl, 'https://example.com/back.jpg');
});
