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
  siteName: 'EV Auto Parts',
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
    name: 'EV Drive Systems Europe',
    email: 'supplier2@autoparts.com',
    password: 'Supplier@2024!',
    phone: '+4915198765432',
    role: 'supplier',
    isEmailVerified: true,
    isActive: true,
    language: 'en',
    businessName: 'EV Drive Systems Europe',
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
// CATEGORIES (9 main + 17 subcategories)
// =============================================================================
const mainCategoriesData = [
  {
    name: { en: 'Battery & Energy Storage', ar: 'البطارية وتخزين الطاقة' },
    slug: 'battery-energy',
    description: {
      en: 'High-voltage modules, 12V auxiliary batteries, and energy storage parts',
      ar: 'وحدات الجهد العالي وبطاريات 12 فولت المساعدة وقطع تخزين الطاقة'
    },
    order: 1,
    image: { url: 'https://picsum.photos/seed/battery-energy/400/300', alt: { en: 'Battery category', ar: 'فئة البطارية' } }
  },
  {
    name: { en: 'Charging Equipment', ar: 'معدات الشحن' },
    slug: 'charging',
    description: {
      en: 'Wallboxes, AC/DC cables, charge ports, and onboard chargers',
      ar: 'صناديق الشحن الجدارية وكابلات التيار وكابلات الشحن السريع ومنافذ الشحن'
    },
    order: 2,
    image: { url: 'https://picsum.photos/seed/charging/400/300', alt: { en: 'Charging category', ar: 'فئة الشحن' } }
  },
  {
    name: { en: 'Electric Drive', ar: 'الدفع الكهربائي' },
    slug: 'electric-drive',
    description: {
      en: 'Drive motors, inverters, and power electronics',
      ar: 'محركات الدفع والعاكسات وإلكترونيات القدرة'
    },
    order: 3,
    image: { url: 'https://picsum.photos/seed/electric-drive/400/300', alt: { en: 'Electric drive category', ar: 'فئة الدفع الكهربائي' } }
  },
  {
    name: { en: 'Thermal Management', ar: 'الإدارة الحرارية' },
    slug: 'thermal',
    description: {
      en: 'Battery coolant pumps, heat pumps, and EV thermal parts',
      ar: 'مضخات تبريد البطارية والمضخات الحرارية وقطع التبريد للسيارات الكهربائية'
    },
    order: 4,
    image: { url: 'https://picsum.photos/seed/thermal/400/300', alt: { en: 'Thermal category', ar: 'فئة التبريد' } }
  },
  {
    name: { en: 'Brakes', ar: 'الفرامل' },
    slug: 'brakes',
    description: {
      en: 'EV-rated brake pads, discs, and regenerative braking support parts',
      ar: 'فحمات وأقراص فرامل مخصصة للسيارات الكهربائية ودعم الفرملة الاسترجاعية'
    },
    order: 5,
    image: { url: 'https://picsum.photos/seed/brakes/400/300', alt: { en: 'Brakes category', ar: 'فئة الفرامل' } }
  },
  {
    name: { en: 'Suspension & Tires', ar: 'التعليق والإطارات' },
    slug: 'suspension-tires',
    description: {
      en: 'EV shock absorbers and low-rolling-resistance tires',
      ar: 'مساعدات صدمات وإطارات منخفضة المقاومة للسيارات الكهربائية'
    },
    order: 6,
    image: { url: 'https://picsum.photos/seed/suspension-tires/400/300', alt: { en: 'Suspension category', ar: 'فئة التعليق' } }
  },
  {
    name: { en: 'Sensors, Cameras & ADAS', ar: 'الحساسات والكاميرات وأنظمة المساعدة' },
    slug: 'sensors-adas',
    description: {
      en: 'Cameras, parking sensors, radar, and ADAS modules',
      ar: 'الكاميرات وحساسات الركن والرادار ووحدات أنظمة المساعدة'
    },
    order: 7,
    image: { url: 'https://picsum.photos/seed/sensors-adas/400/300', alt: { en: 'Sensors category', ar: 'فئة الحساسات' } }
  },
  {
    name: { en: 'Cabin Electronics', ar: 'إلكترونيات المقصورة' },
    slug: 'cabin-electronics',
    description: {
      en: 'Cabin filters, infotainment, and interior electronics',
      ar: 'فلاتر المقصورة وأنظمة المعلومات والترفيه وإلكترونيات الداخلية'
    },
    order: 8,
    image: { url: 'https://picsum.photos/seed/cabin-electronics/400/300', alt: { en: 'Cabin electronics category', ar: 'فئة إلكترونيات المقصورة' } }
  },
  {
    name: { en: 'Body & Exterior', ar: 'الهيكل والخارج' },
    slug: 'body-exterior',
    description: {
      en: 'Mirrors, lights, charge doors, and exterior trim',
      ar: 'المرايا والأضواء وأبواب الشحن والقطع الخارجية'
    },
    order: 9,
    image: { url: 'https://picsum.photos/seed/body-exterior/400/300', alt: { en: 'Body category', ar: 'فئة الهيكل' } }
  }
];

const subCategoriesData = [
  { name: { en: 'Battery Modules', ar: 'وحدات البطارية' }, slug: 'battery-modules', parentSlug: 'battery-energy', description: { en: 'HV modules and 12V auxiliary batteries', ar: 'وحدات الجهد العالي وبطاريات 12 فولت المساعدة' }, order: 1 },
  { name: { en: 'BMS', ar: 'نظام إدارة البطارية' }, slug: 'bms', parentSlug: 'battery-energy', description: { en: 'Battery management system boards and sensors', ar: 'لوحات وحساسات نظام إدارة البطارية' }, order: 2 },
  { name: { en: 'Wallbox Chargers', ar: 'شواحن جدارية' }, slug: 'wallbox-chargers', parentSlug: 'charging', description: { en: 'Home AC wallboxes 7.4 to 22 kW', ar: 'صناديق شحن منزلية من 7.4 إلى 22 كيلوواط' }, order: 1 },
  { name: { en: 'Charging Cables', ar: 'كابلات الشحن' }, slug: 'charging-cables', parentSlug: 'charging', description: { en: 'Type 2 AC cables and CCS2 DC fast-charge cables', ar: 'كابلات تايب 2 وكابلات الشحن السريع CCS2' }, order: 2 },
  { name: { en: 'Charge Ports', ar: 'منافذ الشحن' }, slug: 'charge-ports', parentSlug: 'charging', description: { en: 'Charge port assemblies and inlets', ar: 'تجميعات منافذ الشحن ومداخل الكابل' }, order: 3 },
  { name: { en: 'Motors', ar: 'المحركات' }, slug: 'motors', parentSlug: 'electric-drive', description: { en: 'Drive motors and motor hardware', ar: 'محركات الدفع وقطع المحرك' }, order: 1 },
  { name: { en: 'Inverters', ar: 'العاكسات' }, slug: 'inverters', parentSlug: 'electric-drive', description: { en: 'Traction inverters and power electronics', ar: 'عاكسات الجر وإلكترونيات القدرة' }, order: 2 },
  { name: { en: 'Coolant Pumps', ar: 'مضخات التبريد' }, slug: 'coolant-pumps', parentSlug: 'thermal', description: { en: 'HV battery and inverter coolant pumps', ar: 'مضخات تبريد البطارية والعاكس' }, order: 1 },
  { name: { en: 'Heat Pumps', ar: 'المضخات الحرارية' }, slug: 'heat-pumps', parentSlug: 'thermal', description: { en: 'Cabin and battery heat pump assemblies', ar: 'مضخات حرارية للمقصورة والبطارية' }, order: 2 },
  { name: { en: 'Brake Pads', ar: 'فحمات الفرامل' }, slug: 'brake-pads', parentSlug: 'brakes', description: { en: 'Low-dust EV brake pads', ar: 'فحمات فرامل قليلة الغبار للسيارات الكهربائية' }, order: 1 },
  { name: { en: 'Brake Discs', ar: 'أقراص الفرامل' }, slug: 'brake-discs', parentSlug: 'brakes', description: { en: 'Vented EV brake discs', ar: 'أقراص فرامل مهواة للسيارات الكهربائية' }, order: 2 },
  { name: { en: 'Shocks', ar: 'مساعدات الصدمات' }, slug: 'shocks', parentSlug: 'suspension-tires', description: { en: 'EV-tuned shock absorbers', ar: 'مساعدات صدمات مضبوطة للسيارات الكهربائية' }, order: 1 },
  { name: { en: 'EV Tires', ar: 'إطارات كهربائية' }, slug: 'ev-tires', parentSlug: 'suspension-tires', description: { en: 'Low rolling resistance EV tires', ar: 'إطارات منخفضة المقاومة للسيارات الكهربائية' }, order: 2 },
  { name: { en: 'Cameras', ar: 'الكاميرات' }, slug: 'cameras', parentSlug: 'sensors-adas', description: { en: 'ADAS cameras and surround-view units', ar: 'كاميرات أنظمة المساعدة والرؤية المحيطية' }, order: 1 },
  { name: { en: 'Parking Sensors', ar: 'حساسات الركن' }, slug: 'parking-sensors', parentSlug: 'sensors-adas', description: { en: 'Ultrasonic parking sensors', ar: 'حساسات ركن بالموجات فوق الصوتية' }, order: 2 },
  { name: { en: 'Cabin Filters', ar: 'فلاتر المقصورة' }, slug: 'cabin-filters', parentSlug: 'cabin-electronics', description: { en: 'HEPA and activated-carbon cabin filters', ar: 'فلاتر مقصورة هيبا وكربون نشط' }, order: 1 },
  { name: { en: 'Mirrors & Lights', ar: 'المرايا والإضاءة' }, slug: 'mirrors-lights', parentSlug: 'body-exterior', description: { en: 'Side mirrors, LED lights, and charge-door lamps', ar: 'المرايا الجانبية وأضواء LED ومصابيح باب الشحن' }, order: 1 }
];

// =============================================================================
// PRODUCT HELPERS
// =============================================================================
const fit = (brand, model, yearFrom, yearTo, extra = {}) => ({
  brand,
  model,
  yearFrom,
  yearTo,
  engineType: 'Electric',
  ...extra
});

const spec = (enKey, arKey, enVal, arVal) => ({
  key: { en: enKey, ar: arKey },
  value: { en: enVal, ar: arVal }
});

// Compact factory: maps category slug later, fills images and EUR defaults
const makeProduct = (p) => {
  const partNumber = String(p.partNumber).toUpperCase();
  const warrantyMonths = p.warrantyMonths ?? 24;
  return {
    name: { en: p.nameEn, ar: p.nameAr },
    description: { en: p.descEn, ar: p.descAr },
    partNumber,
    price: p.price,
    currency: 'EUR',
    stock: p.stock,
    lowStockThreshold: p.lowStockThreshold ?? 8,
    category: p.category,
    isFeatured: Boolean(p.isFeatured),
    averageRating: p.averageRating ?? 4.5,
    totalReviews: p.totalReviews ?? 28,
    viewCount: p.viewCount ?? 900,
    purchaseCount: p.purchaseCount ?? 45,
    installationDifficulty: p.installationDifficulty || 'medium',
    weight: p.weight ?? 2.4,
    dimensions: p.dimensions || { length: 30, width: 20, height: 15 },
    warranty: {
      months: warrantyMonths,
      details: {
        en: `${warrantyMonths} months warranty`,
        ar: `ضمان ${warrantyMonths} شهراً`
      }
    },
    images: [
      {
        url: `https://picsum.photos/seed/${partNumber}a/600/600`,
        alt: { en: p.nameEn, ar: p.nameAr },
        isPrimary: true
      }
    ],
    compatibility: p.compatibility || [],
    specifications: p.specifications || [],
    searchKeywords: {
      en: p.keywordsEn || [],
      ar: p.keywordsAr || []
    },
    isActive: true
  };
};

// Shared compatibility groups
const teslaM3BatteryBrake = [
  fit('Tesla', 'Model 3', 2019, 2025, { drivetrain: 'RWD', voltageClass: '12V', transmission: 'Single-Speed' }),
  fit('Tesla', 'Model 3', 2019, 2025, { drivetrain: 'AWD', voltageClass: '12V', transmission: 'Single-Speed' }),
  fit('Tesla', 'Model 3', 2019, 2025, { drivetrain: 'Dual-Motor', voltageClass: '400V', transmission: 'Single-Speed' })
];

const teslaM3Brakes = [
  fit('Tesla', 'Model 3', 2019, 2025, { drivetrain: 'RWD', transmission: 'Single-Speed' }),
  fit('Tesla', 'Model 3', 2019, 2025, { drivetrain: 'AWD', transmission: 'Single-Speed' }),
  fit('Tesla', 'Model 3', 2019, 2025, { drivetrain: 'Dual-Motor', voltageClass: '400V', transmission: 'Single-Speed' })
];

const teslaM3Y400 = [
  fit('Tesla', 'Model 3', 2019, 2025, { drivetrain: 'RWD', connectorType: 'CCS2', voltageClass: '400V', transmission: 'Single-Speed' }),
  fit('Tesla', 'Model 3', 2019, 2025, { drivetrain: 'RWD', connectorType: 'NACS', voltageClass: '400V', transmission: 'Single-Speed' }),
  fit('Tesla', 'Model Y', 2020, 2025, { drivetrain: 'AWD', connectorType: 'CCS2', voltageClass: '400V', transmission: 'Single-Speed' }),
  fit('Tesla', 'Model Y', 2020, 2025, { drivetrain: 'Dual-Motor', connectorType: 'NACS', voltageClass: '400V', transmission: 'Single-Speed' })
];

