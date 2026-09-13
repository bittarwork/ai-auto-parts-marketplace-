/**
 * Shared EV catalog constants used by models, validation, NLP, and seed.
 */

const EV_BRANDS = ['Tesla', 'BYD', 'Hyundai', 'Kia', 'Nissan', 'Volkswagen', 'MG', 'BMW'];

const EV_MODELS = {
  Tesla: ['Model 3', 'Model Y', 'Model S', 'Model X'],
  BYD: ['Atto 3', 'Seal', 'Dolphin', 'Han'],
  Hyundai: ['Ioniq 5', 'Ioniq 6', 'Kona Electric'],
  Kia: ['EV6', 'Niro EV', 'EV9'],
  Nissan: ['Leaf', 'Ariya'],
  Volkswagen: ['ID.3', 'ID.4', 'ID.Buzz'],
  MG: ['MG4', 'MG ZS EV'],
  BMW: ['iX3', 'i4', 'iX']
};

const DRIVETRAINS = ['RWD', 'FWD', 'AWD', 'Dual-Motor'];
const CONNECTOR_TYPES = ['CCS2', 'Type2', 'NACS', 'CHAdeMO'];
const VOLTAGE_CLASSES = ['12V', '400V', '800V'];
const TRANSMISSIONS = ['Automatic', 'Single-Speed'];
const PRODUCT_TRANSMISSIONS = ['Automatic', 'Single-Speed', 'Both'];
const CURRENCIES = ['EUR', 'SYP'];

const BRAND_ALIASES = {
  tesla: 'Tesla',
  تسلا: 'Tesla',
  teslaa: 'Tesla',
  byd: 'BYD',
  'بي واي دي': 'BYD',
  'بى واى دى': 'BYD',
  hyundai: 'Hyundai',
  هيونداي: 'Hyundai',
  هونداي: 'Hyundai',
  kia: 'Kia',
  كيا: 'Kia',
  nissan: 'Nissan',
  نيسان: 'Nissan',
  volkswagen: 'Volkswagen',
  vw: 'Volkswagen',
  فولكسفاغن: 'Volkswagen',
  'فولكس واجن': 'Volkswagen',
  mg: 'MG',
  'ام جي': 'MG',
  'ام جى': 'MG',
  'إم جي': 'MG',
  bmw: 'BMW',
  'بي ام دبليو': 'BMW',
  'بي إم دبليو': 'BMW'
};

const ARABIC_BRAND_NAMES = {
  Tesla: 'تسلا',
  BYD: 'بي واي دي',
  Hyundai: 'هيونداي',
  Kia: 'كيا',
  Nissan: 'نيسان',
  Volkswagen: 'فولكسفاغن',
  MG: 'ام جي',
  BMW: 'بي ام دبليو'
};

const MODEL_ALIASES = {
  Tesla: {
    'model 3': 'Model 3',
    model3: 'Model 3',
    'موديل 3': 'Model 3',
    'model y': 'Model Y',
    modely: 'Model Y',
    'موديل واي': 'Model Y',
    'model s': 'Model S',
    'model x': 'Model X'
  },
  BYD: {
    'atto 3': 'Atto 3',
    atto3: 'Atto 3',
    'اتو 3': 'Atto 3',
    seal: 'Seal',
    سيل: 'Seal',
    dolphin: 'Dolphin',
    دولفين: 'Dolphin',
    han: 'Han',
    هان: 'Han'
  },
  Hyundai: {
    'ioniq 5': 'Ioniq 5',
    ioniq5: 'Ioniq 5',
    'ايونيك 5': 'Ioniq 5',
    'ioniq 6': 'Ioniq 6',
    'kona electric': 'Kona Electric',
    kona: 'Kona Electric'
  },
  Kia: {
    ev6: 'EV6',
    'اي في 6': 'EV6',
    'niro ev': 'Niro EV',
    niro: 'Niro EV',
    ev9: 'EV9'
  },
  Nissan: {
    leaf: 'Leaf',
    ليف: 'Leaf',
    ariya: 'Ariya',
    آريا: 'Ariya'
  },
  Volkswagen: {
    'id.3': 'ID.3',
    id3: 'ID.3',
    'id.4': 'ID.4',
    id4: 'ID.4',
    'اي دي 4': 'ID.4',
    'id.buzz': 'ID.Buzz',
    idbuzz: 'ID.Buzz'
  },
  MG: {
    mg4: 'MG4',
    'ام جي 4': 'MG4',
    'mg zs ev': 'MG ZS EV',
    'zs ev': 'MG ZS EV'
  },
  BMW: {
    ix3: 'iX3',
    i4: 'i4',
    ix: 'iX'
  }
};

module.exports = {
  EV_BRANDS,
  EV_MODELS,
  DRIVETRAINS,
  CONNECTOR_TYPES,
  VOLTAGE_CLASSES,
  TRANSMISSIONS,
  PRODUCT_TRANSMISSIONS,
  CURRENCIES,
  BRAND_ALIASES,
  ARABIC_BRAND_NAMES,
  MODEL_ALIASES
};
