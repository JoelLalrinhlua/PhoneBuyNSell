import type {
  B2BAccountProfile,
  Brand,
  ConditionTier,
  InspectionVideoConfig,
  PhoneModel,
} from '../types/buyback';

export const BRANDS: Brand[] = [
  { id: 'apple', name: 'Apple', maxPayoutAed: 4450, deviceCount: 8 },
  { id: 'samsung', name: 'Samsung', maxPayoutAed: 4380, deviceCount: 7 },
  { id: 'google', name: 'Google', maxPayoutAed: 3240, deviceCount: 4 },
  { id: 'oneplus', name: 'OnePlus', maxPayoutAed: 2790, deviceCount: 4 },
  { id: 'xiaomi', name: 'Xiaomi', maxPayoutAed: 3150, deviceCount: 4 },
  { id: 'nothing', name: 'Nothing', maxPayoutAed: 1820, deviceCount: 3 },
  { id: 'oppo', name: 'OPPO', maxPayoutAed: 2890, deviceCount: 3 },
  { id: 'vivo', name: 'vivo', maxPayoutAed: 2940, deviceCount: 3 },
  { id: 'motorola', name: 'Motorola', maxPayoutAed: 2460, deviceCount: 3 },
  { id: 'iqoo', name: 'iQOO', maxPayoutAed: 2320, deviceCount: 2 },
  { id: 'realme', name: 'realme', maxPayoutAed: 1980, deviceCount: 2 },
  { id: 'poco', name: 'POCO', maxPayoutAed: 1640, deviceCount: 2 },
];

