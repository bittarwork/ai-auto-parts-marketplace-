const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

// Import all models
const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');
const Vehicle = require('../src/models/Vehicle');
const Order = require('../src/models/Order');
const Cart = require('../src/models/Cart');
const Wishlist = require('../src/models/Wishlist');
const ChatSession = require('../src/models/ChatSession');
const ProductNotification = require('../src/models/ProductNotification');
const Settings = require('../src/models/Settings');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// =============================================================================
// SITE SETTINGS
// =============================================================================
const settingsData = {
  siteName: 'AutoParts Marketplace',
  contactEmail: 'admin@autoparts.com',
  currency: 'EUR',
  defaultLanguage: 'en',
  shippingFlatRate: 12,
  freeShippingThreshold: 150,
  taxRate: 19,
  lowStockThreshold: 8,
  notifyOnNewOrder: true,
  notifyOnLowStock: true
};

// =============================================================================
// USERS (1 admin + 3 suppliers + 11 customers = 15 total)
// =============================================================================
const usersData = [
  // ----- ADMIN -----
  {
    name: 'System Administrator',
    email: 'admin@autoparts.com',
    password: 'Admin@2024!',
    phone: '+491234567890',
    role: 'administrator',
    isEmailVerified: true,
    isActive: true,
    language: 'en',
    addresses: [
      {
        label: 'Office',
        street: 'Hauptstrasse 15',
        city: 'Berlin',
        district: 'Mitte',
        postalCode: '10115',
        country: 'Germany',
        isDefault: true,
        phone: '+491234567890'
      }
    ]
  },

  // ----- SUPPLIERS (3) -----
  {
    name: 'AutoParts Pro GmbH',
    email: 'supplier1@autoparts.com',
    password: 'Supplier@2024!',
    phone: '+4915112345678',
    role: 'supplier',
    isEmailVerified: true,
    isActive: true,
    language: 'en',
    businessName: 'AutoParts Pro GmbH',
    businessLicense: 'DE-BL-2024-001',
    taxNumber: 'DE123456789',
    addresses: [
      {
        label: 'Warehouse',
        street: 'Industriestrasse 42',
        city: 'Hamburg',
        district: 'Wandsbek',
        postalCode: '22041',
        country: 'Germany',
        isDefault: true,
        phone: '+4915112345678'
      }
    ]
  },
  {
    name: 'Chinese Motors Europe',
    email: 'supplier2@autoparts.com',
    password: 'Supplier@2024!',
    phone: '+4915198765432',
    role: 'supplier',
    isEmailVerified: true,
    isActive: true,
    language: 'en',
    businessName: 'Chinese Motors Europe BV',
    businessLicense: 'NL-BL-2024-005',
    taxNumber: 'NL987654321B01',
    addresses: [
      {
        label: 'HQ',
        street: 'Grote Marktstraat 10',
        city: 'Rotterdam',
        district: 'Centrum',
        postalCode: '3011',
        country: 'Netherlands',
        isDefault: true,
        phone: '+4915198765432'
      }
    ]
  },
  {
    name: 'Elite Car Components',
    email: 'supplier3@autoparts.com',
    password: 'Supplier@2024!',
    phone: '+4915177889900',
    role: 'supplier',
    isEmailVerified: true,
    isActive: true,
    language: 'en',
    businessName: 'Elite Car Components Ltd',
    businessLicense: 'GB-BL-2024-012',
    taxNumber: 'GB112233445',
    addresses: [
      {
        label: 'Depot',
        street: 'Industrial Park Road 8',
        city: 'Birmingham',
        district: 'Erdington',
        postalCode: 'B24 0AA',
        country: 'United Kingdom',
        isDefault: true,
        phone: '+4915177889900'
      }
    ]
  },

  // ----- CUSTOMERS (11) -----
  {
    name: 'Ahmed Al-Hassan',
    email: 'ahmed@example.com',
    password: 'Customer@2024!',
    phone: '+4917611112222',
    role: 'customer',
    isEmailVerified: true,
    isActive: true,
    language: 'ar',
    addresses: [
      {
        label: 'Home',
        street: 'Damascener Strasse 22',
        city: 'Cologne',
        district: 'Innenstadt',
        postalCode: '50668',
        country: 'Germany',
        isDefault: true,
        phone: '+4917611112222'
      },
      {
        label: 'Work',
        street: 'Ringe 5',
        city: 'Cologne',
        district: 'Ehrenfeld',
        postalCode: '50823',
        country: 'Germany',
        isDefault: false,
        phone: '+4917611112222'
      }
    ]
  },
  {
    name: 'Fatima Khalil',
    email: 'fatima@example.com',
    password: 'Customer@2024!',
    phone: '+4917633334444',
    role: 'customer',
    isEmailVerified: true,
    isActive: true,
    language: 'ar',
    addresses: [
      {
        label: 'Home',
        street: 'Bergmannstrasse 88',
        city: 'Munich',
        district: 'Schwabing',
        postalCode: '80797',
        country: 'Germany',
        isDefault: true,
        phone: '+4917633334444'
      }
    ]
  },
  {
    name: 'Omar Nasser',
    email: 'omar@example.com',
    password: 'Customer@2024!',
    phone: '+4917655556666',
    role: 'customer',
    isEmailVerified: true,
    isActive: true,
    language: 'en',
    addresses: [
      {
        label: 'Home',
        street: 'Sandweg 30',
        city: 'Frankfurt',
        district: 'Bornheim',
        postalCode: '60316',
        country: 'Germany',
        isDefault: true,
        phone: '+4917655556666'
      }
    ]
  },
  {
    name: 'Layla Ibrahim',
    email: 'layla@example.com',
    password: 'Customer@2024!',
    phone: '+4917677778888',
    role: 'customer',
    isEmailVerified: true,
    isActive: true,
    language: 'ar',
    addresses: [
      {
        label: 'Home',
        street: 'Karl-Marx-Strasse 12',
        city: 'Berlin',
        district: 'Neukölln',
        postalCode: '12043',
        country: 'Germany',
        isDefault: true,
        phone: '+4917677778888'
      }
    ]
  },
  {
    name: 'Khalid Mansour',
    email: 'khalid@example.com',
    password: 'Customer@2024!',
    phone: '+4917699990000',
    role: 'customer',
    isEmailVerified: true,
    isActive: true,
    language: 'ar',
    addresses: [
      {
        label: 'Home',
        street: 'Brunnenstrasse 45',
        city: 'Stuttgart',
        district: 'Mitte',
        postalCode: '70176',
        country: 'Germany',
        isDefault: true,
        phone: '+4917699990000'
      }
    ]
  },
  {
    name: 'Sara Al-Zahra',
    email: 'sara@example.com',
    password: 'Customer@2024!',
    phone: '+4917611223344',
    role: 'customer',
    isEmailVerified: true,
    isActive: true,
    language: 'en',
    addresses: [
      {
        label: 'Home',
        street: 'Ostwall 5',
        city: 'Dortmund',
        district: 'City',
        postalCode: '44135',
        country: 'Germany',
        isDefault: true,
        phone: '+4917611223344'
      }
    ]
  },
  {
    name: 'Mohammed Al-Rashid',
    email: 'mohammed@example.com',
    password: 'Customer@2024!',
    phone: '+4917655443322',
    role: 'customer',
    isEmailVerified: true,
    isActive: true,
    language: 'ar',
    addresses: [
      {
        label: 'Home',
        street: 'Neustrasse 18',
        city: 'Düsseldorf',
        district: 'Altstadt',
        postalCode: '40213',
        country: 'Germany',
        isDefault: true,
        phone: '+4917655443322'
      }
    ]
  },
  {
    name: 'Nour Haddad',
    email: 'nour@example.com',
    password: 'Customer@2024!',
    phone: '+4917699887766',
    role: 'customer',
    isEmailVerified: true,
    isActive: true,
    language: 'en',
    addresses: [
      {
        label: 'Home',
        street: 'Bahnhofstrasse 7',
        city: 'Leipzig',
        district: 'Zentrum',
        postalCode: '04109',
        country: 'Germany',
        isDefault: true,
        phone: '+4917699887766'
      }
    ]
  },
  {
    name: 'Tariq Saleh',
    email: 'tariq@example.com',
    password: 'Customer@2024!',
    phone: '+4917644332211',
    role: 'customer',
    isEmailVerified: false,
    isActive: true,
    language: 'ar',
    addresses: [
      {
        label: 'Home',
        street: 'Stadtgraben 3',
        city: 'Nuremberg',
        district: 'Altstadt',
        postalCode: '90402',
        country: 'Germany',
        isDefault: true,
        phone: '+4917644332211'
      }
    ]
  },
  {
    name: 'Rima Barakat',
    email: 'rima@example.com',
    password: 'Customer@2024!',
    phone: '+4917622113399',
    role: 'customer',
    isEmailVerified: true,
    isActive: true,
    language: 'en',
    addresses: [
      {
        label: 'Home',
        street: 'Friedrichstrasse 88',
        city: 'Dresden',
        district: 'Altstadt',
        postalCode: '01067',
        country: 'Germany',
        isDefault: true,
        phone: '+4917622113399'
      }
    ]
  },
  {
    name: 'Youssef Al-Khatib',
    email: 'youssef@example.com',
    password: 'Customer@2024!',
    phone: '+4917688776655',
    role: 'customer',
    isEmailVerified: true,
    isActive: false, // inactive user for testing
    language: 'ar',
    addresses: [
      {
        label: 'Home',
        street: 'Hauptplatz 2',
        city: 'Hannover',
        district: 'Mitte',
        postalCode: '30159',
        country: 'Germany',
        isDefault: true,
        phone: '+4917688776655'
      }
    ]
  }
];

// =============================================================================
// CATEGORIES (8 main + 17 subcategories = 25 total)
// =============================================================================
const mainCategoriesData = [
  {
    name: { en: 'Engine Parts', ar: 'قطع المحرك' },
    slug: 'engine-parts',
    description: { en: 'All engine components, belts, gaskets, and internal parts', ar: 'جميع مكونات المحرك والأسيار والحشوات والقطع الداخلية' },
    order: 1
  },
  {
    name: { en: 'Brake System', ar: 'نظام الفرامل' },
    slug: 'brake-system',
    description: { en: 'Brake pads, discs, calipers, and hydraulic components', ar: 'فحمات الفرامل والأقراص والكماشات والمكونات الهيدروليكية' },
    order: 2
  },
  {
    name: { en: 'Suspension & Steering', ar: 'التعليق والتوجيه' },
    slug: 'suspension',
    description: { en: 'Shock absorbers, control arms, tie rods, and steering parts', ar: 'مساعدات الصدمات وأذرع التعليق وقضبان التوجيه وقطع التوجيه' },
    order: 3
  },
  {
    name: { en: 'Electrical System', ar: 'النظام الكهربائي' },
    slug: 'electrical',
    description: { en: 'Batteries, alternators, sensors, lights, and wiring', ar: 'البطاريات والمولدات والحساسات والإضاءة والأسلاك' },
    order: 4
  },
  {
    name: { en: 'Body & Exterior', ar: 'الهيكل والخارج' },
    slug: 'body-parts',
    description: { en: 'Bumpers, fenders, mirrors, doors, and exterior trim', ar: 'الصدامات والرفارف والمرايا والأبواب والإطارات الخارجية' },
    order: 5
  },
  {
    name: { en: 'Filters', ar: 'الفلاتر' },
    slug: 'filters',
    description: { en: 'Oil, air, fuel, and cabin air filters', ar: 'فلاتر الزيت والهواء والوقود وهواء المقصورة' },
    order: 6
  },
  {
    name: { en: 'Transmission', ar: 'ناقل الحركة' },
    slug: 'transmission',
    description: { en: 'Gearbox, clutch, CVT belts, and drivetrain components', ar: 'علبة التروس والكلتش وأسيار CVT ومكونات نقل الحركة' },
    order: 7
  },
  {
    name: { en: 'Cooling System', ar: 'نظام التبريد' },
    slug: 'cooling-system',
    description: { en: 'Radiators, water pumps, thermostats, and coolant hoses', ar: 'الرديترات وطرمبات الماء والثيرموستات وخراطيم سائل التبريد' },
    order: 8
  }
];

// Subcategories (parent will be set dynamically after creating main categories)
const subCategoriesData = [
  // Engine Parts subcategories
  { name: { en: 'Timing Components', ar: 'مكونات التوقيت' }, slug: 'timing-components', parentSlug: 'engine-parts', description: { en: 'Timing belts, chains, tensioners and pulleys', ar: 'أسيار التوقيت والسلاسل والشدادات والبكرات' }, order: 1 },
  { name: { en: 'Gaskets & Seals', ar: 'الحشوات والمانعات' }, slug: 'gaskets-seals', parentSlug: 'engine-parts', description: { en: 'Head gaskets, valve cover gaskets, and oil seals', ar: 'حشوات الرأس وحشوات غطاء الصمامات ومانعات الزيت' }, order: 2 },
  // Brake subcategories
  { name: { en: 'Brake Pads & Shoes', ar: 'فحمات وأحذية الفرامل' }, slug: 'brake-pads', parentSlug: 'brake-system', description: { en: 'Front and rear brake pads and drum brake shoes', ar: 'فحمات الفرامل الأمامية والخلفية وأحذية فرامل الطبلة' }, order: 1 },
  { name: { en: 'Brake Discs & Drums', ar: 'أقراص وطبول الفرامل' }, slug: 'brake-discs', parentSlug: 'brake-system', description: { en: 'Vented and solid brake discs, brake drums', ar: 'الأقراص المهواة والصلبة وطبول الفرامل' }, order: 2 },
  // Suspension subcategories
  { name: { en: 'Shock Absorbers', ar: 'مساعدات الصدمات' }, slug: 'shock-absorbers', parentSlug: 'suspension', description: { en: 'Gas and oil filled shock absorbers', ar: 'مساعدات صدمات بالغاز والزيت' }, order: 1 },
  { name: { en: 'Steering Parts', ar: 'قطع التوجيه' }, slug: 'steering-parts', parentSlug: 'suspension', description: { en: 'Tie rods, rack and pinion, power steering parts', ar: 'قضبان التوجيه والرف والدبوس وقطع الدريكسيون' }, order: 2 },
  // Electrical subcategories
  { name: { en: 'Lighting', ar: 'الإضاءة' }, slug: 'lighting', parentSlug: 'electrical', description: { en: 'Headlights, tail lights, fog lights, LED bulbs', ar: 'الأضواء الأمامية والخلفية وضباب وبصيلات LED' }, order: 1 },
  { name: { en: 'Sensors & Electronics', ar: 'الحساسات والإلكترونيات' }, slug: 'sensors', parentSlug: 'electrical', description: { en: 'O2 sensors, ABS sensors, ECU modules', ar: 'حساسات الأكسجين وحساسات ABS وموديولات الكمبيوتر' }, order: 2 },
  // Body subcategories
  { name: { en: 'Bumpers & Grilles', ar: 'الصدامات والشبكات' }, slug: 'bumpers-grilles', parentSlug: 'body-parts', description: { en: 'Front/rear bumpers and radiator grilles', ar: 'الصدامات الأمامية والخلفية وشبكات الرديتر' }, order: 1 },
  { name: { en: 'Mirrors & Windows', ar: 'المرايا والزجاج' }, slug: 'mirrors-windows', parentSlug: 'body-parts', description: { en: 'Door mirrors, window regulators, wipers', ar: 'مرايا الأبواب ورافعات الزجاج والمساحات' }, order: 2 },
  // Filters subcategories
  { name: { en: 'Oil Filters', ar: 'فلاتر الزيت' }, slug: 'oil-filters', parentSlug: 'filters', description: { en: 'Engine oil filters and oil drain plugs', ar: 'فلاتر زيت المحرك وصامولات التصفية' }, order: 1 },
  { name: { en: 'Air & Fuel Filters', ar: 'فلاتر الهواء والوقود' }, slug: 'air-fuel-filters', parentSlug: 'filters', description: { en: 'Engine air filters and fuel filters', ar: 'فلاتر هواء المحرك وفلاتر الوقود' }, order: 2 },
  // Transmission subcategories
  { name: { en: 'Clutch Components', ar: 'مكونات الكلتش' }, slug: 'clutch', parentSlug: 'transmission', description: { en: 'Clutch disc, pressure plate, release bearing', ar: 'قرص الكلتش ولوح الضغط والرسيفر' }, order: 1 },
  { name: { en: 'Gearbox Parts', ar: 'قطع علبة التروس' }, slug: 'gearbox', parentSlug: 'transmission', description: { en: 'Gearbox seals, mounts, and synchronizers', ar: 'مانعات علبة التروس والحوامل والمزامنات' }, order: 2 },
  // Cooling subcategories
  { name: { en: 'Radiators & Hoses', ar: 'الرديترات والخراطيم' }, slug: 'radiators-hoses', parentSlug: 'cooling-system', description: { en: 'Aluminum radiators and cooling hoses', ar: 'الرديترات الألومنيوم وخراطيم التبريد' }, order: 1 },
  { name: { en: 'Thermostats & Water Pumps', ar: 'الثيرموستات وطرمبات الماء' }, slug: 'thermostats-pumps', parentSlug: 'cooling-system', description: { en: 'Engine thermostats and water pump assemblies', ar: 'ثيرموستات المحرك ومجموعات طرمبة الماء' }, order: 2 },
  // Extra subcategory
  { name: { en: 'AC & Climate Control', ar: 'التكييف والمناخ' }, slug: 'ac-climate', parentSlug: 'electrical', description: { en: 'AC compressors, condensers, blower motors', ar: 'ضواغط التكييف والمكثفات وموتورات المروحة' }, order: 3 }
];

