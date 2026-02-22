import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ============================================
// IMÁGENES DE SUPLEMENTOS (Unsplash - funcionan)
// ============================================

const SUPPLEMENT_IMAGES = {
  proteinas: [
    'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&q=80',
    'https://images.unsplash.com/photo-1579722820903-4a0f22c3b9e0?w=600&q=80',
    'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=600&q=80',
  ],
  creatinas: [
    'https://images.unsplash.com/photo-1619088978562-73fb98f4ec17?w=600&q=80',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
  ],
  preentrenos: [
    'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=600&q=80',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80',
  ],
  aminoacidos: [
    'https://images.unsplash.com/photo-1612531385446-f7e6d131e1d0?w=600&q=80',
    'https://images.unsplash.com/photo-1579722820903-4a0f22c3b9e0?w=600&q=80',
  ],
  quemadores: [
    'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&q=80',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80',
  ],
  vitaminas: [
    'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=600&q=80',
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80',
  ],
  gainers: [
    'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&q=80',
    'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=600&q=80',
  ],
  accesorios: [
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80',
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&q=80',
  ],
};

const CATEGORY_IMAGES = {
  proteinas: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&q=80',
  creatinas: 'https://images.unsplash.com/photo-1619088978562-73fb98f4ec17?w=800&q=80',
  preentrenos: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=800&q=80',
  aminoacidos: 'https://images.unsplash.com/photo-1612531385446-f7e6d131e1d0?w=800&q=80',
  quemadores: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&q=80',
  vitaminas: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=800&q=80',
  gainers: 'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=800&q=80',
  accesorios: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80',
};

// ============================================
// DATOS
// ============================================

const CATEGORIES_DATA = [
  { name: 'Proteínas', slug: 'proteinas', description: 'Whey Protein, Isolate, Caseína y más para ganar masa muscular', image: CATEGORY_IMAGES.proteinas },
  { name: 'Creatinas', slug: 'creatinas', description: 'Creatina monohidratada, HCL y fórmulas avanzadas para fuerza explosiva', image: CATEGORY_IMAGES.creatinas },
  { name: 'Pre-Entrenos', slug: 'pre-entrenos', description: 'Máxima energía, pump y focus para entrenamientos intensos', image: CATEGORY_IMAGES.preentrenos },
  { name: 'Aminoácidos', slug: 'aminoacidos', description: 'BCAA, EAA, Glutamina para recuperación y rendimiento', image: CATEGORY_IMAGES.aminoacidos },
  { name: 'Quemadores', slug: 'quemadores', description: 'Termogénicos y fat burners para definición muscular', image: CATEGORY_IMAGES.quemadores },
  { name: 'Vitaminas', slug: 'vitaminas', description: 'Multivitamínicos, Omega 3, ZMA para salud óptima', image: CATEGORY_IMAGES.vitaminas },
  { name: 'Gainers', slug: 'gainers', description: 'Mass Gainers y fórmulas hipercalóricas para volumen', image: CATEGORY_IMAGES.gainers },
  { name: 'Accesorios', slug: 'accesorios', description: 'Shakers, guantes, cinturones y equipamiento de gym', image: CATEGORY_IMAGES.accesorios },
];

const BRANDS_DATA = [
  { name: 'Optimum Nutrition', description: 'True Strength - La marca #1 en proteínas a nivel mundial' },
  { name: 'MuscleTech', description: 'Strength Redefined - Innovación y ciencia en suplementos' },
  { name: 'BSN', description: 'Finish First - Rendimiento de élite' },
  { name: 'Dymatize', description: 'Nutrition Perfected - Proteínas de calidad premium' },
  { name: 'Dragon Pharma', description: 'Suplementos de alta calidad para atletas serios' },
  { name: 'Universal Nutrition', description: 'Since 1977 - Tradición en el mundo del fitness' },
  { name: 'Cellucor', description: 'Live Loud - Creadores del legendario C4' },
  { name: 'Rule One Proteins', description: 'R1 - Pureza y calidad garantizada' },
  { name: 'Nutrex Research', description: 'Hardcore Supplements - Lipo-6 y más' },
  { name: 'Scivation', description: 'Xtend - Los BCAAs más vendidos del mundo' },
  { name: 'JNX Sports', description: 'The Shadow - Pre-entrenos de alta intensidad' },
  { name: 'GAT Sport', description: 'Fuel Your Fire - Para atletas dedicados' },
  { name: 'EHP Labs', description: 'OxyShred - Quemadores innovadores de Australia' },
  { name: 'Mutant', description: 'Feed Your Mutation - Suplementos extremos' },
  { name: 'AllMax Nutrition', description: 'Science Backed - Calidad canadiense' },
];