export const PHONE_MODELS: PhoneModel[] = [
  // APPLE
  {
    id: 'iphone-16-pro-max',
    brandId: 'apple',
    name: 'iPhone 16 Pro Max',
    series: 'iPhone 16 Series',
    releaseYear: 2024,
    image: '/images/phone-pro-titanium.jpg',
    basePriceAed: 3650,
    popular: true,
    specBadge: 'Titanium Pro',
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 380 },
      { capacity: '1 TB', priceDeltaAed: 800 },
    ],
    colors: [
      { name: 'Desert Titanium', hex: '#C4B39B' },
      { name: 'Natural Titanium', hex: '#A5A29B' },
      { name: 'White Titanium', hex: '#F1F0EC' },
      { name: 'Black Titanium', hex: '#2B2B2D' },
    ],
  },
  {
    id: 'iphone-16-pro',
    brandId: 'apple',
    name: 'iPhone 16 Pro',
    series: 'iPhone 16 Series',
    releaseYear: 2024,
    image: '/images/phone-pro-titanium.jpg',
    basePriceAed: 3120,
    popular: true,
    specBadge: 'Pro 6.3"',
    storageOptions: [
      { capacity: '128 GB', priceDeltaAed: 0 },
      { capacity: '256 GB', priceDeltaAed: 250 },
      { capacity: '512 GB', priceDeltaAed: 600 },
      { capacity: '1 TB', priceDeltaAed: 980 },
    ],
    colors: [
      { name: 'Natural Titanium', hex: '#A5A29B' },
      { name: 'Desert Titanium', hex: '#C4B39B' },
      { name: 'White Titanium', hex: '#F1F0EC' },
      { name: 'Black Titanium', hex: '#2B2B2D' },
    ],
  },
  {
    id: 'iphone-16',
    brandId: 'apple',
    name: 'iPhone 16',
    series: 'iPhone 16 Series',
    releaseYear: 2024,
    image: '/images/phone-pro-titanium.jpg',
    basePriceAed: 2390,
    storageOptions: [
      { capacity: '128 GB', priceDeltaAed: 0 },
      { capacity: '256 GB', priceDeltaAed: 240 },
      { capacity: '512 GB', priceDeltaAed: 540 },
    ],
    colors: [
      { name: 'Ultramarine', hex: '#6378C6' },
      { name: 'White', hex: '#F5F5F7' },
      { name: 'Black', hex: '#262729' },
    ],
  },
  {
    id: 'iphone-15-pro-max',
    brandId: 'apple',
    name: 'iPhone 15 Pro Max',
    series: 'iPhone 15 Series',
    releaseYear: 2023,
    image: '/images/phone-pro-titanium.jpg',
    basePriceAed: 3050,
    popular: true,
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 320 },
      { capacity: '1 TB', priceDeltaAed: 650 },
    ],
    colors: [
      { name: 'Natural Titanium', hex: '#A5A29B' },
      { name: 'Blue Titanium', hex: '#3F4856' },
      { name: 'White Titanium', hex: '#F1F0EC' },
      { name: 'Black Titanium', hex: '#2B2B2D' },
    ],
  },
  {
    id: 'iphone-15-pro',
    brandId: 'apple',
    name: 'iPhone 15 Pro',
    series: 'iPhone 15 Series',
    releaseYear: 2023,
    image: '/images/phone-pro-titanium.jpg',
    basePriceAed: 2540,
    storageOptions: [
      { capacity: '128 GB', priceDeltaAed: 0 },
      { capacity: '256 GB', priceDeltaAed: 230 },
      { capacity: '512 GB', priceDeltaAed: 510 },
      { capacity: '1 TB', priceDeltaAed: 820 },
    ],
    colors: [
      { name: 'Natural Titanium', hex: '#A5A29B' },
      { name: 'White Titanium', hex: '#F1F0EC' },
      { name: 'Black Titanium', hex: '#2B2B2D' },
    ],
  },
  {
    id: 'iphone-15',
    brandId: 'apple',
    name: 'iPhone 15',
    series: 'iPhone 15 Series',
    releaseYear: 2023,
    image: '/images/phone-pro-titanium.jpg',
    basePriceAed: 1990,
    storageOptions: [
      { capacity: '128 GB', priceDeltaAed: 0 },
      { capacity: '256 GB', priceDeltaAed: 210 },
      { capacity: '512 GB', priceDeltaAed: 460 },
    ],
    colors: [
      { name: 'Black', hex: '#2C2D30' },
      { name: 'Blue', hex: '#DCE4EB' },
      { name: 'Green', hex: '#DCE5D8' },
    ],
  },
  {
    id: 'iphone-14-pro-max',
    brandId: 'apple',
    name: 'iPhone 14 Pro Max',
    series: 'iPhone 14 Series',
    releaseYear: 2022,
    image: '/images/phone-pro-titanium.jpg',
    basePriceAed: 2200,
    storageOptions: [
      { capacity: '128 GB', priceDeltaAed: 0 },
      { capacity: '256 GB', priceDeltaAed: 200 },
      { capacity: '512 GB', priceDeltaAed: 430 },
      { capacity: '1 TB', priceDeltaAed: 690 },
    ],
    colors: [
      { name: 'Space Black', hex: '#302E2F' },
      { name: 'Silver', hex: '#EBECE7' },
      { name: 'Gold', hex: '#F4E8CE' },
    ],
  },
  {
    id: 'iphone-13-pro',
    brandId: 'apple',
    name: 'iPhone 13 Pro',
    series: 'iPhone 13 Series',
    releaseYear: 2021,
    image: '/images/phone-pro-titanium.jpg',
    basePriceAed: 1550,
    storageOptions: [
      { capacity: '128 GB', priceDeltaAed: 0 },
      { capacity: '256 GB', priceDeltaAed: 170 },
      { capacity: '512 GB', priceDeltaAed: 350 },
    ],
    colors: [
      { name: 'Graphite', hex: '#4B4A47' },
      { name: 'Sierra Blue', hex: '#9AB5C7' },
      { name: 'Silver', hex: '#F1F2ED' },
    ],
  },

  // SAMSUNG
  {
    id: 'galaxy-s24-ultra',
    brandId: 'samsung',
    name: 'Galaxy S24 Ultra',
    series: 'Galaxy S Series',
    releaseYear: 2024,
    image: '/images/phone-ultra-slate.jpg',
    basePriceAed: 2990,
    popular: true,
    specBadge: 'S-Pen Titanium',
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 380 },
      { capacity: '1 TB', priceDeltaAed: 690 },
    ],
    colors: [
      { name: 'Titanium Gray', hex: '#8F8B84' },
      { name: 'Titanium Black', hex: '#2B2B2D' },
      { name: 'Titanium Yellow', hex: '#EAE0C0' },
    ],
  },
  {
    id: 'galaxy-z-fold6',
    brandId: 'samsung',
    name: 'Galaxy Z Fold6',
    series: 'Galaxy Z Foldable',
    releaseYear: 2024,
    image: '/images/phone-fold-platinum.jpg',
    basePriceAed: 3680,
    popular: true,
    specBadge: 'Foldable 7.6"',
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 360 },
      { capacity: '1 TB', priceDeltaAed: 700 },
    ],
    colors: [
      { name: 'Silver Shadow', hex: '#A4A7AC' },
      { name: 'Navy', hex: '#2B374B' },
      { name: 'Crafted Black', hex: '#232325' },
    ],
  },
  {
    id: 'galaxy-s24-plus',
    brandId: 'samsung',
    name: 'Galaxy S24+',
    series: 'Galaxy S Series',
    releaseYear: 2024,
    image: '/images/phone-ultra-slate.jpg',
    basePriceAed: 2200,
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 280 },
    ],
    colors: [
      { name: 'Onyx Black', hex: '#2D2E30' },
      { name: 'Marble Gray', hex: '#C6C6C8' },
    ],
  },
  {
    id: 'galaxy-z-flip6',
    brandId: 'samsung',
    name: 'Galaxy Z Flip6',
    series: 'Galaxy Z Foldable',
    releaseYear: 2024,
    image: '/images/phone-fold-platinum.jpg',
    basePriceAed: 2150,
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 260 },
    ],
    colors: [
      { name: 'Silver Shadow', hex: '#A4A7AC' },
      { name: 'Mint', hex: '#C6DFD3' },
    ],
  },
  {
    id: 'galaxy-s23-ultra',
    brandId: 'samsung',
    name: 'Galaxy S23 Ultra',
    series: 'Galaxy S Series',
    releaseYear: 2023,
    image: '/images/phone-ultra-slate.jpg',
    basePriceAed: 2200,
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 260 },
      { capacity: '1 TB', priceDeltaAed: 520 },
    ],
    colors: [
      { name: 'Phantom Black', hex: '#232325' },
      { name: 'Cream', hex: '#EFECE4' },
      { name: 'Green', hex: '#546158' },
    ],
  },
  {
    id: 'galaxy-z-fold5',
    brandId: 'samsung',
    name: 'Galaxy Z Fold5',
    series: 'Galaxy Z Foldable',
    releaseYear: 2023,
    image: '/images/phone-fold-platinum.jpg',
    basePriceAed: 2690,
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 290 },
    ],
    colors: [
      { name: 'Icy Blue', hex: '#B9C7D3' },
      { name: 'Phantom Black', hex: '#232325' },
    ],
  },
  {
    id: 'galaxy-s23',
    brandId: 'samsung',
    name: 'Galaxy S23',
    series: 'Galaxy S Series',
    releaseYear: 2023,
    image: '/images/phone-ultra-slate.jpg',
    basePriceAed: 1550,
    storageOptions: [
      { capacity: '128 GB', priceDeltaAed: 0 },
      { capacity: '256 GB', priceDeltaAed: 180 },
    ],
    colors: [
      { name: 'Phantom Black', hex: '#232325' },
      { name: 'Cream', hex: '#EFECE4' },
    ],
  },

  // GOOGLE
  {
    id: 'pixel-9-pro-xl',
    brandId: 'google',
    name: 'Pixel 9 Pro XL',
    series: 'Pixel 9 Series',
    releaseYear: 2024,
    image: '/images/phone-bar-porcelain.jpg',
    basePriceAed: 2680,
    popular: true,
    specBadge: 'Tensor G4',
    storageOptions: [
      { capacity: '128 GB', priceDeltaAed: 0 },
      { capacity: '256 GB', priceDeltaAed: 240 },
      { capacity: '512 GB', priceDeltaAed: 560 },
    ],
    colors: [
      { name: 'Porcelain', hex: '#EFECE6' },
      { name: 'Hazel', hex: '#888D86' },
      { name: 'Obsidian', hex: '#242527' },
    ],
  },
  {
    id: 'pixel-9-pro',
    brandId: 'google',
    name: 'Pixel 9 Pro',
    series: 'Pixel 9 Series',
    releaseYear: 2024,
    image: '/images/phone-bar-porcelain.jpg',
    basePriceAed: 2390,
    storageOptions: [
      { capacity: '128 GB', priceDeltaAed: 0 },
      { capacity: '256 GB', priceDeltaAed: 220 },
      { capacity: '512 GB', priceDeltaAed: 490 },
    ],
    colors: [
      { name: 'Porcelain', hex: '#EFECE6' },
      { name: 'Obsidian', hex: '#242527' },
    ],
  },
  {
    id: 'pixel-8-pro',
    brandId: 'google',
    name: 'Pixel 8 Pro',
    series: 'Pixel 8 Series',
    releaseYear: 2023,
    image: '/images/phone-bar-porcelain.jpg',
    basePriceAed: 1850,
    storageOptions: [
      { capacity: '128 GB', priceDeltaAed: 0 },
      { capacity: '256 GB', priceDeltaAed: 200 },
      { capacity: '512 GB', priceDeltaAed: 420 },
    ],
    colors: [
      { name: 'Porcelain', hex: '#EFECE6' },
      { name: 'Bay', hex: '#8AB4D8' },
      { name: 'Obsidian', hex: '#242527' },
    ],
  },
  {
    id: 'pixel-8',
    brandId: 'google',
    name: 'Pixel 8',
    series: 'Pixel 8 Series',
    releaseYear: 2023,
    image: '/images/phone-bar-porcelain.jpg',
    basePriceAed: 1450,
    storageOptions: [
      { capacity: '128 GB', priceDeltaAed: 0 },
      { capacity: '256 GB', priceDeltaAed: 160 },
    ],
    colors: [
      { name: 'Hazel', hex: '#7D827B' },
      { name: 'Obsidian', hex: '#242527' },
    ],
  },

  // ONEPLUS
  {
    id: 'oneplus-13',
    brandId: 'oneplus',
    name: 'OnePlus 13',
    series: 'Flagship Number Series',
    releaseYear: 2024,
    image: '/images/phone-circle-obsidian.jpg',
    basePriceAed: 2480,
    popular: true,
    specBadge: 'Hasselblad Optics',
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 310 },
    ],
    colors: [
      { name: 'Black Eclipse', hex: '#232426' },
      { name: 'Arctic Dawn', hex: '#F3F4F6' },
      { name: 'Midnight Ocean', hex: '#263B59' },
    ],
  },
  {
    id: 'oneplus-open',
    brandId: 'oneplus',
    name: 'OnePlus Open',
    series: 'Foldable Series',
    releaseYear: 2023,
    image: '/images/phone-fold-platinum.jpg',
    basePriceAed: 2690,
    storageOptions: [{ capacity: '512 GB', priceDeltaAed: 0 }],
    colors: [
      { name: 'Voyager Black', hex: '#262628' },
      { name: 'Emerald Dusk', hex: '#2E493E' },
    ],
  },
  {
    id: 'oneplus-12',
    brandId: 'oneplus',
    name: 'OnePlus 12',
    series: 'Flagship Number Series',
    releaseYear: 2024,
    image: '/images/phone-circle-obsidian.jpg',
    basePriceAed: 1960,
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 240 },
    ],
    colors: [
      { name: 'Silky Black', hex: '#232426' },
      { name: 'Flowy Emerald', hex: '#39574B' },
    ],
  },
  {
    id: 'oneplus-12r',
    brandId: 'oneplus',
    name: 'OnePlus 12R',
    series: 'R Series',
    releaseYear: 2024,
    image: '/images/phone-circle-obsidian.jpg',
    basePriceAed: 1480,
    storageOptions: [
      { capacity: '128 GB', priceDeltaAed: 0 },
      { capacity: '256 GB', priceDeltaAed: 170 },
    ],
    colors: [
      { name: 'Iron Gray', hex: '#525458' },
      { name: 'Cool Blue', hex: '#7FA5C9' },
    ],
  },

  // NOTHING
  {
    id: 'nothing-phone-2',
    brandId: 'nothing',
    name: 'Nothing Phone (2)',
    series: 'Phone Series',
    releaseYear: 2023,
    image: '/images/phone-glyph-mono.jpg',
    basePriceAed: 1580,
    popular: true,
    specBadge: 'Glyph Interface',
    storageOptions: [
      { capacity: '128 GB', priceDeltaAed: 0 },
      { capacity: '256 GB', priceDeltaAed: 160 },
      { capacity: '512 GB', priceDeltaAed: 300 },
    ],
    colors: [
      { name: 'White', hex: '#F4F4F2' },
      { name: 'Dark Grey', hex: '#3B3D40' },
    ],
  },
  {
    id: 'nothing-phone-2a-plus',
    brandId: 'nothing',
    name: 'Nothing Phone (2a) Plus',
    series: 'Phone (a) Series',
    releaseYear: 2024,
    image: '/images/phone-glyph-mono.jpg',
    basePriceAed: 1290,
    storageOptions: [{ capacity: '256 GB', priceDeltaAed: 0 }],
    colors: [
      { name: 'Metallic Grey', hex: '#8B8D91' },
      { name: 'Black', hex: '#222325' },
    ],
  },
  {
    id: 'nothing-phone-2a',
    brandId: 'nothing',
    name: 'Nothing Phone (2a)',
    series: 'Phone (a) Series',
    releaseYear: 2024,
    image: '/images/phone-glyph-mono.jpg',
    basePriceAed: 1150,
    storageOptions: [
      { capacity: '128 GB', priceDeltaAed: 0 },
      { capacity: '256 GB', priceDeltaAed: 130 },
    ],
    colors: [
      { name: 'Milk', hex: '#F2F1EC' },
      { name: 'Black', hex: '#222325' },
    ],
  },

  // XIAOMI
  {
    id: 'xiaomi-14-ultra',
    brandId: 'xiaomi',
    name: 'Xiaomi 14 Ultra',
    series: 'Xiaomi Ultra',
    releaseYear: 2024,
    image: '/images/phone-circle-obsidian.jpg',
    basePriceAed: 2850,
    popular: true,
    specBadge: '1" Optical Sensor',
    storageOptions: [
      { capacity: '512 GB', priceDeltaAed: 0 },
      { capacity: '1 TB', priceDeltaAed: 300 },
    ],
    colors: [
      { name: 'Black', hex: '#222224' },
      { name: 'White', hex: '#F3F3F1' },
    ],
  },
  {
    id: 'xiaomi-14',
    brandId: 'xiaomi',
    name: 'Xiaomi 14',
    series: 'Xiaomi Series',
    releaseYear: 2024,
    image: '/images/phone-ultra-slate.jpg',
    basePriceAed: 1970,
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 230 },
    ],
    colors: [
      { name: 'Black', hex: '#242527' },
      { name: 'Jade Green', hex: '#3D5D53' },
    ],
  },
  {
    id: 'xiaomi-14t-pro',
    brandId: 'xiaomi',
    name: 'Xiaomi 14T Pro',
    series: 'Xiaomi T Series',
    releaseYear: 2024,
    image: '/images/phone-ultra-slate.jpg',
    basePriceAed: 1750,
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 210 },
    ],
    colors: [
      { name: 'Titan Gray', hex: '#77797E' },
      { name: 'Titan Black', hex: '#262729' },
    ],
  },
  {
    id: 'xiaomi-mix-flip',
    brandId: 'xiaomi',
    name: 'Xiaomi MIX Flip',
    series: 'MIX Foldable',
    releaseYear: 2024,
    image: '/images/phone-fold-platinum.jpg',
    basePriceAed: 2380,
    storageOptions: [{ capacity: '512 GB', priceDeltaAed: 0 }],
    colors: [{ name: 'Black', hex: '#242426' }],
  },

  // OPPO
  {
    id: 'oppo-find-x8-pro',
    brandId: 'oppo',
    name: 'OPPO Find X8 Pro',
    series: 'Find X Series',
    releaseYear: 2024,
    image: '/images/phone-circle-obsidian.jpg',
    basePriceAed: 2650,
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 240 },
    ],
    colors: [
      { name: 'Space Black', hex: '#252629' },
      { name: 'Pearl White', hex: '#F3F2EE' },
    ],
  },
  {
    id: 'oppo-find-n3',
    brandId: 'oppo',
    name: 'OPPO Find N3',
    series: 'Find N Foldable',
    releaseYear: 2023,
    image: '/images/phone-fold-platinum.jpg',
    basePriceAed: 2790,
    storageOptions: [{ capacity: '512 GB', priceDeltaAed: 0 }],
    colors: [
      { name: 'Classic Black', hex: '#242426' },
      { name: 'Champagne Gold', hex: '#D8CCB4' },
    ],
  },
  {
    id: 'oppo-reno12-pro',
    brandId: 'oppo',
    name: 'OPPO Reno12 Pro',
    series: 'Reno Series',
    releaseYear: 2024,
    image: '/images/phone-ultra-slate.jpg',
    basePriceAed: 1450,
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 180 },
    ],
    colors: [{ name: 'Space Brown', hex: '#4A433F' }],
  },

  // VIVO
  {
    id: 'vivo-x200-pro',
    brandId: 'vivo',
    name: 'vivo X200 Pro',
    series: 'X Series',
    releaseYear: 2024,
    image: '/images/phone-circle-obsidian.jpg',
    basePriceAed: 2690,
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 250 },
    ],
    colors: [
      { name: 'Titanium Grey', hex: '#888A8E' },
      { name: 'Cosmos Black', hex: '#202124' },
    ],
  },
  {
    id: 'vivo-x100-pro',
    brandId: 'vivo',
    name: 'vivo X100 Pro',
    series: 'X Series',
    releaseYear: 2024,
    image: '/images/phone-circle-obsidian.jpg',
    basePriceAed: 2200,
    storageOptions: [{ capacity: '512 GB', priceDeltaAed: 0 }],
    colors: [{ name: 'Asteroid Black', hex: '#252628' }],
  },
  {
    id: 'vivo-v40-pro',
    brandId: 'vivo',
    name: 'vivo V40 Pro',
    series: 'V Series',
    releaseYear: 2024,
    image: '/images/phone-ultra-slate.jpg',
    basePriceAed: 1520,
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 170 },
    ],
    colors: [{ name: 'Titanium Grey', hex: '#9A9EA4' }],
  },

  // MOTOROLA
  {
    id: 'motorola-razr-50-ultra',
    brandId: 'motorola',
    name: 'Motorola Razr 50 Ultra',
    series: 'Razr Foldable',
    releaseYear: 2024,
    image: '/images/phone-fold-platinum.jpg',
    basePriceAed: 2240,
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 220 },
    ],
    colors: [
      { name: 'Midnight Blue', hex: '#273449' },
      { name: 'Spring Green', hex: '#55755E' },
    ],
  },
  {
    id: 'motorola-edge-50-ultra',
    brandId: 'motorola',
    name: 'Motorola Edge 50 Ultra',
    series: 'Edge Series',
    releaseYear: 2024,
    image: '/images/phone-ultra-slate.jpg',
    basePriceAed: 1860,
    storageOptions: [{ capacity: '512 GB', priceDeltaAed: 0 }],
    colors: [
      { name: 'Forest Grey', hex: '#4D5150' },
      { name: 'Nordic Wood', hex: '#CBB69C' },
    ],
  },
  {
    id: 'motorola-edge-50-pro',
    brandId: 'motorola',
    name: 'Motorola Edge 50 Pro',
    series: 'Edge Series',
    releaseYear: 2024,
    image: '/images/phone-ultra-slate.jpg',
    basePriceAed: 1450,
    storageOptions: [{ capacity: '256 GB', priceDeltaAed: 0 }],
    colors: [{ name: 'Black Beauty', hex: '#232426' }],
  },

  // IQOO
  {
    id: 'iqoo-13',
    brandId: 'iqoo',
    name: 'iQOO 13',
    series: 'Flagship Series',
    releaseYear: 2024,
    image: '/images/phone-ultra-slate.jpg',
    basePriceAed: 2080,
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 240 },
    ],
    colors: [
      { name: 'Legend White', hex: '#F3F3F1' },
      { name: 'Alpha Black', hex: '#242527' },
    ],
  },
  {
    id: 'iqoo-12',
    brandId: 'iqoo',
    name: 'iQOO 12',
    series: 'Flagship Series',
    releaseYear: 2023,
    image: '/images/phone-ultra-slate.jpg',
    basePriceAed: 1750,
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 200 },
    ],
    colors: [{ name: 'Legend White', hex: '#F3F3F1' }],
  },

  // REALME
  {
    id: 'realme-gt-7-pro',
    brandId: 'realme',
    name: 'realme GT 7 Pro',
    series: 'GT Flagship',
    releaseYear: 2024,
    image: '/images/phone-ultra-slate.jpg',
    basePriceAed: 1850,
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 190 },
    ],
    colors: [
      { name: 'Mars Orange', hex: '#C9633B' },
      { name: 'Galaxy Grey', hex: '#5E6268' },
    ],
  },
  {
    id: 'realme-gt-6',
    brandId: 'realme',
    name: 'realme GT 6',
    series: 'GT Flagship',
    releaseYear: 2024,
    image: '/images/phone-ultra-slate.jpg',
    basePriceAed: 1450,
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 170 },
    ],
    colors: [{ name: 'Fluid Silver', hex: '#C8CCD0' }],
  },

  // POCO
  {
    id: 'poco-f6-pro',
    brandId: 'poco',
    name: 'POCO F6 Pro',
    series: 'F Series',
    releaseYear: 2024,
    image: '/images/phone-ultra-slate.jpg',
    basePriceAed: 1520,
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 200 },
    ],
    colors: [
      { name: 'Black', hex: '#232426' },
      { name: 'White', hex: '#F3F3F1' },
    ],
  },
  {
    id: 'poco-x6-pro',
    brandId: 'poco',
    name: 'POCO X6 Pro',
    series: 'X Series',
    releaseYear: 2024,
    image: '/images/phone-ultra-slate.jpg',
    basePriceAed: 1200,
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 140 },
    ],
    colors: [
      { name: 'POCO Yellow', hex: '#EAB308' },
      { name: 'Black', hex: '#232426' },
    ],
  },
];

