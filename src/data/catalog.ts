import type {
  B2BAccountProfile,
  Brand,
  BrandId,
  ConditionTier,
  InspectionVideoConfig,
  PhoneModel,
} from '../types/buyback';

export const PHONE_MODELS: PhoneModel[] = [
  // =========================================================================
  // APPLE
  // =========================================================================
  {
    id: 'iphone-16-pro-max',
    brandId: 'apple',
    name: 'iPhone 16 Pro Max',
    series: 'iPhone 16 Series',
    releaseYear: 2024,
    image: '/images/phone-pro-titanium.jpg',
    basePriceAed: 3650,
    popular: true,
    specBadge: '6.9" OLED · A18 Pro',
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
    specBadge: '6.3" OLED · A18 Pro',
    storageOptions: [
      { capacity: '128 GB', priceDeltaAed: 0 },
      { capacity: '256 GB', priceDeltaAed: 250 },
      { capacity: '512 GB', priceDeltaAed: 600 },
      { capacity: '1 TB', priceDeltaAed: 980 },
    ],
    colors: [
      { name: 'Desert Titanium', hex: '#C4B39B' },
      { name: 'Natural Titanium', hex: '#A5A29B' },
      { name: 'White Titanium', hex: '#F1F0EC' },
      { name: 'Black Titanium', hex: '#2B2B2D' },
    ],
  },
  {
    id: 'iphone-16-plus',
    brandId: 'apple',
    name: 'iPhone 16 Plus',
    series: 'iPhone 16 Series',
    releaseYear: 2024,
    image: '/images/phone-pro-titanium.jpg',
    basePriceAed: 2690,
    specBadge: '6.7" OLED · A18',
    storageOptions: [
      { capacity: '128 GB', priceDeltaAed: 0 },
      { capacity: '256 GB', priceDeltaAed: 250 },
      { capacity: '512 GB', priceDeltaAed: 560 },
    ],
    colors: [
      { name: 'Ultramarine', hex: '#6378C6' },
      { name: 'Teal', hex: '#7FA9A6' },
      { name: 'Pink', hex: '#EAB6C9' },
      { name: 'White', hex: '#F5F5F7' },
      { name: 'Black', hex: '#262729' },
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
    specBadge: '6.1" OLED · A18',
    storageOptions: [
      { capacity: '128 GB', priceDeltaAed: 0 },
      { capacity: '256 GB', priceDeltaAed: 240 },
      { capacity: '512 GB', priceDeltaAed: 540 },
    ],
    colors: [
      { name: 'Ultramarine', hex: '#6378C6' },
      { name: 'Teal', hex: '#7FA9A6' },
      { name: 'Pink', hex: '#EAB6C9' },
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
    specBadge: '6.7" OLED · A17 Pro',
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
    specBadge: '6.1" OLED · A17 Pro',
    storageOptions: [
      { capacity: '128 GB', priceDeltaAed: 0 },
      { capacity: '256 GB', priceDeltaAed: 230 },
      { capacity: '512 GB', priceDeltaAed: 510 },
      { capacity: '1 TB', priceDeltaAed: 820 },
    ],
    colors: [
      { name: 'Natural Titanium', hex: '#A5A29B' },
      { name: 'Blue Titanium', hex: '#3F4856' },
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
    specBadge: '6.1" OLED · A16 Bionic',
    storageOptions: [
      { capacity: '128 GB', priceDeltaAed: 0 },
      { capacity: '256 GB', priceDeltaAed: 210 },
      { capacity: '512 GB', priceDeltaAed: 460 },
    ],
    colors: [
      { name: 'Black', hex: '#2C2D30' },
      { name: 'Blue', hex: '#DCE4EB' },
      { name: 'Green', hex: '#DCE5D8' },
      { name: 'Yellow', hex: '#F3EBC8' },
      { name: 'Pink', hex: '#F2D9DF' },
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
    specBadge: '6.7" OLED · A16 Bionic',
    storageOptions: [
      { capacity: '128 GB', priceDeltaAed: 0 },
      { capacity: '256 GB', priceDeltaAed: 200 },
      { capacity: '512 GB', priceDeltaAed: 430 },
      { capacity: '1 TB', priceDeltaAed: 690 },
    ],
    colors: [
      { name: 'Deep Purple', hex: '#594F63' },
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
    specBadge: '6.1" ProMotion · A15',
    storageOptions: [
      { capacity: '128 GB', priceDeltaAed: 0 },
      { capacity: '256 GB', priceDeltaAed: 170 },
      { capacity: '512 GB', priceDeltaAed: 350 },
      { capacity: '1 TB', priceDeltaAed: 540 },
    ],
    colors: [
      { name: 'Sierra Blue', hex: '#9AB5C7' },
      { name: 'Alpine Green', hex: '#505F4E' },
      { name: 'Graphite', hex: '#4B4A47' },
      { name: 'Gold', hex: '#F5E7CE' },
      { name: 'Silver', hex: '#F1F2ED' },
    ],
  },

  // =========================================================================
  // SAMSUNG
  // =========================================================================
  {
    id: 'galaxy-s24-ultra',
    brandId: 'samsung',
    name: 'Galaxy S24 Ultra',
    series: 'Galaxy S Series',
    releaseYear: 2024,
    image: '/images/phone-ultra-slate.jpg',
    basePriceAed: 2990,
    popular: true,
    specBadge: '6.8" AMOLED · SD 8 Gen 3',
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 380 },
      { capacity: '1 TB', priceDeltaAed: 690 },
    ],
    colors: [
      { name: 'Titanium Gray', hex: '#8F8B84' },
      { name: 'Titanium Black', hex: '#2B2B2D' },
      { name: 'Titanium Yellow', hex: '#EAE0C0' },
      { name: 'Titanium Blue', hex: '#9DB4C8' },
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
    specBadge: '7.6" Foldable · SD 8 Gen 3',
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 360 },
      { capacity: '1 TB', priceDeltaAed: 700 },
    ],
    colors: [
      { name: 'Silver Shadow', hex: '#A4A7AC' },
      { name: 'Navy', hex: '#2B374B' },
      { name: 'Pink', hex: '#EBD3D9' },
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
    specBadge: '6.7" QHD+ · 12 GB RAM',
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 280 },
    ],
    colors: [
      { name: 'Onyx Black', hex: '#2D2E30' },
      { name: 'Marble Gray', hex: '#C6C6C8' },
      { name: 'Amber Yellow', hex: '#EEE3BF' },
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
    specBadge: '6.7" Flip · SD 8 Gen 3',
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 260 },
    ],
    colors: [
      { name: 'Silver Shadow', hex: '#A4A7AC' },
      { name: 'Blue', hex: '#B9D1E8' },
      { name: 'Mint', hex: '#C6DFD3' },
      { name: 'Yellow', hex: '#F1E3AC' },
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
    specBadge: '6.8" AMOLED · 200 MP',
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 260 },
      { capacity: '1 TB', priceDeltaAed: 520 },
    ],
    colors: [
      { name: 'Phantom Black', hex: '#232325' },
      { name: 'Green', hex: '#546158' },
      { name: 'Cream', hex: '#EFECE4' },
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
    specBadge: '7.6" Foldable · SD 8 Gen 2',
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 290 },
      { capacity: '1 TB', priceDeltaAed: 560 },
    ],
    colors: [
      { name: 'Icy Blue', hex: '#B9C7D3' },
      { name: 'Phantom Black', hex: '#232325' },
      { name: 'Cream', hex: '#EFECE4' },
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
    specBadge: '6.1" AMOLED · SD 8 Gen 2',
    storageOptions: [
      { capacity: '128 GB', priceDeltaAed: 0 },
      { capacity: '256 GB', priceDeltaAed: 180 },
    ],
    colors: [
      { name: 'Phantom Black', hex: '#232325' },
      { name: 'Cream', hex: '#EFECE4' },
      { name: 'Green', hex: '#546158' },
    ],
  },

  // =========================================================================
  // GOOGLE
  // =========================================================================
  {
    id: 'pixel-9-pro-xl',
    brandId: 'google',
    name: 'Pixel 9 Pro XL',
    series: 'Pixel 9 Series',
    releaseYear: 2024,
    image: '/images/phone-bar-porcelain.jpg',
    basePriceAed: 2680,
    popular: true,
    specBadge: '6.8" Super Actua · Tensor G4',
    storageOptions: [
      { capacity: '128 GB', priceDeltaAed: 0 },
      { capacity: '256 GB', priceDeltaAed: 240 },
      { capacity: '512 GB', priceDeltaAed: 560 },
      { capacity: '1 TB', priceDeltaAed: 820 },
    ],
    colors: [
      { name: 'Porcelain', hex: '#EFECE6' },
      { name: 'Hazel', hex: '#888D86' },
      { name: 'Rose Quartz', hex: '#E9D3D6' },
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
    specBadge: '6.3" Super Actua · Tensor G4',
    storageOptions: [
      { capacity: '128 GB', priceDeltaAed: 0 },
      { capacity: '256 GB', priceDeltaAed: 220 },
      { capacity: '512 GB', priceDeltaAed: 490 },
      { capacity: '1 TB', priceDeltaAed: 760 },
    ],
    colors: [
      { name: 'Porcelain', hex: '#EFECE6' },
      { name: 'Hazel', hex: '#888D86' },
      { name: 'Rose Quartz', hex: '#E9D3D6' },
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
    specBadge: '6.7" LTPO OLED · Tensor G3',
    storageOptions: [
      { capacity: '128 GB', priceDeltaAed: 0 },
      { capacity: '256 GB', priceDeltaAed: 200 },
      { capacity: '512 GB', priceDeltaAed: 420 },
      { capacity: '1 TB', priceDeltaAed: 640 },
    ],
    colors: [
      { name: 'Bay', hex: '#8AB4D8' },
      { name: 'Porcelain', hex: '#EFECE6' },
      { name: 'Mint', hex: '#CEE5D8' },
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
    specBadge: '6.2" Actua OLED · Tensor G3',
    storageOptions: [
      { capacity: '128 GB', priceDeltaAed: 0 },
      { capacity: '256 GB', priceDeltaAed: 160 },
    ],
    colors: [
      { name: 'Hazel', hex: '#7D827B' },
      { name: 'Rose', hex: '#E7C8C5' },
      { name: 'Obsidian', hex: '#242527' },
    ],
  },

  // =========================================================================
  // ONEPLUS
  // =========================================================================
  {
    id: 'oneplus-13',
    brandId: 'oneplus',
    name: 'OnePlus 13',
    series: 'Flagship Number Series',
    releaseYear: 2025,
    image: '/images/phone-circle-obsidian.jpg',
    basePriceAed: 2480,
    popular: true,
    specBadge: '6.82" LTPO · SD 8 Elite',
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
    specBadge: '7.82" Foldable · Hasselblad',
    storageOptions: [
      { capacity: '512 GB', priceDeltaAed: 0 },
      { capacity: '1 TB', priceDeltaAed: 340 },
    ],
    colors: [
      { name: 'Emerald Dusk', hex: '#2E493E' },
      { name: 'Voyager Black', hex: '#262628' },
      { name: 'Crimson Shadow', hex: '#6D2428' },
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
    specBadge: '6.82" QHD+ · SD 8 Gen 3',
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 240 },
    ],
    colors: [
      { name: 'Flowy Emerald', hex: '#39574B' },
      { name: 'Silky Black', hex: '#232426' },
      { name: 'Glacial White', hex: '#F4F5F7' },
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
    specBadge: '6.78" 120Hz · SD 8 Gen 2',
    storageOptions: [
      { capacity: '128 GB', priceDeltaAed: 0 },
      { capacity: '256 GB', priceDeltaAed: 170 },
    ],
    colors: [
      { name: 'Iron Gray', hex: '#525458' },
      { name: 'Cool Blue', hex: '#7FA5C9' },
      { name: 'Sunset Dune', hex: '#DFC7B2' },
    ],
  },

  // =========================================================================
  // NOTHING
  // =========================================================================
  {
    id: 'nothing-phone-2',
    brandId: 'nothing',
    name: 'Nothing Phone (2)',
    series: 'Phone Series',
    releaseYear: 2023,
    image: '/images/phone-glyph-mono.jpg',
    basePriceAed: 1580,
    popular: true,
    specBadge: '6.7" LTPO · Glyph Interface',
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
    specBadge: '6.7" AMOLED · Dimensity 7350',
    storageOptions: [{ capacity: '256 GB', priceDeltaAed: 0 }],
    colors: [
      { name: 'Grey', hex: '#8B8D91' },
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
    specBadge: '6.7" AMOLED · Dimensity 7200',
    storageOptions: [
      { capacity: '128 GB', priceDeltaAed: 0 },
      { capacity: '256 GB', priceDeltaAed: 130 },
    ],
    colors: [
      { name: 'Milk', hex: '#F2F1EC' },
      { name: 'White', hex: '#F7F7F5' },
      { name: 'Black', hex: '#222325' },
    ],
  },

  // =========================================================================
  // XIAOMI
  // =========================================================================
  {
    id: 'xiaomi-14-ultra',
    brandId: 'xiaomi',
    name: 'Xiaomi 14 Ultra',
    series: 'Xiaomi Ultra',
    releaseYear: 2024,
    image: '/images/phone-circle-obsidian.jpg',
    basePriceAed: 2850,
    popular: true,
    specBadge: '6.73" QHD+ · Leica 1" Sensor',
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
    specBadge: '6.36" LTPO · Leica Optics',
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 230 },
    ],
    colors: [
      { name: 'Black', hex: '#242527' },
      { name: 'White', hex: '#F4F4F2' },
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
    specBadge: '6.67" 144Hz · Dimensity 9300+',
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 210 },
      { capacity: '1 TB', priceDeltaAed: 390 },
    ],
    colors: [
      { name: 'Titan Gray', hex: '#77797E' },
      { name: 'Titan Blue', hex: '#5D748A' },
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
    specBadge: '6.86" Flip · Leica Summilux',
    storageOptions: [{ capacity: '512 GB', priceDeltaAed: 0 }],
    colors: [
      { name: 'Black', hex: '#242426' },
      { name: 'White', hex: '#F3F3F1' },
    ],
  },

  // =========================================================================
  // OPPO
  // =========================================================================
  {
    id: 'oppo-find-x8-pro',
    brandId: 'oppo',
    name: 'OPPO Find X8 Pro',
    series: 'Find X Series',
    releaseYear: 2024,
    image: '/images/phone-circle-obsidian.jpg',
    basePriceAed: 2650,
    specBadge: '6.78" LTPO · Hasselblad Quad',
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
    specBadge: '7.82" Foldable · 16 GB RAM',
    storageOptions: [{ capacity: '512 GB', priceDeltaAed: 0 }],
    colors: [
      { name: 'Classic Black', hex: '#242426' },
      { name: 'Champagne Gold', hex: '#D8CCB4' },
    ],
  },
  {
    id: 'oppo-reno12-pro',
    brandId: 'oppo',
    name: 'OPPO Reno12 Pro 5G',
    series: 'Reno Series',
    releaseYear: 2024,
    image: '/images/phone-ultra-slate.jpg',
    basePriceAed: 1450,
    specBadge: '6.7" AMOLED · 50 MP Telephoto',
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 180 },
    ],
    colors: [
      { name: 'Nebula Silver', hex: '#C7CCD6' },
      { name: 'Space Brown', hex: '#4A433F' },
    ],
  },

  // =========================================================================
  // VIVO
  // =========================================================================
  {
    id: 'vivo-x200-pro',
    brandId: 'vivo',
    name: 'vivo X200 Pro',
    series: 'X Series',
    releaseYear: 2024,
    image: '/images/phone-circle-obsidian.jpg',
    basePriceAed: 2690,
    specBadge: '6.78" LTPO · ZEISS 200 MP APO',
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
    releaseYear: 2023,
    image: '/images/phone-circle-obsidian.jpg',
    basePriceAed: 2200,
    specBadge: '6.78" LTPO · ZEISS 1" Main',
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 220 },
    ],
    colors: [
      { name: 'Asteroid Black', hex: '#252628' },
      { name: 'Startrail Blue', hex: '#7DA2C4' },
    ],
  },
  {
    id: 'vivo-v40-pro',
    brandId: 'vivo',
    name: 'vivo V40 Pro',
    series: 'V Series',
    releaseYear: 2024,
    image: '/images/phone-ultra-slate.jpg',
    basePriceAed: 1520,
    specBadge: '6.78" AMOLED · ZEISS Portrait',
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 170 },
    ],
    colors: [
      { name: 'Ganges Blue', hex: '#8FB2CE' },
      { name: 'Titanium Grey', hex: '#9A9EA4' },
    ],
  },

  // =========================================================================
  // MOTOROLA
  // =========================================================================
  {
    id: 'motorola-razr-50-ultra',
    brandId: 'motorola',
    name: 'Motorola Razr 50 Ultra',
    series: 'Razr Foldable',
    releaseYear: 2024,
    image: '/images/phone-fold-platinum.jpg',
    basePriceAed: 2240,
    specBadge: '6.9" pOLED Flip · 4.0" Cover',
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 220 },
    ],
    colors: [
      { name: 'Midnight Blue', hex: '#273449' },
      { name: 'Spring Green', hex: '#55755E' },
      { name: 'Peach Fuzz', hex: '#F3BEA2' },
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
    specBadge: '6.7" 144Hz pOLED · 125W Turbo',
    storageOptions: [
      { capacity: '512 GB', priceDeltaAed: 0 },
      { capacity: '1 TB', priceDeltaAed: 240 },
    ],
    colors: [
      { name: 'Forest Grey', hex: '#4D5150' },
      { name: 'Nordic Wood', hex: '#CBB69C' },
      { name: 'Peach Fuzz', hex: '#F3BEA2' },
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
    specBadge: '6.7" 144Hz pOLED · Pantone',
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 160 },
    ],
    colors: [
      { name: 'Black Beauty', hex: '#232426' },
      { name: 'Moonlight Pearl', hex: '#EEECE8' },
    ],
  },

  // =========================================================================
  // IQOO
  // =========================================================================
  {
    id: 'iqoo-13',
    brandId: 'iqoo',
    name: 'iQOO 13',
    series: 'Flagship Series',
    releaseYear: 2024,
    image: '/images/phone-ultra-slate.jpg',
    basePriceAed: 2080,
    specBadge: '6.82" 144Hz Q10 · SD 8 Elite',
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 240 },
    ],
    colors: [
      { name: 'Legend', hex: '#F3F3F1' },
      { name: 'Nardo Grey', hex: '#7D8085' },
      { name: 'Alpha', hex: '#242527' },
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
    specBadge: '6.78" 144Hz LTPO · SD 8 Gen 3',
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 200 },
    ],
    colors: [
      { name: 'Legend', hex: '#F3F3F1' },
      { name: 'Alpha', hex: '#242527' },
    ],
  },

  // =========================================================================
  // REALME
  // =========================================================================
  {
    id: 'realme-gt-7-pro',
    brandId: 'realme',
    name: 'realme GT 7 Pro',
    series: 'GT Flagship',
    releaseYear: 2024,
    image: '/images/phone-ultra-slate.jpg',
    basePriceAed: 1850,
    specBadge: '6.78" Eco² OLED · SD 8 Elite',
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
    specBadge: '6.78" 6000-nit · SD 8s Gen 3',
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 170 },
    ],
    colors: [
      { name: 'Fluid Silver', hex: '#C8CCD0' },
      { name: 'Razor Green', hex: '#4B645A' },
    ],
  },

  // =========================================================================
  // POCO
  // =========================================================================
  {
    id: 'poco-f6-pro',
    brandId: 'poco',
    name: 'POCO F6 Pro',
    series: 'F Series',
    releaseYear: 2024,
    image: '/images/phone-ultra-slate.jpg',
    basePriceAed: 1520,
    specBadge: '6.67" WQHD+ · SD 8 Gen 2',
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 200 },
      { capacity: '1 TB', priceDeltaAed: 360 },
    ],
    colors: [
      { name: 'Black', hex: '#232426' },
      { name: 'White', hex: '#F3F3F1' },
    ],
  },
  {
    id: 'poco-x6-pro',
    brandId: 'poco',
    name: 'POCO X6 Pro 5G',
    series: 'X Series',
    releaseYear: 2024,
    image: '/images/phone-ultra-slate.jpg',
    basePriceAed: 1200,
    specBadge: '6.67" 120Hz · Dimensity 8300',
    storageOptions: [
      { capacity: '256 GB', priceDeltaAed: 0 },
      { capacity: '512 GB', priceDeltaAed: 140 },
    ],
    colors: [
      { name: 'Yellow', hex: '#EAB308' },
      { name: 'Grey', hex: '#7D8086' },
      { name: 'Black', hex: '#232426' },
    ],
  },
];

