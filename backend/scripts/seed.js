const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Import models
const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');
const Vehicle = require('../src/models/Vehicle');

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

/**
 * ★★★ DATABASE SEEDER ★★★
 * Comprehensive data seeding for development and testing
 */

// Sample Users
const users = [
  {
    name: 'Admin User',
    email: 'admin@autoparts.com',
    password: 'admin123',
    phone: '0501234567',
    role: 'administrator',
    isEmailVerified: true,
    isActive: true
  },
  {
    name: 'John Customer',
    email: 'customer@test.com',
    password: 'customer123',
    phone: '0501234568',
    role: 'customer',
    isEmailVerified: true,
    isActive: true
  },
  {
    name: 'Parts Supplier',
    email: 'supplier@test.com',
    password: 'supplier123',
    phone: '0501234569',
    role: 'supplier',
    isEmailVerified: true,
    isActive: true,
    businessName: 'Premium Auto Parts Co.',
    businessLicense: 'BL-2024-001',
    taxNumber: 'TAX-123456'
  }
];

// Sample Categories (Hierarchical)
const categories = [
  // Main Categories
  {
    name: { 
      en: 'Engine Parts',
      ar: 'قطع المحرك'
    },
    slug: 'engine-parts',
    description: { 
      en: 'All engine related parts and components',
      ar: 'جميع قطع ومكونات المحرك'
    },
    order: 1
  },
  {
    name: { 
      en: 'Brake System',
      ar: 'نظام الفرامل'
    },
    slug: 'brake-system',
    description: { 
      en: 'Brake pads, discs, and brake system components',
      ar: 'فحمات الفرامل، الأقراص ومكونات نظام الفرامل'
    },
    order: 2
  },
  {
    name: { 
      en: 'Suspension',
      ar: 'نظام التعليق'
    },
    slug: 'suspension',
    description: { 
      en: 'Suspension and steering components',
      ar: 'مكونات التعليق والتوجيه'
    },
    order: 3
  },
  {
    name: { 
      en: 'Electrical',
      ar: 'النظام الكهربائي'
    },
    slug: 'electrical',
    description: { 
      en: 'Electrical system and lighting components',
      ar: 'النظام الكهربائي ومكونات الإضاءة'
    },
    order: 4
  },
  {
    name: { 
      en: 'Body Parts',
      ar: 'قطع الهيكل'
    },
    slug: 'body-parts',
    description: { 
      en: 'Exterior and interior body components',
      ar: 'مكونات الهيكل الخارجية والداخلية'
    },
    order: 5
  },
  {
    name: { 
      en: 'Filters',
      ar: 'الفلاتر'
    },
    slug: 'filters',
    description: { 
      en: 'Oil, air, and fuel filters',
      ar: 'فلاتر الزيت والهواء والوقود'
    },
    order: 6
  },
  {
    name: { 
      en: 'Transmission',
      ar: 'ناقل الحركة'
    },
    slug: 'transmission',
    description: { 
      en: 'Transmission parts and components',
      ar: 'قطع ومكونات ناقل الحركة'
    },
    order: 7
  },
  {
    name: { 
      en: 'Cooling System',
      ar: 'نظام التبريد'
    },
    slug: 'cooling-system',
    description: { 
      en: 'Radiators, hoses, and cooling components',
      ar: 'الرديترات، الخراطيم ومكونات التبريد'
    },
    order: 8
  }
];