/**
 * Exact arsouq Reduction Schedule from Reference Pricing Table:
 * - Zero Scratch (Flawless):           -AED 0
 * - Small Scratch:                     -AED 150
 * - Medium Scratch:                    -AED 400
 * - Parts Change (Genuine Part):       -AED 500
 * - More Scratch/Dent/Broken:          -AED 700
 * - Hardware issue/Unknown parts:      -AED 1,000
 * - Others:                            Reply by agent
 */
export const CONDITION_TIERS: ConditionTier[] = [
  {
    id: 'zero-scratch',
    title: 'Flawless (Zero Scratch)',
    shortLabel: 'Flawless',
    deductionAed: 0,
    indicatorHex: '#059669',
    summary: 'No scratches on screen or body · 100% functional · Battery 90%+',
    criteria: [
      'Screen: No scratches',
      'Body: No dents or scratches',
      'Battery Health 90% or above',
      'Device & camera fully functional',
    ],
  },
  {
    id: 'small-scratch',
    title: 'Small Scratch',
    shortLabel: 'Small Scratch',
    deductionAed: 150,
    indicatorHex: '#2095D3',
    summary: 'Light scratch on body or screen (or both) · Battery 85%+',
    criteria: [
      'Full working condition',
      'Small scratch on body or display (even if both)',
      'Battery Health 85% or above',
    ],
  },
  {
    id: 'medium-scratch',
    title: 'Medium Scratch',
    shortLabel: 'Medium Scratch',
    deductionAed: 400,
    indicatorHex: '#0284C7',
    summary: 'Small body dent or deeper screen scratch · Battery 85%+',
    criteria: [
      'Full working condition',
      'Small scratch or dent on body',
      'Display small or deep scratch (even if both)',
      'Battery Health 85% or above',
    ],
  },
  {
    id: 'parts-change-genuine',
    title: 'Parts Change (Genuine Part)',
    shortLabel: 'Genuine Part',
    deductionAed: 500,
    indicatorHex: '#D97706',
    summary: 'No scratches · 1 genuine official part replaced · Battery 85%+',
    criteria: [
      'Full working, no scratch on body & display',
      'Battery Health 85% or above',
      'Only one genuine manufacturer part changed',
    ],
  },
  {
    id: 'more-scratch-broken',
    title: 'More Scratch / Dent / Broken',
    shortLabel: 'Dent / Cracked',
    deductionAed: 700,
    indicatorHex: '#EA580C',
    summary: 'Cracked glass, frame dent, or minor mic, speaker, or camera dot',
    criteria: [
      'Back glass broken, frame dent, or display crack',
      'Minor mic, speaker, or camera black dot issue',
      'Network, main display, and camera still working',
    ],
  },
  {
    id: 'hardware-unknown-parts',
    title: 'Hardware Issue / Unknown Parts',
    shortLabel: 'Hardware Issue',
    deductionAed: 1000,
    indicatorHex: '#DC2626',
    summary: 'Face ID issue, damaged non-working display, or unofficial parts',
    criteria: [
      'Face ID / biometrics not working',
      'Display not working due to display damage',
      'Any parts changed from unofficial sources',
    ],
  },
  {
    id: 'others-agent',
    title: 'Others',
    shortLabel: 'Agent Quote',
    deductionAed: null,
    indicatorHex: '#52525B',
    summary: 'Unlisted condition or issue — describe for a custom agent offer',
    criteria: [
      'Unlisted device condition or multiple custom repairs',
      'Detail your phone directly for a custom agent offer',
    ],
  },
];