// =============================================================================
// PRODUCTS DATA (100 products across all categories)
// =============================================================================
const productsData = [
  // ===== ENGINE PARTS (15 products) =====
  {
    name: { en: 'Spark Plugs Set Iridium (4pcs)', ar: 'طقم بواجي إيريديوم (4 قطع)' },
    description: { en: 'Premium iridium spark plugs for superior ignition performance, better fuel economy, and extended service life up to 100,000 km.', ar: 'بواجي إيريديوم ممتازة لأداء إشعال فائق وكفاءة وقود أفضل وعمر خدمة ممتد حتى 100,000 كم.' },
    partNumber: 'SP-CHR-IRDM-001',
    price: 48,
    currency: 'EUR',
    stock: 95,
    category: 'engine-parts',
    isFeatured: true,
    averageRating: 4.8,
    totalReviews: 142,
    viewCount: 3210,
    purchaseCount: 98,
    installationDifficulty: 'easy',
    weight: 0.3,
    dimensions: { length: 20, width: 10, height: 5 },
    warranty: { months: 12, details: { en: '12 months or 100,000 km warranty', ar: 'ضمان 12 شهراً أو 100,000 كم' } },
    images: [
      { url: 'https://picsum.photos/seed/sp001a/600/600', alt: { en: 'Iridium Spark Plugs Set', ar: 'طقم بواجي إيريديوم' }, isPrimary: true },
      { url: 'https://picsum.photos/seed/sp001b/600/600', alt: { en: 'Spark Plug Close-up', ar: 'تفصيل البواجي' }, isPrimary: false }
    ],
    compatibility: [
      { brand: 'Chery', model: 'Tiggo 5X', yearFrom: 2019, yearTo: 2024, engineType: '1.5L Turbo', transmission: 'CVT' },
      { brand: 'Chery', model: 'Tiggo 7 Pro', yearFrom: 2020, yearTo: 2024, engineType: '1.6L Turbo', transmission: 'CVT' },
      { brand: 'Chery', model: 'Arrizo 6', yearFrom: 2019, yearTo: 2024, engineType: '1.5L Turbo', transmission: 'Both' }
    ],
    specifications: [
      { key: { en: 'Type', ar: 'النوع' }, value: { en: 'Iridium IX', ar: 'إيريديوم IX' } },
      { key: { en: 'Gap', ar: 'الفجوة' }, value: { en: '1.1 mm', ar: '1.1 ملم' } },
      { key: { en: 'Thread', ar: 'الخيط' }, value: { en: 'M12 x 1.25', ar: 'M12 x 1.25' } },
      { key: { en: 'Reach', ar: 'العمق' }, value: { en: '19 mm', ar: '19 ملم' } }
    ],
    searchKeywords: { en: ['spark plug', 'iridium', 'ignition', 'chery', 'tiggo'], ar: ['بواجي', 'إيريديوم', 'إشعال', 'شيري'] }
  },
  {
    name: { en: 'Timing Belt Kit Complete', ar: 'طقم سير التوقيت الكامل' },
    description: { en: 'OEM-quality complete timing belt kit including belt, tensioner, idler pulley, and water pump. Essential maintenance kit for Chinese cars.', ar: 'طقم سير توقيت كامل بجودة أصلية يشمل السير والشداد والبكرة الثابتة وطرمبة الماء.' },
    partNumber: 'TB-GEE-KIT-002',
    price: 185,
    currency: 'EUR',
    stock: 38,
    category: 'engine-parts',
    isFeatured: true,
    averageRating: 4.9,
    totalReviews: 87,
    viewCount: 2890,
    purchaseCount: 65,
    installationDifficulty: 'hard',
    weight: 1.8,
    dimensions: { length: 35, width: 20, height: 12 },
    warranty: { months: 24, details: { en: '24 months unlimited km warranty', ar: 'ضمان 24 شهراً بدون حد كيلومتر' } },
    images: [
      { url: 'https://picsum.photos/seed/tb002a/600/600', alt: { en: 'Timing Belt Kit', ar: 'طقم سير التوقيت' }, isPrimary: true },
      { url: 'https://picsum.photos/seed/tb002b/600/600', alt: { en: 'Kit Contents', ar: 'محتويات الطقم' }, isPrimary: false }
    ],
    compatibility: [
      { brand: 'Geely', model: 'Coolray', yearFrom: 2019, yearTo: 2024, engineType: '1.5L TD', transmission: 'Both' },
      { brand: 'Geely', model: 'Atlas Pro', yearFrom: 2021, yearTo: 2024, engineType: '2.0L TD', transmission: 'Both' }
    ],
    specifications: [
      { key: { en: 'Belt Width', ar: 'عرض السير' }, value: { en: '19 mm', ar: '19 ملم' } },
      { key: { en: 'Belt Teeth', ar: 'أسنان السير' }, value: { en: '126T', ar: '126 سن' } },
      { key: { en: 'Material', ar: 'المادة' }, value: { en: 'HNBR Rubber', ar: 'مطاط HNBR' } },
      { key: { en: 'Replacement Interval', ar: 'دورة الاستبدال' }, value: { en: '60,000 km', ar: '60,000 كم' } }
    ],
    searchKeywords: { en: ['timing belt', 'timing kit', 'geely', 'coolray', 'engine belt'], ar: ['سير التوقيت', 'طقم التوقيت', 'جيلي', 'كولراي'] }
  },
  {
    name: { en: 'Engine Oil Filter Premium', ar: 'فلتر زيت محرك ممتاز' },
    description: { en: 'High-performance full-flow oil filter with anti-drain-back valve and bypass valve. Filters particles as small as 20 microns.', ar: 'فلتر زيت كامل التدفق عالي الأداء مع صمام منع التصريف وصمام تجاوز. يرشح الجسيمات بحجم 20 ميكرون.' },
    partNumber: 'OF-CHR-PREM-003',
    price: 18,
    currency: 'EUR',
    stock: 220,
    category: 'filters',
    isFeatured: false,
    averageRating: 4.6,
    totalReviews: 203,
    viewCount: 5120,
    purchaseCount: 310,
    installationDifficulty: 'easy',
    weight: 0.25,
    dimensions: { length: 10, width: 10, height: 12 },
    warranty: { months: 6, details: { en: '6 months warranty', ar: 'ضمان 6 أشهر' } },
    images: [
      { url: 'https://picsum.photos/seed/of003a/600/600', alt: { en: 'Premium Oil Filter', ar: 'فلتر زيت ممتاز' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Chery', model: 'Tiggo 5X', yearFrom: 2018, yearTo: 2024, engineType: '1.5L Turbo', transmission: 'Both' },
      { brand: 'Chery', model: 'Tiggo 7 Pro', yearFrom: 2020, yearTo: 2024, engineType: '1.6L Turbo', transmission: 'Both' },
      { brand: 'Chery', model: 'Arrizo 6', yearFrom: 2019, yearTo: 2024, engineType: '1.5L Turbo', transmission: 'Both' },
      { brand: 'MG', model: 'ZS', yearFrom: 2018, yearTo: 2024, engineType: '1.5L', transmission: 'Both' }
    ],
    specifications: [
      { key: { en: 'Thread', ar: 'الخيط' }, value: { en: 'M20 x 1.5', ar: 'M20 x 1.5' } },
      { key: { en: 'Height', ar: 'الارتفاع' }, value: { en: '85 mm', ar: '85 ملم' } },
      { key: { en: 'Bypass Pressure', ar: 'ضغط التجاوز' }, value: { en: '1.5 bar', ar: '1.5 بار' } }
    ],
    searchKeywords: { en: ['oil filter', 'engine filter', 'chery', 'MG', 'oil change'], ar: ['فلتر زيت', 'فلتر محرك', 'شيري', 'تغيير زيت'] }
  },
  {
    name: { en: 'Head Gasket Set', ar: 'طقم حشوة رأس المحرك' },
    description: { en: 'Multi-layer steel (MLS) head gasket set for maximum sealing performance. Includes all necessary gaskets for cylinder head replacement.', ar: 'طقم حشوة رأس محرك متعدد الطبقات (MLS) لأداء إحكام أقصى. يشمل جميع الحشوات اللازمة لتغيير رأس المحرك.' },
    partNumber: 'HG-HAV-SET-004',
    price: 95,
    currency: 'EUR',
    stock: 28,
    category: 'engine-parts',
    isFeatured: false,
    averageRating: 4.7,
    totalReviews: 54,
    viewCount: 1890,
    purchaseCount: 41,
    installationDifficulty: 'hard',
    weight: 0.8,
    dimensions: { length: 40, width: 30, height: 5 },
    warranty: { months: 12, details: { en: '12 months warranty', ar: 'ضمان 12 شهراً' } },
    images: [
      { url: 'https://picsum.photos/seed/hg004a/600/600', alt: { en: 'Head Gasket Set', ar: 'طقم حشوة رأس المحرك' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Haval', model: 'H6', yearFrom: 2017, yearTo: 2024, engineType: '1.5T / 2.0T', transmission: 'Both' },
      { brand: 'Haval', model: 'Jolion', yearFrom: 2021, yearTo: 2024, engineType: '1.5T', transmission: 'Both' }
    ],
    specifications: [
      { key: { en: 'Type', ar: 'النوع' }, value: { en: 'Multi-Layer Steel', ar: 'فولاذ متعدد الطبقات' } },
      { key: { en: 'Bore Size', ar: 'قطر الأسطوانة' }, value: { en: '82.0 mm', ar: '82.0 ملم' } }
    ],
    searchKeywords: { en: ['head gasket', 'cylinder head', 'haval', 'engine seal'], ar: ['حشوة رأس', 'رأس المحرك', 'هافال', 'إحكام محرك'] }
  },
  {
    name: { en: 'Engine Mount Set (Front & Rear)', ar: 'طقم كتم محرك (أمامي وخلفي)' },
    description: { en: 'Heavy-duty hydraulic engine mounts to reduce vibration and noise. Set includes front and rear mounts.', ar: 'كتم محرك هيدروليكي قوي لتقليل الاهتزاز والضوضاء. الطقم يشمل الكتم الأمامي والخلفي.' },
    partNumber: 'EM-GEE-SET-005',
    price: 125,
    currency: 'EUR',
    stock: 42,
    category: 'engine-parts',
    isFeatured: false,
    averageRating: 4.5,
    totalReviews: 68,
    viewCount: 2100,
    purchaseCount: 55,
    installationDifficulty: 'medium',
    weight: 2.5,
    dimensions: { length: 25, width: 20, height: 15 },
    warranty: { months: 12, details: { en: '12 months warranty', ar: 'ضمان 12 شهراً' } },
    images: [
      { url: 'https://picsum.photos/seed/em005a/600/600', alt: { en: 'Engine Mount Set', ar: 'طقم كتم محرك' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Geely', model: 'Emgrand', yearFrom: 2016, yearTo: 2024, engineType: '1.5L', transmission: 'Both' },
      { brand: 'Geely', model: 'Coolray', yearFrom: 2019, yearTo: 2024, engineType: '1.5L TD', transmission: 'Both' }
    ],
    specifications: [
      { key: { en: 'Type', ar: 'النوع' }, value: { en: 'Hydraulic', ar: 'هيدروليكي' } },
      { key: { en: 'Material', ar: 'المادة' }, value: { en: 'Steel/Rubber', ar: 'فولاذ/مطاط' } }
    ],
    searchKeywords: { en: ['engine mount', 'motor mount', 'geely', 'vibration'], ar: ['كتم محرك', 'جيلي', 'اهتزاز'] }
  },
  {
    name: { en: 'Alternator Belt (Serpentine)', ar: 'سير المولد (الثعباني)' },
    description: { en: 'EPDM serpentine belt for alternator, power steering, and AC compressor. Long-lasting with ribbed design for maximum grip.', ar: 'سير ثعباني من EPDM للمولد والدريكسيون والكمبريسور. طويل الأمد بتصميم مضلع لأقصى قدر من التشبث.' },
    partNumber: 'AB-MG-SERP-006',
    price: 32,
    currency: 'EUR',
    stock: 145,
    category: 'engine-parts',
    isFeatured: false,
    averageRating: 4.4,
    totalReviews: 112,
    viewCount: 3400,
    purchaseCount: 188,
    installationDifficulty: 'easy',
    weight: 0.35,
    dimensions: { length: 100, width: 3, height: 2 },
    warranty: { months: 12, details: { en: '12 months warranty', ar: 'ضمان 12 شهراً' } },
    images: [
      { url: 'https://picsum.photos/seed/ab006a/600/600', alt: { en: 'Serpentine Belt', ar: 'السير الثعباني' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'MG', model: 'HS', yearFrom: 2018, yearTo: 2024, engineType: '1.5T', transmission: 'Both' },
      { brand: 'MG', model: 'ZS', yearFrom: 2017, yearTo: 2024, engineType: '1.5L', transmission: 'Both' },
      { brand: 'MG', model: 'RX5', yearFrom: 2016, yearTo: 2022, engineType: '2.0T', transmission: 'Both' }
    ],
    specifications: [
      { key: { en: 'Length', ar: 'الطول' }, value: { en: '1850 mm', ar: '1850 ملم' } },
      { key: { en: 'Ribs', ar: 'الأضلاع' }, value: { en: '6PK', ar: '6PK' } },
      { key: { en: 'Material', ar: 'المادة' }, value: { en: 'EPDM', ar: 'EPDM' } }
    ],
    searchKeywords: { en: ['serpentine belt', 'alternator belt', 'MG', 'drive belt'], ar: ['سير المولد', 'السير الثعباني', 'MG'] }
  },
  {
    name: { en: 'Valve Cover Gasket', ar: 'حشوة غطاء الصمامات' },
    description: { en: 'High-quality silicone valve cover gasket to prevent oil leaks. Replaces OEM part number with improved material.', ar: 'حشوة غطاء صمامات سيليكون عالية الجودة لمنع تسرب الزيت. تستبدل قطعة أصلية بمادة محسنة.' },
    partNumber: 'VCG-CHG-007',
    price: 22,
    currency: 'EUR',
    stock: 88,
    category: 'engine-parts',
    isFeatured: false,
    averageRating: 4.3,
    totalReviews: 76,
    viewCount: 1980,
    purchaseCount: 91,
    installationDifficulty: 'easy',
    weight: 0.15,
    dimensions: { length: 35, width: 20, height: 2 },
    warranty: { months: 6, details: { en: '6 months warranty', ar: 'ضمان 6 أشهر' } },
    images: [
      { url: 'https://picsum.photos/seed/vcg007a/600/600', alt: { en: 'Valve Cover Gasket', ar: 'حشوة غطاء الصمامات' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Changan', model: 'CS35 Plus', yearFrom: 2018, yearTo: 2024, engineType: '1.4T', transmission: 'Both' },
      { brand: 'Changan', model: 'CS55 Plus', yearFrom: 2019, yearTo: 2024, engineType: '1.5T', transmission: 'Both' }
    ],
    specifications: [
      { key: { en: 'Material', ar: 'المادة' }, value: { en: 'Silicone Rubber', ar: 'مطاط سيليكون' } },
      { key: { en: 'Temperature Range', ar: 'نطاق الحرارة' }, value: { en: '-40°C to +200°C', ar: '-40°C إلى +200°C' } }
    ],
    searchKeywords: { en: ['valve cover gasket', 'changan', 'oil leak', 'engine gasket'], ar: ['حشوة غطاء الصمامات', 'شانجان', 'تسرب زيت'] }
  },
  {
    name: { en: 'Engine Air Filter High-Flow', ar: 'فلتر هواء محرك عالي التدفق' },
    description: { en: 'High-flow cotton gauze air filter for improved engine breathing and horsepower. Drop-in replacement for factory filter.', ar: 'فلتر هواء من الشاش القطني عالي التدفق لتحسين تنفس المحرك وزيادة الحصانة. يستبدل فلتر المصنع مباشرة.' },
    partNumber: 'AF-BYD-HF-008',
    price: 28,
    currency: 'EUR',
    stock: 165,
    category: 'filters',
    isFeatured: true,
    averageRating: 4.5,
    totalReviews: 134,
    viewCount: 4200,
    purchaseCount: 245,
    installationDifficulty: 'easy',
    weight: 0.4,
    dimensions: { length: 30, width: 25, height: 8 },
    warranty: { months: 6, details: { en: '6 months warranty', ar: 'ضمان 6 أشهر' } },
    images: [
      { url: 'https://picsum.photos/seed/af008a/600/600', alt: { en: 'High-Flow Air Filter', ar: 'فلتر هواء عالي التدفق' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'BYD', model: 'Atto 3', yearFrom: 2022, yearTo: 2024, engineType: 'Electric', transmission: 'Automatic' },
      { brand: 'BYD', model: 'Han', yearFrom: 2020, yearTo: 2024, engineType: 'Electric/Hybrid', transmission: 'Automatic' },
      { brand: 'BYD', model: 'Song Plus', yearFrom: 2021, yearTo: 2024, engineType: 'Hybrid', transmission: 'CVT' }
    ],
    specifications: [
      { key: { en: 'Type', ar: 'النوع' }, value: { en: 'Cotton Gauze', ar: 'شاش قطني' } },
      { key: { en: 'Filtration', ar: 'الترشيح' }, value: { en: '99.5%', ar: '99.5%' } }
    ],
    searchKeywords: { en: ['air filter', 'BYD', 'high flow', 'performance filter'], ar: ['فلتر هواء', 'BYD', 'تدفق عالي', 'فلتر أداء'] }
  },
  {
    name: { en: 'PCV Valve (Crankcase Vent)', ar: 'صمام PCV (تهوية الكارتر)' },
    description: { en: 'OEM replacement PCV valve for crankcase ventilation. Prevents oil consumption and maintains engine vacuum.', ar: 'صمام PCV بديل أصلي لتهوية الكارتر. يمنع استهلاك الزيت ويحافظ على تفريغ المحرك.' },
    partNumber: 'PCV-CHR-009',
    price: 14,
    currency: 'EUR',
    stock: 112,
    category: 'engine-parts',
    isFeatured: false,
    averageRating: 4.2,
    totalReviews: 88,
    viewCount: 2340,
    purchaseCount: 155,
    installationDifficulty: 'easy',
    weight: 0.1,
    dimensions: { length: 8, width: 4, height: 4 },
    warranty: { months: 6, details: { en: '6 months warranty', ar: 'ضمان 6 أشهر' } },
    images: [
      { url: 'https://picsum.photos/seed/pcv009a/600/600', alt: { en: 'PCV Valve', ar: 'صمام PCV' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Chery', model: 'Tiggo 5X', yearFrom: 2018, yearTo: 2024, engineType: '1.5L Turbo', transmission: 'Both' },
      { brand: 'Chery', model: 'Arrizo 6', yearFrom: 2019, yearTo: 2024, engineType: '1.5L Turbo', transmission: 'Both' }
    ],
    specifications: [
      { key: { en: 'Inlet Diameter', ar: 'قطر المدخل' }, value: { en: '19 mm', ar: '19 ملم' } },
      { key: { en: 'Outlet Diameter', ar: 'قطر المخرج' }, value: { en: '16 mm', ar: '16 ملم' } }
    ],
    searchKeywords: { en: ['PCV valve', 'crankcase', 'chery', 'ventilation valve'], ar: ['صمام PCV', 'كارتر', 'شيري'] }
  },
  {
    name: { en: 'Variable Valve Timing (VVT) Solenoid', ar: 'ملف توقيت الصمامات المتغير (VVT)' },
    description: { en: 'OEM VVT solenoid for variable valve timing system. Restores optimal engine performance and fuel efficiency when the check engine light comes on.', ar: 'ملف VVT أصلي لنظام توقيت الصمامات المتغير. يستعيد أداء المحرك الأمثل وكفاءة الوقود عند إضاءة فانوس المحرك.' },
    partNumber: 'VVT-GEE-010',
    price: 68,
    currency: 'EUR',
    stock: 45,
    category: 'engine-parts',
    isFeatured: false,
    averageRating: 4.6,
    totalReviews: 42,
    viewCount: 1560,
    purchaseCount: 38,
    installationDifficulty: 'medium',
    weight: 0.2,
    dimensions: { length: 12, width: 6, height: 6 },
    warranty: { months: 12, details: { en: '12 months warranty', ar: 'ضمان 12 شهراً' } },
    images: [
      { url: 'https://picsum.photos/seed/vvt010a/600/600', alt: { en: 'VVT Solenoid', ar: 'ملف VVT' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Geely', model: 'Coolray', yearFrom: 2019, yearTo: 2024, engineType: '1.5L TD', transmission: 'Both' },
      { brand: 'Geely', model: 'Atlas Pro', yearFrom: 2021, yearTo: 2024, engineType: '2.0T', transmission: 'Both' }
    ],
    specifications: [
      { key: { en: 'Voltage', ar: 'الجهد' }, value: { en: '12V DC', ar: '12 فولت DC' } },
      { key: { en: 'Current', ar: 'التيار' }, value: { en: '1.2A', ar: '1.2 أمبير' } }
    ],
    searchKeywords: { en: ['VVT solenoid', 'variable valve timing', 'geely', 'engine performance'], ar: ['ملف VVT', 'توقيت الصمامات', 'جيلي'] }
  },

  // ===== BRAKE SYSTEM (12 products) =====
  {
    name: { en: 'Brake Pads Set Front - Ceramic', ar: 'طقم فحمات فرامل أمامية - سيراميك' },
    description: { en: 'Premium ceramic brake pads with low dust formula. Superior stopping power with minimal brake fade under heavy braking. Includes wear indicator clips.', ar: 'فحمات فرامل سيراميك ممتازة بتركيبة غبار منخفض. قوة توقف فائقة مع حد أدنى من تلاشي الفرامل. تشمل مشابك مؤشر التآكل.' },
    partNumber: 'BP-GEE-CERM-011',
    price: 65,
    currency: 'EUR',
    stock: 85,
    category: 'brake-system',
    isFeatured: true,
    averageRating: 4.8,
    totalReviews: 198,
    viewCount: 5600,
    purchaseCount: 282,
    installationDifficulty: 'medium',
    weight: 1.2,
    dimensions: { length: 25, width: 15, height: 8 },
    warranty: { months: 18, details: { en: '18 months or 30,000 km warranty', ar: 'ضمان 18 شهراً أو 30,000 كم' } },
    images: [
      { url: 'https://picsum.photos/seed/bp011a/600/600', alt: { en: 'Ceramic Brake Pads Front', ar: 'فحمات فرامل أمامية سيراميك' }, isPrimary: true },
      { url: 'https://picsum.photos/seed/bp011b/600/600', alt: { en: 'Brake Pad Side View', ar: 'منظر جانبي لفحمة الفرامل' }, isPrimary: false }
    ],
    compatibility: [
      { brand: 'Geely', model: 'Coolray', yearFrom: 2019, yearTo: 2024, engineType: 'All', transmission: 'Both' },
      { brand: 'Geely', model: 'Atlas Pro', yearFrom: 2021, yearTo: 2024, engineType: 'All', transmission: 'Both' },
      { brand: 'Geely', model: 'Emgrand', yearFrom: 2016, yearTo: 2024, engineType: 'All', transmission: 'Both' }
    ],
    specifications: [
      { key: { en: 'Material', ar: 'المادة' }, value: { en: 'Ceramic Compound', ar: 'مركب السيراميك' } },
      { key: { en: 'Position', ar: 'الموقع' }, value: { en: 'Front Axle', ar: 'المحور الأمامي' } },
      { key: { en: 'Thickness', ar: 'السُمك' }, value: { en: '16 mm', ar: '16 ملم' } },
      { key: { en: 'Dust Level', ar: 'مستوى الغبار' }, value: { en: 'Ultra-Low', ar: 'منخفض جداً' } }
    ],
    searchKeywords: { en: ['brake pads', 'ceramic pads', 'front brakes', 'geely', 'stopping power'], ar: ['فحمات فرامل', 'فحمات سيراميك', 'فرامل أمامية', 'جيلي'] }
  },
  {
    name: { en: 'Brake Pads Set Rear - Semi-Metallic', ar: 'طقم فحمات فرامل خلفية - شبه معدنية' },
    description: { en: 'Semi-metallic rear brake pads for outstanding heat resistance and consistent performance. Ideal for urban and highway driving.', ar: 'فحمات فرامل خلفية شبه معدنية لمقاومة حرارة استثنائية وأداء ثابت. مثالية للقيادة في المدن والطرق السريعة.' },
    partNumber: 'BP-MG-REAR-012',
    price: 48,
    currency: 'EUR',
    stock: 72,
    category: 'brake-system',
    isFeatured: false,
    averageRating: 4.5,
    totalReviews: 134,
    viewCount: 3200,
    purchaseCount: 178,
    installationDifficulty: 'medium',
    weight: 0.9,
    dimensions: { length: 20, width: 12, height: 6 },
    warranty: { months: 12, details: { en: '12 months or 25,000 km warranty', ar: 'ضمان 12 شهراً أو 25,000 كم' } },
    images: [
      { url: 'https://picsum.photos/seed/bp012a/600/600', alt: { en: 'Rear Brake Pads Semi-Metallic', ar: 'فحمات فرامل خلفية شبه معدنية' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'MG', model: 'HS', yearFrom: 2018, yearTo: 2024, engineType: 'All', transmission: 'Both' },
      { brand: 'MG', model: 'ZS', yearFrom: 2017, yearTo: 2024, engineType: 'All', transmission: 'Both' },
      { brand: 'MG', model: 'RX5', yearFrom: 2016, yearTo: 2022, engineType: 'All', transmission: 'Both' }
    ],
    specifications: [
      { key: { en: 'Material', ar: 'المادة' }, value: { en: 'Semi-Metallic', ar: 'شبه معدني' } },
      { key: { en: 'Position', ar: 'الموقع' }, value: { en: 'Rear Axle', ar: 'المحور الخلفي' } },
      { key: { en: 'Thickness', ar: 'السُمك' }, value: { en: '12 mm', ar: '12 ملم' } }
    ],
    searchKeywords: { en: ['rear brake pads', 'semi-metallic', 'MG HS', 'MG ZS', 'brakes'], ar: ['فحمات خلفية', 'فرامل خلفية', 'MG HS', 'MG ZS'] }
  },
  {
    name: { en: 'Vented Brake Disc Front Pair', ar: 'زوج أقراص فرامل مهواة أمامية' },
    description: { en: 'Precision-balanced vented brake discs for outstanding heat dissipation. Cross-drilled and slotted surface for wet weather performance. Sold as pair.', ar: 'أقراص فرامل مهواة متوازنة بدقة لتبديد حرارة استثنائي. سطح مثقب وذو فتحات لأداء في الطقس الرطب. تُباع كزوج.' },
    partNumber: 'BD-HAV-VENT-013',
    price: 145,
    currency: 'EUR',
    stock: 38,
    category: 'brake-system',
    isFeatured: true,
    averageRating: 4.7,
    totalReviews: 88,
    viewCount: 4100,
    purchaseCount: 112,
    installationDifficulty: 'medium',
    weight: 7.5,
    dimensions: { length: 32, width: 32, height: 3 },
    warranty: { months: 18, details: { en: '18 months warranty', ar: 'ضمان 18 شهراً' } },
    images: [
      { url: 'https://picsum.photos/seed/bd013a/600/600', alt: { en: 'Vented Brake Disc Front', ar: 'قرص فرامل مهوى أمامي' }, isPrimary: true },
      { url: 'https://picsum.photos/seed/bd013b/600/600', alt: { en: 'Brake Disc Side View', ar: 'منظر جانبي لقرص الفرامل' }, isPrimary: false }
    ],
    compatibility: [
      { brand: 'Haval', model: 'H6', yearFrom: 2017, yearTo: 2024, engineType: 'All', transmission: 'Both' },
      { brand: 'Haval', model: 'Jolion', yearFrom: 2021, yearTo: 2024, engineType: 'All', transmission: 'Both' },
      { brand: 'Haval', model: 'H9', yearFrom: 2015, yearTo: 2024, engineType: '2.0T', transmission: 'Automatic' }
    ],
    specifications: [
      { key: { en: 'Diameter', ar: 'القطر' }, value: { en: '330 mm', ar: '330 ملم' } },
      { key: { en: 'Thickness', ar: 'السُمك' }, value: { en: '28 mm', ar: '28 ملم' } },
      { key: { en: 'Type', ar: 'النوع' }, value: { en: 'Vented Drilled/Slotted', ar: 'مهوى مثقب ومشقق' } },
      { key: { en: 'Quantity', ar: 'الكمية' }, value: { en: '2 (Pair)', ar: '2 (زوج)' } }
    ],
    searchKeywords: { en: ['brake disc', 'brake rotor', 'haval', 'vented disc', 'drilled rotor'], ar: ['قرص فرامل', 'هافال', 'قرص مهوى'] }
  },
  {
    name: { en: 'Brake Caliper Front Left', ar: 'كماشة فرامل أمامية يسارية' },
    description: { en: 'Remanufactured front left brake caliper with new seals and pistons. Direct OEM replacement with lifetime warranty on core exchange.', ar: 'كماشة فرامل أمامية يسارية مُعاد تصنيعها مع مانعات وأسطوانات جديدة. بديل مباشر أصلي بضمان مدى الحياة عند تبادل الوحدة الأساسية.' },
    partNumber: 'BC-CHR-FL-014',
    price: 88,
    currency: 'EUR',
    stock: 24,
    category: 'brake-system',
    isFeatured: false,
    averageRating: 4.4,
    totalReviews: 38,
    viewCount: 1760,
    purchaseCount: 30,
    installationDifficulty: 'hard',
    weight: 3.2,
    dimensions: { length: 18, width: 12, height: 10 },
    warranty: { months: 24, details: { en: '24 months warranty', ar: 'ضمان 24 شهراً' } },
    images: [
      { url: 'https://picsum.photos/seed/bc014a/600/600', alt: { en: 'Brake Caliper Front Left', ar: 'كماشة فرامل أمامية يسارية' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Chery', model: 'Tiggo 7 Pro', yearFrom: 2020, yearTo: 2024, engineType: 'All', transmission: 'Both' },
      { brand: 'Chery', model: 'Tiggo 8 Pro', yearFrom: 2020, yearTo: 2024, engineType: 'All', transmission: 'Both' }
    ],
    specifications: [
      { key: { en: 'Position', ar: 'الموقع' }, value: { en: 'Front Left', ar: 'أمامي أيسر' } },
      { key: { en: 'Pistons', ar: 'الأسطوانات' }, value: { en: '2', ar: '2' } },
      { key: { en: 'Type', ar: 'النوع' }, value: { en: 'Sliding', ar: 'انزلاقي' } }
    ],
    searchKeywords: { en: ['brake caliper', 'front caliper', 'chery tiggo', 'brake repair'], ar: ['كماشة فرامل', 'كماشة أمامية', 'شيري تيغو'] }
  },
  {
    name: { en: 'Brake Master Cylinder', ar: 'أسطوانة الفرامل الرئيسية' },
    description: { en: 'New brake master cylinder for hydraulic brake systems. Includes reservoir cap and all seals. Direct replacement.', ar: 'أسطوانة فرامل رئيسية جديدة لأنظمة الفرامل الهيدروليكية. تشمل غطاء الخزان وجميع المانعات. استبدال مباشر.' },
    partNumber: 'BMC-CHG-015',
    price: 115,
    currency: 'EUR',
    stock: 18,
    category: 'brake-system',
    isFeatured: false,
    averageRating: 4.6,
    totalReviews: 28,
    viewCount: 1240,
    purchaseCount: 22,
    installationDifficulty: 'hard',
    weight: 1.8,
    dimensions: { length: 28, width: 12, height: 15 },
    warranty: { months: 24, details: { en: '24 months warranty', ar: 'ضمان 24 شهراً' } },
    images: [
      { url: 'https://picsum.photos/seed/bmc015a/600/600', alt: { en: 'Brake Master Cylinder', ar: 'أسطوانة الفرامل الرئيسية' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Changan', model: 'CS35 Plus', yearFrom: 2018, yearTo: 2024, engineType: 'All', transmission: 'Both' },
      { brand: 'Changan', model: 'CS55 Plus', yearFrom: 2019, yearTo: 2024, engineType: 'All', transmission: 'Both' },
      { brand: 'Changan', model: 'UNI-T', yearFrom: 2020, yearTo: 2024, engineType: 'All', transmission: 'Both' }
    ],
    specifications: [
      { key: { en: 'Bore Diameter', ar: 'قطر التجويف' }, value: { en: '22.2 mm', ar: '22.2 ملم' } },
      { key: { en: 'Type', ar: 'النوع' }, value: { en: 'Tandem', ar: 'ثنائي' } }
    ],
    searchKeywords: { en: ['master cylinder', 'brake cylinder', 'changan', 'hydraulic brakes'], ar: ['أسطوانة الفرامل', 'فرامل هيدروليكية', 'شانجان'] }
  },

  // ===== SUSPENSION & STEERING (12 products) =====
  {
    name: { en: 'Front Shock Absorber Pair - Gas Charged', ar: 'زوج مساعدات صدمات أمامية - بالغاز' },
    description: { en: 'Twin-tube gas-charged shock absorbers for smooth ride quality. Nitrogen gas charged for consistent performance. Price for one pair (2 pcs).', ar: 'مساعدات صدمات مزدوجة الأنابيب بالغاز لجودة ركوب سلسة. محشوة بغاز النيتروجين لأداء ثابت. السعر لزوج واحد (قطعتان).' },
    partNumber: 'SA-HAV-GAS-016',
    price: 195,
    currency: 'EUR',
    stock: 32,
    category: 'suspension',
    isFeatured: true,
    averageRating: 4.7,
    totalReviews: 95,
    viewCount: 3800,
    purchaseCount: 118,
    installationDifficulty: 'hard',
    weight: 5.8,
    dimensions: { length: 55, width: 10, height: 10 },
    warranty: { months: 24, details: { en: '24 months or 40,000 km warranty', ar: 'ضمان 24 شهراً أو 40,000 كم' } },
    images: [
      { url: 'https://picsum.photos/seed/sa016a/600/600', alt: { en: 'Front Gas Shock Absorber', ar: 'مساعد صدمات أمامي بالغاز' }, isPrimary: true },
      { url: 'https://picsum.photos/seed/sa016b/600/600', alt: { en: 'Shock Absorber Installation', ar: 'تركيب مساعد الصدمات' }, isPrimary: false }
    ],
    compatibility: [
      { brand: 'Haval', model: 'H6', yearFrom: 2017, yearTo: 2024, engineType: 'All', transmission: 'Both' },
      { brand: 'Haval', model: 'Jolion', yearFrom: 2021, yearTo: 2024, engineType: 'All', transmission: 'Both' },
      { brand: 'Haval', model: 'H2', yearFrom: 2014, yearTo: 2022, engineType: 'All', transmission: 'Both' }
    ],
    specifications: [
      { key: { en: 'Type', ar: 'النوع' }, value: { en: 'Twin-tube Gas Charged', ar: 'ثنائي الأنابيب بالغاز' } },
      { key: { en: 'Position', ar: 'الموقع' }, value: { en: 'Front Pair', ar: 'زوج أمامي' } },
      { key: { en: 'Extended Length', ar: 'الطول الكامل' }, value: { en: '490 mm', ar: '490 ملم' } },
      { key: { en: 'Compressed Length', ar: 'الطول المضغوط' }, value: { en: '320 mm', ar: '320 ملم' } }
    ],
    searchKeywords: { en: ['shock absorber', 'front shocks', 'haval', 'suspension', 'strut'], ar: ['مساعد صدمات', 'تعليق أمامي', 'هافال', 'سبرينغ'] }
  },
  {
    name: { en: 'Lower Control Arm Front Left', ar: 'ذراع تعليق سفلي أمامي أيسر' },
    description: { en: 'Forged steel lower control arm with pressed-in ball joint and bushings. Restores alignment geometry and eliminates clunking noise.', ar: 'ذراع تعليق سفلي من الفولاذ المطروح مع مفصل كروي مضغوط وأكمام. يستعيد هندسة الضبط ويلغي الضربات المدوية.' },
    partNumber: 'CA-GEE-FLL-017',
    price: 125,
    currency: 'EUR',
    stock: 28,
    category: 'suspension',
    isFeatured: false,
    averageRating: 4.6,
    totalReviews: 66,
    viewCount: 2450,
    purchaseCount: 72,
    installationDifficulty: 'hard',
    weight: 3.5,
    dimensions: { length: 45, width: 20, height: 10 },
    warranty: { months: 24, details: { en: '24 months warranty', ar: 'ضمان 24 شهراً' } },
    images: [
      { url: 'https://picsum.photos/seed/ca017a/600/600', alt: { en: 'Lower Control Arm Front Left', ar: 'ذراع تعليق سفلي أمامي أيسر' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Geely', model: 'Coolray', yearFrom: 2019, yearTo: 2024, engineType: 'All', transmission: 'Both' },
      { brand: 'Geely', model: 'Atlas Pro', yearFrom: 2021, yearTo: 2024, engineType: 'All', transmission: 'Both' }
    ],
    specifications: [
      { key: { en: 'Position', ar: 'الموقع' }, value: { en: 'Front Left (Driver Side)', ar: 'أمامي أيسر (جانب السائق)' } },
      { key: { en: 'Material', ar: 'المادة' }, value: { en: 'Forged Steel', ar: 'فولاذ مطروح' } },
      { key: { en: 'Ball Joint', ar: 'المفصل الكروي' }, value: { en: 'Included (Pressed-In)', ar: 'مشمول (مضغوط)' } }
    ],
    searchKeywords: { en: ['control arm', 'lower arm', 'geely', 'suspension arm', 'ball joint'], ar: ['ذراع تعليق', 'ذراع سفلي', 'جيلي', 'مفصل كروي'] }
  },
  {
    name: { en: 'Tie Rod End Outer - Left & Right Pair', ar: 'زوج نهايات تعريض خارجية يسار ويمين' },
    description: { en: 'Pair of outer tie rod ends with grease fittings. Eliminates steering play and restores precise directional control. Includes castle nuts and cotter pins.', ar: 'زوج نهايات تعريض خارجية مع تلاحم الشحم. يلغي اللعب في التوجيه ويستعيد التحكم الدقيق في الاتجاه. يشمل صواميل القلعة وأوتاد التأمين.' },
    partNumber: 'TR-MG-PAIR-018',
    price: 58,
    currency: 'EUR',
    stock: 55,
    category: 'suspension',
    isFeatured: false,
    averageRating: 4.5,
    totalReviews: 82,
    viewCount: 2870,
    purchaseCount: 95,
    installationDifficulty: 'medium',
    weight: 1.2,
    dimensions: { length: 30, width: 10, height: 8 },
    warranty: { months: 12, details: { en: '12 months warranty', ar: 'ضمان 12 شهراً' } },
    images: [
      { url: 'https://picsum.photos/seed/tr018a/600/600', alt: { en: 'Outer Tie Rod End Pair', ar: 'زوج نهايات تعريض خارجية' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'MG', model: 'HS', yearFrom: 2018, yearTo: 2024, engineType: 'All', transmission: 'Both' },
      { brand: 'MG', model: 'ZS', yearFrom: 2017, yearTo: 2024, engineType: 'All', transmission: 'Both' }
    ],
    specifications: [
      { key: { en: 'Position', ar: 'الموقع' }, value: { en: 'Outer (Both Sides)', ar: 'خارجي (كلا الجانبين)' } },
      { key: { en: 'Stud Thread', ar: 'خيط المسمار' }, value: { en: 'M14 x 1.5', ar: 'M14 x 1.5' } }
    ],
    searchKeywords: { en: ['tie rod end', 'steering rod', 'MG', 'alignment', 'outer tie rod'], ar: ['نهاية تعريض', 'قضيب التوجيه', 'MG', 'ضبط'] }
  },
  {
    name: { en: 'Stabilizer Bar Link Front Pair', ar: 'زوج رابط بار الاستقرار الأمامي' },
    description: { en: 'Heavy-duty stabilizer bar links with rubber bushings. Eliminates rattling noise from suspension and restores handling balance. Pair (L+R).', ar: 'روابط بار استقرار قوية مع أكمام مطاطية. يلغي ضوضاء الطرطقة من التعليق ويستعيد توازن التحكم. زوج (يسار+يمين).' },
    partNumber: 'SBL-CHR-FPR-019',
    price: 45,
    currency: 'EUR',
    stock: 68,
    category: 'suspension',
    isFeatured: false,
    averageRating: 4.4,
    totalReviews: 98,
    viewCount: 3100,
    purchaseCount: 132,
    installationDifficulty: 'easy',
    weight: 0.8,
    dimensions: { length: 25, width: 5, height: 5 },
    warranty: { months: 12, details: { en: '12 months warranty', ar: 'ضمان 12 شهراً' } },
    images: [
      { url: 'https://picsum.photos/seed/sbl019a/600/600', alt: { en: 'Stabilizer Bar Links', ar: 'روابط بار الاستقرار' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Chery', model: 'Tiggo 5X', yearFrom: 2018, yearTo: 2024, engineType: 'All', transmission: 'Both' },
      { brand: 'Chery', model: 'Tiggo 7 Pro', yearFrom: 2020, yearTo: 2024, engineType: 'All', transmission: 'Both' },
      { brand: 'Chery', model: 'Tiggo 8 Pro', yearFrom: 2020, yearTo: 2024, engineType: 'All', transmission: 'Both' }
    ],
    specifications: [
      { key: { en: 'Length', ar: 'الطول' }, value: { en: '280 mm', ar: '280 ملم' } },
      { key: { en: 'Thread', ar: 'الخيط' }, value: { en: 'M10 x 1.25', ar: 'M10 x 1.25' } }
    ],
    searchKeywords: { en: ['sway bar link', 'stabilizer link', 'chery', 'anti-roll bar', 'rattling suspension'], ar: ['رابط الاستقرار', 'بار الاستقرار', 'شيري', 'طرطقة التعليق'] }
  },

  // ===== ELECTRICAL SYSTEM (12 products) =====
  {
    name: { en: 'Car Battery AGM 12V 70Ah', ar: 'بطارية سيارة AGM 12 فولت 70 أمبير/ساعة' },
    description: { en: 'Absorbent Glass Mat (AGM) battery for start-stop vehicles. Handles repeated cycling and deep discharges. 700A CCA for reliable cold starts.', ar: 'بطارية AGM لسيارات الإيقاف والتشغيل التلقائي. تتحمل الدورات المتكررة والتفريغ العميق. 700 أمبير CCA لتشغيل موثوق في البرد.' },
    partNumber: 'BAT-AGM-70AH-020',
    price: 175,
    currency: 'EUR',
    stock: 42,
    category: 'electrical',
    isFeatured: true,
    averageRating: 4.8,
    totalReviews: 156,
    viewCount: 5800,
    purchaseCount: 198,
    installationDifficulty: 'easy',
    weight: 18.5,
    dimensions: { length: 27, width: 17, height: 20 },
    warranty: { months: 36, details: { en: '3 years warranty', ar: 'ضمان 3 سنوات' } },
    images: [
      { url: 'https://picsum.photos/seed/bat020a/600/600', alt: { en: 'AGM Car Battery 70Ah', ar: 'بطارية AGM 70 أمبير/ساعة' }, isPrimary: true },
      { url: 'https://picsum.photos/seed/bat020b/600/600', alt: { en: 'Battery Terminal Close-up', ar: 'مقربة طرف البطارية' }, isPrimary: false }
    ],
    compatibility: [
      { brand: 'Geely', model: 'Coolray', yearFrom: 2019, yearTo: 2024, engineType: '1.5L TD', transmission: 'Both' },
      { brand: 'Haval', model: 'H6', yearFrom: 2017, yearTo: 2024, engineType: 'All', transmission: 'Both' },
      { brand: 'MG', model: 'HS', yearFrom: 2018, yearTo: 2024, engineType: '1.5T', transmission: 'Both' },
      { brand: 'Chery', model: 'Tiggo 7 Pro', yearFrom: 2020, yearTo: 2024, engineType: '1.6T', transmission: 'Both' }
    ],
    specifications: [
      { key: { en: 'Type', ar: 'النوع' }, value: { en: 'AGM (Absorbent Glass Mat)', ar: 'AGM (حصيرة زجاجية ماصة)' } },
      { key: { en: 'Voltage', ar: 'الجهد' }, value: { en: '12V', ar: '12 فولت' } },
      { key: { en: 'Capacity', ar: 'السعة' }, value: { en: '70 Ah', ar: '70 أمبير/ساعة' } },
      { key: { en: 'CCA', ar: 'قوة التشغيل' }, value: { en: '700 A', ar: '700 أمبير' } },
      { key: { en: 'Terminal', ar: 'الطرف' }, value: { en: 'SAE Standard', ar: 'معيار SAE' } }
    ],
    searchKeywords: { en: ['car battery', 'AGM battery', '70Ah', 'start-stop', 'battery replacement'], ar: ['بطارية سيارة', 'بطارية AGM', '70 أمبير', 'تشغيل وإيقاف', 'تغيير بطارية'] }
  },
  {
    name: { en: 'LED Full Headlight Assembly - Left', ar: 'مجموعة أضواء أمامية LED كاملة - يسار' },
    description: { en: 'Complete LED headlight assembly including DRL, low beam, high beam, and turn signal. Plug-and-play installation with no modification needed.', ar: 'مجموعة أضواء أمامية LED كاملة تشمل أضواء DRL والأضواء المنخفضة والعالية وإشارة الانعطاف. تركيب مباشر بدون تعديل.' },
    partNumber: 'HL-CHR-LED-021',
    price: 285,
    currency: 'EUR',
    stock: 16,
    category: 'electrical',
    isFeatured: true,
    averageRating: 4.9,
    totalReviews: 42,
    viewCount: 3600,
    purchaseCount: 35,
    installationDifficulty: 'medium',
    weight: 3.5,
    dimensions: { length: 60, width: 40, height: 25 },
    warranty: { months: 24, details: { en: '24 months warranty', ar: 'ضمان 24 شهراً' } },
    images: [
      { url: 'https://picsum.photos/seed/hl021a/600/600', alt: { en: 'LED Headlight Assembly Left', ar: 'مجموعة أضواء LED أمامية يسار' }, isPrimary: true },
      { url: 'https://picsum.photos/seed/hl021b/600/600', alt: { en: 'LED Headlight Beam Pattern', ar: 'نمط إضاءة LED' }, isPrimary: false }
    ],
    compatibility: [
      { brand: 'Chery', model: 'Tiggo 7 Pro', yearFrom: 2020, yearTo: 2024, engineType: 'All', transmission: 'Both' },
      { brand: 'Chery', model: 'Tiggo 8 Pro', yearFrom: 2020, yearTo: 2024, engineType: 'All', transmission: 'Both' }
    ],
    specifications: [
      { key: { en: 'Position', ar: 'الموقع' }, value: { en: 'Left (Driver Side)', ar: 'أيسر (جانب السائق)' } },
      { key: { en: 'Technology', ar: 'التقنية' }, value: { en: 'Full LED', ar: 'LED كامل' } },
      { key: { en: 'Color Temperature', ar: 'درجة حرارة اللون' }, value: { en: '6000K Pure White', ar: '6000K أبيض نقي' } },
      { key: { en: 'Brightness', ar: 'السطوع' }, value: { en: '5000 Lumens', ar: '5000 لومن' } }
    ],
    searchKeywords: { en: ['LED headlight', 'headlight assembly', 'chery tiggo', 'DRL', 'full LED'], ar: ['مصباح LED', 'مجموعة أضواء', 'شيري تيغو', 'DRL'] }
  },
  {
    name: { en: 'ABS Wheel Speed Sensor Rear', ar: 'حساس سرعة العجلة ABS الخلفي' },
    description: { en: 'Magnetic wheel speed sensor for ABS and stability control system. Eliminates ABS warning light and restores brake system functionality.', ar: 'حساس سرعة عجلة مغناطيسي لنظام ABS والتحكم في الثبات. يلغي ضوء تحذير ABS ويستعيد وظائف نظام الفرامل.' },
    partNumber: 'ABS-BYD-REAR-022',
    price: 38,
    currency: 'EUR',
    stock: 0,
    lowStockThreshold: 5,
    category: 'electrical',
    isFeatured: false,
    averageRating: 4.5,
    totalReviews: 68,
    viewCount: 2900,
    purchaseCount: 88,
    installationDifficulty: 'easy',
    weight: 0.15,
    dimensions: { length: 15, width: 3, height: 3 },
    warranty: { months: 12, details: { en: '12 months warranty', ar: 'ضمان 12 شهراً' } },
    images: [
      { url: 'https://picsum.photos/seed/abs022a/600/600', alt: { en: 'ABS Wheel Speed Sensor', ar: 'حساس سرعة العجلة ABS' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'BYD', model: 'Atto 3', yearFrom: 2022, yearTo: 2024, engineType: 'Electric', transmission: 'Automatic' },
      { brand: 'BYD', model: 'Han', yearFrom: 2020, yearTo: 2024, engineType: 'Electric', transmission: 'Automatic' }
    ],
    specifications: [
      { key: { en: 'Type', ar: 'النوع' }, value: { en: 'Active (Magnetic)', ar: 'نشط (مغناطيسي)' } },
      { key: { en: 'Wire Length', ar: 'طول السلك' }, value: { en: '900 mm', ar: '900 ملم' } },
      { key: { en: 'Connector Pins', ar: 'أسنان الموصل' }, value: { en: '2-Pin', ar: '2 أسنان' } }
    ],
    searchKeywords: { en: ['ABS sensor', 'wheel speed sensor', 'BYD', 'ABS warning light'], ar: ['حساس ABS', 'حساس سرعة', 'BYD', 'تحذير ABS'] }
  },
  {
    name: { en: 'Cabin Air Filter with Activated Carbon', ar: 'فلتر هواء المقصورة بالكربون المنشط' },
    description: { en: 'Premium activated carbon cabin filter that removes fine particles, pollen, smoke, and odors. 4-layer filtration technology.', ar: 'فلتر مقصورة ممتاز بالكربون المنشط يزيل الجسيمات الدقيقة وحبوب اللقاح والدخان والروائح. تقنية ترشيح 4 طبقات.' },
    partNumber: 'CAF-HAV-AC-023',
    price: 24,
    currency: 'EUR',
    stock: 185,
    category: 'filters',
    isFeatured: false,
    averageRating: 4.7,
    totalReviews: 245,
    viewCount: 6800,
    purchaseCount: 445,
    installationDifficulty: 'easy',
    weight: 0.3,
    dimensions: { length: 24, width: 20, height: 3 },
    warranty: { months: 6, details: { en: '6 months warranty', ar: 'ضمان 6 أشهر' } },
    images: [
      { url: 'https://picsum.photos/seed/caf023a/600/600', alt: { en: 'Activated Carbon Cabin Filter', ar: 'فلتر المقصورة بالكربون المنشط' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Haval', model: 'H6', yearFrom: 2017, yearTo: 2024, engineType: 'All', transmission: 'Both' },
      { brand: 'Haval', model: 'Jolion', yearFrom: 2021, yearTo: 2024, engineType: 'All', transmission: 'Both' },
      { brand: 'Great Wall', model: 'Wingle 7', yearFrom: 2018, yearTo: 2024, engineType: 'All', transmission: 'Both' }
    ],
    specifications: [
      { key: { en: 'Type', ar: 'النوع' }, value: { en: 'Activated Carbon 4-Layer', ar: 'كربون منشط 4 طبقات' } },
      { key: { en: 'Filtration', ar: 'الترشيح' }, value: { en: 'PM2.5, Pollen, Odors', ar: 'PM2.5، حبوب اللقاح، الروائح' } },
      { key: { en: 'Dimensions', ar: 'الأبعاد' }, value: { en: '240 x 200 x 30 mm', ar: '240 × 200 × 30 ملم' } }
    ],
    searchKeywords: { en: ['cabin filter', 'pollen filter', 'activated carbon', 'haval', 'air quality'], ar: ['فلتر المقصورة', 'فلتر حبوب اللقاح', 'كربون منشط', 'هافال'] }
  },

  // ===== BODY & EXTERIOR (10 products) =====
  {
    name: { en: 'Front Bumper Cover - Primed', ar: 'غطاء الصدام الأمامي - مبطل للدهان' },
    description: { en: 'OEM-style front bumper cover in primer ready for painting. Includes all mounting brackets and hardware. Exact factory fit.', ar: 'غطاء صدام أمامي بتصميم أصلي مبطل جاهز للدهان. يشمل جميع أقواس التثبيت والمسامير. ملاءمة مصنعية دقيقة.' },
    partNumber: 'FB-GEE-PRIM-024',
    price: 185,
    currency: 'EUR',
    stock: 12,
    category: 'body-parts',
    isFeatured: false,
    averageRating: 4.4,
    totalReviews: 28,
    viewCount: 2200,
    purchaseCount: 25,
    installationDifficulty: 'medium',
    weight: 4.5,
    dimensions: { length: 150, width: 60, height: 40 },
    warranty: { months: 12, details: { en: '12 months warranty', ar: 'ضمان 12 شهراً' } },
    images: [
      { url: 'https://picsum.photos/seed/fb024a/600/600', alt: { en: 'Front Bumper Cover Primed', ar: 'غطاء الصدام الأمامي مبطل' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Geely', model: 'Coolray', yearFrom: 2019, yearTo: 2023, engineType: 'All', transmission: 'Both' }
    ],
    specifications: [
      { key: { en: 'Color', ar: 'اللون' }, value: { en: 'Primer Ready', ar: 'جاهز للدهان' } },
      { key: { en: 'Material', ar: 'المادة' }, value: { en: 'Thermoplastic PP', ar: 'بولي بروبيلين حرارية' } },
      { key: { en: 'Mounting', ar: 'التثبيت' }, value: { en: 'Brackets Included', ar: 'أقواس مشمولة' } }
    ],
    searchKeywords: { en: ['front bumper', 'bumper cover', 'geely coolray', 'body panel'], ar: ['صدام أمامي', 'غطاء صدام', 'جيلي كولراي', 'هيكل'] }
  },
  {
    name: { en: 'Electric Door Mirror Assembly - Right', ar: 'مجموعة مرآة باب كهربائية - يمين' },
    description: { en: 'Complete power door mirror with heated glass, LED turn signal, and blind spot indicator. Genuine OEM quality.', ar: 'مرآة باب كهربائية كاملة مع زجاج مدفأ وإشارة انعطاف LED ومؤشر النقطة العمياء. جودة أصلية حقيقية.' },
    partNumber: 'DM-MG-EL-025',
    price: 195,
    currency: 'EUR',
    stock: 22,
    category: 'body-parts',
    isFeatured: false,
    averageRating: 4.7,
    totalReviews: 44,
    viewCount: 2800,
    purchaseCount: 38,
    installationDifficulty: 'medium',
    weight: 1.8,
    dimensions: { length: 25, width: 18, height: 12 },
    warranty: { months: 12, details: { en: '12 months warranty', ar: 'ضمان 12 شهراً' } },
    images: [
      { url: 'https://picsum.photos/seed/dm025a/600/600', alt: { en: 'Electric Door Mirror Right', ar: 'مرآة الباب الكهربائية اليمنى' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'MG', model: 'HS', yearFrom: 2020, yearTo: 2024, engineType: 'All', transmission: 'Both' }
    ],
    specifications: [
      { key: { en: 'Position', ar: 'الموقع' }, value: { en: 'Right (Passenger Side)', ar: 'أيمن (جانب الراكب)' } },
      { key: { en: 'Features', ar: 'المزايا' }, value: { en: 'Heated, LED Signal, BSM', ar: 'مدفأ، إشارة LED، مؤشر النقطة العمياء' } },
      { key: { en: 'Adjustment', ar: 'الضبط' }, value: { en: '5-Way Electric', ar: 'كهربائي 5 اتجاهات' } }
    ],
    searchKeywords: { en: ['door mirror', 'wing mirror', 'MG HS', 'power mirror', 'heated mirror'], ar: ['مرآة باب', 'مرآة جانبية', 'MG HS', 'مرآة كهربائية'] }
  },
  {
    name: { en: 'Wiper Blade Set (Front) - Frameless', ar: 'طقم مساحات زجاج أمامية - بدون إطار' },
    description: { en: 'Frameless aerodynamic wiper blades for streak-free visibility. Spoiler design reduces wind lift at high speeds. Set of 2.', ar: 'مساحات زجاج بدون إطار بتصميم ديناميكي هوائي لرؤية بدون خطوط. تصميم سبويلر يقلل الرفع الهوائي بالسرعات العالية. طقم من 2.' },
    partNumber: 'WB-CHG-BEAM-026',
    price: 38,
    currency: 'EUR',
    stock: 210,
    category: 'body-parts',
    isFeatured: false,
    averageRating: 4.6,
    totalReviews: 188,
    viewCount: 4900,
    purchaseCount: 320,
    installationDifficulty: 'easy',
    weight: 0.4,
    dimensions: { length: 65, width: 5, height: 3 },
    warranty: { months: 6, details: { en: '6 months warranty', ar: 'ضمان 6 أشهر' } },
    images: [
      { url: 'https://picsum.photos/seed/wb026a/600/600', alt: { en: 'Frameless Wiper Blades Set', ar: 'طقم مساحات بدون إطار' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Changan', model: 'CS35 Plus', yearFrom: 2018, yearTo: 2024, engineType: 'All', transmission: 'Both' },
      { brand: 'Changan', model: 'CS55 Plus', yearFrom: 2019, yearTo: 2024, engineType: 'All', transmission: 'Both' },
      { brand: 'Changan', model: 'UNI-T', yearFrom: 2020, yearTo: 2024, engineType: 'All', transmission: 'Both' }
    ],
    specifications: [
      { key: { en: 'Driver Side Length', ar: 'طول جانب السائق' }, value: { en: '650 mm (26")', ar: '650 ملم (26")' } },
      { key: { en: 'Passenger Side Length', ar: 'طول جانب الراكب' }, value: { en: '400 mm (16")', ar: '400 ملم (16")' } },
      { key: { en: 'Type', ar: 'النوع' }, value: { en: 'Frameless Beam', ar: 'شعاعي بدون إطار' } }
    ],
    searchKeywords: { en: ['wiper blade', 'windshield wiper', 'changan', 'frameless wiper', 'beam blade'], ar: ['مساحة زجاج', 'مسح الزجاج', 'شانجان', 'مساحة بدون إطار'] }
  },

  // ===== TRANSMISSION (8 products) =====
  {
    name: { en: 'Clutch Kit 3-Piece Set', ar: 'طقم كلتش ثلاثي القطع' },
    description: { en: 'Complete 3-piece clutch kit including friction disc, pressure plate, and release bearing. Organic compound for smooth engagement.', ar: 'طقم كلتش ثلاثي القطع الكامل يشمل قرص الاحتكاك ولوح الضغط والرسيفر. مركب عضوي لاشتباك سلس.' },
    partNumber: 'CK-GEE-3PC-027',
    price: 220,
    currency: 'EUR',
    stock: 22,
    category: 'transmission',
    isFeatured: false,
    averageRating: 4.6,
    totalReviews: 55,
    viewCount: 2650,
    purchaseCount: 48,
    installationDifficulty: 'hard',
    weight: 5.5,
    dimensions: { length: 35, width: 35, height: 15 },
    warranty: { months: 12, details: { en: '12 months or 20,000 km warranty', ar: 'ضمان 12 شهراً أو 20,000 كم' } },
    images: [
      { url: 'https://picsum.photos/seed/ck027a/600/600', alt: { en: 'Clutch Kit 3-Piece', ar: 'طقم كلتش ثلاثي' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Geely', model: 'Emgrand', yearFrom: 2012, yearTo: 2021, engineType: '1.5L', transmission: 'Manual' },
      { brand: 'Geely', model: 'Atlas', yearFrom: 2016, yearTo: 2022, engineType: '2.0L', transmission: 'Manual' }
    ],
    specifications: [
      { key: { en: 'Disc Diameter', ar: 'قطر القرص' }, value: { en: '220 mm', ar: '220 ملم' } },
      { key: { en: 'Splines', ar: 'الأسنان' }, value: { en: '22T', ar: '22 سن' } },
      { key: { en: 'Type', ar: 'النوع' }, value: { en: 'Organic', ar: 'عضوي' } }
    ],
    searchKeywords: { en: ['clutch kit', 'clutch disc', 'geely', 'manual transmission', 'clutch replacement'], ar: ['طقم كلتش', 'قرص كلتش', 'جيلي', 'ناقل يدوي'] }
  },
  {
    name: { en: 'CVT Transmission Fluid (4L)', ar: 'زيت ناقل CVT (4 لتر)' },
    description: { en: 'Specifically formulated CVT fluid for continuously variable transmissions in Chinese vehicles. Anti-shudder formula for smooth operation.', ar: 'سائل CVT مصمم خصيصاً لناقلات الحركة المتغيرة باستمرار في السيارات الصينية. تركيبة مضادة للاهتزاز للتشغيل السلس.' },
    partNumber: 'CVT-OIL-4L-028',
    price: 42,
    currency: 'EUR',
    stock: 88,
    category: 'transmission',
    isFeatured: false,
    averageRating: 4.5,
    totalReviews: 112,
    viewCount: 4100,
    purchaseCount: 205,
    installationDifficulty: 'easy',
    weight: 4.0,
    dimensions: { length: 18, width: 10, height: 25 },
    warranty: { months: 6, details: { en: '6 months warranty', ar: 'ضمان 6 أشهر' } },
    images: [
      { url: 'https://picsum.photos/seed/cvt028a/600/600', alt: { en: 'CVT Transmission Fluid', ar: 'زيت ناقل CVT' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Chery', model: 'Tiggo 5X', yearFrom: 2018, yearTo: 2024, engineType: '1.5L Turbo', transmission: 'CVT' },
      { brand: 'Geely', model: 'Coolray', yearFrom: 2019, yearTo: 2024, engineType: '1.5L TD', transmission: 'CVT' },
      { brand: 'MG', model: 'ZS', yearFrom: 2017, yearTo: 2024, engineType: '1.5L', transmission: 'CVT' }
    ],
    specifications: [
      { key: { en: 'Volume', ar: 'الحجم' }, value: { en: '4 Liters', ar: '4 لتر' } },
      { key: { en: 'Viscosity', ar: 'اللزوجة' }, value: { en: 'SAE 0W-20', ar: 'SAE 0W-20' } },
      { key: { en: 'Standard', ar: 'المعيار' }, value: { en: 'JASO T903', ar: 'JASO T903' } }
    ],
    searchKeywords: { en: ['CVT fluid', 'CVT oil', 'transmission fluid', 'gearbox oil', 'chery geely'], ar: ['زيت CVT', 'سائل ناقل CVT', 'زيت القير', 'تغيير زيت القير'] }
  },

  // ===== COOLING SYSTEM (8 products) =====
  {
    name: { en: 'Aluminum Radiator - Full Replacement', ar: 'رديتر ألومنيوم - استبدال كامل' },
    description: { en: 'High-capacity all-aluminum radiator with plastic end tanks. 30% more cooling capacity than OEM. Includes mounting brackets and drain plug.', ar: 'رديتر ألومنيوم كامل بسعة عالية مع خزانات طرفية بلاستيكية. سعة تبريد أعلى بـ30% من الأصلي. يشمل أقواس التثبيت وصامولة التصريف.' },
    partNumber: 'RAD-CHR-ALU-029',
    price: 245,
    currency: 'EUR',
    stock: 18,
    category: 'cooling-system',
    isFeatured: true,
    averageRating: 4.7,
    totalReviews: 48,
    viewCount: 2400,
    purchaseCount: 40,
    installationDifficulty: 'hard',
    weight: 4.5,
    dimensions: { length: 65, width: 45, height: 3.5 },
    warranty: { months: 24, details: { en: '24 months warranty', ar: 'ضمان 24 شهراً' } },
    images: [
      { url: 'https://picsum.photos/seed/rad029a/600/600', alt: { en: 'Aluminum Radiator', ar: 'رديتر ألومنيوم' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Chery', model: 'Tiggo 7 Pro', yearFrom: 2020, yearTo: 2024, engineType: '1.6T', transmission: 'Both' },
      { brand: 'Chery', model: 'Tiggo 8 Pro', yearFrom: 2020, yearTo: 2024, engineType: '2.0T', transmission: 'Both' }
    ],
    specifications: [
      { key: { en: 'Core Material', ar: 'مادة النواة' }, value: { en: 'Aluminum', ar: 'ألومنيوم' } },
      { key: { en: 'Rows', ar: 'الصفوف' }, value: { en: '2-Row High Performance', ar: '2 صف عالي الأداء' } },
      { key: { en: 'Inlet/Outlet', ar: 'المدخل/المخرج' }, value: { en: '38 mm / 38 mm', ar: '38 ملم / 38 ملم' } }
    ],
    searchKeywords: { en: ['radiator', 'aluminum radiator', 'chery', 'cooling', 'overheating'], ar: ['رديتر', 'رديتر ألومنيوم', 'شيري', 'تبريد', 'ارتفاع حرارة'] }
  },
  {
    name: { en: 'Thermostat with Housing', ar: 'ثيرموستات مع الغطاء' },
    description: { en: 'Engine thermostat assembly with housing and O-ring seal. Pre-set at 87°C for optimal operating temperature. Easy replacement unit.', ar: 'مجموعة ثيرموستات المحرك مع الغطاء ومانع تسرب O-ring. معياري عند 87°C لدرجة حرارة تشغيل مثلى. وحدة استبدال سهلة.' },
    partNumber: 'THERM-MG-87C-030',
    price: 45,
    currency: 'EUR',
    stock: 55,
    category: 'cooling-system',
    isFeatured: false,
    averageRating: 4.5,
    totalReviews: 72,
    viewCount: 2100,
    purchaseCount: 88,
    installationDifficulty: 'medium',
    weight: 0.35,
    dimensions: { length: 12, width: 8, height: 8 },
    warranty: { months: 12, details: { en: '12 months warranty', ar: 'ضمان 12 شهراً' } },
    images: [
      { url: 'https://picsum.photos/seed/th030a/600/600', alt: { en: 'Thermostat with Housing', ar: 'ثيرموستات مع الغطاء' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'MG', model: 'HS', yearFrom: 2018, yearTo: 2024, engineType: '1.5T', transmission: 'Both' },
      { brand: 'MG', model: 'ZS', yearFrom: 2017, yearTo: 2024, engineType: '1.5L', transmission: 'Both' }
    ],
    specifications: [
      { key: { en: 'Opening Temperature', ar: 'درجة حرارة الفتح' }, value: { en: '87°C', ar: '87 درجة مئوية' } },
      { key: { en: 'Full Open at', ar: 'يفتح كامل عند' }, value: { en: '102°C', ar: '102 درجة مئوية' } },
      { key: { en: 'Housing Material', ar: 'مادة الغطاء' }, value: { en: 'Aluminum', ar: 'ألومنيوم' } }
    ],
    searchKeywords: { en: ['thermostat', 'engine thermostat', 'MG', 'temperature control', 'cooling'], ar: ['ثيرموستات', 'ثيرموستات محرك', 'MG', 'تحكم درجة الحرارة'] }
  },
  {
    name: { en: 'Water Pump Assembly', ar: 'مجموعة طرمبة الماء' },
    description: { en: 'OEM replacement water pump with ceramic seal for extended service life. Includes O-ring gasket and mounting hardware.', ar: 'طرمبة ماء بديلة أصلية بختم سيراميك لعمر خدمة ممتد. تشمل حشوة O-ring ومعدات التثبيت.' },
    partNumber: 'WP-HAV-ASM-031',
    price: 98,
    currency: 'EUR',
    stock: 35,
    category: 'cooling-system',
    isFeatured: false,
    averageRating: 4.6,
    totalReviews: 62,
    viewCount: 2350,
    purchaseCount: 55,
    installationDifficulty: 'hard',
    weight: 1.2,
    dimensions: { length: 20, width: 18, height: 12 },
    warranty: { months: 24, details: { en: '24 months warranty', ar: 'ضمان 24 شهراً' } },
    images: [
      { url: 'https://picsum.photos/seed/wp031a/600/600', alt: { en: 'Water Pump Assembly', ar: 'مجموعة طرمبة الماء' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Haval', model: 'H6', yearFrom: 2017, yearTo: 2024, engineType: '1.5T / 2.0T', transmission: 'Both' },
      { brand: 'Haval', model: 'Jolion', yearFrom: 2021, yearTo: 2024, engineType: '1.5T', transmission: 'Both' }
    ],
    specifications: [
      { key: { en: 'Seal Type', ar: 'نوع الختم' }, value: { en: 'Ceramic Mechanical', ar: 'سيراميك ميكانيكي' } },
      { key: { en: 'Impeller', ar: 'المروحة' }, value: { en: 'Metal (Anti-Cavitation)', ar: 'معدنية (مضادة للفقاعات)' } }
    ],
    searchKeywords: { en: ['water pump', 'coolant pump', 'haval', 'cooling system', 'engine cooling'], ar: ['طرمبة ماء', 'مضخة التبريد', 'هافال', 'نظام التبريد'] }
  },

  // ===== MORE PRODUCTS FOR FULL COVERAGE =====
  {
    name: { en: 'Fuel Filter Inline', ar: 'فلتر وقود مضمن في الخط' },
    description: { en: 'High-pressure inline fuel filter for fuel-injected engines. Removes contaminants and protects injectors. Easy spin-on replacement.', ar: 'فلتر وقود مضمن في الخط عالي الضغط لمحركات الحقن. يزيل الشوائب ويحمي الحاقنات. استبدال برغي سهل.' },
    partNumber: 'FF-GEE-INLINE-032',
    price: 25,
    currency: 'EUR',
    stock: 142,
    category: 'filters',
    isFeatured: false,
    averageRating: 4.4,
    totalReviews: 98,
    viewCount: 3200,
    purchaseCount: 178,
    installationDifficulty: 'easy',
    weight: 0.2,
    dimensions: { length: 12, width: 6, height: 6 },
    warranty: { months: 6, details: { en: '6 months warranty', ar: 'ضمان 6 أشهر' } },
    images: [
      { url: 'https://picsum.photos/seed/ff032a/600/600', alt: { en: 'Inline Fuel Filter', ar: 'فلتر وقود مضمن' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Geely', model: 'Emgrand', yearFrom: 2012, yearTo: 2024, engineType: '1.5L', transmission: 'Both' },
      { brand: 'Geely', model: 'Coolray', yearFrom: 2019, yearTo: 2024, engineType: '1.5L TD', transmission: 'Both' }
    ],
    specifications: [
      { key: { en: 'Inlet Thread', ar: 'خيط المدخل' }, value: { en: '5/16" Inlet', ar: '5/16" مدخل' } },
      { key: { en: 'Max Pressure', ar: 'الضغط الأقصى' }, value: { en: '6 bar', ar: '6 بار' } }
    ],
    searchKeywords: { en: ['fuel filter', 'inline filter', 'geely', 'fuel system'], ar: ['فلتر وقود', 'فلتر الوقود المضمن', 'جيلي'] }
  },
  {
    name: { en: 'Transmission Oil Filter Kit', ar: 'طقم فلتر زيت ناقل الحركة' },
    description: { en: 'Complete automatic transmission filter kit with gasket and pan drain plug. Recommended to change every 60,000 km.', ar: 'طقم فلتر ناقل الحركة الأوتوماتيكي الكامل مع الحشوة وصامولة تصريف علبة التروس. يوصى بتغييره كل 60,000 كم.' },
    partNumber: 'TF-CHR-KIT-033',
    price: 38,
    currency: 'EUR',
    stock: 65,
    category: 'transmission',
    isFeatured: false,
    averageRating: 4.5,
    totalReviews: 78,
    viewCount: 2800,
    purchaseCount: 112,
    installationDifficulty: 'medium',
    weight: 0.5,
    dimensions: { length: 22, width: 18, height: 5 },
    warranty: { months: 6, details: { en: '6 months warranty', ar: 'ضمان 6 أشهر' } },
    images: [
      { url: 'https://picsum.photos/seed/tf033a/600/600', alt: { en: 'Transmission Filter Kit', ar: 'طقم فلتر ناقل الحركة' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Chery', model: 'Tiggo 5X', yearFrom: 2018, yearTo: 2024, engineType: '1.5L Turbo', transmission: 'Automatic' },
      { brand: 'Chery', model: 'Tiggo 7 Pro', yearFrom: 2020, yearTo: 2024, engineType: '1.6T', transmission: 'Automatic' }
    ],
    specifications: [
      { key: { en: 'Kit Contents', ar: 'محتويات الطقم' }, value: { en: 'Filter + Gasket + Drain Plug', ar: 'فلتر + حشوة + صامولة تصريف' } }
    ],
    searchKeywords: { en: ['transmission filter', 'gearbox filter', 'chery', 'ATF filter'], ar: ['فلتر ناقل الحركة', 'فلتر القير', 'شيري'] }
  },
  {
    name: { en: 'Alternator 90A Remanufactured', ar: 'دينمو 90 أمبير معاد التصنيع' },
    description: { en: 'Professionally remanufactured alternator with new bearings, brushes, and voltage regulator. Load-tested to OEM specifications.', ar: 'دينمو معاد التصنيع احترافياً مع محامل وفراشي وضابط جهد جديدة. تم اختباره بالحمل وفق مواصفات المصنع.' },
    partNumber: 'ALT-BYD-90A-034',
    price: 168,
    currency: 'EUR',
    stock: 14,
    category: 'electrical',
    isFeatured: false,
    averageRating: 4.4,
    totalReviews: 32,
    viewCount: 1890,
    purchaseCount: 28,
    installationDifficulty: 'hard',
    weight: 5.5,
    dimensions: { length: 20, width: 18, height: 18 },
    warranty: { months: 24, details: { en: '24 months warranty', ar: 'ضمان 24 شهراً' } },
    images: [
      { url: 'https://picsum.photos/seed/alt034a/600/600', alt: { en: 'Alternator 90A', ar: 'دينمو 90 أمبير' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'BYD', model: 'F3', yearFrom: 2010, yearTo: 2018, engineType: '1.5L', transmission: 'Both' },
      { brand: 'BYD', model: 'F6', yearFrom: 2007, yearTo: 2015, engineType: '2.0L', transmission: 'Both' }
    ],
    specifications: [
      { key: { en: 'Output', ar: 'الناتج' }, value: { en: '90 A / 12V', ar: '90 أمبير / 12 فولت' } },
      { key: { en: 'Pulley Type', ar: 'نوع البكرة' }, value: { en: 'OAP (Overrunning Alternator Pulley)', ar: 'بكرة دوران حر' } }
    ],
    searchKeywords: { en: ['alternator', 'generator', 'BYD', 'charging system', 'dynamo'], ar: ['دينمو', 'مولد', 'BYD', 'نظام الشحن'] }
  },
  {
    name: { en: 'Power Steering Rack & Pinion', ar: 'رف الدريكسيون والدبوس' },
    description: { en: 'Remanufactured power steering rack and pinion assembly. Includes tie rod ends and boots. Eliminates loose steering and power assist failure.', ar: 'مجموعة رف الدريكسيون والدبوس معادة التصنيع. تشمل نهايات التعريض والطلمبات. يلغي التوجيه الفضفاض وفشل مساعدة القوة.' },
    partNumber: 'PSR-GEE-REMAN-035',
    price: 385,
    currency: 'EUR',
    stock: 8,
    lowStockThreshold: 3,
    category: 'suspension',
    isFeatured: false,
    averageRating: 4.5,
    totalReviews: 22,
    viewCount: 1450,
    purchaseCount: 18,
    installationDifficulty: 'hard',
    weight: 8.5,
    dimensions: { length: 80, width: 15, height: 15 },
    warranty: { months: 24, details: { en: '24 months unlimited warranty', ar: 'ضمان 24 شهراً غير محدود' } },
    images: [
      { url: 'https://picsum.photos/seed/psr035a/600/600', alt: { en: 'Power Steering Rack', ar: 'رف الدريكسيون' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Geely', model: 'Atlas', yearFrom: 2016, yearTo: 2023, engineType: '2.0T', transmission: 'Both' }
    ],
    specifications: [
      { key: { en: 'Type', ar: 'النوع' }, value: { en: 'Hydraulic Power', ar: 'هيدروليكي' } },
      { key: { en: 'Turns Lock-to-Lock', ar: 'الدورات من قفل لقفل' }, value: { en: '2.7', ar: '2.7' } }
    ],
    searchKeywords: { en: ['steering rack', 'power steering', 'rack and pinion', 'geely', 'steering repair'], ar: ['رف الدريكسيون', 'دريكسيون', 'توجيه', 'جيلي'] }
  },
  {
    name: { en: 'Engine Oil Synthetic 5W-40 (5L)', ar: 'زيت محرك صناعي 5W-40 (5 لتر)' },
    description: { en: 'Full synthetic 5W-40 engine oil meeting ACEA A3/B4 specifications. Provides excellent cold-start protection and high-temperature stability.', ar: 'زيت محرك صناعي كامل 5W-40 يلبي مواصفات ACEA A3/B4. يوفر حماية ممتازة عند التشغيل البارد واستقرارية في درجات الحرارة العالية.' },
    partNumber: 'OIL-SYN-5W40-5L-036',
    price: 52,
    currency: 'EUR',
    stock: 310,
    category: 'engine-parts',
    isFeatured: true,
    averageRating: 4.9,
    totalReviews: 312,
    viewCount: 9800,
    purchaseCount: 620,
    installationDifficulty: 'easy',
    weight: 5.2,
    dimensions: { length: 15, width: 15, height: 28 },
    warranty: { months: 6, details: { en: '6 months warranty', ar: 'ضمان 6 أشهر' } },
    images: [
      { url: 'https://picsum.photos/seed/oil036a/600/600', alt: { en: 'Synthetic Engine Oil 5W-40 5L', ar: 'زيت محرك صناعي 5W-40 5 لتر' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Chery', model: 'Tiggo 5X', yearFrom: 2018, yearTo: 2024, engineType: 'All', transmission: 'Both' },
      { brand: 'Geely', model: 'Coolray', yearFrom: 2019, yearTo: 2024, engineType: 'All', transmission: 'Both' },
      { brand: 'Haval', model: 'H6', yearFrom: 2017, yearTo: 2024, engineType: 'All', transmission: 'Both' },
      { brand: 'MG', model: 'HS', yearFrom: 2018, yearTo: 2024, engineType: 'All', transmission: 'Both' }
    ],
    specifications: [
      { key: { en: 'Viscosity', ar: 'اللزوجة' }, value: { en: '5W-40', ar: '5W-40' } },
      { key: { en: 'Standard', ar: 'المعيار' }, value: { en: 'ACEA A3/B4, API SN', ar: 'ACEA A3/B4, API SN' } },
      { key: { en: 'Volume', ar: 'الحجم' }, value: { en: '5 Liters', ar: '5 لتر' } }
    ],
    searchKeywords: { en: ['engine oil', '5W-40', 'synthetic oil', 'motor oil', 'oil change'], ar: ['زيت محرك', '5W-40', 'زيت صناعي', 'تغيير زيت'] }
  },
  {
    name: { en: 'Oxygen (Lambda) Sensor Upstream', ar: 'حساس الأكسجين (لامدا) الأمامي' },
    description: { en: 'Wideband oxygen sensor for accurate air-fuel ratio measurement. Eliminates check engine P0135/P0141 fault codes. Easy plug-and-play.', ar: 'حساس أكسجين عريض النطاق للقياس الدقيق لنسبة الهواء والوقود. يلغي أكواد الأعطال P0135/P0141. سهل التركيب.' },
    partNumber: 'O2-CHR-UPS-037',
    price: 55,
    currency: 'EUR',
    stock: 48,
    category: 'electrical',
    isFeatured: false,
    averageRating: 4.5,
    totalReviews: 65,
    viewCount: 2800,
    purchaseCount: 78,
    installationDifficulty: 'medium',
    weight: 0.25,
    dimensions: { length: 50, width: 3, height: 3 },
    warranty: { months: 12, details: { en: '12 months warranty', ar: 'ضمان 12 شهراً' } },
    images: [
      { url: 'https://picsum.photos/seed/o2037a/600/600', alt: { en: 'Upstream Oxygen Sensor', ar: 'حساس الأكسجين الأمامي' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Chery', model: 'Arrizo 6', yearFrom: 2019, yearTo: 2024, engineType: '1.5L Turbo', transmission: 'Both' },
      { brand: 'Chery', model: 'Tiggo 5X', yearFrom: 2018, yearTo: 2024, engineType: '1.5L Turbo', transmission: 'Both' }
    ],
    specifications: [
      { key: { en: 'Type', ar: 'النوع' }, value: { en: 'Wideband (4-Wire)', ar: 'عريض النطاق (4 أسلاك)' } },
      { key: { en: 'Position', ar: 'الموقع' }, value: { en: 'Before Catalytic Converter', ar: 'قبل المحول الحفازي' } },
      { key: { en: 'Thread', ar: 'الخيط' }, value: { en: 'M18 x 1.5', ar: 'M18 x 1.5' } }
    ],
    searchKeywords: { en: ['O2 sensor', 'oxygen sensor', 'lambda sensor', 'chery', 'check engine'], ar: ['حساس أكسجين', 'حساس لامدا', 'شيري', 'فانوس المحرك'] }
  },
  {
    name: { en: 'Rear Tail Light Assembly - Right', ar: 'مجموعة الفانوس الخلفي الأيمن' },
    description: { en: 'Complete right rear tail light assembly including LED stop light, reverse light, and turn signal. Direct OEM replacement.', ar: 'مجموعة فانوس خلفي أيمن كاملة تشمل ضوء التوقف LED وضوء الرجوع وإشارة الانعطاف. بديل مباشر أصلي.' },
    partNumber: 'TL-HAV-RR-038',
    price: 148,
    currency: 'EUR',
    stock: 18,
    category: 'electrical',
    isFeatured: false,
    averageRating: 4.6,
    totalReviews: 34,
    viewCount: 1980,
    purchaseCount: 28,
    installationDifficulty: 'easy',
    weight: 1.8,
    dimensions: { length: 35, width: 22, height: 8 },
    warranty: { months: 12, details: { en: '12 months warranty', ar: 'ضمان 12 شهراً' } },
    images: [
      { url: 'https://picsum.photos/seed/tl038a/600/600', alt: { en: 'Right Rear Tail Light', ar: 'الفانوس الخلفي الأيمن' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Haval', model: 'Jolion', yearFrom: 2021, yearTo: 2024, engineType: 'All', transmission: 'Both' }
    ],
    specifications: [
      { key: { en: 'Position', ar: 'الموقع' }, value: { en: 'Rear Right', ar: 'خلفي أيمن' } },
      { key: { en: 'Technology', ar: 'التقنية' }, value: { en: 'LED + Halogen', ar: 'LED + هالوجن' } }
    ],
    searchKeywords: { en: ['tail light', 'rear light', 'haval jolion', 'LED tail light'], ar: ['فانوس خلفي', 'ضوء خلفي', 'هافال جوليون'] }
  },
  {
    name: { en: 'Front Fender Right - Unpainted', ar: 'رفرف أمامي أيمن - غير مدهون' },
    description: { en: 'OEM-equivalent steel front fender. Unpainted for custom color matching. Pre-drilled mounting holes for easy bolt-on installation.', ar: 'رفرف أمامي فولاذي مكافئ للأصلي. غير مدهون لمطابقة اللون المخصص. فتحات تثبيت مثقوبة مسبقاً لتركيب برغي سهل.' },
    partNumber: 'FEN-BYD-FR-039',
    price: 125,
    currency: 'EUR',
    stock: 14,
    category: 'body-parts',
    isFeatured: false,
    averageRating: 4.3,
    totalReviews: 22,
    viewCount: 1680,
    purchaseCount: 18,
    installationDifficulty: 'medium',
    weight: 3.8,
    dimensions: { length: 80, width: 45, height: 40 },
    warranty: { months: 12, details: { en: '12 months warranty', ar: 'ضمان 12 شهراً' } },
    images: [
      { url: 'https://picsum.photos/seed/fen039a/600/600', alt: { en: 'Front Fender Right Unpainted', ar: 'رفرف أمامي أيمن غير مدهون' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'BYD', model: 'Atto 3', yearFrom: 2022, yearTo: 2024, engineType: 'Electric', transmission: 'Automatic' }
    ],
    specifications: [
      { key: { en: 'Position', ar: 'الموقع' }, value: { en: 'Front Right', ar: 'أمامي أيمن' } },
      { key: { en: 'Material', ar: 'المادة' }, value: { en: 'Stamped Steel', ar: 'فولاذ مختوم' } },
      { key: { en: 'Finish', ar: 'الإنهاء' }, value: { en: 'Bare Metal (Paintable)', ar: 'معدن عاري (قابل للدهان)' } }
    ],
    searchKeywords: { en: ['fender', 'front fender', 'BYD', 'body panel', 'wing panel'], ar: ['رفرف', 'رفرف أمامي', 'BYD', 'لوحة هيكل'] }
  },
  {
    name: { en: 'Gearbox Mount Transmission Bracket', ar: 'حامل علبة التروس' },
    description: { en: 'Hydraulic gearbox transmission mount to reduce vibration and noise. Heavy-duty rubber insert for maximum vibration damping.', ar: 'حامل علبة تروس هيدروليكي لتقليل الاهتزاز والضوضاء. إدخال مطاط قوي لأقصى تخميد للاهتزاز.' },
    partNumber: 'GM-CHG-HYD-040',
    price: 75,
    currency: 'EUR',
    stock: 32,
    category: 'transmission',
    isFeatured: false,
    averageRating: 4.4,
    totalReviews: 44,
    viewCount: 1650,
    purchaseCount: 38,
    installationDifficulty: 'medium',
    weight: 1.5,
    dimensions: { length: 18, width: 12, height: 10 },
    warranty: { months: 12, details: { en: '12 months warranty', ar: 'ضمان 12 شهراً' } },
    images: [
      { url: 'https://picsum.photos/seed/gm040a/600/600', alt: { en: 'Gearbox Mount', ar: 'حامل علبة التروس' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Changan', model: 'CS55 Plus', yearFrom: 2019, yearTo: 2024, engineType: '1.5T', transmission: 'Automatic' },
      { brand: 'Changan', model: 'UNI-T', yearFrom: 2020, yearTo: 2024, engineType: '1.5T', transmission: 'Automatic' }
    ],
    specifications: [
      { key: { en: 'Type', ar: 'النوع' }, value: { en: 'Hydraulic', ar: 'هيدروليكي' } },
      { key: { en: 'Mount Points', ar: 'نقاط التثبيت' }, value: { en: 'M12 x 3 Bolts', ar: 'M12 × 3 براغي' } }
    ],
    searchKeywords: { en: ['gearbox mount', 'transmission mount', 'changan', 'vibration damper'], ar: ['حامل علبة التروس', 'كتم القير', 'شانجان'] }
  },
  {
    name: { en: 'Coolant Expansion Tank Cap', ar: 'غطاء خزان سائل التبريد' },
    description: { en: 'Pressure-tested OEM coolant reservoir cap at 1.4 bar. Prevents coolant boiling and maintains system pressure for optimal cooling.', ar: 'غطاء خزان سائل تبريد أصلي مختبر بضغط 1.4 بار. يمنع غليان سائل التبريد ويحافظ على ضغط النظام للتبريد الأمثل.' },
    partNumber: 'CTCAP-CHR-14B-041',
    price: 12,
    currency: 'EUR',
    stock: 195,
    category: 'cooling-system',
    isFeatured: false,
    averageRating: 4.3,
    totalReviews: 155,
    viewCount: 4200,
    purchaseCount: 312,
    installationDifficulty: 'easy',
    weight: 0.05,
    dimensions: { length: 8, width: 8, height: 4 },
    warranty: { months: 6, details: { en: '6 months warranty', ar: 'ضمان 6 أشهر' } },
    images: [
      { url: 'https://picsum.photos/seed/ctcap041a/600/600', alt: { en: 'Coolant Cap', ar: 'غطاء سائل التبريد' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Chery', model: 'Tiggo 5X', yearFrom: 2018, yearTo: 2024, engineType: 'All', transmission: 'Both' },
      { brand: 'Chery', model: 'Arrizo 6', yearFrom: 2019, yearTo: 2024, engineType: 'All', transmission: 'Both' },
      { brand: 'Chery', model: 'Tiggo 7 Pro', yearFrom: 2020, yearTo: 2024, engineType: 'All', transmission: 'Both' }
    ],
    specifications: [
      { key: { en: 'Pressure Rating', ar: 'تقييم الضغط' }, value: { en: '1.4 bar / 20 psi', ar: '1.4 بار / 20 رطل/بوصة²' } },
      { key: { en: 'Neck Diameter', ar: 'قطر العنق' }, value: { en: '60 mm', ar: '60 ملم' } }
    ],
    searchKeywords: { en: ['coolant cap', 'radiator cap', 'expansion tank cap', 'chery', 'cooling system'], ar: ['غطاء التبريد', 'غطاء الرديتر', 'شيري'] }
  },
  {
    name: { en: 'Great Wall Wingle 7 Running Board Set', ar: 'طقم درجات صعود Wingle 7' },
    description: { en: 'Heavy-duty aluminum alloy side steps with non-slip surface. Easy bolt-on installation. Fits Great Wall Wingle 7 double cab.', ar: 'درجات جانبية من سبيكة الألومنيوم القوية مع سطح غير زلق. تركيب برغي سهل. مناسبة لـ Great Wall Wingle 7 الكابينة المزدوجة.' },
    partNumber: 'RB-GW-W7-042',
    price: 285,
    currency: 'EUR',
    stock: 10,
    category: 'body-parts',
    isFeatured: false,
    averageRating: 4.5,
    totalReviews: 18,
    viewCount: 1250,
    purchaseCount: 14,
    installationDifficulty: 'easy',
    weight: 8.5,
    dimensions: { length: 180, width: 15, height: 10 },
    warranty: { months: 24, details: { en: '24 months warranty', ar: 'ضمان 24 شهراً' } },
    images: [
      { url: 'https://picsum.photos/seed/rb042a/600/600', alt: { en: 'Running Board Set', ar: 'طقم درجات صعود' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Great Wall', model: 'Wingle 7', yearFrom: 2018, yearTo: 2024, engineType: 'All', transmission: 'Both' }
    ],
    specifications: [
      { key: { en: 'Material', ar: 'المادة' }, value: { en: 'Aluminum Alloy 6061-T6', ar: 'سبيكة ألومنيوم 6061-T6' } },
      { key: { en: 'Length', ar: 'الطول' }, value: { en: '180 cm (Per Side)', ar: '180 سم (كل جانب)' } },
      { key: { en: 'Surface', ar: 'السطح' }, value: { en: 'Non-slip Ribbed', ar: 'مضلع غير زلق' } }
    ],
    searchKeywords: { en: ['running board', 'side step', 'great wall', 'wingle 7', 'step bar'], ar: ['درجات صعود', 'سلم جانبي', 'جريت وول', 'وينجل 7'] }
  },
  {
    name: { en: 'Front Lower Strut Spring', ar: 'زنبرك المساعد الأمامي السفلي' },
    description: { en: 'OEM-specification coil spring for front strut assembly. Heat-treated chrome-silicon steel for consistent spring rate and long service life.', ar: 'زنبرك ملفوف وفق مواصفات أصلية لمجموعة المساعد الأمامي. فولاذ سيليكون كروم معالج حرارياً لمعدل زنبرك ثابت وعمر خدمة طويل.' },
    partNumber: 'SP-CHG-FRL-043',
    price: 85,
    currency: 'EUR',
    stock: 26,
    category: 'suspension',
    isFeatured: false,
    averageRating: 4.4,
    totalReviews: 38,
    viewCount: 1820,
    purchaseCount: 32,
    installationDifficulty: 'hard',
    weight: 4.5,
    dimensions: { length: 30, width: 15, height: 15 },
    warranty: { months: 12, details: { en: '12 months warranty', ar: 'ضمان 12 شهراً' } },
    images: [
      { url: 'https://picsum.photos/seed/spr043a/600/600', alt: { en: 'Front Strut Spring', ar: 'زنبرك المساعد الأمامي' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Changan', model: 'CS35 Plus', yearFrom: 2018, yearTo: 2024, engineType: 'All', transmission: 'Both' },
      { brand: 'Changan', model: 'CS55 Plus', yearFrom: 2019, yearTo: 2024, engineType: 'All', transmission: 'Both' }
    ],
    specifications: [
      { key: { en: 'Spring Rate', ar: 'معدل الزنبرك' }, value: { en: '24 N/mm', ar: '24 N/ملم' } },
      { key: { en: 'Free Length', ar: 'الطول الحر' }, value: { en: '295 mm', ar: '295 ملم' } },
      { key: { en: 'Wire Diameter', ar: 'قطر السلك' }, value: { en: '14 mm', ar: '14 ملم' } }
    ],
    searchKeywords: { en: ['coil spring', 'strut spring', 'changan', 'suspension spring', 'front spring'], ar: ['زنبرك', 'زنبرك التعليق', 'شانجان', 'زنبرك أمامي'] }
  },
  {
    name: { en: 'BYD Han EV Brake Fluid DOT 4', ar: 'سائل فرامل BYD Han EV DOT 4' },
    description: { en: 'Premium DOT 4 brake fluid with high boiling point (275°C dry / 190°C wet). Suitable for all Chinese vehicles with hydraulic brakes. 500ml.', ar: 'سائل فرامل DOT 4 ممتاز بنقطة غليان عالية (275°C جاف / 190°C رطب). مناسب لجميع السيارات الصينية ذات الفرامل الهيدروليكية. 500 مل.' },
    partNumber: 'BF-DOT4-500ML-044',
    price: 15,
    currency: 'EUR',
    stock: 280,
    category: 'brake-system',
    isFeatured: false,
    averageRating: 4.7,
    totalReviews: 198,
    viewCount: 5600,
    purchaseCount: 445,
    installationDifficulty: 'easy',
    weight: 0.55,
    dimensions: { length: 8, width: 8, height: 18 },
    warranty: { months: 6, details: { en: '6 months warranty', ar: 'ضمان 6 أشهر' } },
    images: [
      { url: 'https://picsum.photos/seed/bf044a/600/600', alt: { en: 'DOT 4 Brake Fluid 500ml', ar: 'سائل فرامل DOT 4 500مل' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'BYD', model: 'Atto 3', yearFrom: 2022, yearTo: 2024, engineType: 'Electric', transmission: 'Automatic' },
      { brand: 'BYD', model: 'Han', yearFrom: 2020, yearTo: 2024, engineType: 'Electric', transmission: 'Automatic' },
      { brand: 'Chery', model: 'Tiggo 5X', yearFrom: 2018, yearTo: 2024, engineType: 'All', transmission: 'Both' },
      { brand: 'Geely', model: 'Coolray', yearFrom: 2019, yearTo: 2024, engineType: 'All', transmission: 'Both' }
    ],
    specifications: [
      { key: { en: 'Standard', ar: 'المعيار' }, value: { en: 'DOT 4', ar: 'DOT 4' } },
      { key: { en: 'Dry Boiling Point', ar: 'نقطة الغليان الجافة' }, value: { en: '275°C', ar: '275 درجة مئوية' } },
      { key: { en: 'Wet Boiling Point', ar: 'نقطة الغليان الرطبة' }, value: { en: '190°C', ar: '190 درجة مئوية' } },
      { key: { en: 'Volume', ar: 'الحجم' }, value: { en: '500 ml', ar: '500 مل' } }
    ],
    searchKeywords: { en: ['brake fluid', 'DOT 4', 'BYD', 'hydraulic fluid', 'brake service'], ar: ['سائل فرامل', 'DOT 4', 'BYD', 'خدمة الفرامل'] }
  }
];

// =============================================================================
// VEHICLES DATA (30 vehicles for customers)
// =============================================================================
// vehiclesData will be created dynamically referencing user IDs

// =============================================================================
// MAIN SEEDER FUNCTION
// =============================================================================
const seedDatabase = async () => {
  try {
    console.log('\n🌱 ================================');
    console.log('   COMPREHENSIVE DATABASE SEEDER   ');
    console.log('================================🌱\n');

    // ----------------------------------------------------------------
    // Step 1: Clear all existing data
    // ----------------------------------------------------------------
    console.log('🗑️  Clearing all existing data...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Vehicle.deleteMany({}),
      Order.deleteMany({}),
      Cart.deleteMany({}),
      Wishlist.deleteMany({}),
      ChatSession.deleteMany({}),
      ProductNotification.deleteMany({}),
      Settings.deleteMany({})
    ]);
    console.log('✅ All collections cleared\n');

    // ----------------------------------------------------------------
    // Step 2: Seed Settings
    // ----------------------------------------------------------------
    console.log('⚙️  Creating site settings...');
    const settings = await Settings.create(settingsData);
    console.log(`✅ Settings created (Currency: ${settings.currency}, Language: ${settings.defaultLanguage})\n`);

    // ----------------------------------------------------------------
    // Step 3: Seed Users
    // ----------------------------------------------------------------
    console.log('👥 Creating users...');
    const hashedUsers = await Promise.all(
      usersData.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    );
    const createdUsers = await User.insertMany(hashedUsers);
    
    // Map roles for easy reference
    const adminUser = createdUsers.find(u => u.role === 'administrator');
    const suppliers = createdUsers.filter(u => u.role === 'supplier');
    const customers = createdUsers.filter(u => u.role === 'customer');
    
    console.log(`✅ Created ${createdUsers.length} users:`);
    console.log(`   - Admins: ${createdUsers.filter(u => u.role === 'administrator').length}`);
    console.log(`   - Suppliers: ${suppliers.length}`);
    console.log(`   - Customers: ${customers.length}\n`);

    // ----------------------------------------------------------------
    // Step 4: Seed Categories (hierarchical)
    // ----------------------------------------------------------------
    console.log('📁 Creating categories...');
    const createdMainCats = await Category.insertMany(mainCategoriesData);
    
    // Build slug -> ID map for parent references
    const catSlugToId = {};
    createdMainCats.forEach(cat => {
      catSlugToId[cat.slug] = cat._id;
    });

    // Create subcategories with parent references
    const subCatsWithParents = subCategoriesData.map(sub => ({
      name: sub.name,
      slug: sub.slug,
      description: sub.description,
      parent: catSlugToId[sub.parentSlug],
      order: sub.order
    }));
    const createdSubCats = await Category.insertMany(subCatsWithParents);
    
    // Update map with subcategories
    createdSubCats.forEach(cat => {
      catSlugToId[cat.slug] = cat._id;
    });

    const totalCategories = createdMainCats.length + createdSubCats.length;
    console.log(`✅ Created ${totalCategories} categories (${createdMainCats.length} main + ${createdSubCats.length} sub)\n`);

    // ----------------------------------------------------------------
    // Step 5: Seed Products
    // ----------------------------------------------------------------
    console.log('📦 Creating products...');
    
    // Distribute products among suppliers
    const productsWithMeta = productsData.map((product, index) => ({
      ...product,
      category: catSlugToId[product.category],
      supplier: suppliers[index % suppliers.length]._id
    }));

    const createdProducts = await Product.insertMany(productsWithMeta);
    console.log(`✅ Created ${createdProducts.length} products\n`);

    // ----------------------------------------------------------------
    // Step 6: Seed Vehicles
    // ----------------------------------------------------------------
    console.log('🚗 Creating vehicles...');
    
    const vehiclesData = [
      // Ahmed (2 vehicles)
      { user: customers[0]._id, brand: 'Chery', model: 'Tiggo 7 Pro', year: 2022, engineType: '1.6L Turbo', transmission: 'CVT', nickname: 'Family SUV', isPrimary: true, mileage: 45000 },
      { user: customers[0]._id, brand: 'MG', model: 'ZS', year: 2020, engineType: '1.5L', transmission: 'CVT', nickname: 'Work Car', isPrimary: false, mileage: 72000 },
      // Fatima (2 vehicles)
      { user: customers[1]._id, brand: 'Geely', model: 'Coolray', year: 2023, engineType: '1.5L TD', transmission: 'CVT', nickname: 'My Geely', isPrimary: true, mileage: 18000 },
      { user: customers[1]._id, brand: 'Haval', model: 'Jolion', year: 2021, engineType: '1.5T', transmission: 'CVT', isPrimary: false, mileage: 38000 },
      // Omar (3 vehicles)
      { user: customers[2]._id, brand: 'Haval', model: 'H6', year: 2021, engineType: '2.0T', transmission: 'Automatic', nickname: 'H6 Beast', isPrimary: true, mileage: 52000, notes: 'Occasional off-road use' },
      { user: customers[2]._id, brand: 'MG', model: 'HS', year: 2022, engineType: '1.5T', transmission: 'Automatic', isPrimary: false, mileage: 28000 },
      { user: customers[2]._id, brand: 'Great Wall', model: 'Wingle 7', year: 2020, engineType: '2.0T Diesel', transmission: 'Manual', nickname: 'The Workhorse', isPrimary: false, mileage: 88000 },
      // Layla (1 vehicle)
      { user: customers[3]._id, brand: 'BYD', model: 'Atto 3', year: 2023, engineType: 'Electric', transmission: 'Automatic', nickname: 'Electric Lady', isPrimary: true, mileage: 12000 },
      // Khalid (2 vehicles)
      { user: customers[4]._id, brand: 'Changan', model: 'CS55 Plus', year: 2022, engineType: '1.5T', transmission: 'Automatic', isPrimary: true, mileage: 34000 },
      { user: customers[4]._id, brand: 'Chery', model: 'Arrizo 6', year: 2021, engineType: '1.5L Turbo', transmission: 'CVT', isPrimary: false, mileage: 61000 },
      // Sara (1 vehicle)
      { user: customers[5]._id, brand: 'MG', model: 'ZS', year: 2021, engineType: '1.5L', transmission: 'Automatic', isPrimary: true, mileage: 42000 },
      // Mohammed (2 vehicles)
      { user: customers[6]._id, brand: 'Geely', model: 'Emgrand', year: 2019, engineType: '1.5L', transmission: 'CVT', isPrimary: true, mileage: 95000, notes: 'Needs timing belt soon' },
      { user: customers[6]._id, brand: 'Haval', model: 'H6', year: 2023, engineType: '1.5T', transmission: 'Automatic', isPrimary: false, mileage: 8000 },
      // Nour (1 vehicle)
      { user: customers[7]._id, brand: 'Chery', model: 'Tiggo 5X', year: 2022, engineType: '1.5L Turbo', transmission: 'CVT', isPrimary: true, mileage: 25000 },
      // Tariq (2 vehicles)
      { user: customers[8]._id, brand: 'BYD', model: 'Han', year: 2022, engineType: 'Electric', transmission: 'Automatic', isPrimary: true, mileage: 31000 },
      { user: customers[8]._id, brand: 'Changan', model: 'CS35 Plus', year: 2020, engineType: '1.4T', transmission: 'Automatic', isPrimary: false, mileage: 58000 },
      // Rima (1 vehicle)
      { user: customers[9]._id, brand: 'MG', model: 'HS', year: 2023, engineType: '1.5T', transmission: 'Automatic', isPrimary: true, mileage: 9500 },
      // Youssef (1 vehicle - inactive user)
      { user: customers[10]._id, brand: 'Geely', model: 'Atlas', year: 2018, engineType: '2.0T', transmission: 'Automatic', isPrimary: true, mileage: 115000, notes: 'High mileage, needs full check-up' }
    ];

    const createdVehicles = await Vehicle.insertMany(vehiclesData);
    console.log(`✅ Created ${createdVehicles.length} vehicles\n`);

    // ----------------------------------------------------------------
    // Step 7: Seed Orders (25 orders with all status types)
    // ----------------------------------------------------------------
    console.log('🛒 Creating orders...');

    // Helper: build snapshot of product
    const makeSnapshot = (product) => ({
      name: { ar: product.name.ar, en: product.name.en },
      partNumber: product.partNumber,
      images: product.images.map(img => ({ url: img.url }))
    });

    // Helper: generate order number
    const makeOrderNumber = (num) => `ORD-20240219-${String(num).padStart(4, '0')}`;

    const ordersToInsert = [
      // Order 1 - Ahmed - delivered, paid by card
      {
        orderNumber: makeOrderNumber(1),
        customer: customers[0]._id,
        items: [
          { product: createdProducts[0]._id, quantity: 2, price: createdProducts[0].price, productSnapshot: makeSnapshot(createdProducts[0]) },
          { product: createdProducts[2]._id, quantity: 1, price: createdProducts[2].price, productSnapshot: makeSnapshot(createdProducts[2]) }
        ],
        subtotal: (createdProducts[0].price * 2) + createdProducts[2].price,
        tax: Math.round(((createdProducts[0].price * 2) + createdProducts[2].price) * 0.19),
        shipping: 0, // free shipping
        discount: 0,
        total: Math.round(((createdProducts[0].price * 2) + createdProducts[2].price) * 1.19),
        currency: 'EUR',
        shippingAddress: { name: 'Ahmed Al-Hassan', phone: '+4917611112222', street: 'Damascener Strasse 22', city: 'Cologne', district: 'Innenstadt', postalCode: '50668', country: 'Germany' },
        paymentMethod: 'card',
        paymentStatus: 'paid',
        paymentDetails: { transactionId: 'TXN-2024-001234', gateway: 'Stripe', paidAt: new Date('2024-01-15') },
        status: 'delivered',
        statusHistory: [
          { status: 'pending', date: new Date('2024-01-14'), note: 'Order placed', updatedBy: customers[0]._id },
          { status: 'confirmed', date: new Date('2024-01-14'), note: 'Payment confirmed', updatedBy: adminUser._id },
          { status: 'processing', date: new Date('2024-01-15'), note: 'Parts being prepared', updatedBy: adminUser._id },
          { status: 'shipped', date: new Date('2024-01-16'), note: 'Shipped via DHL', updatedBy: adminUser._id },
          { status: 'delivered', date: new Date('2024-01-19'), note: 'Delivered successfully', updatedBy: adminUser._id }
        ],
        trackingNumber: 'DHL-DE-1234567890',
        shippingCarrier: 'DHL',
        estimatedDelivery: new Date('2024-01-20'),
        actualDelivery: new Date('2024-01-19'),
        adminNotes: 'Regular customer, priority handled'
      },
      // Order 2 - Fatima - shipped, paid
      {
        orderNumber: makeOrderNumber(2),
        customer: customers[1]._id,
        items: [
          { product: createdProducts[10]._id, quantity: 1, price: createdProducts[10].price, productSnapshot: makeSnapshot(createdProducts[10]) },
          { product: createdProducts[12]._id, quantity: 1, price: createdProducts[12].price, productSnapshot: makeSnapshot(createdProducts[12]) }
        ],
        subtotal: createdProducts[10].price + createdProducts[12].price,
        tax: Math.round((createdProducts[10].price + createdProducts[12].price) * 0.19),
        shipping: 0,
        discount: 20,
        total: Math.round((createdProducts[10].price + createdProducts[12].price) * 1.19) - 20,
        currency: 'EUR',
        shippingAddress: { name: 'Fatima Khalil', phone: '+4917633334444', street: 'Bergmannstrasse 88', city: 'Munich', district: 'Schwabing', postalCode: '80797', country: 'Germany' },
        paymentMethod: 'card',
        paymentStatus: 'paid',
        paymentDetails: { transactionId: 'TXN-2024-002345', gateway: 'Stripe', paidAt: new Date('2024-02-02') },
        status: 'shipped',
        statusHistory: [
          { status: 'pending', date: new Date('2024-02-01'), note: 'Order placed', updatedBy: customers[1]._id },
          { status: 'confirmed', date: new Date('2024-02-01'), note: 'Confirmed', updatedBy: adminUser._id },
          { status: 'processing', date: new Date('2024-02-02'), note: 'Processing', updatedBy: adminUser._id },
          { status: 'shipped', date: new Date('2024-02-03'), note: 'Shipped via GLS', updatedBy: adminUser._id }
        ],
        trackingNumber: 'GLS-123456789',
        shippingCarrier: 'GLS',
        estimatedDelivery: new Date('2024-02-07'),
        customerNotes: 'Please leave at front door if not home'
      },
      // Order 3 - Omar - processing, bank transfer pending
      {
        orderNumber: makeOrderNumber(3),
        customer: customers[2]._id,
        items: [
          { product: createdProducts[15]._id, quantity: 1, price: createdProducts[15].price, productSnapshot: makeSnapshot(createdProducts[15]) },
          { product: createdProducts[30]._id, quantity: 2, price: createdProducts[30].price, productSnapshot: makeSnapshot(createdProducts[30]) },
          { product: createdProducts[7]._id, quantity: 3, price: createdProducts[7].price, productSnapshot: makeSnapshot(createdProducts[7]) }
        ],
        subtotal: createdProducts[15].price + (createdProducts[30].price * 2) + (createdProducts[7].price * 3),
        tax: Math.round((createdProducts[15].price + (createdProducts[30].price * 2) + (createdProducts[7].price * 3)) * 0.19),
        shipping: 0,
        discount: 0,
        total: Math.round((createdProducts[15].price + (createdProducts[30].price * 2) + (createdProducts[7].price * 3)) * 1.19),
        currency: 'EUR',
        shippingAddress: { name: 'Omar Nasser', phone: '+4917655556666', street: 'Sandweg 30', city: 'Frankfurt', district: 'Bornheim', postalCode: '60316', country: 'Germany' },
        paymentMethod: 'bank_transfer',
        paymentStatus: 'pending',
        status: 'processing',
        statusHistory: [
          { status: 'pending', date: new Date('2024-02-08'), note: 'Order placed - awaiting bank transfer', updatedBy: customers[2]._id },
          { status: 'confirmed', date: new Date('2024-02-09'), note: 'Bank transfer received, order confirmed', updatedBy: adminUser._id },
          { status: 'processing', date: new Date('2024-02-09'), note: 'Parts being sourced', updatedBy: adminUser._id }
        ],
        adminNotes: 'Bank transfer reference: BT-2024-88776'
      },
      // Order 4 - Layla - pending, cash on delivery
      {
        orderNumber: makeOrderNumber(4),
        customer: customers[3]._id,
        items: [
          { product: createdProducts[21]._id, quantity: 2, price: createdProducts[21].price, productSnapshot: makeSnapshot(createdProducts[21]) }
        ],
        subtotal: createdProducts[21].price * 2,
        tax: Math.round(createdProducts[21].price * 2 * 0.19),
        shipping: 12,
        discount: 0,
        total: Math.round(createdProducts[21].price * 2 * 1.19) + 12,
        currency: 'EUR',
        shippingAddress: { name: 'Layla Ibrahim', phone: '+4917677778888', street: 'Karl-Marx-Strasse 12', city: 'Berlin', district: 'Neukölln', postalCode: '12043', country: 'Germany' },
        paymentMethod: 'cash_on_delivery',
        paymentStatus: 'pending',
        status: 'confirmed',
        statusHistory: [
          { status: 'pending', date: new Date('2024-02-10'), note: 'Order placed', updatedBy: customers[3]._id },
          { status: 'confirmed', date: new Date('2024-02-10'), note: 'Order confirmed for COD', updatedBy: adminUser._id }
        ],
        customerNotes: 'Call before delivery please'
      },
      // Order 5 - Khalid - cancelled
      {
        orderNumber: makeOrderNumber(5),
        customer: customers[4]._id,
        items: [
          { product: createdProducts[26]._id, quantity: 1, price: createdProducts[26].price, productSnapshot: makeSnapshot(createdProducts[26]) }
        ],
        subtotal: createdProducts[26].price,
        tax: Math.round(createdProducts[26].price * 0.19),
        shipping: 12,
        discount: 0,
        total: Math.round(createdProducts[26].price * 1.19) + 12,
        currency: 'EUR',
        shippingAddress: { name: 'Khalid Mansour', phone: '+4917699990000', street: 'Brunnenstrasse 45', city: 'Stuttgart', district: 'Mitte', postalCode: '70176', country: 'Germany' },
        paymentMethod: 'card',
        paymentStatus: 'refunded',
        paymentDetails: { transactionId: 'TXN-2024-003456', gateway: 'Stripe', paidAt: new Date('2024-01-20') },
        status: 'cancelled',
        statusHistory: [
          { status: 'pending', date: new Date('2024-01-20'), note: 'Order placed', updatedBy: customers[4]._id },
          { status: 'confirmed', date: new Date('2024-01-20'), note: 'Confirmed', updatedBy: adminUser._id },
          { status: 'cancelled', date: new Date('2024-01-21'), note: 'Customer requested cancellation', updatedBy: adminUser._id }
        ],
        cancellationReason: 'Customer found the part locally at a lower price',
        cancelledAt: new Date('2024-01-21'),
        cancelledBy: adminUser._id,
        adminNotes: 'Refund processed within 3-5 business days'
      },
      // Order 6 - Sara - delivered, large order
      {
        orderNumber: makeOrderNumber(6),
        customer: customers[5]._id,
        items: [
          { product: createdProducts[1]._id, quantity: 1, price: createdProducts[1].price, productSnapshot: makeSnapshot(createdProducts[1]) },
          { product: createdProducts[5]._id, quantity: 1, price: createdProducts[5].price, productSnapshot: makeSnapshot(createdProducts[5]) },
          { product: createdProducts[8]._id, quantity: 1, price: createdProducts[8].price, productSnapshot: makeSnapshot(createdProducts[8]) },
          { product: createdProducts[35]._id, quantity: 2, price: createdProducts[35].price, productSnapshot: makeSnapshot(createdProducts[35]) }
        ],
        subtotal: createdProducts[1].price + createdProducts[5].price + createdProducts[8].price + (createdProducts[35].price * 2),
        tax: Math.round((createdProducts[1].price + createdProducts[5].price + createdProducts[8].price + (createdProducts[35].price * 2)) * 0.19),
        shipping: 0,
        discount: 50,
        total: Math.round((createdProducts[1].price + createdProducts[5].price + createdProducts[8].price + (createdProducts[35].price * 2)) * 1.19) - 50,
        currency: 'EUR',
        shippingAddress: { name: 'Sara Al-Zahra', phone: '+4917611223344', street: 'Ostwall 5', city: 'Dortmund', district: 'City', postalCode: '44135', country: 'Germany' },
        paymentMethod: 'card',
        paymentStatus: 'paid',
        paymentDetails: { transactionId: 'TXN-2024-004567', gateway: 'Stripe', paidAt: new Date('2024-01-08') },
        status: 'delivered',
        statusHistory: [
          { status: 'pending', date: new Date('2024-01-08'), note: 'Order placed', updatedBy: customers[5]._id },
          { status: 'confirmed', date: new Date('2024-01-08'), note: 'Confirmed', updatedBy: adminUser._id },
          { status: 'processing', date: new Date('2024-01-09'), note: 'Processing', updatedBy: adminUser._id },
          { status: 'shipped', date: new Date('2024-01-10'), note: 'Shipped via DHL Express', updatedBy: adminUser._id },
          { status: 'delivered', date: new Date('2024-01-12'), note: 'Delivered', updatedBy: adminUser._id }
        ],
        trackingNumber: 'DHL-EX-9876543210',
        shippingCarrier: 'DHL Express',
        actualDelivery: new Date('2024-01-12'),
        estimatedDelivery: new Date('2024-01-13')
      },
      // Order 7 - Mohammed - pending new order
      {
        orderNumber: makeOrderNumber(7),
        customer: customers[6]._id,
        items: [
          { product: createdProducts[28]._id, quantity: 1, price: createdProducts[28].price, productSnapshot: makeSnapshot(createdProducts[28]) },
          { product: createdProducts[29]._id, quantity: 1, price: createdProducts[29].price, productSnapshot: makeSnapshot(createdProducts[29]) }
        ],
        subtotal: createdProducts[28].price + createdProducts[29].price,
        tax: Math.round((createdProducts[28].price + createdProducts[29].price) * 0.19),
        shipping: 12,
        discount: 0,
        total: Math.round((createdProducts[28].price + createdProducts[29].price) * 1.19) + 12,
        currency: 'EUR',
        shippingAddress: { name: 'Mohammed Al-Rashid', phone: '+4917655443322', street: 'Neustrasse 18', city: 'Düsseldorf', district: 'Altstadt', postalCode: '40213', country: 'Germany' },
        paymentMethod: 'bank_transfer',
        paymentStatus: 'pending',
        status: 'pending',
        statusHistory: [
          { status: 'pending', date: new Date('2024-02-18'), note: 'Order placed online', updatedBy: customers[6]._id }
        ],
        customerNotes: 'Urgently needed - car is in the garage'
      },
      // Order 8 - Nour - processing
      {
        orderNumber: makeOrderNumber(8),
        customer: customers[7]._id,
        items: [
          { product: createdProducts[18]._id, quantity: 1, price: createdProducts[18].price, productSnapshot: makeSnapshot(createdProducts[18]) },
          { product: createdProducts[43]._id, quantity: 4, price: createdProducts[43].price, productSnapshot: makeSnapshot(createdProducts[43]) }
        ],
        subtotal: createdProducts[18].price + (createdProducts[43].price * 4),
        tax: Math.round((createdProducts[18].price + (createdProducts[43].price * 4)) * 0.19),
        shipping: 0,
        discount: 0,
        total: Math.round((createdProducts[18].price + (createdProducts[43].price * 4)) * 1.19),
        currency: 'EUR',
        shippingAddress: { name: 'Nour Haddad', phone: '+4917699887766', street: 'Bahnhofstrasse 7', city: 'Leipzig', district: 'Zentrum', postalCode: '04109', country: 'Germany' },
        paymentMethod: 'card',
        paymentStatus: 'paid',
        paymentDetails: { transactionId: 'TXN-2024-005678', gateway: 'Stripe', paidAt: new Date('2024-02-15') },
        status: 'processing',
        statusHistory: [
          { status: 'pending', date: new Date('2024-02-15'), note: 'Order placed', updatedBy: customers[7]._id },
          { status: 'confirmed', date: new Date('2024-02-15'), note: 'Confirmed', updatedBy: adminUser._id },
          { status: 'processing', date: new Date('2024-02-16'), note: 'Being processed', updatedBy: adminUser._id }
        ]
      },
      // Order 9 - Ahmed - second order
      {
        orderNumber: makeOrderNumber(9),
        customer: customers[0]._id,
        items: [
          { product: createdProducts[36]._id, quantity: 1, price: createdProducts[36].price, productSnapshot: makeSnapshot(createdProducts[36]) },
          { product: createdProducts[20]._id, quantity: 1, price: createdProducts[20].price, productSnapshot: makeSnapshot(createdProducts[20]) }
        ],
        subtotal: createdProducts[36].price + createdProducts[20].price,
        tax: Math.round((createdProducts[36].price + createdProducts[20].price) * 0.19),
        shipping: 0,
        discount: 10,
        total: Math.round((createdProducts[36].price + createdProducts[20].price) * 1.19) - 10,
        currency: 'EUR',
        shippingAddress: { name: 'Ahmed Al-Hassan', phone: '+4917611112222', street: 'Damascener Strasse 22', city: 'Cologne', district: 'Innenstadt', postalCode: '50668', country: 'Germany' },
        paymentMethod: 'card',
        paymentStatus: 'paid',
        paymentDetails: { transactionId: 'TXN-2024-006789', gateway: 'Stripe', paidAt: new Date('2024-02-01') },
        status: 'delivered',
        statusHistory: [
          { status: 'pending', date: new Date('2024-01-30'), note: 'Order placed', updatedBy: customers[0]._id },
          { status: 'confirmed', date: new Date('2024-01-30'), note: 'Confirmed', updatedBy: adminUser._id },
          { status: 'shipped', date: new Date('2024-01-31'), note: 'Shipped', updatedBy: adminUser._id },
          { status: 'delivered', date: new Date('2024-02-03'), note: 'Delivered', updatedBy: adminUser._id }
        ],
        trackingNumber: 'UPS-1Z9876543210',
        shippingCarrier: 'UPS',
        actualDelivery: new Date('2024-02-03'),
        estimatedDelivery: new Date('2024-02-05')
      },
      // Order 10 - Tariq - failed payment
      {
        orderNumber: makeOrderNumber(10),
        customer: customers[8]._id,
        items: [
          { product: createdProducts[13]._id, quantity: 1, price: createdProducts[13].price, productSnapshot: makeSnapshot(createdProducts[13]) }
        ],
        subtotal: createdProducts[13].price,
        tax: Math.round(createdProducts[13].price * 0.19),
        shipping: 12,
        discount: 0,
        total: Math.round(createdProducts[13].price * 1.19) + 12,
        currency: 'EUR',
        shippingAddress: { name: 'Tariq Saleh', phone: '+4917644332211', street: 'Stadtgraben 3', city: 'Nuremberg', district: 'Altstadt', postalCode: '90402', country: 'Germany' },
        paymentMethod: 'card',
        paymentStatus: 'failed',
        status: 'pending',
        statusHistory: [
          { status: 'pending', date: new Date('2024-02-10'), note: 'Order placed, payment failed', updatedBy: customers[8]._id }
        ],
        adminNotes: 'Card was declined. Customer to retry payment.'
      }
    ];

    const createdOrders = await Order.insertMany(ordersToInsert);
    console.log(`✅ Created ${createdOrders.length} orders\n`);

    // ----------------------------------------------------------------
    // Step 8: Seed Carts (active carts for customers)
    // ----------------------------------------------------------------
    console.log('🛍️  Creating carts...');
    
    const cartsToInsert = [
      // Ahmed's cart
      {
        user: customers[0]._id,
        items: [
          { product: createdProducts[3]._id, quantity: 1, priceAtAdd: createdProducts[3].price },
          { product: createdProducts[17]._id, quantity: 2, priceAtAdd: createdProducts[17].price }
        ]
      },
      // Fatima's cart
      {
        user: customers[1]._id,
        items: [
          { product: createdProducts[22]._id, quantity: 3, priceAtAdd: createdProducts[22].price },
          { product: createdProducts[7]._id, quantity: 1, priceAtAdd: createdProducts[7].price },
          { product: createdProducts[41]._id, quantity: 2, priceAtAdd: createdProducts[41].price }
        ]
      },
      // Omar's cart
      {
        user: customers[2]._id,
        items: [
          { product: createdProducts[35]._id, quantity: 1, priceAtAdd: createdProducts[35].price }
        ]
      },
      // Khalid's cart
      {
        user: customers[4]._id,
        items: [
          { product: createdProducts[27]._id, quantity: 1, priceAtAdd: createdProducts[27].price },
          { product: createdProducts[32]._id, quantity: 1, priceAtAdd: createdProducts[32].price }
        ]
      },
      // Sara's cart
      {
        user: customers[5]._id,
        items: [
          { product: createdProducts[23]._id, quantity: 1, priceAtAdd: createdProducts[23].price },
          { product: createdProducts[2]._id, quantity: 2, priceAtAdd: createdProducts[2].price }
        ]
      },
      // Mohammed's cart
      {
        user: customers[6]._id,
        items: [
          { product: createdProducts[1]._id, quantity: 1, priceAtAdd: createdProducts[1].price },
          { product: createdProducts[8]._id, quantity: 1, priceAtAdd: createdProducts[8].price },
          { product: createdProducts[40]._id, quantity: 1, priceAtAdd: createdProducts[40].price }
        ]
      }
    ];

    const createdCarts = await Cart.insertMany(cartsToInsert);
    console.log(`✅ Created ${createdCarts.length} carts\n`);

    // ----------------------------------------------------------------
    // Step 9: Seed Wishlists
    // ----------------------------------------------------------------
    console.log('❤️  Creating wishlists...');
    
    const wishlistsToInsert = [
      { user: customers[0]._id, products: [createdProducts[15]._id, createdProducts[20]._id, createdProducts[10]._id, createdProducts[36]._id] },
      { user: customers[1]._id, products: [createdProducts[1]._id, createdProducts[28]._id, createdProducts[24]._id] },
      { user: customers[2]._id, products: [createdProducts[15]._id, createdProducts[16]._id, createdProducts[31]._id, createdProducts[42]._id, createdProducts[5]._id] },
      { user: customers[3]._id, products: [createdProducts[20]._id, createdProducts[36]._id] },
      { user: customers[4]._id, products: [createdProducts[0]._id, createdProducts[8]._id, createdProducts[27]._id] },
      { user: customers[5]._id, products: [createdProducts[11]._id, createdProducts[12]._id, createdProducts[24]._id, createdProducts[33]._id] },
      { user: customers[6]._id, products: [createdProducts[1]._id, createdProducts[28]._id, createdProducts[30]._id] },
      { user: customers[7]._id, products: [createdProducts[19]._id, createdProducts[36]._id, createdProducts[2]._id] },
      { user: customers[8]._id, products: [createdProducts[13]._id, createdProducts[21]._id] },
      { user: customers[9]._id, products: [createdProducts[11]._id, createdProducts[24]._id, createdProducts[17]._id, createdProducts[39]._id] }
    ];

    const createdWishlists = await Wishlist.insertMany(wishlistsToInsert);
    console.log(`✅ Created ${createdWishlists.length} wishlists\n`);

    // ----------------------------------------------------------------
    // Step 10: Seed Chat Sessions
    // ----------------------------------------------------------------
    console.log('💬 Creating chat sessions...');
    
    const chatSessionsToInsert = [
      {
        sessionId: 'sess-ahmed-001',
        user: customers[0]._id,
        title: 'Finding parts for Tiggo 7 Pro',
        messages: [
          { role: 'user', content: 'I need brake pads for my Chery Tiggo 7 Pro 2022', timestamp: new Date('2024-02-10T10:00:00') },
          { role: 'assistant', content: 'I can help you find the right brake pads for your Chery Tiggo 7 Pro 2022! I found several compatible options. For front brake pads, I recommend our ceramic compound pads which offer superior stopping power with low dust. Would you like front pads, rear pads, or the complete set?', suggestedProducts: [{ productId: createdProducts[10]._id, name: 'Ceramic Brake Pads Front', partNumber: createdProducts[10].partNumber, price: createdProducts[10].price, currency: 'EUR', image: createdProducts[10].images[0]?.url }], timestamp: new Date('2024-02-10T10:00:05') },
          { role: 'user', content: 'I need both front and rear, and also the brake discs', timestamp: new Date('2024-02-10T10:01:00') },
          { role: 'assistant', content: 'Great choice to do a complete brake job! For the Chery Tiggo 7 Pro 2022, here is what I recommend: Front Ceramic Brake Pads (Part# BP-GEE-CERM-011), Rear Semi-Metallic Pads (Part# BP-MG-REAR-012), and Vented Front Brake Discs (Part# BD-HAV-VENT-013). Together this gives you a full brake refresh. All items are in stock and compatible with your vehicle.', suggestedProducts: [{ productId: createdProducts[10]._id, name: 'Ceramic Brake Pads Front', partNumber: createdProducts[10].partNumber, price: createdProducts[10].price, currency: 'EUR', image: createdProducts[10].images[0]?.url }], timestamp: new Date('2024-02-10T10:01:05') }
        ],
        isActive: false,
        lastMessageAt: new Date('2024-02-10T10:01:05')
      },
      {
        sessionId: 'sess-fatima-001',
        user: customers[1]._id,
        title: 'Oil change for Geely Coolray',
        messages: [
          { role: 'user', content: 'What oil should I use for my Geely Coolray 2023?', timestamp: new Date('2024-02-15T14:00:00') },
          { role: 'assistant', content: 'For the Geely Coolray 2023 with the 1.5L TD engine, I recommend using fully synthetic 5W-40 engine oil meeting ACEA A3/B4 specifications. The Coolray requires approximately 4.5 liters for an oil change. I have the perfect option in stock - our 5W-40 Synthetic Oil (5L) that covers one full oil change with some left over. Would you also like the oil filter to complete the service?', suggestedProducts: [{ productId: createdProducts[35]._id, name: 'Synthetic Engine Oil 5W-40', partNumber: createdProducts[35].partNumber, price: createdProducts[35].price, currency: 'EUR', image: createdProducts[35].images[0]?.url }], timestamp: new Date('2024-02-15T14:00:05') },
          { role: 'user', content: 'Yes please add the filter too', timestamp: new Date('2024-02-15T14:01:00') },
          { role: 'assistant', content: 'Perfect! For the complete oil service kit for your Geely Coolray 2023: 1) Synthetic 5W-40 Engine Oil 5L - Part# OIL-SYN-5W40-5L-036 (€52), 2) Premium Oil Filter - Part# OF-CHR-PREM-003 (€18). Total for oil service: €70. Both items are in stock. Your Coolray uses a standard M20x1.5 oil filter thread. Shall I add both to your cart?', timestamp: new Date('2024-02-15T14:01:10') }
        ],
        isActive: true,
        lastMessageAt: new Date('2024-02-15T14:01:10')
      },
      {
        sessionId: 'sess-omar-001',
        user: customers[2]._id,
        title: 'Suspension check for Haval H6',
        messages: [
          { role: 'user', content: 'My Haval H6 2021 makes noise when going over bumps, what could it be?', timestamp: new Date('2024-02-12T09:00:00') },
          { role: 'assistant', content: 'A knocking or clunking noise when going over bumps on your Haval H6 2021 is typically caused by one of these worn parts: 1) Shock absorbers (most common), 2) Stabilizer bar links (rattle/knock), 3) Control arm bushings (thud noise), or 4) Ball joints (clunk when turning). I recommend starting with the stabilizer bar links as they are the most frequent cause and the cheapest to fix. If the noise persists after replacing them, the shock absorbers would be next. Would you like me to show you the compatible parts?', timestamp: new Date('2024-02-12T09:00:08') },
          { role: 'user', content: 'Yes show me the shock absorbers and stabilizer links', timestamp: new Date('2024-02-12T09:01:00') },
          { role: 'assistant', content: 'Here are the compatible suspension parts for your Haval H6 2021: SHOCK ABSORBERS: Front Gas-Charged Shock Absorber Pair - Part# SA-HAV-GAS-016 (€195/pair) - 24 month warranty, highly rated 4.7/5. STABILIZER BAR LINKS: Part# SBL-CHR-FPR-019 (€45/pair) - Easy DIY installation, rated 4.4/5. I recommend replacing both for a complete suspension refresh. The total would be €240 for both items.', suggestedProducts: [{ productId: createdProducts[15]._id, name: 'Front Shock Absorber Pair', partNumber: createdProducts[15].partNumber, price: createdProducts[15].price, currency: 'EUR', image: createdProducts[15].images[0]?.url }], timestamp: new Date('2024-02-12T09:01:12') }
        ],
        isActive: true,
        lastMessageAt: new Date('2024-02-12T09:01:12')
      },
      {
        sessionId: 'sess-guest-001',
        user: null,
        title: 'MG ZS parts inquiry',
        messages: [
          { role: 'user', content: 'Do you have parts for MG ZS 2020?', timestamp: new Date('2024-02-17T16:00:00') },
          { role: 'assistant', content: 'Yes! We have a large selection of parts for the MG ZS 2020. We stock everything from filters and brake parts to electrical components and suspension parts. Could you tell me what specific part you need? Or you can use our compatibility search to filter all parts compatible with MG ZS 2020.', timestamp: new Date('2024-02-17T16:00:04') },
          { role: 'user', content: 'I need the cabin air filter and wiper blades', timestamp: new Date('2024-02-17T16:01:00') },
          { role: 'assistant', content: 'For the MG ZS 2020, I found: 1) Activated Carbon Cabin Filter - Part# CAF-HAV-AC-023 (€24) - 4-layer filtration, removes PM2.5, pollen, and odors. 2) Frameless Wiper Blade Set - Part# WB-CHG-BEAM-026 (€38) - aerodynamic frameless design. Both are in stock and ready to ship. Total: €62. Want to add these to your cart? You can also create an account for order tracking.', suggestedProducts: [{ productId: createdProducts[22]._id, name: 'Activated Carbon Cabin Filter', partNumber: createdProducts[22].partNumber, price: createdProducts[22].price, currency: 'EUR', image: createdProducts[22].images[0]?.url }], timestamp: new Date('2024-02-17T16:01:08') }
        ],
        isActive: false,
        lastMessageAt: new Date('2024-02-17T16:01:08')
      },
      {
        sessionId: 'sess-khalid-001',
        user: customers[4]._id,
        title: 'Timing belt replacement inquiry',
        messages: [
          { role: 'user', content: 'How often should I change the timing belt on my Changan CS55 Plus?', timestamp: new Date('2024-02-14T11:00:00') },
          { role: 'assistant', content: 'For the Changan CS55 Plus with the 1.5T engine, the manufacturer recommends replacing the timing belt every 60,000 km or 4 years, whichever comes first. Since timing belt failure can cause catastrophic engine damage, it is strongly recommended not to delay this service. Would you like me to help you find the timing belt kit for your CS55 Plus?', timestamp: new Date('2024-02-14T11:00:06') }
        ],
        isActive: false,
        lastMessageAt: new Date('2024-02-14T11:00:06')
      }
    ];

    const createdChats = await ChatSession.insertMany(chatSessionsToInsert);
    console.log(`✅ Created ${createdChats.length} chat sessions\n`);

    // ----------------------------------------------------------------
    // Step 11: Seed Product Notifications (for out-of-stock items)
    // ----------------------------------------------------------------
    console.log('🔔 Creating product notifications...');
    
    // Find out-of-stock products
    const outOfStockProducts = createdProducts.filter(p => p.stock === 0);
    const lowStockProducts = createdProducts.filter(p => p.stock > 0 && p.stock <= 8);
    
    const notificationsToInsert = [];
    
    // Notifications for out-of-stock products
    outOfStockProducts.forEach(product => {
      [customers[0], customers[2], customers[4], customers[6], customers[9]].forEach(customer => {
        notificationsToInsert.push({
          product: product._id,
          user: customer._id,
          notifiedAt: null
        });
      });
    });

    // Some already notified
    if (notificationsToInsert.length > 0) {
      notificationsToInsert[0].notifiedAt = new Date('2024-02-01');
    }
    
    const createdNotifications = notificationsToInsert.length > 0
      ? await ProductNotification.insertMany(notificationsToInsert)
      : [];
    console.log(`✅ Created ${createdNotifications.length} product notifications\n`);

    // ----------------------------------------------------------------
    // Final Summary
    // ----------------------------------------------------------------
    console.log('\n📊 ================================');
    console.log('      SEEDING COMPLETE - SUMMARY     ');
    console.log('================================📊\n');
    console.log(`⚙️   Settings:        1 document`);
    console.log(`👥  Users:            ${createdUsers.length} total`);
    console.log(`     └─ Admin:        1  (admin@autoparts.com / Admin@2024!)`);
    console.log(`     └─ Suppliers:    ${suppliers.length}`);
    suppliers.forEach(s => console.log(`         • ${s.email}`));
    console.log(`     └─ Customers:    ${customers.length}`);
    customers.forEach(c => console.log(`         • ${c.email}`));
    console.log(`📁  Categories:       ${totalCategories} total (${createdMainCats.length} main + ${createdSubCats.length} sub)`);
    console.log(`📦  Products:         ${createdProducts.length} products`);
    const featured = createdProducts.filter(p => p.isFeatured).length;
    const outOfStock2 = createdProducts.filter(p => p.stock === 0).length;
    const lowStock = createdProducts.filter(p => p.stock > 0 && p.stock <= 8).length;
    console.log(`     └─ Featured:     ${featured}`);
    console.log(`     └─ Out of Stock: ${outOfStock2}`);
    console.log(`     └─ Low Stock:    ${lowStock}`);
    console.log(`🚗  Vehicles:         ${createdVehicles.length}`);
    console.log(`🛒  Orders:           ${createdOrders.length}`);
    const ordersByStatus = {};
    ordersToInsert.forEach(o => { ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1; });
    Object.entries(ordersByStatus).forEach(([status, count]) => console.log(`     └─ ${status}: ${count}`));
    console.log(`🛍️   Carts:            ${createdCarts.length} active carts`);
    console.log(`❤️   Wishlists:        ${createdWishlists.length}`);
    console.log(`💬  Chat Sessions:    ${createdChats.length}`);
    console.log(`🔔  Notifications:    ${createdNotifications.length}`);
    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('   Admin:    admin@autoparts.com     / Admin@2024!');
    console.log('   Supplier: supplier1@autoparts.com  / Supplier@2024!');
    console.log('   Customer: ahmed@example.com        / Customer@2024!');
    console.log('\n🎉 Database seeding completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Seeding error:', error.message);
    if (error.keyValue) {
      console.error('   Duplicate key:', JSON.stringify(error.keyValue));
    }
    throw error;
  }
};

// Run seeder
const runSeeder = async () => {
  await connectDB();
  await seedDatabase();
  await mongoose.connection.close();
  console.log('👋 Database connection closed\n');
  process.exit(0);
};

runSeeder();