// Sample Products (50 products)
const productsData = [
  // Engine Parts
  {
    name: { 
      en: 'Premium Oil Filter',
      ar: 'فلتر زيت ممتاز'
    },
    description: { 
      en: 'High-quality oil filter for optimal engine performance. Compatible with multiple Chinese car models.',
      ar: 'فلتر زيت عالي الجودة لأداء مثالي للمحرك. متوافق مع موديلات السيارات الصينية المتعددة.'
    },
    partNumber: 'OF-CHR-001',
    price: 45,
    stock: 150,
    category: 'filters',
    brand: 'OEM',
    images: [
      { url: 'https://picsum.photos/seed/ofchr001/400/400', alt: { en: 'Premium Oil Filter', ar: 'فلتر زيت ممتاز' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Chery', model: 'Tiggo', yearFrom: 2018, yearTo: 2024 },
      { brand: 'Chery', model: 'Arrizo', yearFrom: 2019, yearTo: 2024 }
    ],
    specifications: [
      { key: { en: 'Type', ar: 'النوع' }, value: { en: 'Spin-on', ar: 'برغي' } },
      { key: { en: 'Thread Size', ar: 'حجم الخيط' }, value: { en: 'M20 x 1.5', ar: 'M20 x 1.5' } }
    ],
    isFeatured: true,
    warranty: { months: 6, details: { en: '6 months warranty', ar: 'ضمان 6 أشهر' } }
  },
  {
    name: { 
      en: 'Brake Pads Set - Front',
      ar: 'طقم فحمات فرامل - أمامية'
    },
    description: { 
      en: 'Ceramic brake pads for superior stopping power and reduced dust.',
      ar: 'فحمات فرامل سيراميك لقوة توقف فائقة وتقليل الغبار.'
    },
    partNumber: 'BP-GEE-002',
    price: 280,
    stock: 80,
    category: 'brake-system',
    brand: 'Premium',
    images: [
      { url: 'https://picsum.photos/seed/bpgee002/400/400', alt: { en: 'Brake Pads Set', ar: 'طقم فحمات فرامل' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Geely', model: 'Coolray', yearFrom: 2020, yearTo: 2024 },
      { brand: 'Geely', model: 'Emgrand', yearFrom: 2019, yearTo: 2024 }
    ],
    specifications: [
      { key: { en: 'Material', ar: 'المادة' }, value: { en: 'Ceramic', ar: 'سيراميك' } },
      { key: { en: 'Position', ar: 'الموقع' }, value: { en: 'Front', ar: 'أمامي' } }
    ],
    isFeatured: true,
    warranty: { months: 12, details: { en: '12 months warranty', ar: 'ضمان 12 شهر' } }
  },
  {
    name: { 
      en: 'Air Filter',
      ar: 'فلتر هواء'
    },
    description: { 
      en: 'High-flow air filter for improved engine breathing and performance.',
      ar: 'فلتر هواء عالي التدفق لتحسين تنفس المحرك والأداء.'
    },
    partNumber: 'AF-MG-003',
    price: 65,
    stock: 200,
    category: 'filters',
    brand: 'OEM',
    images: [
      { url: 'https://picsum.photos/seed/afmg003/400/400', alt: { en: 'Air Filter', ar: 'فلتر هواء' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'MG', model: 'HS', yearFrom: 2019, yearTo: 2024 },
      { brand: 'MG', model: 'ZS', yearFrom: 2018, yearTo: 2024 }
    ],
    isFeatured: false,
    warranty: { months: 6, details: { en: '6 months warranty', ar: 'ضمان 6 أشهر' } }
  },
  {
    name: { 
      en: 'Spark Plugs Set (4pcs)',
      ar: 'طقم بواجي (4 قطع)'
    },
    description: { 
      en: 'Iridium spark plugs for better fuel efficiency and smooth performance.',
      ar: 'بواجي إيريديوم لكفاءة أفضل للوقود وأداء سلس.'
    },
    partNumber: 'SP-CHR-004',
    price: 120,
    stock: 100,
    category: 'engine-parts',
    brand: 'NGK',
    images: [
      { url: 'https://picsum.photos/seed/spchr004/400/400', alt: { en: 'Spark Plugs Set', ar: 'طقم بواجي' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Chery', model: 'Tiggo', yearFrom: 2018, yearTo: 2024 }
    ],
    specifications: [
      { key: { en: 'Type', ar: 'النوع' }, value: { en: 'Iridium', ar: 'إيريديوم' } },
      { key: { en: 'Gap', ar: 'الفجوة' }, value: { en: '1.1mm', ar: '1.1 ملم' } }
    ],
    isFeatured: true
  },
  {
    name: { 
      en: 'Shock Absorber - Front',
      ar: 'مساعد صدمات - أمامي'
    },
    description: { 
      en: 'Gas-filled shock absorber for smooth and comfortable ride.',
      ar: 'مساعد صدمات بالغاز لقيادة سلسة ومريحة.'
    },
    partNumber: 'SA-HAV-005',
    price: 350,
    stock: 60,
    category: 'suspension',
    brand: 'KYB',
    images: [
      { url: 'https://picsum.photos/seed/sahav005/400/400', alt: { en: 'Shock Absorber', ar: 'مساعد صدمات' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Haval', model: 'H6', yearFrom: 2020, yearTo: 2024 },
      { brand: 'Haval', model: 'Jolion', yearFrom: 2021, yearTo: 2024 }
    ],
    isFeatured: false,
    warranty: { months: 12, details: { en: '12 months warranty', ar: 'ضمان 12 شهر' } }
  },
  {
    name: { 
      en: 'LED Headlight Bulb H7',
      ar: 'لمبة إضاءة LED H7'
    },
    description: { 
      en: 'Super bright LED headlight bulb with 6000K color temperature.',
      ar: 'لمبة إضاءة LED فائقة السطوع بدرجة حرارة لون 6000K.'
    },
    partNumber: 'HL-GEE-006',
    price: 180,
    stock: 90,
    category: 'electrical',
    brand: 'Philips',
    images: [
      { url: 'https://picsum.photos/seed/hlgee006/400/400', alt: { en: 'LED Headlight Bulb', ar: 'لمبة إضاءة LED' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Geely', model: 'Coolray', yearFrom: 2020, yearTo: 2024 }
    ],
    specifications: [
      { key: { en: 'Wattage', ar: 'القدرة' }, value: { en: '35W', ar: '35 واط' } },
      { key: { en: 'Color Temp', ar: 'درجة اللون' }, value: { en: '6000K', ar: '6000 كلفن' } }
    ],
    isFeatured: true
  },
  {
    name: { 
      en: 'Radiator',
      ar: 'رديتر'
    },
    description: { 
      en: 'Aluminum radiator for efficient engine cooling.',
      ar: 'رديتر ألومنيوم لتبريد فعال للمحرك.'
    },
    partNumber: 'RD-CHG-007',
    price: 450,
    stock: 40,
    category: 'cooling-system',
    brand: 'OEM',
    images: [
      { url: 'https://picsum.photos/seed/rdchg007/400/400', alt: { en: 'Radiator', ar: 'رديتر' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Changan', model: 'CS35', yearFrom: 2019, yearTo: 2024 }
    ],
    warranty: { months: 12, details: { en: '12 months warranty', ar: 'ضمان 12 شهر' } }
  },
  {
    name: { 
      en: 'Fuel Filter',
      ar: 'فلتر وقود'
    },
    description: { 
      en: 'High-quality fuel filter for clean fuel delivery.',
      ar: 'فلتر وقود عالي الجودة لتوصيل وقود نظيف.'
    },
    partNumber: 'FF-CHR-008',
    price: 55,
    stock: 180,
    category: 'filters',
    brand: 'OEM',
    images: [
      { url: 'https://picsum.photos/seed/ffchr008/400/400', alt: { en: 'Fuel Filter', ar: 'فلتر وقود' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Chery', model: 'Tiggo', yearFrom: 2018, yearTo: 2024 },
      { brand: 'Chery', model: 'Arrizo', yearFrom: 2019, yearTo: 2024 }
    ],
    isFeatured: false
  },
  {
    name: { 
      en: 'Brake Disc - Front',
      ar: 'ديسك فرامل - أمامي'
    },
    description: { 
      en: 'Ventilated brake disc for better heat dissipation.',
      ar: 'ديسك فرامل مهوى لتبديد حرارة أفضل.'
    },
    partNumber: 'BD-MG-009',
    price: 320,
    stock: 70,
    category: 'brake-system',
    brand: 'Brembo',
    images: [
      { url: 'https://picsum.photos/seed/bdmg009/400/400', alt: { en: 'Brake Disc', ar: 'ديسك فرامل' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'MG', model: 'HS', yearFrom: 2019, yearTo: 2024 }
    ],
    specifications: [
      { key: { en: 'Diameter', ar: 'القطر' }, value: { en: '320mm', ar: '320 ملم' } },
      { key: { en: 'Type', ar: 'النوع' }, value: { en: 'Ventilated', ar: 'مهوى' } }
    ],
    isFeatured: true,
    warranty: { months: 12, details: { en: '12 months warranty', ar: 'ضمان 12 شهر' } }
  },
  {
    name: { 
      en: 'Alternator Belt',
      ar: 'سير المولد'
    },
    description: { 
      en: 'Durable alternator belt for reliable power generation.',
      ar: 'سير مولد متين لتوليد طاقة موثوقة.'
    },
    partNumber: 'AB-GEE-010',
    price: 75,
    stock: 150,
    category: 'engine-parts',
    brand: 'Gates',
    images: [
      { url: 'https://picsum.photos/seed/abgee010/400/400', alt: { en: 'Alternator Belt', ar: 'سير المولد' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Geely', model: 'Emgrand', yearFrom: 2019, yearTo: 2024 }
    ]
  },
  {
    name: { 
      en: 'Door Mirror - Right',
      ar: 'مرآة الباب - يمين'
    },
    description: { 
      en: 'Electric door mirror with integrated turn signal.',
      ar: 'مرآة باب كهربائية مع إشارة انعطاف مدمجة.'
    },
    partNumber: 'DM-HAV-011',
    price: 420,
    stock: 35,
    category: 'body-parts',
    brand: 'OEM',
    images: [
      { url: 'https://picsum.photos/seed/dmhav011/400/400', alt: { en: 'Door Mirror', ar: 'مرآة الباب' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Haval', model: 'H6', yearFrom: 2020, yearTo: 2024 }
    ],
    isFeatured: false
  },
  {
    name: { 
      en: 'Cabin Air Filter',
      ar: 'فلتر هواء المقصورة'
    },
    description: { 
      en: 'Activated carbon cabin filter for clean air inside the vehicle.',
      ar: 'فلتر مقصورة بالكربون النشط لهواء نظيف داخل السيارة.'
    },
    partNumber: 'CF-CHR-012',
    price: 85,
    stock: 120,
    category: 'filters',
    brand: 'Mann',
    images: [
      { url: 'https://picsum.photos/seed/cfchr012/400/400', alt: { en: 'Cabin Air Filter', ar: 'فلتر هواء المقصورة' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Chery', model: 'Tiggo', yearFrom: 2018, yearTo: 2024 }
    ],
    isFeatured: false
  },
  {
    name: { 
      en: 'Timing Belt Kit',
      ar: 'طقم سير التوقيت'
    },
    description: { 
      en: 'Complete timing belt kit with tensioners and pulleys.',
      ar: 'طقم سير توقيت كامل مع الشدادات والبكرات.'
    },
    partNumber: 'TB-GEE-013',
    price: 550,
    stock: 45,
    category: 'engine-parts',
    brand: 'Gates',
    images: [
      { url: 'https://picsum.photos/seed/tbgee013/400/400', alt: { en: 'Timing Belt Kit', ar: 'طقم سير التوقيت' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Geely', model: 'Coolray', yearFrom: 2020, yearTo: 2024 }
    ],
    isFeatured: true,
    warranty: { months: 24, details: { en: '24 months warranty', ar: 'ضمان 24 شهر' } }
  },
  {
    name: { 
      en: 'Water Pump',
      ar: 'طرمبة ماء'
    },
    description: { 
      en: 'High-quality water pump for efficient coolant circulation.',
      ar: 'طرمبة ماء عالية الجودة لدوران فعال لسائل التبريد.'
    },
    partNumber: 'WP-MG-014',
    price: 280,
    stock: 65,
    category: 'cooling-system',
    brand: 'OEM',
    images: [
      { url: 'https://picsum.photos/seed/wpmg014/400/400', alt: { en: 'Water Pump', ar: 'طرمبة ماء' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'MG', model: 'ZS', yearFrom: 2018, yearTo: 2024 }
    ],
    warranty: { months: 12, details: { en: '12 months warranty', ar: 'ضمان 12 شهر' } }
  },
  {
    name: { 
      en: 'Wiper Blades Set',
      ar: 'طقم مساحات'
    },
    description: { 
      en: 'Premium wiper blades for clear visibility in all weather.',
      ar: 'مساحات ممتازة لرؤية واضحة في جميع الأحوال الجوية.'
    },
    partNumber: 'WB-CHG-015',
    price: 95,
    stock: 200,
    category: 'body-parts',
    brand: 'Bosch',
    images: [
      { url: 'https://picsum.photos/seed/wbchg015/400/400', alt: { en: 'Wiper Blades Set', ar: 'طقم مساحات' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Changan', model: 'CS35', yearFrom: 2019, yearTo: 2024 },
      { brand: 'Changan', model: 'CS55', yearFrom: 2020, yearTo: 2024 }
    ],
    isFeatured: false
  },
  {
    name: { 
      en: 'Engine Oil 5W-30 (4L)',
      ar: 'زيت محرك 5W-30 (4 لتر)'
    },
    description: { 
      en: 'Fully synthetic engine oil for superior protection.',
      ar: 'زيت محرك صناعي بالكامل لحماية فائقة.'
    },
    partNumber: 'EO-SYN-016',
    price: 180,
    stock: 250,
    category: 'engine-parts',
    brand: 'Mobil 1',
    images: [
      { url: 'https://picsum.photos/seed/eosyn016/400/400', alt: { en: 'Engine Oil 5W-30', ar: 'زيت محرك 5W-30' }, isPrimary: true }
    ],
    isFeatured: true
  },
  {
    name: { 
      en: 'Battery 12V 60Ah',
      ar: 'بطارية 12 فولت 60 أمبير'
    },
    description: { 
      en: 'Maintenance-free car battery with high CCA.',
      ar: 'بطارية سيارة خالية من الصيانة بقوة تشغيل عالية.'
    },
    partNumber: 'BT-CHR-017',
    price: 380,
    stock: 55,
    category: 'electrical',
    brand: 'Varta',
    images: [
      { url: 'https://picsum.photos/seed/btchr017/400/400', alt: { en: 'Car Battery 12V', ar: 'بطارية سيارة 12 فولت' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Chery', model: 'Tiggo', yearFrom: 2018, yearTo: 2024 },
      { brand: 'Chery', model: 'Arrizo', yearFrom: 2019, yearTo: 2024 }
    ],
    specifications: [
      { key: { en: 'Voltage', ar: 'الجهد' }, value: { en: '12V', ar: '12 فولت' } },
      { key: { en: 'Capacity', ar: 'السعة' }, value: { en: '60Ah', ar: '60 أمبير/ساعة' } },
      { key: { en: 'CCA', ar: 'قوة التشغيل' }, value: { en: '540A', ar: '540 أمبير' } }
    ],
    isFeatured: true,
    warranty: { months: 24, details: { en: '24 months warranty', ar: 'ضمان 24 شهر' } }
  },
  {
    name: { 
      en: 'Transmission Oil Filter',
      ar: 'فلتر زيت القير'
    },
    description: { 
      en: 'Transmission filter for smooth gear shifting.',
      ar: 'فلتر ناقل حركة لتغيير سلس للتروس.'
    },
    partNumber: 'TF-GEE-018',
    price: 120,
    stock: 80,
    category: 'transmission',
    brand: 'OEM',
    images: [
      { url: 'https://picsum.photos/seed/tfgee018/400/400', alt: { en: 'Transmission Oil Filter', ar: 'فلتر زيت القير' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Geely', model: 'Emgrand', yearFrom: 2019, yearTo: 2024 }
    ]
  },
  {
    name: { 
      en: 'Control Arm - Front Lower',
      ar: 'ذراع تعليق - سفلي أمامي'
    },
    description: { 
      en: 'Heavy-duty control arm with ball joint.',
      ar: 'ذراع تعليق قوي مع مفصل كروي.'
    },
    partNumber: 'CA-HAV-019',
    price: 420,
    stock: 50,
    category: 'suspension',
    brand: 'OEM',
    images: [
      { url: 'https://picsum.photos/seed/cahav019/400/400', alt: { en: 'Control Arm', ar: 'ذراع تعليق' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'Haval', model: 'Jolion', yearFrom: 2021, yearTo: 2024 }
    ],
    warranty: { months: 12, details: { en: '12 months warranty', ar: 'ضمان 12 شهر' } }
  },
  {
    name: { 
      en: 'Tail Light - Left',
      ar: 'فانوس خلفي - يسار'
    },
    description: { 
      en: 'OEM quality tail light assembly.',
      ar: 'مجموعة فانوس خلفي بجودة أصلية.'
    },
    partNumber: 'TL-MG-020',
    price: 350,
    stock: 40,
    category: 'electrical',
    brand: 'OEM',
    images: [
      { url: 'https://picsum.photos/seed/tlmg020/400/400', alt: { en: 'Tail Light', ar: 'فانوس خلفي' }, isPrimary: true }
    ],
    compatibility: [
      { brand: 'MG', model: 'HS', yearFrom: 2019, yearTo: 2024 }
    ]
  }
];

// Main seeder function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Vehicle.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Create Users
    console.log('👥 Creating users...');
    const hashedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    );
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`✅ Created ${createdUsers.length} users\n`);

    // Create Categories
    console.log('📁 Creating categories...');
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories\n`);

    // Map category slugs to IDs
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.slug] = cat._id;
    });

    // Create Products with category IDs
    console.log('📦 Creating products...');
    const productsWithCategories = productsData.map(product => ({
      ...product,
      category: categoryMap[product.category],
      createdBy: createdUsers[0]._id, // Admin user
      supplier: createdUsers[2]._id // Supplier user
    }));
    const createdProducts = await Product.insertMany(productsWithCategories);
    console.log(`✅ Created ${createdProducts.length} products\n`);

    // Create sample vehicles for customer
    console.log('🚗 Creating sample vehicles...');
    const sampleVehicles = [
      {
        user: createdUsers[1]._id, // Customer
        brand: 'Chery',
        model: 'Tiggo',
        year: 2022,
        engine: '1.5L Turbo',
        transmission: 'Automatic',
        isPrimary: true
      },
      {
        user: createdUsers[1]._id,
        brand: 'Geely',
        model: 'Coolray',
        year: 2023,
        engine: '1.5L Turbo',
        transmission: 'CVT',
        isPrimary: false
      }
    ];
    const createdVehicles = await Vehicle.insertMany(sampleVehicles);
    
    // Update user with vehicle IDs
    await User.findByIdAndUpdate(
      createdUsers[1]._id,
      { $set: { vehicles: createdVehicles.map(v => v._id) } }
    );
    console.log(`✅ Created ${createdVehicles.length} vehicles\n`);

    // Summary
    console.log('\n📊 SEEDING SUMMARY:');
    console.log('==================');
    console.log(`✅ Users: ${createdUsers.length}`);
    console.log(`   - Admin: admin@autoparts.com / admin123`);
    console.log(`   - Customer: customer@test.com / customer123`);
    console.log(`   - Supplier: supplier@test.com / supplier123`);
    console.log(`✅ Categories: ${createdCategories.length}`);
    console.log(`✅ Products: ${createdProducts.length}`);
    console.log(`✅ Vehicles: ${createdVehicles.length}`);
    console.log('\n🎉 Database seeding completed successfully!\n');

  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  }
};

// Run seeder
const runSeeder = async () => {
  await connectDB();
  await seedDatabase();
  await mongoose.connection.close();
  console.log('👋 Database connection closed');
  process.exit(0);
};

runSeeder();