export const UAE_EMIRATES = [
  'Dubai',
  'Abu Dhabi',
  'Sharjah',
  'Ajman',
  'Ras Al Khaimah',
  'Fujairah',
  'Umm Al Quwain',
] as const;

/**
 * Inspection guide video configuration.
 * When your video file is ready, place it in `public/videos/` and set `src`
 * below (e.g. `src: '/videos/phone-inspection.mp4'`).
 */
export const INSPECTION_VIDEO_CONFIG: InspectionVideoConfig = {
  src: '',
  poster: '/images/editorial-handover.jpg',
  durationLabel: '0:45',
  title: 'How to Inspect the Phone',
  subtitle:
    'Watch this quick guide to verify screen glass, frame condition, battery health, and sensors before viewing your approximate offer.',
  checkpoints: [
    {
      step: '01',
      title: 'Display & Frame Check',
      detail: 'Tilt the screen and back glass under light to check for hairline scratches, dents, or cracks.',
    },
    {
      step: '02',
      title: 'Battery Health Check',
      detail: 'Check Settings > Battery Health (90%+ for Flawless, 85%+ for Small or Medium Scratch).',
    },
    {
      step: '03',
      title: 'Sensors & Genuine Parts',
      detail: 'Confirm Face ID / Touch ID, cameras, audio, and official parts history are working.',
    },
  ],
};

/**
 * Default signed-in B2B partner profile (pre-populated from account registration,
 * read-only during individual phone / batch sell submissions).
 */
export const DEFAULT_B2B_ACCOUNT: B2BAccountProfile = {
  accountCode: 'B2B-DXB-4082',
  companyName: 'Al Noor Mobile Trading LLC',
  tradeLicenseEmirate: 'Dubai',
  contactPerson: 'Tariq Al Mansoori',
  contactPhone: '+971 50 482 9100',
  contactEmail: 'procurement@alnoormobile.ae',
  registeredAddress: 'Warehouse 14, Al Quoz Industrial Area 3, Dubai, UAE',
  settlementMethodLabel: 'Registered Corporate Bank IBAN',
  maskedIban: 'AE07 •••• •••• •••• •••• 4560',
};