const universalCcs2 = [
  fit('Tesla', 'Model 3', 2019, 2025, { connectorType: 'CCS2', voltageClass: '400V', transmission: 'Single-Speed' }),
  fit('Tesla', 'Model Y', 2020, 2025, { connectorType: 'CCS2', voltageClass: '400V', transmission: 'Single-Speed' }),
  fit('Tesla', 'Model S', 2021, 2025, { connectorType: 'CCS2', voltageClass: '400V', transmission: 'Single-Speed' }),
  fit('BYD', 'Atto 3', 2022, 2025, { connectorType: 'CCS2', voltageClass: '400V', transmission: 'Automatic' }),
  fit('BYD', 'Seal', 2023, 2025, { connectorType: 'CCS2', voltageClass: '800V', transmission: 'Automatic' }),
  fit('Hyundai', 'Ioniq 5', 2021, 2025, { connectorType: 'CCS2', voltageClass: '800V', transmission: 'Single-Speed' }),
  fit('Hyundai', 'Ioniq 6', 2022, 2025, { connectorType: 'CCS2', voltageClass: '800V', transmission: 'Single-Speed' }),
  fit('Kia', 'EV6', 2021, 2025, { connectorType: 'CCS2', voltageClass: '800V', transmission: 'Single-Speed' }),
  fit('Nissan', 'Ariya', 2022, 2025, { connectorType: 'CCS2', voltageClass: '400V', transmission: 'Automatic' }),
  fit('Volkswagen', 'ID.4', 2021, 2025, { connectorType: 'CCS2', voltageClass: '400V', transmission: 'Single-Speed' }),
  fit('Volkswagen', 'ID.3', 2020, 2025, { connectorType: 'CCS2', voltageClass: '400V', transmission: 'Single-Speed' }),
  fit('MG', 'MG4', 2022, 2025, { connectorType: 'CCS2', voltageClass: '400V', transmission: 'Automatic' }),
  fit('BMW', 'iX3', 2021, 2025, { connectorType: 'CCS2', voltageClass: '400V', transmission: 'Automatic' }),
  fit('BMW', 'i4', 2021, 2025, { connectorType: 'CCS2', voltageClass: '400V', transmission: 'Automatic' })
];

const universalType2 = [
  fit('Tesla', 'Model 3', 2019, 2025, { connectorType: 'Type2', voltageClass: '400V', transmission: 'Single-Speed' }),
  fit('Tesla', 'Model Y', 2020, 2025, { connectorType: 'Type2', voltageClass: '400V', transmission: 'Single-Speed' }),
  fit('BYD', 'Atto 3', 2022, 2025, { connectorType: 'Type2', voltageClass: '400V', transmission: 'Automatic' }),
  fit('BYD', 'Dolphin', 2023, 2025, { connectorType: 'Type2', voltageClass: '400V', transmission: 'Automatic' }),
  fit('Hyundai', 'Kona Electric', 2020, 2025, { connectorType: 'Type2', voltageClass: '400V', transmission: 'Automatic' }),
  fit('Kia', 'Niro EV', 2020, 2025, { connectorType: 'Type2', voltageClass: '400V', transmission: 'Automatic' }),
  fit('Nissan', 'Leaf', 2018, 2024, { connectorType: 'Type2', voltageClass: '400V', transmission: 'Automatic' }),
  fit('Volkswagen', 'ID.Buzz', 2022, 2025, { connectorType: 'Type2', voltageClass: '400V', transmission: 'Single-Speed' }),
  fit('MG', 'MG ZS EV', 2020, 2025, { connectorType: 'Type2', voltageClass: '400V', transmission: 'Automatic' }),
  fit('BMW', 'iX', 2021, 2025, { connectorType: 'Type2', voltageClass: '400V', transmission: 'Automatic' })
];