const BRAND_DIRECTORY: { id: BrandId; name: string }[] = [
  { id: 'apple', name: 'Apple' },
  { id: 'samsung', name: 'Samsung' },
  { id: 'google', name: 'Google' },
  { id: 'oneplus', name: 'OnePlus' },
  { id: 'xiaomi', name: 'Xiaomi' },
  { id: 'nothing', name: 'Nothing' },
  { id: 'oppo', name: 'OPPO' },
  { id: 'vivo', name: 'vivo' },
  { id: 'motorola', name: 'Motorola' },
  { id: 'iqoo', name: 'iQOO' },
  { id: 'realme', name: 'realme' },
  { id: 'poco', name: 'POCO' },
];

/**
 * Dynamically derived brand catalog so maxPayoutAed and deviceCount
 * are always 100% accurate against PHONE_MODELS.
 */
export const BRANDS: Brand[] = BRAND_DIRECTORY.map(({ id, name }) => {
  const models = PHONE_MODELS.filter((m) => m.brandId === id);
  const maxPayoutAed = models.reduce((highest, m) => {
    const modelMax =
      m.basePriceAed + Math.max(...m.storageOptions.map((s) => s.priceDeltaAed), 0);
    return Math.max(highest, modelMax);
  }, 0);
  return {
    id,
    name,
    maxPayoutAed,
    deviceCount: models.length,
  };
});