// ============================================
// PRODUCTOS POR PESO (cada peso = producto separado)
// ============================================

interface ProductTemplate {
  baseName: string;
  brand: string;
  category: string;
  presentations: { weight: string; price: number }[];
  description: string;
  flavors: string[];
}

const PRODUCTS: ProductTemplate[] = [
  // ==================== PROTEÍNAS ====================
  {
    baseName: 'Gold Standard 100% Whey',
    brand: 'Optimum Nutrition',
    category: 'proteinas',
    presentations: [
      { weight: '2lb (907g)', price: 259.90 },
      { weight: '5lb (2.27kg)', price: 459.90 },
      { weight: '10lb (4.54kg)', price: 789.90 },
    ],
    description: 'La proteína whey más vendida del mundo. 24g de proteína, 5.5g BCAAs y 4g glutamina por servicio.',
    flavors: ['Double Rich Chocolate', 'French Vanilla', 'Cookies & Cream', 'Strawberry Banana', 'Banana'],
  },
  {
    baseName: 'Platinum Hydrowhey',
    brand: 'Optimum Nutrition',
    category: 'proteinas',
    presentations: [
      { weight: '3.5lb (1.59kg)', price: 349.90 },
    ],
    description: 'Proteína hidrolizada premium de ON. Absorción ultrarrápida post-entreno.',
    flavors: ['Chocolate', 'Vanilla', 'Cookies & Cream'],
  },
  {
    baseName: 'Gold Standard Casein',
    brand: 'Optimum Nutrition',
    category: 'proteinas',
    presentations: [
      { weight: '2lb (907g)', price: 279.90 },
      { weight: '4lb (1.81kg)', price: 489.90 },
    ],
    description: 'Caseína micelar de liberación lenta. Ideal para antes de dormir.',
    flavors: ['Chocolate', 'Vanilla', 'Cookies & Cream'],
  },
  {
    baseName: 'Nitro-Tech Whey Gold',
    brand: 'MuscleTech',
    category: 'proteinas',
    presentations: [
      { weight: '2.2lb (1kg)', price: 269.90 },
      { weight: '5lb (2.27kg)', price: 479.90 },
    ],
    description: 'Whey protein con péptidos y creatina. 24g proteína por servicio.',
    flavors: ['Double Rich Chocolate', 'French Vanilla Cream', 'Cookies & Cream', 'Strawberry'],
  },
  {
    baseName: 'Nitro-Tech Ripped',
    brand: 'MuscleTech',
    category: 'proteinas',
    presentations: [
      { weight: '2lb (907g)', price: 279.90 },
      { weight: '4lb (1.81kg)', price: 499.90 },
    ],
    description: 'Proteína + quemador de grasa. Para definición muscular.',
    flavors: ['Chocolate Fudge Brownie', 'French Vanilla Swirl'],
  },
  {
    baseName: 'ISO100 Hydrolyzed',
    brand: 'Dymatize',
    category: 'proteinas',
    presentations: [
      { weight: '1.4lb (640g)', price: 219.90 },
      { weight: '3lb (1.36kg)', price: 319.90 },
      { weight: '5lb (2.27kg)', price: 489.90 },
    ],
    description: '100% proteína aislada hidrolizada. 25g proteína, 0 azúcar, 0 lactosa.',
    flavors: ['Gourmet Chocolate', 'Gourmet Vanilla', 'Cookies & Cream', 'Fudge Brownie', 'Strawberry'],
  },
  {
    baseName: 'Syntha-6',
    brand: 'BSN',
    category: 'proteinas',
    presentations: [
      { weight: '2.91lb (1.32kg)', price: 249.90 },
      { weight: '5lb (2.27kg)', price: 419.90 },
    ],
    description: 'Ultra-premium protein matrix. Mezcla de 6 proteínas de liberación sostenida.',
    flavors: ['Chocolate Milkshake', 'Vanilla Ice Cream', 'Cookies & Cream', 'Strawberry Milkshake'],
  },
  {
    baseName: 'ISO Whey',
    brand: 'Dragon Pharma',
    category: 'proteinas',
    presentations: [
      { weight: '2lb (907g)', price: 299.90 },
      { weight: '4lb (1.8kg)', price: 539.90 },
    ],
    description: 'Proteína isolada premium de Dragon Pharma. Cero grasa, cero azúcar.',
    flavors: ['Chocolate', 'Vanilla', 'Cookies & Cream', 'Peanut Butter'],
  },
  {
    baseName: 'R1 Protein',
    brand: 'Rule One Proteins',
    category: 'proteinas',
    presentations: [
      { weight: '2.4lb (1.1kg)', price: 289.90 },
      { weight: '5lb (2.27kg)', price: 519.90 },
    ],
    description: '25g de proteína isolada e hidrolizada. Sin rellenos innecesarios.',
    flavors: ['Chocolate Fudge', 'Vanilla Creme', 'Cookies & Creme'],
  },
  {
    baseName: 'Mutant Whey',
    brand: 'Mutant',
    category: 'proteinas',
    presentations: [
      { weight: '2lb (908g)', price: 219.90 },
      { weight: '5lb (2.27kg)', price: 389.90 },
    ],
    description: '22g de proteína whey blend para construcción muscular.',
    flavors: ['Triple Chocolate', 'Vanilla Ice Cream', 'Cookies & Cream'],
  },
  {
    baseName: 'IsoFlex',
    brand: 'AllMax Nutrition',
    category: 'proteinas',
    presentations: [
      { weight: '2lb (907g)', price: 299.90 },
      { weight: '5lb (2.27kg)', price: 529.90 },
    ],
    description: 'Proteína isolada pura al 90%. 27g proteína, sin grasa ni azúcar.',
    flavors: ['Chocolate', 'Vanilla', 'Cookies & Cream', 'Peanut Butter Chocolate'],
  },

  // ==================== CREATINAS ====================
  {
    baseName: 'Creatina Monohidratada',
    brand: 'Dragon Pharma',
    category: 'creatinas',
    presentations: [
      { weight: '300g', price: 89.90 },
      { weight: '500g', price: 129.90 },
      { weight: '1kg', price: 219.90 },
    ],
    description: 'Creatina monohidratada micronizada 200 mesh. Pureza garantizada.',
    flavors: ['Sin Sabor'],
  },
  {
    baseName: 'Micronized Creatine',
    brand: 'Optimum Nutrition',
    category: 'creatinas',
    presentations: [
      { weight: '300g', price: 99.90 },
      { weight: '600g', price: 169.90 },
      { weight: '1.2kg', price: 299.90 },
    ],
    description: 'Creatina monohidratada micronizada Creapure. 5g por servicio.',
    flavors: ['Sin Sabor'],
  },
  {
    baseName: 'Cell-Tech',
    brand: 'MuscleTech',
    category: 'creatinas',
    presentations: [
      { weight: '3lb (1.36kg)', price: 159.90 },
      { weight: '6lb (2.72kg)', price: 279.90 },
    ],
    description: 'Sistema de creatina con carbohidratos para máximo transporte muscular.',
    flavors: ['Fruit Punch', 'Grape', 'Orange'],
  },
  {
    baseName: 'Platinum Creatine',
    brand: 'MuscleTech',
    category: 'creatinas',
    presentations: [
      { weight: '400g', price: 79.90 },
      { weight: '800g', price: 139.90 },
    ],
    description: 'Creatina monohidratada ultra-pura. 5g HPLC-tested por servicio.',
    flavors: ['Sin Sabor'],
  },
  {
    baseName: 'Creatine Powder',
    brand: 'Universal Nutrition',
    category: 'creatinas',
    presentations: [
      { weight: '200g', price: 69.90 },
      { weight: '500g', price: 119.90 },
      { weight: '1kg', price: 199.90 },
    ],
    description: 'Creatina monohidratada clásica de Universal. Probada desde 1977.',
    flavors: ['Sin Sabor'],
  },

  // ==================== PRE-ENTRENOS ====================
  {
    baseName: 'C4 Original',
    brand: 'Cellucor',
    category: 'pre-entrenos',
    presentations: [
      { weight: '30 serv (195g)', price: 139.90 },
      { weight: '60 serv (390g)', price: 249.90 },
    ],
    description: 'El pre-entreno más vendido de América. Energía explosiva con CarnoSyn Beta-Alanine.',
    flavors: ['Fruit Punch', 'Cherry Limeade', 'Pink Lemonade', 'Watermelon', 'Blue Raspberry'],
  },
  {
    baseName: 'C4 Ultimate',
    brand: 'Cellucor',
    category: 'pre-entrenos',
    presentations: [
      { weight: '20 serv (520g)', price: 189.90 },
    ],
    description: 'Versión premium de C4. Citrulina, Beta-Alanina y Cognizin para máximo rendimiento.',
    flavors: ['Strawberry Watermelon', 'Icy Blue Razz', 'Sour Batch Bros'],
  },
  {
    baseName: 'C4 Ripped',
    brand: 'Cellucor',
    category: 'pre-entrenos',
    presentations: [
      { weight: '30 serv (180g)', price: 149.90 },
    ],
    description: 'Pre-entreno con quemadores de grasa incluidos. Energía + definición.',
    flavors: ['Cherry Limeade', 'Fruit Punch', 'Tropical Punch'],
  },
  {
    baseName: 'The Shadow',
    brand: 'JNX Sports',
    category: 'pre-entrenos',
    presentations: [
      { weight: '30 serv (270g)', price: 169.90 },
    ],
    description: 'Pre-entreno hardcore de alta estimulación. Para usuarios experimentados.',
    flavors: ['Fruit Punch', 'Blue Raspberry', 'Watermelon', 'Grape'],
  },
  {
    baseName: 'Vapor X5 Next Gen',
    brand: 'MuscleTech',
    category: 'pre-entrenos',
    presentations: [
      { weight: '30 serv (232g)', price: 159.90 },
      { weight: '60 serv (465g)', price: 279.90 },
    ],
    description: 'Pre-entreno con 5 complejos para energía, fuerza y pump.',
    flavors: ['Blue Raspberry Fusion', 'Fruit Punch Blast', 'Icy Rocket Freeze'],
  },
  {
    baseName: 'N.O.-Xplode',
    brand: 'BSN',
    category: 'pre-entrenos',
    presentations: [
      { weight: '30 serv (555g)', price: 149.90 },
      { weight: '60 serv (1.11kg)', price: 269.90 },
    ],
    description: 'Pre-entreno legendario con cafeína, beta-alanina y creatina.',
    flavors: ['Fruit Punch', 'Blue Razz', 'Watermelon', 'Grape'],
  },
  {
    baseName: 'Venom',
    brand: 'Dragon Pharma',
    category: 'pre-entrenos',
    presentations: [
      { weight: '40 serv (300g)', price: 159.90 },
    ],
    description: 'Pre-entreno potente de Dragon Pharma. Energía extrema y vasodilatación.',
    flavors: ['Fruit Punch', 'Blue Ice', 'Mango', 'Watermelon'],
  },
  {
    baseName: 'Nitraflex',
    brand: 'GAT Sport',
    category: 'pre-entrenos',
    presentations: [
      { weight: '30 serv (300g)', price: 159.90 },
    ],
    description: 'Pre-entreno con potenciador de testosterona. Fuerza, energía y pump.',
    flavors: ['Black Cherry', 'Blue Raspberry', 'Fruit Punch', 'Green Apple'],
  },
  {
    baseName: 'Outlift',
    brand: 'Nutrex Research',
    category: 'pre-entrenos',
    presentations: [
      { weight: '20 serv (502g)', price: 169.90 },
    ],
    description: 'Pre-entreno clínicamente dosificado. 10 ingredientes activos.',
    flavors: ['Wild Cherry Citrus', 'Blackberry Lemonade', 'Blue Raspberry'],
  },

  // ==================== AMINOÁCIDOS ====================
  {
    baseName: 'Xtend BCAA',
    brand: 'Scivation',
    category: 'aminoacidos',
    presentations: [
      { weight: '30 serv (416g)', price: 129.90 },
      { weight: '90 serv (1.17kg)', price: 319.90 },
    ],
    description: 'Los BCAAs más vendidos del mundo. 7g BCAAs + electrolitos por servicio.',
    flavors: ['Blue Raspberry', 'Watermelon', 'Mango', 'Lemon Lime', 'Grape'],
  },
  {
    baseName: 'Amino Energy',
    brand: 'Optimum Nutrition',
    category: 'aminoacidos',
    presentations: [
      { weight: '30 serv (270g)', price: 119.90 },
      { weight: '65 serv (585g)', price: 219.90 },
    ],
    description: 'Aminoácidos + cafeína natural. Energía limpia cualquier momento del día.',
    flavors: ['Grape', 'Blue Raspberry', 'Watermelon', 'Green Apple', 'Fruit Fusion'],
  },
  {
    baseName: 'BCAA 1000 Caps',
    brand: 'Optimum Nutrition',
    category: 'aminoacidos',
    presentations: [
      { weight: '200 caps', price: 79.90 },
      { weight: '400 caps', price: 139.90 },
    ],
    description: 'BCAAs en cápsulas convenientes. 1g por cápsula.',
    flavors: ['Sin Sabor'],
  },
  {
    baseName: 'Glutamine Powder',
    brand: 'Optimum Nutrition',
    category: 'aminoacidos',
    presentations: [
      { weight: '300g', price: 69.90 },
      { weight: '600g', price: 119.90 },
      { weight: '1kg', price: 179.90 },
    ],
    description: 'L-Glutamina pura micronizada para recuperación e inmunidad.',
    flavors: ['Sin Sabor'],
  },
  {
    baseName: 'Amino X',
    brand: 'BSN',
    category: 'aminoacidos',
    presentations: [
      { weight: '30 serv (435g)', price: 109.90 },
      { weight: '70 serv (1.01kg)', price: 219.90 },
    ],
    description: 'BCAAs efervescentes con 10g de aminoácidos por servicio.',
    flavors: ['Blue Raspberry', 'Fruit Punch', 'Watermelon', 'Grape'],
  },
  {
    baseName: 'BCAA 8:1:1',
    brand: 'Dragon Pharma',
    category: 'aminoacidos',
    presentations: [
      { weight: '300g', price: 99.90 },
      { weight: '600g', price: 169.90 },
    ],
    description: 'BCAAs en proporción 8:1:1 para máxima síntesis proteica.',
    flavors: ['Lemon', 'Grape', 'Fruit Punch', 'Watermelon'],
  },

  // ==================== QUEMADORES ====================
  {
    baseName: 'Lipo-6 Black',
    brand: 'Nutrex Research',
    category: 'quemadores',
    presentations: [
      { weight: '60 caps', price: 129.90 },
    ],
    description: 'Termogénico de alta potencia con liberación rápida. El quemador más vendido.',
    flavors: ['Sin Sabor'],
  },
  {
    baseName: 'Lipo-6 Black Hers',
    brand: 'Nutrex Research',
    category: 'quemadores',
    presentations: [
      { weight: '60 caps', price: 119.90 },
    ],
    description: 'Quemador de grasa diseñado para mujeres. Fórmula femenina.',
    flavors: ['Sin Sabor'],
  },
  {
    baseName: 'OxyShred',
    brand: 'EHP Labs',
    category: 'quemadores',
    presentations: [
      { weight: '60 serv (276g)', price: 159.90 },
    ],
    description: 'Quemador de grasa australiano #1. Termogénico + energía + mood.',
    flavors: ['Kiwi Strawberry', 'Passionfruit', 'Guava Paradise', 'Wild Melon'],
  },
  {
    baseName: 'Hydroxycut Hardcore Elite',
    brand: 'MuscleTech',
    category: 'quemadores',
    presentations: [
      { weight: '100 caps', price: 119.90 },
    ],
    description: 'Potente termogénico con C. canephora robusta para pérdida de peso.',
    flavors: ['Sin Sabor'],
  },
  {
    baseName: 'Super HD',
    brand: 'Cellucor',
    category: 'quemadores',
    presentations: [
      { weight: '60 caps', price: 109.90 },
      { weight: '120 caps', price: 189.90 },
    ],
    description: 'Termogénico con nootropicos. Quema grasa + claridad mental.',
    flavors: ['Sin Sabor'],
  },
  {
    baseName: 'Animal Cuts',
    brand: 'Universal Nutrition',
    category: 'quemadores',
    presentations: [
      { weight: '42 packs', price: 169.90 },
    ],
    description: 'Pack de definición completo: termogénico + diurético + metabolizador.',
    flavors: ['Sin Sabor'],
  },

  // ==================== VITAMINAS ====================
  {
    baseName: 'Opti-Men',
    brand: 'Optimum Nutrition',
    category: 'vitaminas',
    presentations: [
      { weight: '90 tabs', price: 89.90 },
      { weight: '150 tabs', price: 139.90 },
      { weight: '240 tabs', price: 199.90 },
    ],
    description: 'Multivitamínico completo para hombres activos. 75+ ingredientes.',
    flavors: ['Sin Sabor'],
  },
  {
    baseName: 'Opti-Women',
    brand: 'Optimum Nutrition',
    category: 'vitaminas',
    presentations: [
      { weight: '60 caps', price: 79.90 },
      { weight: '120 caps', price: 139.90 },
    ],
    description: 'Multivitamínico diseñado para las necesidades de la mujer activa.',
    flavors: ['Sin Sabor'],
  },
  {
    baseName: 'Fish Oil Omega 3',
    brand: 'Optimum Nutrition',
    category: 'vitaminas',
    presentations: [
      { weight: '100 softgels', price: 59.90 },
      { weight: '200 softgels', price: 99.90 },
    ],
    description: 'Aceite de pescado purificado con EPA y DHA.',
    flavors: ['Sin Sabor'],
  },
  {
    baseName: 'ZMA',
    brand: 'Optimum Nutrition',
    category: 'vitaminas',
    presentations: [
      { weight: '90 caps', price: 49.90 },
      { weight: '180 caps', price: 89.90 },
    ],
    description: 'Zinc, Magnesio y B6 para recuperación nocturna.',
    flavors: ['Sin Sabor'],
  },
  {
    baseName: 'Animal Pak',
    brand: 'Universal Nutrition',
    category: 'vitaminas',
    presentations: [
      { weight: '15 packs', price: 69.90 },
      { weight: '30 packs', price: 119.90 },
      { weight: '44 packs', price: 159.90 },
    ],
    description: 'El pack de vitaminas legendario para culturistas desde 1983.',
    flavors: ['Sin Sabor'],
  },
  {
    baseName: 'Animal Flex',
    brand: 'Universal Nutrition',
    category: 'vitaminas',
    presentations: [
      { weight: '44 packs', price: 119.90 },
    ],
    description: 'Soporte completo para articulaciones y ligamentos.',
    flavors: ['Sin Sabor'],
  },

  // ==================== GAINERS ====================
  {
    baseName: 'Serious Mass',
    brand: 'Optimum Nutrition',
    category: 'gainers',
    presentations: [
      { weight: '6lb (2.72kg)', price: 229.90 },
      { weight: '12lb (5.44kg)', price: 399.90 },
    ],
    description: 'El gainer más vendido. 1250 calorías y 50g de proteína por servicio.',
    flavors: ['Chocolate', 'Vanilla', 'Strawberry', 'Banana'],
  },
  {
    baseName: 'Pro Gainer',
    brand: 'Optimum Nutrition',
    category: 'gainers',
    presentations: [
      { weight: '5.09lb (2.31kg)', price: 239.90 },
      { weight: '10.19lb (4.62kg)', price: 429.90 },
    ],
    description: 'Gainer de alta proteína con 60g protein y carbohidratos complejos.',
    flavors: ['Double Chocolate', 'Vanilla Custard', 'Strawberry Cream'],
  },
  {
    baseName: 'Mass-Tech Extreme 2000',
    brand: 'MuscleTech',
    category: 'gainers',
    presentations: [
      { weight: '6lb (2.72kg)', price: 269.90 },
      { weight: '22lb (9.98kg)', price: 699.90 },
    ],
    description: '2000 calorías, 80g proteína y 400g carbohidratos por servicio.',
    flavors: ['Triple Chocolate Brownie', 'Vanilla Milkshake', 'Strawberry'],
  },
  {
    baseName: 'True Mass 1200',
    brand: 'BSN',
    category: 'gainers',
    presentations: [
      { weight: '10.25lb (4.65kg)', price: 309.90 },
    ],
    description: 'Mass gainer premium con proteínas de múltiples fuentes.',
    flavors: ['Chocolate Milkshake', 'Vanilla Ice Cream'],
  },
  {
    baseName: 'Mutant Mass',
    brand: 'Mutant',
    category: 'gainers',
    presentations: [
      { weight: '5lb (2.27kg)', price: 229.90 },
      { weight: '15lb (6.8kg)', price: 549.90 },
    ],
    description: 'Gainer extremo con 1100 calorías y 56g de proteína.',
    flavors: ['Triple Chocolate', 'Cookies & Cream', 'Vanilla Ice Cream'],
  },
  {
    baseName: 'Super Mass Gainer',
    brand: 'Dymatize',
    category: 'gainers',
    presentations: [
      { weight: '6lb (2.72kg)', price: 189.90 },
      { weight: '12lb (5.44kg)', price: 349.90 },
    ],
    description: '1310 calorías con creatina, glutamina y BCAAs incluidos.',
    flavors: ['Rich Chocolate', 'Gourmet Vanilla'],
  },

  // ==================== ACCESORIOS ====================
  {
    baseName: 'Shaker Classic',
    brand: 'AllMax Nutrition',
    category: 'accesorios',
    presentations: [
      { weight: '600ml', price: 29.90 },
      { weight: '800ml', price: 39.90 },
    ],
    description: 'Shaker clásico con BlenderBall de acero inoxidable.',
    flavors: ['Negro', 'Azul', 'Rojo'],
  },
  {
    baseName: 'Shaker Pro',
    brand: 'AllMax Nutrition',
    category: 'accesorios',
    presentations: [
      { weight: '700ml', price: 44.90 },
      { weight: '1L', price: 54.90 },
    ],
    description: 'Shaker premium con compartimento para suplementos.',
    flavors: ['Negro', 'Blanco'],
  },
  {
    baseName: 'Guantes Training',
    brand: 'Universal Nutrition',
    category: 'accesorios',
    presentations: [
      { weight: 'Talla S', price: 49.90 },
      { weight: 'Talla M', price: 49.90 },
      { weight: 'Talla L', price: 49.90 },
      { weight: 'Talla XL', price: 49.90 },
    ],
    description: 'Guantes con grip antideslizante y muñequera con velcro.',
    flavors: ['Negro', 'Negro/Rojo'],
  },
  {
    baseName: 'Cinturón Powerlifting',
    brand: 'Universal Nutrition',
    category: 'accesorios',
    presentations: [
      { weight: 'Talla S', price: 89.90 },
      { weight: 'Talla M', price: 89.90 },
      { weight: 'Talla L', price: 89.90 },
      { weight: 'Talla XL', price: 89.90 },
    ],
    description: 'Cinturón de cuero genuino de 10cm para levantamientos pesados.',
    flavors: ['Negro'],
  },
  {
    baseName: 'Straps Deadlift',
    brand: 'GAT Sport',
    category: 'accesorios',
    presentations: [
      { weight: 'Par', price: 34.90 },
    ],
    description: 'Straps de algodón reforzado para peso muerto y jalones.',
    flavors: ['Negro', 'Rojo'],
  },
];

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function main() {
  console.log('💪 Starting BEAST NUTRITION seed (productos por peso)...\n');

  // Clean existing data
  console.log('🗑️  Cleaning existing data...');
  await prisma.productVariantVariantValue.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productStat.deleteMany();
  await prisma.product.deleteMany();
  await prisma.variantTypeValue.deleteMany();
  await prisma.variantType.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();

  // Settings
  console.log('⚙️  Creating settings...');
  await prisma.settings.upsert({
    where: { id: 'main' },
    update: {
      businessName: 'BEAST NUTRITION',
      whatsapp: '+51999888777',
      currency: 'S/',
      cartEnabled: true,
      welcomeMessage: '¡Qué tal BEAST! 💪 ¿Listo para llevar tu entrenamiento al siguiente nivel?',
      description: 'Tu tienda de suplementos deportivos. Proteínas, creatinas, pre-entrenos y más.',
      seoTitle: 'BEAST NUTRITION - Suplementos Deportivos | Proteínas, Creatinas, Pre-Entrenos',
      seoDescription: 'Tienda de suplementos deportivos en Perú. Whey Protein, Creatina, Pre-entrenos y más.',
    },
    create: {
      id: 'main',
      businessName: 'BEAST NUTRITION',
      whatsapp: '+51999888777',
      currency: 'S/',
      cartEnabled: true,
      welcomeMessage: '¡Qué tal BEAST! 💪 ¿Listo para llevar tu entrenamiento al siguiente nivel?',
      description: 'Tu tienda de suplementos deportivos.',
      seoTitle: 'BEAST NUTRITION - Suplementos Deportivos',
      seoDescription: 'Tienda de suplementos deportivos en Perú.',
    },
  });

  // Users
  console.log('👤 Creating users...');
  const hashedPassword = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@beastnutrition.com' },
    update: {},
    create: {
      email: 'admin@beastnutrition.com',
      password: hashedPassword,
      name: 'Admin Beast',
      role: 'ADMIN',
    },
  });

  // Variant Type: Sabor
  console.log('🏷️  Creating variant type (Sabor)...');
  const saborType = await prisma.variantType.upsert({
    where: { name: 'Sabor' },
    update: { showAsFilter: true, showInLanding: false },
    create: {
      name: 'Sabor',
      description: 'Sabores disponibles',
      order: 0,
      isActive: true,
      showAsFilter: true,
      showInLanding: false,
    },
  });

  // Create all flavor values
  const allFlavors = new Set<string>();
  PRODUCTS.forEach(p => p.flavors.forEach(f => allFlavors.add(f)));

  const flavorValueMap: Record<string, string> = {};
  let flavorOrder = 0;
  for (const flavor of allFlavors) {
    const value = await prisma.variantTypeValue.upsert({
      where: { variantTypeId_value: { variantTypeId: saborType.id, value: flavor } },
      update: {},
      create: { variantTypeId: saborType.id, value: flavor, order: flavorOrder++, isActive: true },
    });
    flavorValueMap[flavor] = value.id;
  }
  console.log(`   ✅ Created ${allFlavors.size} flavor values`);

  // Brands
  console.log('🏪 Creating brands...');
  const brandsMap: Record<string, string> = {};
  for (let i = 0; i < BRANDS_DATA.length; i++) {
    const b = BRANDS_DATA[i];
    const created = await prisma.brand.upsert({
      where: { slug: generateSlug(b.name) },
      update: {},
      create: { name: b.name, slug: generateSlug(b.name), description: b.description, order: i, isActive: true },
    });
    brandsMap[b.name] = created.id;
  }
  console.log(`   ✅ Created ${BRANDS_DATA.length} brands`);

  // Categories
  console.log('📁 Creating categories...');
  const categoriesMap: Record<string, string> = {};
  for (let i = 0; i < CATEGORIES_DATA.length; i++) {
    const c = CATEGORIES_DATA[i];
    const created = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { description: c.description, image: c.image },
      create: {
        name: c.name, slug: c.slug, description: c.description, image: c.image,
        order: i, isActive: true, seoTitle: `${c.name} - BEAST NUTRITION`, seoDescription: c.description,
      },
    });
    categoriesMap[c.slug] = created.id;
  }
  console.log(`   ✅ Created ${CATEGORIES_DATA.length} categories`);

  // Products
  console.log('📦 Creating products (one per weight)...');
  let productCount = 0;
  let variantCount = 0;

  for (const template of PRODUCTS) {
    const categoryId = categoriesMap[template.category];
    const brandId = brandsMap[template.brand] || null;
    const images = SUPPLEMENT_IMAGES[template.category as keyof typeof SUPPLEMENT_IMAGES] || SUPPLEMENT_IMAGES.proteinas;

    for (const presentation of template.presentations) {
      const hasDiscount = Math.random() > 0.75;
      const isFeatured = Math.random() > 0.85;

      const productName = `${template.baseName} ${presentation.weight}`;
      const slug = generateSlug(`${productName}-${productCount}`);
      const price = presentation.price;
      const salePrice = hasDiscount ? Math.round(price * (0.85 + Math.random() * 0.1) * 100) / 100 : null;
      const discountPercent = salePrice ? Math.round((1 - salePrice / price) * 100) : null;
      const imageUrl = images[productCount % images.length];

      try {
        const product = await prisma.product.create({
          data: {
            name: productName,
            slug,
            description: template.description,
            price: Math.round(price * 100) / 100,
            salePrice,
            discountPercent,
            showPrice: true,
            stock: randomInt(5, 50),
            showStock: true,
            isActive: true,
            isFeatured,
            order: productCount,
            categoryId,
            brandId,
            seoTitle: `${productName} - ${template.brand} | BEAST NUTRITION`,
            seoDescription: template.description,
          },
        });

        await prisma.productImage.create({
          data: { productId: product.id, url: imageUrl, publicId: `seed-${product.id}`, order: 0 },
        });

        // Variants by flavor
        for (let i = 0; i < template.flavors.length; i++) {
          const flavor = template.flavors[i];
          const flavorValueId = flavorValueMap[flavor];
          if (!flavorValueId) continue;

          const variant = await prisma.productVariant.create({
            data: {
              productId: product.id,
              sku: `${slug}-${generateSlug(flavor)}`.toUpperCase().slice(0, 50),
              price: null,
              stock: randomInt(3, 20),
              isActive: true,
              order: i,
            },
          });

          await prisma.productVariantVariantValue.create({
            data: { productVariantId: variant.id, variantTypeId: saborType.id, value: flavor },
          });
          variantCount++;
        }
        productCount++;
      } catch (error) {
        console.error(`Error creating ${productName}:`, error);
      }
    }
  }

  console.log(`   ✅ Created ${productCount} products`);
  console.log(`   ✅ Created ${variantCount} flavor variants`);

  console.log(`
====================================
   💪 BEAST NUTRITION READY! 💪
====================================

Email: admin@beastnutrition.com
Password: admin123

- ${BRANDS_DATA.length} Marcas
- ${CATEGORIES_DATA.length} Categorías
- ${productCount} Productos (por peso)
- ${variantCount} Variantes (por sabor)

✅ Cada peso es un producto visible
✅ Sabores como variantes internas
`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