// =============================================================================
// PRODUCTS (45 EV parts — indices 0..44)
// =============================================================================
const productsData = [
  // 0 — NLP: battery tesla 2022
  makeProduct({
    nameEn: 'Tesla Model 3 12V Auxiliary Battery',
    nameAr: 'بطارية مساعدة 12 فولت لتسلا موديل 3',
    descEn: 'OEM-spec 12V AGM auxiliary battery for Tesla Model 3 2019-2025 including 2022. Powers computers, locks, and lights when the high-voltage pack is asleep.',
    descAr: 'بطارية مساعدة 12 فولت AGM لتسلا موديل 3 من 2019 إلى 2025 بما فيها 2022. تغذي الحواسيب والأقفال والإضاءة عند سكون حزمة الجهد العالي.',
    partNumber: 'BAT-TSL-12V-M3-001',
    price: 189,
    stock: 54,
    category: 'battery-modules',
    isFeatured: true,
    averageRating: 4.8,
    totalReviews: 164,
    viewCount: 5120,
    purchaseCount: 238,
    installationDifficulty: 'easy',
    weight: 5.4,
    dimensions: { length: 24, width: 17, height: 19 },
    warrantyMonths: 24,
    compatibility: teslaM3BatteryBrake,
    specifications: [
      spec('Voltage', 'الجهد', '12V AGM', '12 فولت AGM'),
      spec('Capacity', 'السعة', '70 Ah', '70 أمبير ساعة'),
      spec('Cold cranking', 'تيار الإقلاع البارد', '760 A', '760 أمبير')
    ],
    keywordsEn: ['battery', 'tesla', '2022', '12v', 'auxiliary', 'model 3'],
    keywordsAr: ['بطارية', 'تسلا', '2022', 'بطارية مساعدة', 'موديل 3']
  }),
  // 1 — NLP: VW ID.4 12V battery
  makeProduct({
    nameEn: 'Volkswagen ID.4 12V Auxiliary Battery',
    nameAr: 'بطارية مساعدة 12 فولت ل فولكسفاغن ID.4',
    descEn: '12V auxiliary battery for Volkswagen ID.4. Keeps the onboard network alive during DC charging and sleep cycles.',
    descAr: 'بطارية مساعدة 12 فولت ل فولكسفاغن ID.4. تبقي الشبكة الكهربائية نشطة أثناء الشحن السريع ووضع السكون.',
    partNumber: 'BAT-VW-12V-ID4-002',
    price: 165,
    stock: 33,
    category: 'battery-modules',
    isFeatured: true,
    averageRating: 4.6,
    totalReviews: 91,
    viewCount: 2480,
    purchaseCount: 112,
    installationDifficulty: 'easy',
    weight: 4.9,
    compatibility: [
      fit('Volkswagen', 'ID.4', 2021, 2025, { drivetrain: 'RWD', voltageClass: '12V', transmission: 'Single-Speed' }),
      fit('Volkswagen', 'ID.4', 2021, 2025, { drivetrain: 'AWD', voltageClass: '12V', transmission: 'Single-Speed' }),
      fit('Volkswagen', 'ID.3', 2020, 2025, { voltageClass: '12V', transmission: 'Single-Speed' })
    ],
    specifications: [
      spec('Voltage', 'الجهد', '12V EFB', '12 فولت EFB'),
      spec('Capacity', 'السعة', '61 Ah', '61 أمبير ساعة')
    ],
    keywordsEn: ['battery', 'id.4', 'volkswagen', '12v', 'vw'],
    keywordsAr: ['بطارية', 'اي دي 4', 'فولكسفاغن', '12 فولت']
  }),
  // 2 — NLP: Hyundai Ioniq 5 12V battery
  makeProduct({
    nameEn: 'Hyundai Ioniq 5 12V Auxiliary Battery',
    nameAr: 'بطارية مساعدة 12 فولت لهيونداي أيونيك 5',
    descEn: '12V lithium auxiliary battery for Hyundai Ioniq 5. Restores 12V network faults after DC fast charging.',
    descAr: 'بطارية ليثيوم مساعدة 12 فولت لهيونداي أيونيك 5. تعالج أعطال شبكة 12 فولت بعد الشحن السريع.',
    partNumber: 'BAT-HYN-12V-IQ5-003',
    price: 210,
    stock: 27,
    category: 'battery-modules',
    isFeatured: false,
    averageRating: 4.7,
    totalReviews: 73,
    viewCount: 1980,
    purchaseCount: 88,
    installationDifficulty: 'medium',
    weight: 3.8,
    compatibility: [
      fit('Hyundai', 'Ioniq 5', 2021, 2025, { drivetrain: 'RWD', voltageClass: '12V', connectorType: 'CCS2', transmission: 'Single-Speed' }),
      fit('Hyundai', 'Ioniq 5', 2021, 2025, { drivetrain: 'AWD', voltageClass: '12V', connectorType: 'CCS2', transmission: 'Single-Speed' }),
      fit('Hyundai', 'Ioniq 6', 2022, 2025, { voltageClass: '12V', connectorType: 'CCS2', transmission: 'Single-Speed' })
    ],
    specifications: [
      spec('Chemistry', 'الكيمياء', 'Li-ion 12V', 'ليثيوم أيون 12 فولت'),
      spec('Capacity', 'السعة', '45 Ah', '45 أمبير ساعة')
    ],
    keywordsEn: ['battery', 'ioniq 5', 'hyundai', '12v'],
    keywordsAr: ['بطارية', 'ايونيك 5', 'هيونداي', '12 فولت']
  }),
  // 3
  makeProduct({
    nameEn: 'Kia EV6 12V Auxiliary Battery',
    nameAr: 'بطارية مساعدة 12 فولت لكيا EV6',
    descEn: '12V auxiliary battery shared with the E-GMP platform used by Kia EV6 and EV9.',
    descAr: 'بطارية مساعدة 12 فولت مشتركة مع منصة E-GMP في كيا EV6 و EV9.',
    partNumber: 'BAT-KIA-12V-EV6-004',
    price: 205,
    stock: 19,
    category: 'battery-modules',
    averageRating: 4.5,
    totalReviews: 44,
    viewCount: 1320,
    purchaseCount: 51,
    installationDifficulty: 'medium',
    weight: 3.9,
    compatibility: [
      fit('Kia', 'EV6', 2021, 2025, { voltageClass: '12V', connectorType: 'CCS2', transmission: 'Single-Speed' }),
      fit('Kia', 'EV9', 2023, 2025, { voltageClass: '12V', connectorType: 'CCS2', transmission: 'Single-Speed' })
    ],
    specifications: [spec('Voltage', 'الجهد', '12V Li-ion', '12 فولت ليثيوم')],
    keywordsEn: ['battery', 'ev6', 'kia', '12v'],
    keywordsAr: ['بطارية', 'اي في 6', 'كيا']
  }),
  // 4 — low stock HV module
  makeProduct({
    nameEn: 'Tesla Model 3 / Y HV Battery Module',
    nameAr: 'وحدة بطارية جهد عالي لتسلا موديل 3 و واي',
    descEn: 'Remanufactured 400V battery module for Tesla Model 3 and Model Y. Workshop installation required.',
    descAr: 'وحدة بطارية 400 فولت مجددة لتسلا موديل 3 وموديل واي. التركيب في ورشة متخصص.',
    partNumber: 'BAT-TSL-HVM-M3Y-005',
    price: 1890,
    stock: 4,
    category: 'battery-modules',
    isFeatured: false,
    averageRating: 4.4,
    totalReviews: 18,
    viewCount: 3100,
    purchaseCount: 9,
    installationDifficulty: 'hard',
    weight: 28,
    dimensions: { length: 80, width: 35, height: 12 },
    warrantyMonths: 12,
    compatibility: teslaM3Y400,
    specifications: [
      spec('Voltage class', 'فئة الجهد', '400V', '400 فولت'),
      spec('Capacity', 'السعة', '~5.3 kWh module', 'حوالي 5.3 كيلوواط ساعة')
    ],
    keywordsEn: ['battery', 'module', 'tesla', 'hv', 'high voltage'],
    keywordsAr: ['بطارية', 'وحدة', 'تسلا', 'جهد عالي']
  }),
  // 5
  makeProduct({
    nameEn: 'BYD Blade Battery Module Atto 3 / Seal',
    nameAr: 'وحدة بطارية بليد لبي واي دي أتّو 3 وسيل',
    descEn: 'Blade LFP battery module compatible with BYD Atto 3 and Seal energy packs.',
    descAr: 'وحدة بطارية بليد LFP متوافقة مع حزم بي واي دي أتّو 3 وسيل.',
    partNumber: 'BAT-BYD-BLD-AT3-006',
    price: 1420,
    stock: 11,
    category: 'battery-modules',
    averageRating: 4.6,
    totalReviews: 22,
    viewCount: 1670,
    purchaseCount: 14,
    installationDifficulty: 'hard',
    weight: 22,
    dimensions: { length: 96, width: 14, height: 12 },
    warrantyMonths: 24,
    compatibility: [
      fit('BYD', 'Atto 3', 2022, 2025, { drivetrain: 'FWD', voltageClass: '400V', transmission: 'Automatic' }),
      fit('BYD', 'Seal', 2023, 2025, { drivetrain: 'RWD', voltageClass: '800V', transmission: 'Automatic' }),
      fit('BYD', 'Han', 2020, 2024, { drivetrain: 'AWD', voltageClass: '400V', transmission: 'Automatic' })
    ],
    specifications: [spec('Chemistry', 'الكيمياء', 'LFP Blade', 'فوسفات حديد ليثيوم بليد')],
    keywordsEn: ['battery', 'byd', 'atto 3', 'blade', 'module'],
    keywordsAr: ['بطارية', 'بي واي دي', 'اتو 3', 'بليد']
  }),
  // 6
  makeProduct({
    nameEn: 'Tesla Model 3 / Y BMS Controller',
    nameAr: 'وحدة إدارة البطارية لتسلا موديل 3 و واي',
    descEn: 'Battery management system controller for Tesla Model 3 and Model Y 400V packs.',
    descAr: 'وحدة نظام إدارة البطارية لتسلا موديل 3 وموديل واي بحزم 400 فولت.',
    partNumber: 'BMS-TSL-M3Y-007',
    price: 640,
    stock: 16,
    category: 'bms',
    isFeatured: true,
    averageRating: 4.7,
    totalReviews: 39,
    viewCount: 2210,
    purchaseCount: 27,
    installationDifficulty: 'hard',
    weight: 1.2,
    compatibility: teslaM3Y400,
    specifications: [spec('Pack voltage', 'جهد الحزمة', '400V', '400 فولت')],
    keywordsEn: ['bms', 'battery management', 'tesla', 'controller'],
    keywordsAr: ['نظام إدارة البطارية', 'تسلا', 'بي ام اس']
  }),
  // 7 — low stock
  makeProduct({
    nameEn: 'Hyundai / Kia 800V BMS Board',
    nameAr: 'لوحة إدارة بطارية 800 فولت لهيونداي وكيا',
    descEn: 'E-GMP 800V BMS board for Hyundai Ioniq 5/6 and Kia EV6.',
    descAr: 'لوحة إدارة بطارية 800 فولت لمنصة E-GMP في أيونيك 5/6 وكيا EV6.',
    partNumber: 'BMS-HYN-EGMP-008',
    price: 720,
    stock: 6,
    category: 'bms',
    averageRating: 4.5,
    totalReviews: 17,
    viewCount: 980,
    purchaseCount: 11,
    installationDifficulty: 'hard',
    weight: 0.9,
    compatibility: [
      fit('Hyundai', 'Ioniq 5', 2021, 2025, { voltageClass: '800V', connectorType: 'CCS2', transmission: 'Single-Speed' }),
      fit('Hyundai', 'Ioniq 6', 2022, 2025, { voltageClass: '800V', connectorType: 'CCS2', transmission: 'Single-Speed' }),
      fit('Kia', 'EV6', 2021, 2025, { voltageClass: '800V', connectorType: 'CCS2', transmission: 'Single-Speed' })
    ],
    specifications: [spec('Voltage class', 'فئة الجهد', '800V', '800 فولت')],
    keywordsEn: ['bms', 'ioniq 5', 'ev6', '800v'],
    keywordsAr: ['نظام إدارة البطارية', 'ايونيك 5', 'اي في 6']
  }),
  // 8 — NLP: fast charger / CCS2 DC cable
  makeProduct({
    nameEn: 'CCS2 DC Fast Charging Cable 250A',
    nameAr: 'كابل شحن سريع CCS2 تيار مستمر 250 أمبير',
    descEn: 'Heavy-duty CCS2 DC fast charging cable for public and depot chargers. Fits European CCS2 EVs including Tesla, Hyundai, Kia, VW, BMW, BYD and MG.',
    descAr: 'كابل شحن سريع CCS2 تيار مستمر للشواحن العامة والمستودعات. يناسب السيارات الأوروبية بمنفذ CCS2.',
    partNumber: 'CAB-CCS2-DC-250-009',
    price: 429,
    stock: 41,
    category: 'charging-cables',
    isFeatured: true,
    averageRating: 4.9,
    totalReviews: 201,
    viewCount: 8640,
    purchaseCount: 310,
    installationDifficulty: 'easy',
    weight: 6.8,
    dimensions: { length: 500, width: 12, height: 8 },
    warrantyMonths: 36,
    compatibility: universalCcs2,
    specifications: [
      spec('Connector', 'الوصل', 'CCS2 Combo 2', 'CCS2 كومبو 2'),
      spec('Current', 'التيار', '250 A DC', '250 أمبير تيار مستمر'),
      spec('Length', 'الطول', '5 m', '5 أمتار')
    ],
    keywordsEn: ['fast charger', 'fast charging', 'ccs2', 'dc cable', 'charger', 'rapid'],
    keywordsAr: ['شاحن سريع', 'كابل شحن', 'شحن سريع', 'سي سي اس']
  }),
  // 9 — NLP: Type 2 home cable
  makeProduct({
    nameEn: 'Type 2 Home Charging Cable 7.4 kW',
    nameAr: 'كابل شحن منزلي تايب 2 بقوة 7.4 كيلوواط',
    descEn: 'Single-phase Type 2 Mode 3 cable for home AC charging up to 7.4 kW. Works with most European EV inlets.',
    descAr: 'كابل تايب 2 أحادي الطور للشحن المنزلي حتى 7.4 كيلوواط. يناسب معظم منافذ السيارات الأوروبية.',
    partNumber: 'CAB-T2-AC-74-010',
    price: 159,
    stock: 88,
    category: 'charging-cables',
    isFeatured: true,
    averageRating: 4.8,
    totalReviews: 256,
    viewCount: 7210,
    purchaseCount: 402,
    installationDifficulty: 'easy',
    weight: 3.1,
    dimensions: { length: 500, width: 10, height: 6 },
    warrantyMonths: 24,
    compatibility: universalType2,
    specifications: [
      spec('Connector', 'الوصل', 'Type 2 Mennekes', 'تايب 2 مينيكيس'),
      spec('Power', 'القدرة', '7.4 kW 32A 1-phase', '7.4 كيلوواط 32 أمبير طور واحد')
    ],
    keywordsEn: ['type 2', 'home cable', 'charging cable', '7.4kw', 'charger'],
    keywordsAr: ['تايب 2', 'كابل منزلي', 'كابل شحن', 'شاحن']
  }),
  // 10 — NLP: 11kW wallbox
  makeProduct({
    nameEn: 'Home Wallbox Charger 11 kW Type 2',
    nameAr: 'شاحن جداري منزلي 11 كيلوواط تايب 2',
    descEn: 'Smart 11 kW three-phase wallbox with Type 2 socket, app control, and RFID. Ideal for overnight home charging.',
    descAr: 'شاحن جداري ذكي 11 كيلوواط ثلاثي الطور بمقبس تايب 2 وتطبيق وRFID. مثالي للشحن الليلي في المنزل.',
    partNumber: 'WBX-T2-11KW-011',
    price: 890,
    stock: 24,
    category: 'wallbox-chargers',
    isFeatured: true,
    averageRating: 4.9,
    totalReviews: 128,
    viewCount: 6540,
    purchaseCount: 176,
    installationDifficulty: 'hard',
    weight: 7.5,
    dimensions: { length: 40, width: 28, height: 16 },
    warrantyMonths: 36,
    compatibility: universalType2,
    specifications: [
      spec('Power', 'القدرة', '11 kW 16A 3-phase', '11 كيلوواط 16 أمبير ثلاثي الطور'),
      spec('Connector', 'الوصل', 'Type 2 socket', 'مقبس تايب 2')
    ],
    keywordsEn: ['wallbox', '11kw', 'home charger', 'type 2', 'charger'],
    keywordsAr: ['شاحن جداري', '11 كيلوواط', 'شاحن منزلي', 'تايب 2']
  }),
  // 11
  makeProduct({
    nameEn: 'Home Wallbox Charger 22 kW Type 2',
    nameAr: 'شاحن جداري منزلي 22 كيلوواط تايب 2',
    descEn: '22 kW three-phase wallbox for faster AC charging at home or the workplace.',
    descAr: 'شاحن جداري 22 كيلوواط ثلاثي الطور لشحن أسرع في المنزل أو العمل.',
    partNumber: 'WBX-T2-22KW-012',
    price: 1190,
    stock: 14,
    category: 'wallbox-chargers',
    isFeatured: false,
    averageRating: 4.7,
    totalReviews: 61,
    viewCount: 2890,
    purchaseCount: 48,
    installationDifficulty: 'hard',
    weight: 8.2,
    compatibility: universalType2,
    specifications: [spec('Power', 'القدرة', '22 kW 32A 3-phase', '22 كيلوواط 32 أمبير ثلاثي الطور')],
    keywordsEn: ['wallbox', '22kw', 'home charger', 'type 2'],
    keywordsAr: ['شاحن جداري', '22 كيلوواط', 'شاحن منزلي']
  }),
  // 12 — NLP: Ioniq 5 charge port, stock 0
  makeProduct({
    nameEn: 'Hyundai Ioniq 5 CCS2 Charge Port Assembly',
    nameAr: 'تجميعة منفذ شحن CCS2 لهيونداي أيونيك 5',
    descEn: 'Complete charge port and charge-door assembly for Hyundai Ioniq 5 including CCS2 inlet and lock actuator.',
    descAr: 'تجميعة منفذ الشحن وباب الشحن لهيونداي أيونيك 5 مع مدخل CCS2 ومحرك القفل.',
    partNumber: 'CPT-HYN-IQ5-CCS-013',
    price: 385,
    stock: 0,
    category: 'charge-ports',
    isFeatured: true,
    averageRating: 4.6,
    totalReviews: 34,
    viewCount: 2760,
    purchaseCount: 41,
    installationDifficulty: 'medium',
    weight: 2.8,
    compatibility: [
      fit('Hyundai', 'Ioniq 5', 2021, 2025, { connectorType: 'CCS2', voltageClass: '800V', transmission: 'Single-Speed' }),
      fit('Hyundai', 'Ioniq 6', 2022, 2025, { connectorType: 'CCS2', voltageClass: '800V', transmission: 'Single-Speed' })
    ],
    specifications: [
      spec('Inlet', 'المدخل', 'CCS2 + Type 2', 'CCS2 وتايب 2'),
      spec('Voltage class', 'فئة الجهد', '800V', '800 فولت')
    ],
    keywordsEn: ['charge port', 'ioniq 5', 'ccs2', 'charging port', 'inlet'],
    keywordsAr: ['منفذ الشحن', 'ايونيك 5', 'منفذ شحن']
  }),
  // 13
  makeProduct({
    nameEn: 'Tesla Model 3 / Y NACS Charge Port',
    nameAr: 'منفذ شحن NACS لتسلا موديل 3 و واي',
    descEn: 'NACS charge port assembly for Tesla Model 3 and Model Y. Also listed with CCS2 adapter compatibility for Europe.',
    descAr: 'تجميعة منفذ شحن NACS لتسلا موديل 3 وموديل واي مع توافق محول CCS2 لأوروبا.',
    partNumber: 'CPT-TSL-NACS-M3-014',
    price: 310,
    stock: 21,
    category: 'charge-ports',
    averageRating: 4.7,
    totalReviews: 58,
    viewCount: 3440,
    purchaseCount: 67,
    installationDifficulty: 'medium',
    weight: 1.6,
    compatibility: teslaM3Y400,
    specifications: [spec('Connector', 'الوصل', 'NACS / CCS2 adapter', 'NACS أو محول CCS2')],
    keywordsEn: ['charge port', 'tesla', 'nacs', 'ccs2'],
    keywordsAr: ['منفذ الشحن', 'تسلا', 'ناكس']
  }),
  // 14
  makeProduct({
    nameEn: 'Volkswagen ID.4 CCS2 Charge Port',
    nameAr: 'منفذ شحن CCS2 ل فولكسفاغن ID.4',
    descEn: 'MEB charge port for Volkswagen ID.4 and ID.3 with CCS2 DC inlet.',
    descAr: 'منفذ شحن منصة MEB ل فولكسفاغن ID.4 و ID.3 بمدخل CCS2.',
    partNumber: 'CPT-VW-ID4-CCS-015',
    price: 295,
    stock: 18,
    category: 'charge-ports',
    averageRating: 4.4,
    totalReviews: 29,
    viewCount: 1510,
    purchaseCount: 33,
    installationDifficulty: 'medium',
    weight: 2.1,
    compatibility: [
      fit('Volkswagen', 'ID.4', 2021, 2025, { connectorType: 'CCS2', voltageClass: '400V', transmission: 'Single-Speed' }),
      fit('Volkswagen', 'ID.3', 2020, 2025, { connectorType: 'CCS2', voltageClass: '400V', transmission: 'Single-Speed' }),
      fit('Volkswagen', 'ID.Buzz', 2022, 2025, { connectorType: 'CCS2', voltageClass: '400V', transmission: 'Single-Speed' })
    ],
    specifications: [spec('Inlet', 'المدخل', 'CCS2', 'CCS2')],
    keywordsEn: ['charge port', 'id.4', 'ccs2', 'volkswagen'],
    keywordsAr: ['منفذ الشحن', 'اي دي 4', 'فولكسفاغن']
  }),
  // 15
  makeProduct({
    nameEn: 'Nissan Leaf CHAdeMO Charge Inlet',
    nameAr: 'مدخل شحن CHAdeMO لنيسان ليف',
    descEn: 'CHAdeMO DC inlet assembly for Nissan Leaf, plus Type 2 AC socket on European cars.',
    descAr: 'تجميعة مدخل CHAdeMO لنيسان ليف مع مقبس تايب 2 في السيارات الأوروبية.',
    partNumber: 'CPT-NIS-LEAF-CHA-016',
    price: 265,
    stock: 13,
    category: 'charge-ports',
    averageRating: 4.3,
    totalReviews: 41,
    viewCount: 1880,
    purchaseCount: 36,
    installationDifficulty: 'medium',
    weight: 2.4,
    compatibility: [
      fit('Nissan', 'Leaf', 2018, 2024, { connectorType: 'CHAdeMO', voltageClass: '400V', drivetrain: 'FWD', transmission: 'Automatic' }),
      fit('Nissan', 'Leaf', 2018, 2024, { connectorType: 'Type2', voltageClass: '400V', drivetrain: 'FWD', transmission: 'Automatic' })
    ],
    specifications: [spec('DC inlet', 'مدخل التيار المستمر', 'CHAdeMO', 'CHAdeMO')],
    keywordsEn: ['charge port', 'leaf', 'chademo', 'nissan'],
    keywordsAr: ['منفذ الشحن', 'ليف', 'نيسان']
  }),
  // 16 — NLP: MG4 onboard charger
  makeProduct({
    nameEn: 'MG4 Onboard Charger OBC 11 kW',
    nameAr: 'شاحن داخلي 11 كيلوواط لام جي MG4',
    descEn: 'Onboard charger (OBC) for MG MG4. Converts AC from a wallbox or Type 2 cable into DC for the traction battery.',
    descAr: 'شاحن داخلي لسيارة ام جي MG4. يحول تيار الجدار أو كابل تايب 2 إلى تيار مستمر لحزمة الجر.',
    partNumber: 'OBC-MG-MG4-11KW-017',
    price: 780,
    stock: 9,
    category: 'charging',
    isFeatured: true,
    averageRating: 4.5,
    totalReviews: 26,
    viewCount: 2040,
    purchaseCount: 19,
    installationDifficulty: 'hard',
    weight: 9.6,
    dimensions: { length: 38, width: 26, height: 12 },
    warrantyMonths: 24,
    compatibility: [
      fit('MG', 'MG4', 2022, 2025, { connectorType: 'Type2', voltageClass: '400V', drivetrain: 'RWD', transmission: 'Automatic' }),
      fit('MG', 'MG ZS EV', 2022, 2025, { connectorType: 'Type2', voltageClass: '400V', drivetrain: 'FWD', transmission: 'Automatic' })
    ],
    specifications: [
      spec('AC input', 'دخل التيار المتردد', '11 kW Type 2', '11 كيلوواط تايب 2'),
      spec('Cooling', 'التبريد', 'Liquid cooled', 'تبريد سائل')
    ],
    keywordsEn: ['onboard charger', 'obc', 'mg4', 'charger', '11kw'],
    keywordsAr: ['شاحن داخلي', 'ام جي 4', 'شاحن', 'اوه بي سي']
  }),
  // 17
  makeProduct({
    nameEn: 'Type 2 Three-Phase Home Cable 11 kW',
    nameAr: 'كابل منزلي تايب 2 ثلاثي الطور 11 كيلوواط',
    descEn: 'Three-phase Type 2 cable for 11 kW AC charging from a wallbox.',
    descAr: 'كابل تايب 2 ثلاثي الطور للشحن بقدرة 11 كيلوواط من شاحن جداري.',
    partNumber: 'CAB-T2-AC-11KW-018',
    price: 189,
    stock: 47,
    category: 'charging-cables',
    isFeatured: false,
    averageRating: 4.6,
    totalReviews: 88,
    viewCount: 2660,
    purchaseCount: 121,
    installationDifficulty: 'easy',
    weight: 3.6,
    compatibility: universalType2,
    specifications: [spec('Power', 'القدرة', '11 kW 16A 3-phase', '11 كيلوواط 16 أمبير ثلاثي الطور')],
    keywordsEn: ['type 2', '11kw', 'charging cable', 'home cable'],
    keywordsAr: ['تايب 2', '11 كيلوواط', 'كابل شحن']
  }),
  // 18
  makeProduct({
    nameEn: 'BMW iX3 / i4 CCS2 Charge Cable 200A',
    nameAr: 'كابل شحن CCS2 لبي ام دبليو iX3 و i4',
    descEn: 'CCS2 DC cable rated 200A for BMW iX3, i4 and iX public charging.',
    descAr: 'كابل CCS2 تيار مستمر 200 أمبير لبي ام دبليو iX3 و i4 و iX.',
    partNumber: 'CAB-BMW-CCS-200-019',
    price: 349,
    stock: 22,
    category: 'charging-cables',
    averageRating: 4.5,
    totalReviews: 37,
    viewCount: 1430,
    purchaseCount: 29,
    installationDifficulty: 'easy',
    weight: 5.9,
    compatibility: [
      fit('BMW', 'iX3', 2021, 2025, { connectorType: 'CCS2', voltageClass: '400V', transmission: 'Automatic' }),
      fit('BMW', 'i4', 2021, 2025, { connectorType: 'CCS2', voltageClass: '400V', transmission: 'Automatic' }),
      fit('BMW', 'iX', 2021, 2025, { connectorType: 'CCS2', voltageClass: '400V', transmission: 'Automatic' })
    ],
    specifications: [spec('Current', 'التيار', '200 A DC', '200 أمبير تيار مستمر')],
    keywordsEn: ['fast charger', 'ccs2', 'bmw', 'ix3', 'cable'],
    keywordsAr: ['شاحن سريع', 'بي ام دبليو', 'كابل']
  }),
  // 19
  makeProduct({
    nameEn: 'Tesla Model 3 Rear Drive Motor',
    nameAr: 'محرك الدفع الخلفي لتسلا موديل 3',
    descEn: 'Rear permanent-magnet drive unit for Tesla Model 3 RWD and Dual-Motor cars.',
    descAr: 'وحدة دفع خلفية بمغناطيس دائم لتسلا موديل 3 دفع خلفي ومزدوج.',
    partNumber: 'MTR-TSL-M3-RDU-020',
    price: 2450,
    stock: 7,
    category: 'motors',
    isFeatured: false,
    averageRating: 4.6,
    totalReviews: 15,
    viewCount: 4120,
    purchaseCount: 8,
    installationDifficulty: 'hard',
    weight: 82,
    dimensions: { length: 55, width: 45, height: 35 },
    warrantyMonths: 12,
    compatibility: [
      fit('Tesla', 'Model 3', 2019, 2025, { drivetrain: 'RWD', voltageClass: '400V', transmission: 'Single-Speed' }),
      fit('Tesla', 'Model 3', 2019, 2025, { drivetrain: 'Dual-Motor', voltageClass: '400V', transmission: 'Single-Speed' }),
      fit('Tesla', 'Model Y', 2020, 2025, { drivetrain: 'RWD', voltageClass: '400V', transmission: 'Single-Speed' })
    ],
    specifications: [spec('Type', 'النوع', 'PM rear drive unit', 'وحدة دفع خلفية بمغناطيس دائم')],
    keywordsEn: ['motor', 'drive unit', 'tesla', 'model 3'],
    keywordsAr: ['محرك', 'تسلا', 'موديل 3', 'دفع']
  }),
  // 20
  makeProduct({
    nameEn: 'Tesla Model 3 / Y Traction Inverter',
    nameAr: 'عاكس جر لتسلا موديل 3 و واي',
    descEn: 'Rear traction inverter for Tesla Model 3 and Model Y drive units.',
    descAr: 'عاكس جر خلفي لوحدات دفع تسلا موديل 3 وموديل واي.',
    partNumber: 'INV-TSL-M3Y-021',
    price: 1680,
    stock: 10,
    category: 'inverters',
    averageRating: 4.5,
    totalReviews: 21,
    viewCount: 2750,
    purchaseCount: 12,
    installationDifficulty: 'hard',
    weight: 11.4,
    compatibility: teslaM3Y400,
    specifications: [spec('Voltage class', 'فئة الجهد', '400V', '400 فولت')],
    keywordsEn: ['inverter', 'tesla', 'power electronics', 'drive'],
    keywordsAr: ['عاكس', 'تسلا', 'إلكترونيات القدرة']
  }),
  // 21
  makeProduct({
    nameEn: 'BYD Atto 3 Drive Motor',
    nameAr: 'محرك دفع لبي واي دي أتّو 3',
    descEn: 'Front drive motor for BYD Atto 3 FWD. Also fits Dolphin with matching mounts.',
    descAr: 'محرك دفع أمامي لبي واي دي أتّو 3. يناسب دولفين مع الحوامل المطابقة.',
    partNumber: 'MTR-BYD-AT3-FWD-022',
    price: 1320,
    stock: 12,
    category: 'motors',
    averageRating: 4.4,
    totalReviews: 19,
    viewCount: 1540,
    purchaseCount: 13,
    installationDifficulty: 'hard',
    weight: 64,
    compatibility: [
      fit('BYD', 'Atto 3', 2022, 2025, { drivetrain: 'FWD', voltageClass: '400V', transmission: 'Automatic' }),
      fit('BYD', 'Dolphin', 2023, 2025, { drivetrain: 'FWD', voltageClass: '400V', transmission: 'Automatic' })
    ],
    specifications: [spec('Layout', 'التخطيط', 'FWD PMSM', 'أمامي مغناطيس دائم')],
    keywordsEn: ['motor', 'byd', 'atto 3', 'drive'],
    keywordsAr: ['محرك', 'بي واي دي', 'اتو 3']
  }),
  // 22
  makeProduct({
    nameEn: 'Hyundai Ioniq 5 Traction Inverter',
    nameAr: 'عاكس جر لهيونداي أيونيك 5',
    descEn: '800V silicon-carbide traction inverter for Hyundai Ioniq 5 and Kia EV6.',
    descAr: 'عاكس جر 800 فولت بكربيد السيليكون لهيونداي أيونيك 5 وكيا EV6.',
    partNumber: 'INV-HYN-IQ5-800-023',
    price: 1750,
    stock: 8,
    category: 'inverters',
    isFeatured: false,
    averageRating: 4.6,
    totalReviews: 14,
    viewCount: 1890,
    purchaseCount: 7,
    installationDifficulty: 'hard',
    weight: 10.8,
    compatibility: [
      fit('Hyundai', 'Ioniq 5', 2021, 2025, { voltageClass: '800V', connectorType: 'CCS2', transmission: 'Single-Speed' }),
      fit('Kia', 'EV6', 2021, 2025, { voltageClass: '800V', connectorType: 'CCS2', transmission: 'Single-Speed' })
    ],
    specifications: [spec('Semiconductor', 'أشباه الموصلات', 'SiC 800V', 'كربيد سيليكون 800 فولت')],
    keywordsEn: ['inverter', 'ioniq 5', '800v', 'hyundai'],
    keywordsAr: ['عاكس', 'ايونيك 5', 'هيونداي']
  }),
  // 23
  makeProduct({
    nameEn: 'Nissan Leaf Traction Motor',
    nameAr: 'محرك جر لنيسان ليف',
    descEn: 'Front traction motor for Nissan Leaf 40 kWh and 62 kWh cars.',
    descAr: 'محرك جر أمامي لنيسان ليف بسعة 40 و 62 كيلوواط ساعة.',
    partNumber: 'MTR-NIS-LEAF-024',
    price: 980,
    stock: 15,
    category: 'motors',
    averageRating: 4.3,
    totalReviews: 33,
    viewCount: 1675,
    purchaseCount: 22,
    installationDifficulty: 'hard',
    weight: 58,
    compatibility: [
      fit('Nissan', 'Leaf', 2018, 2024, { drivetrain: 'FWD', connectorType: 'CHAdeMO', voltageClass: '400V', transmission: 'Automatic' }),
      fit('Nissan', 'Ariya', 2022, 2025, { drivetrain: 'FWD', connectorType: 'CCS2', voltageClass: '400V', transmission: 'Automatic' })
    ],
    specifications: [spec('Layout', 'التخطيط', 'FWD EM61', 'أمامي EM61')],
    keywordsEn: ['motor', 'leaf', 'nissan', 'traction'],
    keywordsAr: ['محرك', 'ليف', 'نيسان']
  }),
  // 24 — Tesla HV coolant pump
  makeProduct({
    nameEn: 'Tesla Model 3 / Y HV Coolant Pump',
    nameAr: 'مضخة تبريد جهد عالي لتسلا موديل 3 و واي',
    descEn: 'High-voltage battery coolant pump for Tesla Model 3 and Model Y thermal loop.',
    descAr: 'مضخة تبريد بطارية الجهد العالي لدائرة تسلا موديل 3 وموديل واي.',
    partNumber: 'PMP-TSL-M3Y-HV-025',
    price: 245,
    stock: 31,
    category: 'coolant-pumps',
    isFeatured: true,
    averageRating: 4.8,
    totalReviews: 97,
    viewCount: 3890,
    purchaseCount: 118,
    installationDifficulty: 'medium',
    weight: 1.8,
    compatibility: teslaM3Y400,
    specifications: [spec('Loop', 'الدائرة', 'HV battery coolant', 'تبريد بطارية الجهد العالي')],
    keywordsEn: ['coolant pump', 'tesla', 'thermal', 'battery pump'],
    keywordsAr: ['مضخة تبريد', 'تسلا', 'حراري']
  }),
  // 25
  makeProduct({
    nameEn: 'Tesla Model 3 / Y Heat Pump Assembly',
    nameAr: 'مضخة حرارية لتسلا موديل 3 و واي',
    descEn: 'Octovalve heat pump assembly for Tesla Model 3 and Model Y cabin and battery heating.',
    descAr: 'تجميعة مضخة حرارية لتسلا موديل 3 وموديل واي لتدفئة المقصورة والبطارية.',
    partNumber: 'HP-TSL-M3Y-026',
    price: 890,
    stock: 5,
    category: 'heat-pumps',
    averageRating: 4.6,
    totalReviews: 42,
    viewCount: 2560,
    purchaseCount: 31,
    installationDifficulty: 'hard',
    weight: 8.4,
    compatibility: teslaM3Y400,
    specifications: [spec('System', 'النظام', 'Octovalve heat pump', 'مضخة حرارية أوكتوفالف')],
    keywordsEn: ['heat pump', 'tesla', 'thermal', 'octovalve'],
    keywordsAr: ['مضخة حرارية', 'تسلا']
  }),
  // 26 — low stock
  makeProduct({
    nameEn: 'Volkswagen ID.4 Battery Coolant Pump',
    nameAr: 'مضخة تبريد بطارية فولكسفاغن ID.4',
    descEn: 'MEB battery coolant pump for Volkswagen ID.4, ID.3 and ID.Buzz.',
    descAr: 'مضخة تبريد بطارية منصة MEB ل فولكسفاغن ID.4 و ID.3 و ID.Buzz.',
    partNumber: 'PMP-VW-ID4-BAT-027',
    price: 198,
    stock: 3,
    category: 'coolant-pumps',
    averageRating: 4.4,
    totalReviews: 28,
    viewCount: 1420,
    purchaseCount: 24,
    installationDifficulty: 'medium',
    weight: 1.5,
    compatibility: [
      fit('Volkswagen', 'ID.4', 2021, 2025, { voltageClass: '400V', transmission: 'Single-Speed' }),
      fit('Volkswagen', 'ID.3', 2020, 2025, { voltageClass: '400V', transmission: 'Single-Speed' }),
      fit('Volkswagen', 'ID.Buzz', 2022, 2025, { voltageClass: '400V', transmission: 'Single-Speed' })
    ],
    specifications: [spec('Circuit', 'الدائرة', 'Battery cooling', 'تبريد البطارية')],
    keywordsEn: ['coolant pump', 'id.4', 'volkswagen', 'thermal'],
    keywordsAr: ['مضخة تبريد', 'اي دي 4', 'فولكسفاغن']
  }),
  // 27
  makeProduct({
    nameEn: 'Kia EV6 Heat Pump Module',
    nameAr: 'وحدة مضخة حرارية لكيا EV6',
    descEn: 'Heat pump module for Kia EV6 and Hyundai Ioniq 5 cabin heating.',
    descAr: 'وحدة مضخة حرارية لكيا EV6 وهيونداي أيونيك 5 لتدفئة المقصورة.',
    partNumber: 'HP-KIA-EV6-028',
    price: 760,
    stock: 11,
    category: 'heat-pumps',
    averageRating: 4.5,
    totalReviews: 16,
    viewCount: 980,
    purchaseCount: 10,
    installationDifficulty: 'hard',
    weight: 7.2,
    compatibility: [
      fit('Kia', 'EV6', 2021, 2025, { voltageClass: '800V', connectorType: 'CCS2', transmission: 'Single-Speed' }),
      fit('Hyundai', 'Ioniq 5', 2021, 2025, { voltageClass: '800V', connectorType: 'CCS2', transmission: 'Single-Speed' })
    ],
    specifications: [spec('Type', 'النوع', 'E-GMP heat pump', 'مضخة حرارية E-GMP')],
    keywordsEn: ['heat pump', 'ev6', 'ioniq 5', 'thermal'],
    keywordsAr: ['مضخة حرارية', 'اي في 6', 'ايونيك 5']
  }),
  // 28 — Tesla Model 3 brakes 2019-2025
  makeProduct({
    nameEn: 'Tesla Model 3 Brake Pads Front 2019-2025',
    nameAr: 'فحمات فرامل أمامية لتسلا موديل 3 2019-2025',
    descEn: 'Low-dust ceramic front brake pads for Tesla Model 3 2019-2025. Tuned for regenerative braking with reliable friction at low speeds.',
    descAr: 'فحمات سيراميك أمامية قليلة الغبار لتسلا موديل 3 من 2019 إلى 2025. مضبوطة مع الفرملة الاسترجاعية.',
    partNumber: 'BP-TSL-M3-FR-029',
    price: 129,
    stock: 76,
    category: 'brake-pads',
    isFeatured: true,
    averageRating: 4.8,
    totalReviews: 188,
    viewCount: 4980,
    purchaseCount: 265,
    installationDifficulty: 'medium',
    weight: 2.1,
    compatibility: teslaM3Brakes.concat([
      fit('Tesla', 'Model Y', 2020, 2025, { drivetrain: 'AWD', transmission: 'Single-Speed' })
    ]),
    specifications: [
      spec('Compound', 'المادة', 'Low-dust ceramic', 'سيراميك قليل الغبار'),
      spec('Axle', 'المحور', 'Front', 'أمامي')
    ],
    keywordsEn: ['brake pads', 'tesla', 'model 3', 'brakes'],
    keywordsAr: ['فحمات الفرامل', 'تسلا', 'موديل 3', 'فرامل']
  }),
  // 29 — NLP: Nissan Leaf brake pads
  makeProduct({
    nameEn: 'Nissan Leaf Brake Pads Front',
    nameAr: 'فحمات فرامل أمامية لنيسان ليف',
    descEn: 'Front brake pads for Nissan Leaf. Quiet compound designed for frequent regenerative blending.',
    descAr: 'فحمات فرامل أمامية لنيسان ليف. تركيبة هادئة مع الفرملة الاسترجاعية المتكررة.',
    partNumber: 'BP-NIS-LEAF-FR-030',
    price: 78,
    stock: 64,
    category: 'brake-pads',
    isFeatured: true,
    averageRating: 4.7,
    totalReviews: 142,
    viewCount: 3210,
    purchaseCount: 198,
    installationDifficulty: 'easy',
    weight: 1.6,
    compatibility: [
      fit('Nissan', 'Leaf', 2018, 2024, { drivetrain: 'FWD', connectorType: 'CHAdeMO', voltageClass: '400V', transmission: 'Automatic' }),
      fit('Nissan', 'Ariya', 2022, 2025, { drivetrain: 'FWD', connectorType: 'CCS2', voltageClass: '400V', transmission: 'Automatic' })
    ],
    specifications: [spec('Axle', 'المحور', 'Front', 'أمامي')],
    keywordsEn: ['brake pads', 'leaf', 'nissan', 'brakes'],
    keywordsAr: ['فحمات الفرامل', 'ليف', 'نيسان', 'فرامل']
  }),
  // 30 — Tesla Model 3 discs 2019-2025
  makeProduct({
    nameEn: 'Tesla Model 3 Brake Discs Front Pair 2019-2025',
    nameAr: 'زوج أقراص فرامل أمامية لتسلا موديل 3 2019-2025',
    descEn: 'Vented front brake discs for Tesla Model 3 2019-2025. Pair includes both rotors.',
    descAr: 'أقراص فرامل أمامية مهواة لتسلا موديل 3 من 2019 إلى 2025. الزوج يشمل القرصين.',
    partNumber: 'BD-TSL-M3-FR-031',
    price: 219,
    stock: 38,
    category: 'brake-discs',
    isFeatured: false,
    averageRating: 4.7,
    totalReviews: 76,
    viewCount: 2540,
    purchaseCount: 94,
    installationDifficulty: 'medium',
    weight: 14.5,
    compatibility: teslaM3Brakes,
    specifications: [
      spec('Diameter', 'القطر', '320 mm vented', '320 ملم مهوى'),
      spec('Set', 'المجموعة', 'Front pair', 'زوج أمامي')
    ],
    keywordsEn: ['brake discs', 'rotors', 'tesla', 'model 3'],
    keywordsAr: ['أقراص الفرامل', 'تسلا', 'موديل 3']
  }),
  // 31
  makeProduct({
    nameEn: 'Hyundai Ioniq 5 Brake Pads Rear',
    nameAr: 'فحمات فرامل خلفية لهيونداي أيونيك 5',
    descEn: 'Rear EV brake pads for Hyundai Ioniq 5 and Kia EV6.',
    descAr: 'فحمات فرامل خلفية لهيونداي أيونيك 5 وكيا EV6.',
    partNumber: 'BP-HYN-IQ5-RR-032',
    price: 92,
    stock: 49,
    category: 'brake-pads',
    averageRating: 4.6,
    totalReviews: 55,
    viewCount: 1760,
    purchaseCount: 71,
    installationDifficulty: 'easy',
    weight: 1.4,
    compatibility: [
      fit('Hyundai', 'Ioniq 5', 2021, 2025, { transmission: 'Single-Speed' }),
      fit('Kia', 'EV6', 2021, 2025, { transmission: 'Single-Speed' })
    ],
    specifications: [spec('Axle', 'المحور', 'Rear', 'خلفي')],
    keywordsEn: ['brake pads', 'ioniq 5', 'ev6', 'hyundai'],
    keywordsAr: ['فحمات الفرامل', 'ايونيك 5', 'هيونداي']
  }),
  // 32
  makeProduct({
    nameEn: 'BMW i4 Front Brake Discs Pair',
    nameAr: 'زوج أقراص فرامل أمامية لبي ام دبليو i4',
    descEn: 'Vented front discs for BMW i4 and iX3.',
    descAr: 'أقراص أمامية مهواة لبي ام دبليو i4 و iX3.',
    partNumber: 'BD-BMW-I4-FR-033',
    price: 268,
    stock: 17,
    category: 'brake-discs',
    averageRating: 4.5,
    totalReviews: 23,
    viewCount: 890,
    purchaseCount: 18,
    installationDifficulty: 'medium',
    weight: 15.2,
    compatibility: [
      fit('BMW', 'i4', 2021, 2025, { drivetrain: 'RWD', voltageClass: '400V', transmission: 'Automatic' }),
      fit('BMW', 'iX3', 2021, 2025, { drivetrain: 'RWD', voltageClass: '400V', transmission: 'Automatic' })
    ],
    specifications: [spec('Diameter', 'القطر', '348 mm', '348 ملم')],
    keywordsEn: ['brake discs', 'bmw', 'i4', 'ix3'],
    keywordsAr: ['أقراص الفرامل', 'بي ام دبليو']
  }),
  // 33
  makeProduct({
    nameEn: 'Volkswagen ID.4 Brake Pads Front',
    nameAr: 'فحمات فرامل أمامية ل فولكسفاغن ID.4',
    descEn: 'Front pads for Volkswagen ID.4 and ID.3 with low residual drag.',
    descAr: 'فحمات أمامية ل فولكسفاغن ID.4 و ID.3 بسحب متبقٍ منخفض.',
    partNumber: 'BP-VW-ID4-FR-034',
    price: 99,
    stock: 52,
    category: 'brake-pads',
    averageRating: 4.6,
    totalReviews: 67,
    viewCount: 2010,
    purchaseCount: 84,
    installationDifficulty: 'easy',
    weight: 1.7,
    compatibility: [
      fit('Volkswagen', 'ID.4', 2021, 2025, { transmission: 'Single-Speed' }),
      fit('Volkswagen', 'ID.3', 2020, 2025, { transmission: 'Single-Speed' })
    ],
    specifications: [spec('Axle', 'المحور', 'Front', 'أمامي')],
    keywordsEn: ['brake pads', 'id.4', 'volkswagen'],
    keywordsAr: ['فحمات الفرامل', 'اي دي 4']
  }),
  // 34
  makeProduct({
    nameEn: 'Tesla Model 3 / Y Front Shock Absorbers Pair',
    nameAr: 'زوج مساعدات صدمات أمامية لتسلا موديل 3 و واي',
    descEn: 'Front shock pair tuned for Tesla Model 3 and Model Y curb weight.',
    descAr: 'زوج مساعدات أمامية مضبوط لوزن تسلا موديل 3 وموديل واي.',
    partNumber: 'SHK-TSL-M3Y-FR-035',
    price: 389,
    stock: 26,
    category: 'shocks',
    isFeatured: false,
    averageRating: 4.7,
    totalReviews: 48,
    viewCount: 1870,
    purchaseCount: 39,
    installationDifficulty: 'medium',
    weight: 8.6,
    compatibility: teslaM3Y400,
    specifications: [spec('Axle', 'المحور', 'Front pair', 'زوج أمامي')],
    keywordsEn: ['shocks', 'suspension', 'tesla', 'model 3'],
    keywordsAr: ['مساعدات', 'تعليق', 'تسلا']
  }),
  // 35
  makeProduct({
    nameEn: 'EV Tire 235/45R18 Low Rolling Resistance',
    nameAr: 'إطار سيارة كهربائية 235/45R18 منخفض المقاومة',
    descEn: 'Low rolling resistance EV tire 235/45R18 for Tesla Model 3 and Volkswagen ID.3.',
    descAr: 'إطار منخفض المقاومة 235/45R18 لتسلا موديل 3 وفولكسفاغن ID.3.',
    partNumber: 'TIR-EV-23545R18-036',
    price: 145,
    stock: 80,
    category: 'ev-tires',
    isFeatured: true,
    averageRating: 4.6,
    totalReviews: 112,
    viewCount: 3340,
    purchaseCount: 156,
    installationDifficulty: 'easy',
    weight: 10.2,
    compatibility: [
      fit('Tesla', 'Model 3', 2019, 2025, { transmission: 'Single-Speed' }),
      fit('Volkswagen', 'ID.3', 2020, 2025, { transmission: 'Single-Speed' }),
      fit('BMW', 'i4', 2021, 2025, { transmission: 'Automatic' })
    ],
    specifications: [
      spec('Size', 'المقاس', '235/45R18', '235/45R18'),
      spec('Load', 'الحمل', 'XL EV', 'حمل إضافي للسيارات الكهربائية')
    ],
    keywordsEn: ['tire', 'ev tire', '235/45r18', 'tesla'],
    keywordsAr: ['إطار', 'إطارات كهربائية', 'تسلا']
  }),
  // 36
  makeProduct({
    nameEn: 'Kia EV6 Rear Shock Absorbers Pair',
    nameAr: 'زوج مساعدات خلفية لكيا EV6',
    descEn: 'Rear shocks for Kia EV6 and Hyundai Ioniq 5.',
    descAr: 'مساعدات خلفية لكيا EV6 وهيونداي أيونيك 5.',
    partNumber: 'SHK-KIA-EV6-RR-037',
    price: 298,
    stock: 20,
    category: 'shocks',
    averageRating: 4.5,
    totalReviews: 31,
    viewCount: 1110,
    purchaseCount: 22,
    installationDifficulty: 'medium',
    weight: 7.4,
    compatibility: [
      fit('Kia', 'EV6', 2021, 2025, { transmission: 'Single-Speed' }),
      fit('Hyundai', 'Ioniq 5', 2021, 2025, { transmission: 'Single-Speed' })
    ],
    specifications: [spec('Axle', 'المحور', 'Rear pair', 'زوج خلفي')],
    keywordsEn: ['shocks', 'ev6', 'ioniq 5', 'suspension'],
    keywordsAr: ['مساعدات', 'اي في 6', 'تعليق']
  }),
  // 37
  makeProduct({
    nameEn: 'MG4 EV Tire 215/50R17',
    nameAr: 'إطار ام جي MG4 مقاس 215/50R17',
    descEn: 'EV-rated tire 215/50R17 for MG MG4 and MG ZS EV.',
    descAr: 'إطار كهربائي 215/50R17 لام جي MG4 و MG ZS EV.',
    partNumber: 'TIR-MG-MG4-21550-038',
    price: 119,
    stock: 44,
    category: 'ev-tires',
    averageRating: 4.4,
    totalReviews: 39,
    viewCount: 1280,
    purchaseCount: 58,
    installationDifficulty: 'easy',
    weight: 8.8,
    compatibility: [
      fit('MG', 'MG4', 2022, 2025, { drivetrain: 'RWD', transmission: 'Automatic' }),
      fit('MG', 'MG ZS EV', 2020, 2025, { drivetrain: 'FWD', transmission: 'Automatic' })
    ],
    specifications: [spec('Size', 'المقاس', '215/50R17', '215/50R17')],
    keywordsEn: ['tire', 'mg4', 'ev tire'],
    keywordsAr: ['إطار', 'ام جي 4']
  }),
  // 38
  makeProduct({
    nameEn: 'Tesla Model 3 Repeater Camera',
    nameAr: 'كاميرا جانبية لتسلا موديل 3',
    descEn: 'Side repeater camera for Tesla Autopilot on Model 3 and Model Y.',
    descAr: 'كاميرا جانبية لأنظمة أوتوبايلوت في تسلا موديل 3 وموديل واي.',
    partNumber: 'CAM-TSL-M3-RPT-039',
    price: 175,
    stock: 29,
    category: 'cameras',
    averageRating: 4.6,
    totalReviews: 54,
    viewCount: 2450,
    purchaseCount: 63,
    installationDifficulty: 'medium',
    weight: 0.15,
    compatibility: teslaM3Y400,
    specifications: [spec('System', 'النظام', 'Autopilot repeater cam', 'كاميرا أوتوبايلوت جانبية')],
    keywordsEn: ['camera', 'tesla', 'adas', 'autopilot'],
    keywordsAr: ['كاميرا', 'تسلا', 'أنظمة مساعدة']
  }),
  // 39
  makeProduct({
    nameEn: 'Volkswagen ID.4 Parking Sensor Set',
    nameAr: 'طقم حساسات ركن ل فولكسفاغن ID.4',
    descEn: 'Ultrasonic parking sensor set for Volkswagen ID.4 bumpers.',
    descAr: 'طقم حساسات ركن بالموجات فوق الصوتية لصدام فولكسفاغن ID.4.',
    partNumber: 'PRK-VW-ID4-USS-040',
    price: 89,
    stock: 36,
    category: 'parking-sensors',
    averageRating: 4.5,
    totalReviews: 47,
    viewCount: 1340,
    purchaseCount: 52,
    installationDifficulty: 'easy',
    weight: 0.35,
    compatibility: [
      fit('Volkswagen', 'ID.4', 2021, 2025, { transmission: 'Single-Speed' }),
      fit('Volkswagen', 'ID.3', 2020, 2025, { transmission: 'Single-Speed' }),
      fit('Volkswagen', 'ID.Buzz', 2022, 2025, { transmission: 'Single-Speed' })
    ],
    specifications: [spec('Type', 'النوع', 'Ultrasonic 4-pc', 'فوق صوتي 4 قطع')],
    keywordsEn: ['parking sensors', 'id.4', 'pdc', 'adas'],
    keywordsAr: ['حساسات ركن', 'اي دي 4']
  }),
  // 40
  makeProduct({
    nameEn: 'Hyundai Ioniq 5 Front ADAS Camera',
    nameAr: 'كاميرا أمامية لأنظمة المساعدة لأيونيك 5',
    descEn: 'Windshield ADAS camera for Hyundai Ioniq 5 and Ioniq 6.',
    descAr: 'كاميرا زجاج أمامي لأنظمة المساعدة في هيونداي أيونيك 5 و 6.',
    partNumber: 'CAM-HYN-IQ5-FWD-041',
    price: 420,
    stock: 14,
    category: 'cameras',
    averageRating: 4.4,
    totalReviews: 18,
    viewCount: 990,
    purchaseCount: 12,
    installationDifficulty: 'hard',
    weight: 0.22,
    compatibility: [
      fit('Hyundai', 'Ioniq 5', 2021, 2025, { transmission: 'Single-Speed' }),
      fit('Hyundai', 'Ioniq 6', 2022, 2025, { transmission: 'Single-Speed' })
    ],
    specifications: [spec('Mount', 'التثبيت', 'Windshield forward cam', 'كاميرا أمامية على الزجاج')],
    keywordsEn: ['camera', 'ioniq 5', 'adas', 'hyundai'],
    keywordsAr: ['كاميرا', 'ايونيك 5', 'أنظمة مساعدة']
  }),
  // 41
  makeProduct({
    nameEn: 'BMW iX Parking Sensor Kit',
    nameAr: 'طقم حساسات ركن لبي ام دبليو iX',
    descEn: 'Front and rear parking sensors for BMW iX and iX3.',
    descAr: 'حساسات ركن أمامية وخلفية لبي ام دبليو iX و iX3.',
    partNumber: 'PRK-BMW-IX-USS-042',
    price: 128,
    stock: 23,
    category: 'parking-sensors',
    averageRating: 4.5,
    totalReviews: 21,
    viewCount: 760,
    purchaseCount: 17,
    installationDifficulty: 'easy',
    weight: 0.4,
    compatibility: [
      fit('BMW', 'iX', 2021, 2025, { transmission: 'Automatic' }),
      fit('BMW', 'iX3', 2021, 2025, { transmission: 'Automatic' })
    ],
    specifications: [spec('Type', 'النوع', 'Ultrasonic kit', 'طقم فوق صوتي')],
    keywordsEn: ['parking sensors', 'bmw', 'ix', 'pdc'],
    keywordsAr: ['حساسات ركن', 'بي ام دبليو']
  }),
  // 42 — NLP: BYD Atto 3 cabin filter
  makeProduct({
    nameEn: 'BYD Atto 3 Cabin Filter',
    nameAr: 'فلتر هواء مقصورة لبي واي دي أتّو 3',
    descEn: 'Activated-carbon cabin filter for BYD Atto 3. Captures PM2.5, pollen, and charging-bay odours.',
    descAr: 'فلتر مقصورة بكربون نشط لبي واي دي أتّو 3. يلتقط الجسيمات الدقيقة وحبوب اللقاح وروائح مواقف الشحن.',
    partNumber: 'CAF-BYD-AT3-043',
    price: 24,
    stock: 140,
    category: 'cabin-filters',
    isFeatured: true,
    averageRating: 4.8,
    totalReviews: 210,
    viewCount: 4120,
    purchaseCount: 355,
    installationDifficulty: 'easy',
    weight: 0.22,
    dimensions: { length: 24, width: 20, height: 3 },
    warrantyMonths: 12,
    compatibility: [
      fit('BYD', 'Atto 3', 2022, 2025, { drivetrain: 'FWD', connectorType: 'Type2', voltageClass: '400V', transmission: 'Automatic' }),
      fit('BYD', 'Dolphin', 2023, 2025, { drivetrain: 'FWD', transmission: 'Automatic' }),
      fit('BYD', 'Seal', 2023, 2025, { drivetrain: 'RWD', transmission: 'Automatic' })
    ],
    specifications: [
      spec('Type', 'النوع', 'Activated carbon', 'كربون نشط'),
      spec('Layers', 'الطبقات', '4-layer PM2.5', '4 طبقات للجسيمات الدقيقة')
    ],
    keywordsEn: ['cabin filter', 'atto 3', 'byd', 'pollen', 'filter'],
    keywordsAr: ['فلتر المقصورة', 'اتو 3', 'بي واي دي', 'فلتر هواء']
  }),
  // 43
  makeProduct({
    nameEn: 'Tesla Model 3 HEPA Cabin Filter',
    nameAr: 'فلتر هيبا لمقصورة تسلا موديل 3',
    descEn: 'HEPA cabin filter for Tesla Model 3 and Model Y Bioweapon Defense Mode intake.',
    descAr: 'فلتر هيبا لمقصورة تسلا موديل 3 وموديل واي لمنفذ وضع الحماية الحيوية.',
    partNumber: 'CAF-TSL-M3-HEPA-044',
    price: 48,
    stock: 95,
    category: 'cabin-filters',
    isFeatured: false,
    averageRating: 4.9,
    totalReviews: 176,
    viewCount: 3880,
    purchaseCount: 241,
    installationDifficulty: 'easy',
    weight: 0.45,
    compatibility: teslaM3Y400,
    specifications: [spec('Grade', 'الدرجة', 'HEPA H13', 'هيبا H13')],
    keywordsEn: ['cabin filter', 'hepa', 'tesla', 'model 3'],
    keywordsAr: ['فلتر المقصورة', 'هيبا', 'تسلا']
  }),
  // 44
  makeProduct({
    nameEn: 'Volkswagen ID.4 Cabin Filter',
    nameAr: 'فلتر مقصورة فولكسفاغن ID.4',
    descEn: 'Cabin pollen filter for Volkswagen ID.4, ID.3 and ID.Buzz.',
    descAr: 'فلتر حبوب لقاح لمقصورة فولكسفاغن ID.4 و ID.3 و ID.Buzz.',
    partNumber: 'CAF-VW-ID4-045',
    price: 22,
    stock: 110,
    category: 'cabin-filters',
    averageRating: 4.5,
    totalReviews: 83,
    viewCount: 1670,
    purchaseCount: 129,
    installationDifficulty: 'easy',
    weight: 0.18,
    compatibility: [
      fit('Volkswagen', 'ID.4', 2021, 2025, { transmission: 'Single-Speed' }),
      fit('Volkswagen', 'ID.3', 2020, 2025, { transmission: 'Single-Speed' }),
      fit('Volkswagen', 'ID.Buzz', 2022, 2025, { transmission: 'Single-Speed' })
    ],
    specifications: [spec('Type', 'النوع', 'Pollen + carbon', 'حبوب لقاح وكربون')],
    keywordsEn: ['cabin filter', 'id.4', 'volkswagen'],
    keywordsAr: ['فلتر المقصورة', 'اي دي 4']
  }),
  // 45
  makeProduct({
    nameEn: 'Tesla Model 3 Power Folding Side Mirror',
    nameAr: 'مرآة جانبية قابلة للطي لتسلا موديل 3',
    descEn: 'Power-folding side mirror with camera mount for Tesla Model 3.',
    descAr: 'مرآة جانبية كهربائية مع حامل كاميرا لتسلا موديل 3.',
    partNumber: 'MIR-TSL-M3-LH-046',
    price: 265,
    stock: 18,
    category: 'mirrors-lights',
    averageRating: 4.4,
    totalReviews: 32,
    viewCount: 1540,
    purchaseCount: 27,
    installationDifficulty: 'medium',
    weight: 1.9,
    compatibility: [
      fit('Tesla', 'Model 3', 2019, 2025, { transmission: 'Single-Speed' }),
      fit('Tesla', 'Model Y', 2020, 2025, { transmission: 'Single-Speed' })
    ],
    specifications: [spec('Side', 'الجهة', 'Left (EU)', 'يسار أوروبا')],
    keywordsEn: ['mirror', 'tesla', 'side mirror', 'body'],
    keywordsAr: ['مرآة', 'تسلا', 'مرآة جانبية']
  }),
  // 46
  makeProduct({
    nameEn: 'Hyundai Ioniq 5 LED Headlight',
    nameAr: 'ضوء أمامي LED لهيونداي أيونيك 5',
    descEn: 'Pixel LED headlight for Hyundai Ioniq 5 including charge-status signature lighting.',
    descAr: 'ضوء أمامي LED بكسل لهيونداي أيونيك 5 مع إضاءة حالة الشحن.',
    partNumber: 'LGT-HYN-IQ5-HL-047',
    price: 540,
    stock: 9,
    category: 'mirrors-lights',
    isFeatured: false,
    averageRating: 4.7,
    totalReviews: 24,
    viewCount: 2110,
    purchaseCount: 16,
    installationDifficulty: 'hard',
    weight: 4.2,
    compatibility: [
      fit('Hyundai', 'Ioniq 5', 2021, 2025, { connectorType: 'CCS2', voltageClass: '800V', transmission: 'Single-Speed' })
    ],
    specifications: [spec('Type', 'النوع', 'Pixel LED', 'LED بكسل')],
    keywordsEn: ['headlight', 'ioniq 5', 'led', 'lights'],
    keywordsAr: ['ضوء أمامي', 'ايونيك 5', 'ليد']
  }),
  // 47
  makeProduct({
    nameEn: 'BMW iX3 Door Mirror Assembly',
    nameAr: 'تجميعة مرآة باب لبي ام دبليو iX3',
    descEn: 'Heated door mirror for BMW iX3 with blind-spot LED.',
    descAr: 'مرآة باب مدفأة لبي ام دبليو iX3 مع ضوء نقطة عمياء.',
    partNumber: 'MIR-BMW-IX3-RH-048',
    price: 310,
    stock: 12,
    category: 'mirrors-lights',
    averageRating: 4.5,
    totalReviews: 14,
    viewCount: 640,
    purchaseCount: 9,
    installationDifficulty: 'medium',
    weight: 1.7,
    compatibility: [
      fit('BMW', 'iX3', 2021, 2025, { drivetrain: 'RWD', connectorType: 'CCS2', voltageClass: '400V', transmission: 'Automatic' }),
      fit('BMW', 'iX', 2021, 2025, { drivetrain: 'AWD', connectorType: 'CCS2', voltageClass: '400V', transmission: 'Automatic' })
    ],
    specifications: [spec('Side', 'الجهة', 'Right (EU)', 'يمين أوروبا')],
    keywordsEn: ['mirror', 'bmw', 'ix3', 'door mirror'],
    keywordsAr: ['مرآة', 'بي ام دبليو', 'اي اكس 3']
  })
];