/**
 * Exact arsouq Fixed AED Reduction Schedule:
 * - Flawless (Zero Scratch):           -AED 0
 * - Small Scratch:                     -AED 150
 * - Medium Scratch:                    -AED 400
 * - Parts Change (Genuine Part):       -AED 500
 * - More Scratch / Dent / Broken:      -AED 700
 * - Hardware Issue / Unknown Parts:    -AED 1,000
 * - Others:                            Reply by agent
 */
export const CONDITION_TIERS: ConditionTier[] = [
  {
    id: 'zero-scratch',
    title: 'Flawless',
    shortLabel: 'Flawless',
    deductionAed: 0,
    badgeLabel: 'Zero Scratch · 90%+',
    indicatorHex: '#059669',
    summary: 'Spotless screen & body · 100% working · Original parts',
    criteria: [
      'Screen & frame: Zero scratches or marks',
      'Battery Health 90% or above',
      '100% original parts & all sensors working',
    ],
  },
  {
    id: 'small-scratch',
    title: 'Small Scratch',
    shortLabel: 'Small Scratch',
    deductionAed: 150,
    badgeLabel: 'Battery 85%+',
    indicatorHex: '#2095D3',
    summary: 'Faint hairline scratch on screen or body · Fully working',
    criteria: [
      'Light surface scratch on body, screen, or both',
      'Battery Health 85% or above',
      'No dents, cracks, or replaced parts',
    ],
  },
  {
    id: 'medium-scratch',
    title: 'Medium Scratch',
    shortLabel: 'Medium Scratch',
    deductionAed: 400,
    badgeLabel: 'Battery 85%+',
    indicatorHex: '#0284C7',
    summary: 'Visible screen scratch or minor body nick · Fully working',
    criteria: [
      'Noticeable scratch on display or small body nick',
      'Battery Health 85% or above',
      'All cameras, biometrics, and audio working',
    ],
  },
  {
    id: 'parts-change-genuine',
    title: 'Genuine Part',
    shortLabel: 'Genuine Part',
    deductionAed: 500,
    badgeLabel: '1 Official Part',
    indicatorHex: '#D97706',
    summary: 'No scratches · One official manufacturer part replaced · 85%+',
    criteria: [
      'Spotless body & display with 85%+ battery health',
      'Single genuine manufacturer part replaced',
      'All device functions verified working',
    ],
  },
  {
    id: 'more-scratch-broken',
    title: 'Cracked / Dent',
    shortLabel: 'Dent / Cracked',
    deductionAed: 700,
    badgeLabel: 'Core Working',
    indicatorHex: '#EA580C',
    summary: 'Cracked glass, frame dent, or minor speaker/mic/camera spot',
    criteria: [
      'Cracked front/back glass or visible frame dent',
      'Minor speaker, mic, or camera spot issue',
      'Main touch display and cellular network working',
    ],
  },
  {
    id: 'hardware-unknown-parts',
    title: 'Hardware Issue',
    shortLabel: 'Hardware Issue',
    deductionAed: 1000,
    badgeLabel: 'Major Fault',
    indicatorHex: '#DC2626',
    summary: 'Face ID fault, broken OLED display, or third-party repair',
    criteria: [
      'Face ID / Touch ID biometrics not working',
      'Damaged non-working display or dead pixels',
      'Unofficial / unknown replacement parts installed',
    ],
  },
  {
    id: 'others-agent',
    title: 'Other Condition',
    shortLabel: 'Agent Quote',
    deductionAed: null,
    badgeLabel: 'Custom Review',
    indicatorHex: '#52525B',
    summary: 'Multiple issues or unlisted fault — custom specialist offer',
    criteria: [
      'Unlisted device condition or multiple custom repairs',
      'Describe your phone for a tailored agent offer',
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
 * Drop your MP4 in `public/videos/` and set `src` (e.g. '/videos/phone-inspection.mp4').
 */
export const INSPECTION_VIDEO_CONFIG: InspectionVideoConfig = {
  src: '',
  poster: '/images/editorial-handover.jpg',
  durationLabel: '0:45',
  title: 'Phone inspection guide',
  subtitle:
    'Watch this quick 45-second check to confirm your selected condition before viewing your final AED evaluation.',
  checkpoints: [
    {
      step: '01',
      title: 'Screen & Frame Under Light',
      detail: 'Tilt the display and frame under bright light to check for hairline scratches, nicks, or glass cracks.',
    },
    {
      step: '02',
      title: 'Battery Health Percentage',
      detail: 'Open Settings > Battery > Battery Health (90%+ for Flawless, 85%+ for Small or Medium Scratch).',
    },
    {
      step: '03',
      title: 'Biometrics & Parts History',
      detail: 'Verify Face ID / Touch ID, cameras, audio, and Settings > General > About for genuine parts.',
    },
  ],
};

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