// =============================================================================
// MAIN SEEDER FUNCTION
// =============================================================================
const seedDatabase = async () => {
  try {
    console.log('\n🌱 ================================');
    console.log('   EV AUTO PARTS DATABASE SEEDER  ');
    console.log('================================🌱\n');

    // Sanity check before touching the database
    const partNumbers = productsData.map((p) => p.partNumber);
    const uniquePartNumbers = new Set(partNumbers);
    if (productsData.length < 40) {
      throw new Error(`Need at least 40 products, got ${productsData.length}`);
    }
    if (uniquePartNumbers.size !== partNumbers.length) {
      throw new Error('Duplicate part numbers found in productsData');
    }
    console.log(`🧪 Pre-check: ${productsData.length} products, ${uniquePartNumbers.size} unique part numbers\n`);

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
    // insertMany skips User pre-save hooks, so hash passwords here (10 rounds)
    // ----------------------------------------------------------------
    console.log('👥 Creating users...');
    const hashedUsers = await Promise.all(
      usersData.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    );
    const createdUsers = await User.insertMany(hashedUsers);

    const adminUser = createdUsers.find((u) => u.role === 'administrator');
    const suppliers = createdUsers.filter((u) => u.role === 'supplier');
    const customers = createdUsers.filter((u) => u.role === 'customer');

    console.log(`✅ Created ${createdUsers.length} users:`);
    console.log(`   - Admins: ${createdUsers.filter((u) => u.role === 'administrator').length}`);
    console.log(`   - Suppliers: ${suppliers.length}`);
    console.log(`   - Customers: ${customers.length}\n`);

    // ----------------------------------------------------------------
    // Step 4: Seed Categories (hierarchical)
    // ----------------------------------------------------------------
    console.log('📁 Creating categories...');
    const createdMainCats = await Category.insertMany(mainCategoriesData);

    const catSlugToId = {};
    createdMainCats.forEach((cat) => {
      catSlugToId[cat.slug] = cat._id;
    });

    const subCatsWithParents = subCategoriesData.map((sub) => ({
      name: sub.name,
      slug: sub.slug,
      description: sub.description,
      parent: catSlugToId[sub.parentSlug],
      order: sub.order
    }));
    const createdSubCats = await Category.insertMany(subCatsWithParents);

    createdSubCats.forEach((cat) => {
      catSlugToId[cat.slug] = cat._id;
    });

    const missingCategory = productsData.find((p) => !catSlugToId[p.category]);
    if (missingCategory) {
      throw new Error(`Unknown product category slug: ${missingCategory.category} (${missingCategory.partNumber})`);
    }

    const totalCategories = createdMainCats.length + createdSubCats.length;
    console.log(`✅ Created ${totalCategories} categories (${createdMainCats.length} main + ${createdSubCats.length} sub)\n`);

    // ----------------------------------------------------------------
    // Step 5: Seed Products
    // ----------------------------------------------------------------
    console.log('📦 Creating products...');

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
      // Ahmed
      {
        user: customers[0]._id,
        brand: 'Tesla',
        model: 'Model 3',
        year: 2022,
        drivetrain: 'RWD',
        connectorType: 'NACS',
        voltageClass: '400V',
        engineType: 'Electric',
        transmission: 'Single-Speed',
        batteryCapacityKwh: 60,
        nickname: 'Family EV',
        isPrimary: true,
        mileage: 28000
      },
      {
        user: customers[0]._id,
        brand: 'BYD',
        model: 'Atto 3',
        year: 2023,
        drivetrain: 'FWD',
        connectorType: 'Type2',
        voltageClass: '400V',
        engineType: 'Electric',
        transmission: 'Automatic',
        batteryCapacityKwh: 60,
        nickname: 'City EV',
        isPrimary: false,
        mileage: 14000
      },
      // Fatima
      {
        user: customers[1]._id,
        brand: 'Hyundai',
        model: 'Ioniq 5',
        year: 2023,
        drivetrain: 'AWD',
        connectorType: 'CCS2',
        voltageClass: '800V',
        engineType: 'Electric',
        transmission: 'Single-Speed',
        batteryCapacityKwh: 77.4,
        nickname: 'Pixel SUV',
        isPrimary: true,
        mileage: 19000
      },
      // Omar
      {
        user: customers[2]._id,
        brand: 'Volkswagen',
        model: 'ID.4',
        year: 2022,
        drivetrain: 'RWD',
        connectorType: 'CCS2',
        voltageClass: '400V',
        engineType: 'Electric',
        transmission: 'Single-Speed',
        batteryCapacityKwh: 77,
        nickname: 'Family ID',
        isPrimary: true,
        mileage: 31000
      },
      {
        user: customers[2]._id,
        brand: 'Kia',
        model: 'EV6',
        year: 2023,
        drivetrain: 'AWD',
        connectorType: 'CCS2',
        voltageClass: '800V',
        engineType: 'Electric',
        transmission: 'Single-Speed',
        batteryCapacityKwh: 77.4,
        isPrimary: false,
        mileage: 16000
      },
      // Layla
      {
        user: customers[3]._id,
        brand: 'BYD',
        model: 'Atto 3',
        year: 2023,
        drivetrain: 'FWD',
        connectorType: 'Type2',
        voltageClass: '400V',
        engineType: 'Electric',
        transmission: 'Automatic',
        batteryCapacityKwh: 60,
        nickname: 'Electric Lady',
        isPrimary: true,
        mileage: 12000
      },
      // Khalid
      {
        user: customers[4]._id,
        brand: 'Nissan',
        model: 'Leaf',
        year: 2021,
        drivetrain: 'FWD',
        connectorType: 'CHAdeMO',
        voltageClass: '400V',
        engineType: 'Electric',
        transmission: 'Automatic',
        batteryCapacityKwh: 40,
        nickname: 'Daily Leaf',
        isPrimary: true,
        mileage: 54000
      },
      {
        user: customers[4]._id,
        brand: 'Tesla',
        model: 'Model Y',
        year: 2024,
        drivetrain: 'Dual-Motor',
        connectorType: 'NACS',
        voltageClass: '400V',
        engineType: 'Electric',
        transmission: 'Single-Speed',
        batteryCapacityKwh: 75,
        isPrimary: false,
        mileage: 8000
      },
      // Sara
      {
        user: customers[5]._id,
        brand: 'MG',
        model: 'MG4',
        year: 2023,
        drivetrain: 'RWD',
        connectorType: 'CCS2',
        voltageClass: '400V',
        engineType: 'Electric',
        transmission: 'Automatic',
        batteryCapacityKwh: 64,
        nickname: 'Red MG',
        isPrimary: true,
        mileage: 21000
      },
      // Mohammed
      {
        user: customers[6]._id,
        brand: 'BMW',
        model: 'iX3',
        year: 2022,
        drivetrain: 'RWD',
        connectorType: 'CCS2',
        voltageClass: '400V',
        engineType: 'Electric',
        transmission: 'Automatic',
        batteryCapacityKwh: 80,
        nickname: 'BMW Electric',
        isPrimary: true,
        mileage: 27000
      },
      {
        user: customers[6]._id,
        brand: 'Hyundai',
        model: 'Ioniq 6',
        year: 2024,
        drivetrain: 'RWD',
        connectorType: 'CCS2',
        voltageClass: '800V',
        engineType: 'Electric',
        transmission: 'Single-Speed',
        batteryCapacityKwh: 77.4,
        isPrimary: false,
        mileage: 6000
      },
      // Nour
      {
        user: customers[7]._id,
        brand: 'Tesla',
        model: 'Model 3',
        year: 2021,
        drivetrain: 'RWD',
        connectorType: 'CCS2',
        voltageClass: '400V',
        engineType: 'Electric',
        transmission: 'Single-Speed',
        batteryCapacityKwh: 55,
        nickname: 'White Tesla',
        isPrimary: true,
        mileage: 42000
      },
      // Tariq
      {
        user: customers[8]._id,
        brand: 'BYD',
        model: 'Han',
        year: 2022,
        drivetrain: 'AWD',
        connectorType: 'Type2',
        voltageClass: '400V',
        engineType: 'Electric',
        transmission: 'Automatic',
        batteryCapacityKwh: 85,
        isPrimary: true,
        mileage: 31000
      },
      // Rima
      {
        user: customers[9]._id,
        brand: 'Kia',
        model: 'EV6',
        year: 2023,
        drivetrain: 'AWD',
        connectorType: 'CCS2',
        voltageClass: '800V',
        engineType: 'Electric',
        transmission: 'Single-Speed',
        batteryCapacityKwh: 77.4,
        nickname: 'GT-Line',
        isPrimary: true,
        mileage: 15000
      },
      // Youssef (inactive user)
      {
        user: customers[10]._id,
        brand: 'Nissan',
        model: 'Leaf',
        year: 2019,
        drivetrain: 'FWD',
        connectorType: 'CHAdeMO',
        voltageClass: '400V',
        engineType: 'Electric',
        transmission: 'Automatic',
        batteryCapacityKwh: 40,
        nickname: 'Old Leaf',
        isPrimary: true,
        mileage: 128000,
        notes: 'High mileage, 12V battery and brake pads due'
      }
    ];

    const createdVehicles = await Vehicle.insertMany(vehiclesData);
    console.log(`✅ Created ${createdVehicles.length} vehicles\n`);

    // ----------------------------------------------------------------
    // Step 7: Seed Orders (10 orders, products 0..39 only)
    // ----------------------------------------------------------------
    console.log('🛒 Creating orders...');

    const makeSnapshot = (product) => ({
      name: { ar: product.name.ar, en: product.name.en },
      partNumber: product.partNumber,
      images: product.images.map((img) => ({ url: img.url }))
    });

    const makeOrderNumber = (num) => `ORD-20240219-${String(num).padStart(4, '0')}`;

    const makeOrderItems = (pairs) =>
      pairs.map(([idx, qty]) => ({
        product: createdProducts[idx]._id,
        quantity: qty,
        price: createdProducts[idx].price,
        productSnapshot: makeSnapshot(createdProducts[idx])
      }));

    const calcTotals = (items, shipping, discount = 0) => {
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const tax = Math.round(subtotal * 0.19);
      const total = Math.round(subtotal * 1.19) + shipping - discount;
      return { subtotal, tax, shipping, discount, total };
    };

    const items1 = makeOrderItems([[0, 1], [8, 1]]);
    const items2 = makeOrderItems([[10, 1], [9, 1]]);
    const items3 = makeOrderItems([[1, 1], [33, 2], [39, 1]]);
    const items4 = makeOrderItems([[9, 2]]);
    const items5 = makeOrderItems([[16, 1]]);
    const items6 = makeOrderItems([[28, 1], [30, 1], [35, 1]]);
    const items7 = makeOrderItems([[12, 1], [2, 1]]);
    const items8 = makeOrderItems([[29, 1], [15, 1]]);
    const items9 = makeOrderItems([[24, 1], [6, 1]]);
    const items10 = makeOrderItems([[18, 1]]);

    const ordersToInsert = [
      // 1 Ahmed — delivered, card, Tesla 12V + CCS2 cable
      {
        orderNumber: makeOrderNumber(1),
        customer: customers[0]._id,
        items: items1,
        ...calcTotals(items1, 0),
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
          { status: 'delivered', date: new Date('2024-01-18'), note: 'Delivered', updatedBy: adminUser._id }
        ],
        trackingNumber: 'DHL-EV-0012345678',
        shippingCarrier: 'DHL',
        actualDelivery: new Date('2024-01-18'),
        estimatedDelivery: new Date('2024-01-19')
      },
      // 2 Fatima — shipped, card, wallbox + Type 2 cable
      {
        orderNumber: makeOrderNumber(2),
        customer: customers[1]._id,
        items: items2,
        ...calcTotals(items2, 0),
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
      // 3 Omar — processing, bank transfer
      {
        orderNumber: makeOrderNumber(3),
        customer: customers[2]._id,
        items: items3,
        ...calcTotals(items3, 0),
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
      // 4 Layla — confirmed, cash on delivery, cabin filters
      {
        orderNumber: makeOrderNumber(4),
        customer: customers[3]._id,
        items: items4,
        ...calcTotals(items4, 12),
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
      // 5 Khalid — cancelled MG4 OBC
      {
        orderNumber: makeOrderNumber(5),
        customer: customers[4]._id,
        items: items5,
        ...calcTotals(items5, 12),
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
      // 6 Sara — delivered Tesla pads/discs
      {
        orderNumber: makeOrderNumber(6),
        customer: customers[5]._id,
        items: items6,
        ...calcTotals(items6, 0, 20),
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
      // 7 Mohammed — pending Ioniq charge port + 12V
      {
        orderNumber: makeOrderNumber(7),
        customer: customers[6]._id,
        items: items7,
        ...calcTotals(items7, 12),
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
      // 8 Nour — processing (Tesla camera + Leaf pads for a second household car)
      {
        orderNumber: makeOrderNumber(8),
        customer: customers[7]._id,
        items: items8,
        ...calcTotals(items8, 0),
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
      // 9 Ahmed — second order delivered, coolant pump + BMS
      {
        orderNumber: makeOrderNumber(9),
        customer: customers[0]._id,
        items: items9,
        ...calcTotals(items9, 0, 10),
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
      // 10 Tariq — pending failed card
      {
        orderNumber: makeOrderNumber(10),
        customer: customers[8]._id,
        items: items10,
        ...calcTotals(items10, 12),
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
    // Step 8: Seed Carts (~6 customers)
    // ----------------------------------------------------------------
    console.log('🛍️  Creating carts...');

    const cartsToInsert = [
      {
        user: customers[0]._id,
        items: [
          { product: createdProducts[28]._id, quantity: 1, priceAtAdd: createdProducts[28].price },
          { product: createdProducts[9]._id, quantity: 1, priceAtAdd: createdProducts[9].price }
        ]
      },
      {
        user: customers[1]._id,
        items: [
          { product: createdProducts[12]._id, quantity: 1, priceAtAdd: createdProducts[12].price },
          { product: createdProducts[2]._id, quantity: 1, priceAtAdd: createdProducts[2].price },
          { product: createdProducts[31]._id, quantity: 1, priceAtAdd: createdProducts[31].price }
        ]
      },
      {
        user: customers[2]._id,
        items: [
          { product: createdProducts[1]._id, quantity: 1, priceAtAdd: createdProducts[1].price }
        ]
      },
      {
        user: customers[4]._id,
        items: [
          { product: createdProducts[29]._id, quantity: 1, priceAtAdd: createdProducts[29].price },
          { product: createdProducts[15]._id, quantity: 1, priceAtAdd: createdProducts[15].price }
        ]
      },
      {
        user: customers[5]._id,
        items: [
          { product: createdProducts[16]._id, quantity: 1, priceAtAdd: createdProducts[16].price },
          { product: createdProducts[37]._id, quantity: 2, priceAtAdd: createdProducts[37].price }
        ]
      },
      {
        user: customers[6]._id,
        items: [
          { product: createdProducts[32]._id, quantity: 1, priceAtAdd: createdProducts[32].price },
          { product: createdProducts[18]._id, quantity: 1, priceAtAdd: createdProducts[18].price },
          { product: createdProducts[41]._id, quantity: 1, priceAtAdd: createdProducts[41].price }
        ]
      }
    ];

    const createdCarts = await Cart.insertMany(cartsToInsert);
    console.log(`✅ Created ${createdCarts.length} carts\n`);

    // ----------------------------------------------------------------
    // Step 9: Seed Wishlists (~10 customers)
    // ----------------------------------------------------------------
    console.log('❤️  Creating wishlists...');

    const wishlistsToInsert = [
      { user: customers[0]._id, products: [createdProducts[0]._id, createdProducts[8]._id, createdProducts[10]._id, createdProducts[24]._id] },
      { user: customers[1]._id, products: [createdProducts[12]._id, createdProducts[2]._id, createdProducts[27]._id] },
      { user: customers[2]._id, products: [createdProducts[1]._id, createdProducts[8]._id, createdProducts[26]._id, createdProducts[33]._id, createdProducts[39]._id] },
      { user: customers[3]._id, products: [createdProducts[42]._id, createdProducts[5]._id] },
      { user: customers[4]._id, products: [createdProducts[29]._id, createdProducts[0]._id, createdProducts[15]._id] },
      { user: customers[5]._id, products: [createdProducts[16]._id, createdProducts[10]._id, createdProducts[37]._id, createdProducts[9]._id] },
      { user: customers[6]._id, products: [createdProducts[32]._id, createdProducts[18]._id, createdProducts[40]._id] },
      { user: customers[7]._id, products: [createdProducts[0]._id, createdProducts[28]._id, createdProducts[43]._id] },
      { user: customers[8]._id, products: [createdProducts[5]._id, createdProducts[21]._id] },
      { user: customers[9]._id, products: [createdProducts[8]._id, createdProducts[31]._id, createdProducts[36]._id, createdProducts[7]._id] }
    ];

    const createdWishlists = await Wishlist.insertMany(wishlistsToInsert);
    console.log(`✅ Created ${createdWishlists.length} wishlists\n`);

    // ----------------------------------------------------------------
    // Step 10: Seed Chat Sessions (EV NLP demo topics)
    // ----------------------------------------------------------------
    console.log('💬 Creating chat sessions...');

    const suggest = (product) => ({
      productId: product._id,
      name: product.name.en,
      partNumber: product.partNumber,
      price: product.price,
      currency: 'EUR',
      image: product.images[0]?.url
    });

    const chatSessionsToInsert = [
      {
        sessionId: 'sess-ahmed-001',
        user: customers[0]._id,
        title: 'Tesla 12V battery for Model 3',
        messages: [
          { role: 'user', content: 'I want a battery for a Tesla 2022', timestamp: new Date('2024-02-10T10:00:00') },
          {
            role: 'assistant',
            content: 'I found the Tesla Model 3 12V auxiliary battery (Part# BAT-TSL-12V-M3-001) compatible with Model 3 2019-2025, including your 2022. It restores 12V power for computers, locks, and lights. Would you also like the matching high-voltage coolant pump?',
            suggestedProducts: [suggest(createdProducts[0])],
            timestamp: new Date('2024-02-10T10:00:05')
          },
          { role: 'user', content: 'اريد بطارية لسيارة تسلا موديل 2022', timestamp: new Date('2024-02-10T10:01:00') },
          {
            role: 'assistant',
            content: 'نعم، البطارية المساعدة 12 فولت لتسلا موديل 3 مناسبة لسنة 2022. القطعة متوفرة في المخزون ويمكن إضافتها إلى السلة.',
            suggestedProducts: [suggest(createdProducts[0])],
            timestamp: new Date('2024-02-10T10:01:05')
          }
        ],
        isActive: false,
        lastMessageAt: new Date('2024-02-10T10:01:05')
      },
      {
        sessionId: 'sess-fatima-001',
        user: customers[1]._id,
        title: 'Fast charger for electric car',
        messages: [
          { role: 'user', content: 'Find a fast charger for an electric car', timestamp: new Date('2024-02-15T14:00:00') },
          {
            role: 'assistant',
            content: 'For DC fast charging I recommend the CCS2 DC Fast Charging Cable 250A. Your Hyundai Ioniq 5 uses CCS2 at 800V, so this cable is a match. For home charging, the 11 kW Type 2 wallbox is the better overnight option.',
            suggestedProducts: [suggest(createdProducts[8]), suggest(createdProducts[10])],
            timestamp: new Date('2024-02-15T14:00:05')
          },
          { role: 'user', content: 'ابحث عن شاحن سريع لسيارة كهربائية', timestamp: new Date('2024-02-15T14:01:00') },
          {
            role: 'assistant',
            content: 'كابل الشحن السريع CCS2 وكابل تايب 2 المنزلي والشاحن الجداري 11 كيلوواط جميعها متوفرة. أيونيك 5 لديك تدعم CCS2 للشحن السريع.',
            suggestedProducts: [suggest(createdProducts[8])],
            timestamp: new Date('2024-02-15T14:01:10')
          }
        ],
        isActive: true,
        lastMessageAt: new Date('2024-02-15T14:01:10')
      },
      {
        sessionId: 'sess-omar-001',
        user: customers[2]._id,
        title: 'What parts fit my car?',
        messages: [
          { role: 'user', content: 'What parts fit my car?', timestamp: new Date('2024-02-12T09:00:00') },
          {
            role: 'assistant',
            content: 'Your primary vehicle is a Volkswagen ID.4 2022. Compatible parts include the ID.4 12V auxiliary battery, ID.4 brake pads, parking sensors, and the battery coolant pump. I can also filter CCS2 charging cables that fit ID.4.',
            suggestedProducts: [suggest(createdProducts[1]), suggest(createdProducts[33])],
            timestamp: new Date('2024-02-12T09:00:08')
          },
          { role: 'user', content: 'ما القطع المناسبة لسيارتي؟', timestamp: new Date('2024-02-12T09:01:00') },
          {
            role: 'assistant',
            content: 'لسيارة فولكسفاغن ID.4 2022: بطارية 12 فولت، فحمات الفرامل، حساسات الركن، ومضخة تبريد البطارية. كابل CCS2 مناسب أيضاً للشحن السريع.',
            suggestedProducts: [suggest(createdProducts[1]), suggest(createdProducts[8])],
            timestamp: new Date('2024-02-12T09:01:12')
          }
        ],
        isActive: true,
        lastMessageAt: new Date('2024-02-12T09:01:12')
      },
      {
        sessionId: 'sess-guest-001',
        user: null,
        title: 'CCS2 cable inquiry',
        messages: [
          { role: 'user', content: 'Do you have a CCS2 fast charging cable?', timestamp: new Date('2024-02-17T16:00:00') },
          {
            role: 'assistant',
            content: 'Yes. We stock a CCS2 DC Fast Charging Cable 250A that fits Tesla, BYD, Hyundai, Kia, Volkswagen, MG and BMW CCS2 cars. We also have Type 2 home cables and an 11 kW wallbox.',
            suggestedProducts: [suggest(createdProducts[8]), suggest(createdProducts[9])],
            timestamp: new Date('2024-02-17T16:00:04')
          },
          { role: 'user', content: 'Add the wallbox too please', timestamp: new Date('2024-02-17T16:01:00') },
          {
            role: 'assistant',
            content: 'The 11 kW Type 2 wallbox is in stock. Create an account to track the order and save vehicles for compatibility checks.',
            suggestedProducts: [suggest(createdProducts[10])],
            timestamp: new Date('2024-02-17T16:01:08')
          }
        ],
        isActive: false,
        lastMessageAt: new Date('2024-02-17T16:01:08')
      },
      {
        sessionId: 'sess-khalid-001',
        user: customers[4]._id,
        title: 'Nissan Leaf brake pads',
        messages: [
          { role: 'user', content: 'I need brake pads for my Nissan Leaf 2021', timestamp: new Date('2024-02-14T11:00:00') },
          {
            role: 'assistant',
            content: 'The Nissan Leaf front brake pads (Part# BP-NIS-LEAF-FR-030) fit Leaf 2018-2024 including your 2021. They are in stock. I can also show the CHAdeMO charge inlet if yours is worn.',
            suggestedProducts: [suggest(createdProducts[29]), suggest(createdProducts[15])],
            timestamp: new Date('2024-02-14T11:00:06')
          }
        ],
        isActive: false,
        lastMessageAt: new Date('2024-02-14T11:00:06')
      }
    ];

    const createdChats = await ChatSession.insertMany(chatSessionsToInsert);
    console.log(`✅ Created ${createdChats.length} chat sessions\n`);

    // ----------------------------------------------------------------
    // Step 11: Seed Product Notifications (out-of-stock)
    // ----------------------------------------------------------------
    console.log('🔔 Creating product notifications...');

    const outOfStockProducts = createdProducts.filter((p) => p.stock === 0);

    const notificationsToInsert = [];
    outOfStockProducts.forEach((product) => {
      [customers[0], customers[2], customers[4], customers[6], customers[9]].forEach((customer) => {
        notificationsToInsert.push({
          product: product._id,
          user: customer._id,
          notifiedAt: null
        });
      });
    });

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
    console.log(`⚙️   Settings:        1 document (${settings.siteName}, ${settings.currency})`);
    console.log(`👥  Users:            ${createdUsers.length} total`);
    console.log(`     └─ Admin:        1  (admin@autoparts.com / Admin@2024!)`);
    console.log(`     └─ Suppliers:    ${suppliers.length}`);
    suppliers.forEach((s) => console.log(`         • ${s.email} (${s.businessName})`));
    console.log(`     └─ Customers:    ${customers.length}`);
    customers.forEach((c) => console.log(`         • ${c.email}`));
    console.log(`📁  Categories:       ${totalCategories} total (${createdMainCats.length} main + ${createdSubCats.length} sub)`);
    console.log(`📦  Products:         ${createdProducts.length} products`);
    const featured = createdProducts.filter((p) => p.isFeatured).length;
    const outOfStock2 = createdProducts.filter((p) => p.stock === 0).length;
    const lowStock = createdProducts.filter((p) => p.stock > 0 && p.stock <= 8).length;
    console.log(`     └─ Featured:     ${featured}`);
    console.log(`     └─ Out of Stock: ${outOfStock2}`);
    console.log(`     └─ Low Stock:    ${lowStock}`);
    console.log(`🚗  Vehicles:         ${createdVehicles.length}`);
    console.log(`🛒  Orders:           ${createdOrders.length}`);
    const ordersByStatus = {};
    ordersToInsert.forEach((o) => {
      ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
    });
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
