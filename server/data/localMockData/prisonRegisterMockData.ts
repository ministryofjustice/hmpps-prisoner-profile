import { PrisonDto } from '../interfaces/prisonRegisterApi/prisonRegisterApiTypes'

const prisonsKeyedByPrisonId: Record<string, PrisonDto> = {
  AKI: {
    prisonId: 'AKI',
    prisonName: 'Acklington (HMP)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  STC2: {
    prisonId: 'STC2',
    prisonName: 'Rainsbrook (STC)',
    active: false,
    male: true,
    female: true,
    contracted: true,
    types: [
      {
        code: 'STC',
        description: 'Secure Training Centre',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 136,
        addressLine1: 'Rainsbrook Secure Training Centre',
        addressLine2: null,
        town: 'Willoughby',
        county: null,
        postcode: 'CV23 8SY',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'MTCNovo',
      },
    ],
  },
  AWI: {
    prisonId: 'AWI',
    prisonName: 'Ashwell (HMP)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  ACI: {
    prisonId: 'ACI',
    prisonName: 'Altcourse with extra info (HMP & YOI)',
    active: true,
    male: true,
    female: true,
    contracted: true,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['B'],
    addresses: [
      {
        id: 1,
        addressLine1: 'Higher Lane',
        addressLine2: null,
        town: 'Liverpool',
        county: 'Merseyside',
        postcode: 'L9 7LH',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'G4S',
      },
    ],
  },
  BTI: {
    prisonId: 'BTI',
    prisonName: 'Blakenhurst (HMP)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  BHI: {
    prisonId: 'BHI',
    prisonName: 'Blantyre House (HMP)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  BDI: {
    prisonId: 'BDI',
    prisonName: 'Blundeston (HMP)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  BKI: {
    prisonId: 'BKI',
    prisonName: 'Brockhill (HMP & YOI)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  BUI: {
    prisonId: 'BUI',
    prisonName: 'Bullwood Hall (HMP)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  CHI: {
    prisonId: 'CHI',
    prisonName: 'Camp Hill (HMP)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  CYI: {
    prisonId: 'CYI',
    prisonName: 'Canterbury (HMP)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  CSI: {
    prisonId: 'CSI',
    prisonName: 'Castington (HMP & YOI)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  DRI: {
    prisonId: 'DRI',
    prisonName: 'Dorchester (HMP)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  DVI: {
    prisonId: 'DVI',
    prisonName: 'Dover Immigration Removal Centre',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  NEI: {
    prisonId: 'NEI',
    prisonName: 'Edmunds Hill (HMP)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  EVI: {
    prisonId: 'EVI',
    prisonName: 'Everthorpe (HMP)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  WNI: {
    prisonId: 'WNI',
    prisonName: 'Werrington (HMYOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'YCS',
        description: 'Youth Custody Service',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 119,
        addressLine1: 'Ash Bank Road',
        addressLine2: 'Werrington',
        town: 'Stoke-On-Trent',
        county: 'Staffordshire',
        postcode: 'ST9 0DX',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  ALI: {
    prisonId: 'ALI',
    prisonName: 'Albany (HMP)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  GPI: {
    prisonId: 'GPI',
    prisonName: 'Glen Parva (HMPYOI & Rc)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  GLI: {
    prisonId: 'GLI',
    prisonName: 'Gloucester (HMP)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  WYI: {
    prisonId: 'WYI',
    prisonName: 'Wetherby (HM YOI)',
    active: true,
    male: true,
    female: true,
    contracted: false,
    types: [
      {
        code: 'YCS',
        description: 'Youth Custody Service',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 120,
        addressLine1: 'York Road',
        addressLine2: null,
        town: 'Wetherby',
        county: null,
        postcode: 'LS22 5ED',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  HRI: {
    prisonId: 'HRI',
    prisonName: 'Haslar Immigration Removal Centre',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  HGI: {
    prisonId: 'HGI',
    prisonName: 'Hewell Grange (HMP)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  ASI: {
    prisonId: 'ASI',
    prisonName: 'Ashfield (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: true,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 2,
        addressLine1: 'Shortwood Road',
        addressLine2: 'Pucklechurch',
        town: 'Bristol',
        county: 'Gloucestershire',
        postcode: 'BS16 9QJ',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'Serco',
      },
    ],
  },
  STC3: {
    prisonId: 'STC3',
    prisonName: 'Oakhill (STC)',
    active: true,
    male: true,
    female: false,
    contracted: true,
    types: [
      {
        code: 'STC',
        description: 'Secure Training Centre',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 137,
        addressLine1: 'Chalgrove Field',
        addressLine2: 'Oakhill',
        town: 'Milton Keynes',
        county: null,
        postcode: 'MK5 6AJ',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'G4S',
      },
    ],
  },
  HYI: {
    prisonId: 'HYI',
    prisonName: 'Holloway (HMP)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  PTI: {
    prisonId: 'PTI',
    prisonName: 'Kingston (HMP)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  LAI: {
    prisonId: 'LAI',
    prisonName: 'Lancaster Castle (HMP)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  LMI: {
    prisonId: 'LMI',
    prisonName: 'Latchmere House (HMP)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  FEI: {
    prisonId: 'FEI',
    prisonName: 'Fosse Way (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: true,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 140,
        addressLine1: 'HMP Fosse Way',
        addressLine2: 'Wigston',
        town: 'Leicester',
        county: 'Leicestershire',
        postcode: 'LE18 4TN',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  AA1: {
    prisonId: 'AA1',
    prisonName: 'AA3 Prison for test',
    active: true,
    male: true,
    female: true,
    contracted: false,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
      {
        code: 'YCS',
        description: 'Youth Custody Service',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 132,
        addressLine1: 'First Line',
        addressLine2: 'Second Line',
        town: 'Sheffield',
        county: 'South Yorkshire',
        postcode: 'S1 1AA',
        country: 'England',
      },
    ],
    operators: [],
  },
  FHI: {
    prisonId: 'FHI',
    prisonName: 'Foston Hall (HMP & YOI)',
    active: true,
    male: false,
    female: true,
    contracted: false,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 39,
        addressLine1: 'Foston',
        addressLine2: null,
        town: 'Derby',
        county: 'Derbyshire',
        postcode: 'DE65 5DN',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  HDI: {
    prisonId: 'HDI',
    prisonName: 'Hatfield (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 46,
        addressLine1: 'Lancaster Drive',
        addressLine2: 'Lindholme',
        town: 'Doncaster',
        county: 'South Yorkshire',
        postcode: 'DN7 6FA',
        country: 'England',
      },
      {
        id: 47,
        addressLine1: 'Thorne Road',
        addressLine2: 'Hatfield',
        town: 'Doncaster',
        county: 'South Yorkshire',
        postcode: 'DN7 6EL',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  HOI: {
    prisonId: 'HOI',
    prisonName: 'High Down (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 50,
        addressLine1: 'High Down Lane',
        addressLine2: null,
        town: 'Sutton',
        county: 'Surrey',
        postcode: 'SM2 5PJ',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  HII: {
    prisonId: 'HII',
    prisonName: 'Hindley (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 52,
        addressLine1: 'Gibson Street',
        addressLine2: 'Bickershaw',
        town: 'Wigan',
        county: 'Greater Manchester',
        postcode: 'WN2 5TH',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  HBI: {
    prisonId: 'HBI',
    prisonName: 'Hollesley Bay (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 53,
        addressLine1: 'Rectory Road',
        addressLine2: 'Hollesley',
        town: 'Woodbridge',
        county: 'Suffolk',
        postcode: 'IP12 3JW',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  HLI: {
    prisonId: 'HLI',
    prisonName: 'Hull (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['B', 'C'],
    addresses: [
      {
        id: 55,
        addressLine1: 'Hedon Road',
        addressLine2: null,
        town: 'Hull',
        county: 'East Riding of Yorkshire',
        postcode: 'HU9 5LS',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  NNI: {
    prisonId: 'NNI',
    prisonName: 'Northallerton (HMP)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  LWI: {
    prisonId: 'LWI',
    prisonName: 'Lewes (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
    ],
    categories: ['B'],
    addresses: [
      {
        id: 65,
        addressLine1: '1 Brighton Road',
        addressLine2: null,
        town: 'Lewes',
        county: 'East Sussex',
        postcode: 'BN7 1EA',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  LII: {
    prisonId: 'LII',
    prisonName: 'Lincoln (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 67,
        addressLine1: 'Greetwell Road',
        addressLine2: null,
        town: 'Lincoln',
        county: 'Lincolnshire',
        postcode: 'LN2 4BD',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  LNI: {
    prisonId: 'LNI',
    prisonName: 'Low Newton (HMP & YOI)',
    active: true,
    male: false,
    female: true,
    contracted: false,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 72,
        addressLine1: 'Brasside',
        addressLine2: null,
        town: 'Durham',
        county: 'County Durham',
        postcode: 'DH1 5YA',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  MDI: {
    prisonId: 'MDI',
    prisonName: 'Moorland (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 77,
        addressLine1: 'Bawtry Road',
        addressLine2: 'Hatfield Woodhouse',
        town: 'Doncaster',
        county: 'South Yorkshire',
        postcode: 'DN7 6BW',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  PKI: {
    prisonId: 'PKI',
    prisonName: 'Parkhurst (HMP)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  MHI: {
    prisonId: 'MHI',
    prisonName: 'Morton Hall (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'IRC',
        description: 'Immigration Removal Centre',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 78,
        addressLine1: 'Swinderby',
        addressLine2: null,
        town: 'Lincoln',
        county: 'Lincolnshire',
        postcode: 'LN6 9PT',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  NHI: {
    prisonId: 'NHI',
    prisonName: 'New Hall (HMP & YOI)',
    active: true,
    male: false,
    female: true,
    contracted: false,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 79,
        addressLine1: 'New Hall Way',
        addressLine2: 'Flockton',
        town: 'Wakefield',
        county: 'West Yorkshire',
        postcode: 'WF4 4XX',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  NWI: {
    prisonId: 'NWI',
    prisonName: 'Norwich (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 82,
        addressLine1: 'Knox Road',
        addressLine2: null,
        town: 'Norwich',
        county: 'Norfolk',
        postcode: 'NR1 4LU',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  PVI: {
    prisonId: 'PVI',
    prisonName: 'Pentonville (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 88,
        addressLine1: 'Caledonian Road',
        addressLine2: null,
        town: 'London',
        county: 'Greater London',
        postcode: 'N7 8TT',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  PFI: {
    prisonId: 'PFI',
    prisonName: 'Peterborough Female (HMP & YOI)',
    active: true,
    male: false,
    female: true,
    contracted: true,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 90,
        addressLine1: 'Saville Road',
        addressLine2: 'Westwood',
        town: 'Peterborough',
        county: 'Cambridgeshire',
        postcode: 'PE3 7PD',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'Sodexo',
      },
    ],
  },
  RDI: {
    prisonId: 'RDI',
    prisonName: 'Reading (HMP & YOI)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  PDI: {
    prisonId: 'PDI',
    prisonName: 'Portland (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 91,
        addressLine1: 'The Grove',
        addressLine2: 'Grove Road',
        town: 'Portland',
        county: 'Dorset',
        postcode: 'DT5 1DL',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  RCI: {
    prisonId: 'RCI',
    prisonName: 'Rochester (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 96,
        addressLine1: '1 Fort Road',
        addressLine2: null,
        town: 'Rochester',
        county: 'Kent',
        postcode: 'ME1 3QS',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  SHI: {
    prisonId: 'SHI',
    prisonName: 'Stoke Heath (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 103,
        addressLine1: null,
        addressLine2: null,
        town: 'Market Drayton',
        county: 'Shropshire',
        postcode: 'TF9 2JL',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  STI: {
    prisonId: 'STI',
    prisonName: 'Styal (HMP & YOI)',
    active: true,
    male: false,
    female: true,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 104,
        addressLine1: 'Styal Road',
        addressLine2: null,
        town: 'Wilmslow',
        county: 'Cheshire',
        postcode: 'SK9 4HR',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  SMI: {
    prisonId: 'SMI',
    prisonName: 'Shepton Mallet (HMP)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  SYI: {
    prisonId: 'SYI',
    prisonName: 'Shrewsbury (HMP)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  SUI: {
    prisonId: 'SUI',
    prisonName: 'Sudbury (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 105,
        addressLine1: 'Sudbury',
        addressLine2: null,
        town: 'Ashbourne',
        county: 'Derbyshire',
        postcode: 'DE6 5HW',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  SNI: {
    prisonId: 'SNI',
    prisonName: 'Swinfen Hall (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 108,
        addressLine1: 'Swinfen',
        addressLine2: null,
        town: 'Lichfield',
        county: 'Staffordshire',
        postcode: 'WS14 9QS',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  TCI: {
    prisonId: 'TCI',
    prisonName: 'Thorn Cross (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 112,
        addressLine1: 'Arley Road',
        addressLine2: 'Appleton',
        town: 'Warrington',
        county: 'Cheshire',
        postcode: 'WA4 4RL',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  UKI: {
    prisonId: 'UKI',
    prisonName: 'Usk (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 113,
        addressLine1: '47 Maryport Street',
        addressLine2: null,
        town: 'Usk',
        county: null,
        postcode: 'NP15 1XP',
        country: 'Wales',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  UPI: {
    prisonId: 'UPI',
    prisonName: 'Prescoed (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 92,
        addressLine1: 'Coed-y-Paen',
        addressLine2: null,
        town: 'Pontypool',
        county: 'Monmouthshire',
        postcode: 'NP4 0TB',
        country: 'Wales',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  WWI: {
    prisonId: 'WWI',
    prisonName: 'Wandsworth (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 115,
        addressLine1: 'PO Box 757',
        addressLine2: 'Wandsworth',
        town: 'London',
        county: 'Greater London',
        postcode: 'SW18 3HS',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  WII: {
    prisonId: 'WII',
    prisonName: 'Warren Hill (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['B', 'C'],
    addresses: [
      {
        id: 116,
        addressLine1: 'Rectory Road',
        addressLine2: 'Hollesley',
        town: 'Woodbridge',
        county: 'Suffolk',
        postcode: 'IP12 3JW',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  WCI: {
    prisonId: 'WCI',
    prisonName: 'Winchester (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 123,
        addressLine1: 'Romsey Road',
        addressLine2: null,
        town: 'Winchester',
        county: 'Hampshire',
        postcode: 'SO22 5DF',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  WHI: {
    prisonId: 'WHI',
    prisonName: 'Woodhill (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['B', 'A'],
    addresses: [
      {
        id: 124,
        addressLine1: 'Tattenhoe Street',
        addressLine2: null,
        town: 'Milton Keynes',
        county: 'Buckinghamshire',
        postcode: 'MK4 4DA',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  WSI: {
    prisonId: 'WSI',
    prisonName: 'Wormwood Scrubs (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 125,
        addressLine1: 'Du Cane Road',
        addressLine2: null,
        town: 'London',
        county: 'Greater London',
        postcode: 'W12 0AE',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  WMI: {
    prisonId: 'WMI',
    prisonName: 'Wymott (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 126,
        addressLine1: 'Ulnes Walton Lane',
        addressLine2: null,
        town: 'Leyland',
        county: 'Lancashire',
        postcode: 'PR26 8LW',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  WAI: {
    prisonId: 'WAI',
    prisonName: 'The Weare (HMP)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  WBI: {
    prisonId: 'WBI',
    prisonName: 'Wellingborough (HMP)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  WOI: {
    prisonId: 'WOI',
    prisonName: 'Wolds (HMP)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  FOI: {
    prisonId: 'FOI',
    prisonName: 'Foreign Prison',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  TAI: {
    prisonId: 'TAI',
    prisonName: 'Thorp Arch (HMP)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  RUI: {
    prisonId: 'RUI',
    prisonName: 'Rudgate (HMP)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  ANI: {
    prisonId: 'ANI',
    prisonName: 'Aldington (HMP)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  CEI: {
    prisonId: 'CEI',
    prisonName: 'Cleland (HMP)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  NOI: {
    prisonId: 'NOI',
    prisonName: 'Northeye (HMP)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  PCI: {
    prisonId: 'PCI',
    prisonName: 'Pucklechurch (hmrc)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  FII: {
    prisonId: 'FII',
    prisonName: 'Finnamore (hmYOI)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  CPI: {
    prisonId: 'CPI',
    prisonName: 'Campsfield House (hmYOI)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  OXI: {
    prisonId: 'OXI',
    prisonName: 'Oxford (HMP)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  RLI: {
    prisonId: 'RLI',
    prisonName: 'Rollestone (HMP)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  CRI: {
    prisonId: 'CRI',
    prisonName: 'Colchester (hmYOI)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  ZZGHI: {
    prisonId: 'ZZGHI',
    prisonName: 'Ghost Holding Establishment',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [],
  },
  FBI: {
    prisonId: 'FBI',
    prisonName: 'Forest Bank (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: true,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['B'],
    addresses: [
      {
        id: 38,
        addressLine1: 'Forest Bank',
        addressLine2: 'Swinton',
        town: 'Manchester',
        county: 'Greater Manchester',
        postcode: 'M27 8FB',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'Sodexo',
      },
    ],
  },
  AGI: {
    prisonId: 'AGI',
    prisonName: 'Askham Grange (HMP & YOI)',
    active: false,
    male: true,
    female: true,
    contracted: true,
    types: [
      {
        code: 'STC',
        description: 'Secure Training Centre',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 3,
        addressLine1: 'Main Street',
        addressLine2: null,
        town: 'Sheffield',
        county: 'South Yorkshire',
        postcode: 'YO23 3FT',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  KTI: {
    prisonId: 'KTI',
    prisonName: 'Kennet (HMP)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [],
    categories: [],
    addresses: [],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  BMI: {
    prisonId: 'BMI',
    prisonName: 'Birmingham (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['B'],
    addresses: [
      {
        id: 8,
        addressLine1: 'Winson Green Road',
        addressLine2: null,
        town: 'Birmingham',
        county: 'West Midlands',
        postcode: 'B18 4AS',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  BXI: {
    prisonId: 'BXI',
    prisonName: 'Brixton (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 11,
        addressLine1: 'Jebb Avenue',
        addressLine2: 'Brixton Hill',
        town: 'London',
        county: 'Greater London',
        postcode: 'SW2 5XF',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  BCI: {
    prisonId: 'BCI',
    prisonName: 'Buckley Hall (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 13,
        addressLine1: 'Buckley Farm Lane',
        addressLine2: null,
        town: 'Rochdale',
        county: 'Greater Manchester',
        postcode: 'OL12 9DP',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  BRI: {
    prisonId: 'BRI',
    prisonName: 'Bure (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 15,
        addressLine1: 'Jaguar Drive',
        addressLine2: 'Badersfield',
        town: 'Norwich',
        county: 'Norfolk',
        postcode: 'NR10 5GB',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  CWI: {
    prisonId: 'CWI',
    prisonName: 'Channings Wood (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 17,
        addressLine1: 'Greenhill Lane',
        addressLine2: 'Denbury',
        town: 'Newton Abbot',
        county: 'Devon',
        postcode: 'TQ12 6DW',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  CLI: {
    prisonId: 'CLI',
    prisonName: 'Coldingley (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 19,
        addressLine1: 'Shaftesbury Road',
        addressLine2: 'Bisley',
        town: 'Woking',
        county: 'Surrey',
        postcode: 'GU24 9EX',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  DAI: {
    prisonId: 'DAI',
    prisonName: 'Dartmoor (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 21,
        addressLine1: 'Princetown',
        addressLine2: null,
        town: 'Yelverton',
        county: 'Devon',
        postcode: 'PL20 6RR',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  FSI: {
    prisonId: 'FSI',
    prisonName: 'Featherstone (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 33,
        addressLine1: 'Featherstone',
        addressLine2: null,
        town: 'Wolverhampton',
        county: 'West Midlands',
        postcode: 'WV10 7PU',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  MJW: {
    prisonId: 'MJW',
    prisonName: "Michael's Prison",
    active: false,
    male: false,
    female: true,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
      {
        code: 'STC',
        description: 'Secure Training Centre',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 133,
        addressLine1: '57 Chelsea Road',
        addressLine2: '',
        town: 'Sheffield',
        county: 'South Yorkshire',
        postcode: 'S11 9BE',
        country: 'England',
      },
      {
        id: 134,
        addressLine1: '32 Scotland Road',
        addressLine2: null,
        town: 'Sheffield',
        county: null,
        postcode: 'S1 5TH',
        country: 'England',
      },
    ],
    operators: [],
  },
  FDI: {
    prisonId: 'FDI',
    prisonName: 'Ford (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 37,
        addressLine1: 'Ford Road',
        addressLine2: null,
        town: 'Arundel',
        county: 'West Sussex',
        postcode: 'BN18 0BX',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  ABC: {
    prisonId: 'ABC',
    prisonName: 'HMP New Prison2',
    active: true,
    male: false,
    female: true,
    contracted: false,
    types: [
      {
        code: 'IRC',
        description: 'Immigration Removal Centre',
      },
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
      {
        code: 'STC',
        description: 'Secure Training Centre',
      },
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 130,
        addressLine1: '1021 Chelsea Road',
        addressLine2: 'Brincliffe',
        town: 'Sheffield',
        county: 'South Yorkshire',
        postcode: 'S11 9BQ',
        country: 'England',
      },
      {
        id: 131,
        addressLine1: '69 Evelyn Road',
        addressLine2: 'Crookes',
        town: 'Sheffield',
        county: 'South Yorkshire',
        postcode: 'S10 5FE',
        country: 'England',
      },
    ],
    operators: [],
  },
  FKI: {
    prisonId: 'FKI',
    prisonName: 'Frankland (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['B', 'A'],
    addresses: [
      {
        id: 40,
        addressLine1: 'Brasside',
        addressLine2: null,
        town: 'Durham',
        county: 'County Durham',
        postcode: 'DH1 5YD',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  FNI: {
    prisonId: 'FNI',
    prisonName: 'Full Sutton (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['B', 'A'],
    addresses: [
      {
        id: 41,
        addressLine1: 'Full Sutton',
        addressLine2: null,
        town: 'York',
        county: 'North Yorkshire',
        postcode: 'YO41 1PS',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  GHI: {
    prisonId: 'GHI',
    prisonName: 'Garth (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['B'],
    addresses: [
      {
        id: 42,
        addressLine1: 'Ulnes Walton Lane',
        addressLine2: null,
        town: 'Leyland',
        county: 'Lancashire',
        postcode: 'PR26 8NE',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  GTI: {
    prisonId: 'GTI',
    prisonName: 'Gartree (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['B'],
    addresses: [
      {
        id: 43,
        addressLine1: 'Gartree',
        addressLine2: null,
        town: 'Market Harborough',
        county: 'Leicestershire',
        postcode: 'LE16 7RP',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  GNI: {
    prisonId: 'GNI',
    prisonName: 'Grendon (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['B', 'C'],
    addresses: [
      {
        id: 44,
        addressLine1: 'Grendon Underwood',
        addressLine2: 'Edgcott',
        town: 'Aylesbury',
        county: 'Buckinghamshire',
        postcode: 'HP18 0TL',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  GMI: {
    prisonId: 'GMI',
    prisonName: 'Guys Marsh (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 45,
        addressLine1: null,
        addressLine2: null,
        town: 'Shaftsbury',
        county: 'Dorset',
        postcode: 'SP7 0AH',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  HVI: {
    prisonId: 'HVI',
    prisonName: 'Haverigg (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 48,
        addressLine1: 'Haverigg',
        addressLine2: null,
        town: 'Millom',
        county: 'Cumbria',
        postcode: 'LA18 4NA',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  HEI: {
    prisonId: 'HEI',
    prisonName: 'Hewell (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 49,
        addressLine1: 'Hewell Lane',
        addressLine2: null,
        town: 'Redditch',
        county: 'Worcestershire',
        postcode: 'B97 6QS',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  HPI: {
    prisonId: 'HPI',
    prisonName: 'Highpoint (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 51,
        addressLine1: 'Stradishall',
        addressLine2: null,
        town: 'Newmarket',
        county: 'Suffolk',
        postcode: 'CB8 9YG',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  HMI: {
    prisonId: 'HMI',
    prisonName: 'Humber (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 56,
        addressLine1: '4 Sands Lane',
        addressLine2: 'Everthorpe',
        town: 'Brough',
        county: 'East Yorkshire',
        postcode: 'HU15 2JZ',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  HCI: {
    prisonId: 'HCI',
    prisonName: 'Huntercombe (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 57,
        addressLine1: 'Huntercombe Place',
        addressLine2: 'Nuffield',
        town: 'Henley-on-Thames',
        county: 'Oxfordshire',
        postcode: 'RG9 5SB',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  PYI: {
    prisonId: 'PYI',
    prisonName: 'Parc (HMYOI)',
    active: true,
    male: true,
    female: false,
    contracted: true,
    types: [
      {
        code: 'YCS',
        description: 'Youth Custody Service',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 138,
        addressLine1: 'Heol Hopcyn John',
        addressLine2: null,
        town: 'Bridgend',
        county: null,
        postcode: 'CF35 6AP',
        country: 'Wales',
      },
    ],
    operators: [
      {
        name: 'G4S',
      },
    ],
  },
  KMI: {
    prisonId: 'KMI',
    prisonName: 'Kirkham (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 60,
        addressLine1: 'Freckleton Road',
        addressLine2: 'Kirkham',
        town: 'Preston',
        county: 'Lancashire',
        postcode: 'PR4 2RN',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  LFI: {
    prisonId: 'LFI',
    prisonName: 'Lancaster Farms (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 62,
        addressLine1: 'Stone Row Head',
        addressLine2: null,
        town: 'Lancaster',
        county: 'Lancashire',
        postcode: 'LA1 3QZ',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  LEI: {
    prisonId: 'LEI',
    prisonName: 'Leeds (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 63,
        addressLine1: '2 Gloucester Terrace',
        addressLine2: null,
        town: 'Leeds',
        county: 'West Yorkshire',
        postcode: 'LS12 2TJ',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  LCI: {
    prisonId: 'LCI',
    prisonName: 'Leicester (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 64,
        addressLine1: '116 Welford Road',
        addressLine2: null,
        town: 'Leicester',
        county: 'Leicestershire',
        postcode: 'LE2 7AJ',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  LYI: {
    prisonId: 'LYI',
    prisonName: 'Leyhill (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 66,
        addressLine1: 'Wotton-under-Edge',
        addressLine2: null,
        town: 'Gloucester',
        county: 'Gloucestershire',
        postcode: 'GL12 8BT',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  LHI: {
    prisonId: 'LHI',
    prisonName: 'Lindholme (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 68,
        addressLine1: 'Bawtry Road',
        addressLine2: 'Hatfield',
        town: 'Doncaster',
        county: 'South Yorkshire',
        postcode: 'DN7 6EE',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  LTI: {
    prisonId: 'LTI',
    prisonName: 'Littlehey (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 69,
        addressLine1: 'Perry',
        addressLine2: null,
        town: 'Huntingdon',
        county: 'Cambridgeshire',
        postcode: 'PE28 0SR',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  LPI: {
    prisonId: 'LPI',
    prisonName: 'Liverpool (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['B'],
    addresses: [
      {
        id: 70,
        addressLine1: '68 Hornby Road',
        addressLine2: null,
        town: 'Liverpool',
        county: 'Merseyside',
        postcode: 'L9 3DF',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  LLI: {
    prisonId: 'LLI',
    prisonName: 'Long Lartin (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['B', 'A'],
    addresses: [
      {
        id: 71,
        addressLine1: 'South Littleton',
        addressLine2: null,
        town: 'Evesham',
        county: 'Worcestershire',
        postcode: 'WR11 8TZ',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  MSI: {
    prisonId: 'MSI',
    prisonName: 'Maidstone (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 74,
        addressLine1: '36 County Road',
        addressLine2: null,
        town: 'Maidstone',
        county: 'Kent',
        postcode: 'ME14 1UZ',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  NSI: {
    prisonId: 'NSI',
    prisonName: 'North Sea Camp (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 80,
        addressLine1: 'Croppers Lane',
        addressLine2: 'Freiston',
        town: 'Boston',
        county: 'Lincolnshire',
        postcode: 'PE22 0QX',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  ONI: {
    prisonId: 'ONI',
    prisonName: 'Onley (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 85,
        addressLine1: 'Willoughby',
        addressLine2: null,
        town: 'Rugby',
        county: 'Warwickshire',
        postcode: 'CV23 8AP',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  RNI: {
    prisonId: 'RNI',
    prisonName: 'Ranby (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 94,
        addressLine1: null,
        addressLine2: null,
        town: 'Retford',
        county: 'Nottinghamshire',
        postcode: 'DN22 8EU',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  RSI: {
    prisonId: 'RSI',
    prisonName: 'Risley (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 95,
        addressLine1: 'Warrington Road',
        addressLine2: 'Risley',
        town: 'Warrington',
        county: 'Cheshire',
        postcode: 'WA3 6BP',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  SDI: {
    prisonId: 'SDI',
    prisonName: 'Send (HMP)',
    active: true,
    male: false,
    female: true,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 98,
        addressLine1: 'Ripley Road',
        addressLine2: 'Send',
        town: 'Woking',
        county: 'Surrey',
        postcode: 'GU23 7LJ',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  SPI: {
    prisonId: 'SPI',
    prisonName: 'Spring Hill (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 99,
        addressLine1: 'Grendon Underwood',
        addressLine2: null,
        town: 'Aylesbury',
        county: 'Buckinghamshire',
        postcode: 'HP18 0TL',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  SFI: {
    prisonId: 'SFI',
    prisonName: 'Stafford (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 100,
        addressLine1: '54 Gaol Road',
        addressLine2: null,
        town: 'Stafford',
        county: 'Staffordshire',
        postcode: 'ST16 3AW',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  SKI: {
    prisonId: 'SKI',
    prisonName: 'Stocken (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 102,
        addressLine1: 'Stocken Hall Road',
        addressLine2: 'Stretton',
        town: 'Oakham',
        county: 'Rutland',
        postcode: 'LE15 7RD',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  SLI: {
    prisonId: 'SLI',
    prisonName: 'Swaleside (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['B'],
    addresses: [
      {
        id: 106,
        addressLine1: 'Church Road',
        addressLine2: 'Eastchurch',
        town: 'Sheerness',
        county: 'Kent',
        postcode: 'ME12 4AX',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  MTI: {
    prisonId: 'MTI',
    prisonName: 'The Mount (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 110,
        addressLine1: 'Molyneaux Avenue',
        addressLine2: 'Bovingdon',
        town: 'Hemel Hempstead',
        county: 'Hertfordshire',
        postcode: 'HP3 0NZ',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  VEI: {
    prisonId: 'VEI',
    prisonName: 'The Verne (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 111,
        addressLine1: 'Verne Common Road',
        addressLine2: null,
        town: 'Portland',
        county: 'Dorset',
        postcode: 'DT5 1EQ',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  WDI: {
    prisonId: 'WDI',
    prisonName: 'Wakefield (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['B', 'A'],
    addresses: [
      {
        id: 114,
        addressLine1: '5 Love Lane',
        addressLine2: null,
        town: 'Wakefield',
        county: 'West Yorkshire',
        postcode: 'WF2 9AG',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  WLI: {
    prisonId: 'WLI',
    prisonName: 'Wayland (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 117,
        addressLine1: 'Griston',
        addressLine2: null,
        town: 'Thetford',
        county: 'Norfolk',
        postcode: 'IP25 6RL',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  WEI: {
    prisonId: 'WEI',
    prisonName: 'Wealstun (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 118,
        addressLine1: 'Walton Road',
        addressLine2: null,
        town: 'Wetherby',
        county: null,
        postcode: 'LS23 7AZ',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  WTI: {
    prisonId: 'WTI',
    prisonName: 'Whatton (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 121,
        addressLine1: 'New Lane',
        addressLine2: 'Whatton',
        town: 'Nottingham',
        county: 'Nottinghamshire',
        postcode: 'NG13 9FQ',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  WRI: {
    prisonId: 'WRI',
    prisonName: 'Whitemoor (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['B', 'A'],
    addresses: [
      {
        id: 122,
        addressLine1: 'Longhill Road',
        addressLine2: null,
        town: 'March',
        county: 'Cambridgeshire',
        postcode: 'PE15 0PR',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  AYI: {
    prisonId: 'AYI',
    prisonName: 'Aylesbury (HMYOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'YCS',
        description: 'Youth Custody Service',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 4,
        addressLine1: 'Bierton Road',
        addressLine2: null,
        town: 'Aylesbury',
        county: 'Buckinghamshire',
        postcode: 'HP20 1EH',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  BFI: {
    prisonId: 'BFI',
    prisonName: 'Bedford (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 5,
        addressLine1: 'St Loyes Street',
        addressLine2: null,
        town: 'Bedford',
        county: 'Bedfordshire',
        postcode: 'MK40 1HG',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  BAI: {
    prisonId: 'BAI',
    prisonName: 'Belmarsh (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
    ],
    categories: ['B', 'A'],
    addresses: [
      {
        id: 6,
        addressLine1: 'Belmarsh Road',
        addressLine2: null,
        town: 'London',
        county: 'Greater London',
        postcode: 'SE28 0EB',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  BWI: {
    prisonId: 'BWI',
    prisonName: 'Berwyn (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 7,
        addressLine1: 'Bridge Road',
        addressLine2: 'Wrexham Industrial Estate',
        town: 'Wrexham',
        county: null,
        postcode: 'LL13 9QA',
        country: 'Wales',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  BSI: {
    prisonId: 'BSI',
    prisonName: 'Brinsford (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
    ],
    categories: ['B', 'C'],
    addresses: [
      {
        id: 9,
        addressLine1: 'New Road',
        addressLine2: 'Featherstone',
        town: 'Wolverhampton',
        county: 'West Midlands',
        postcode: 'WV10 7PY',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  BLI: {
    prisonId: 'BLI',
    prisonName: 'Bristol (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 10,
        addressLine1: '19 Cambridge Road',
        addressLine2: 'Bishopston',
        town: 'Bristol',
        county: null,
        postcode: 'BS7 8PS',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  BZI: {
    prisonId: 'BZI',
    prisonName: 'Bronzefield (HMP & YOI)',
    active: true,
    male: false,
    female: true,
    contracted: true,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 12,
        addressLine1: 'Woodthorpe Road',
        addressLine2: null,
        town: 'Ashford',
        county: 'Surrey',
        postcode: 'TW15 3JZ',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'Sodexo',
      },
    ],
  },
  BNI: {
    prisonId: 'BNI',
    prisonName: 'Bullingdon (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
    ],
    categories: ['B', 'C'],
    addresses: [
      {
        id: 14,
        addressLine1: 'Patrick Haugh Road',
        addressLine2: 'Arncott',
        town: 'Bicester',
        county: 'Oxfordshire',
        postcode: 'OX25 1PZ',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  CFI: {
    prisonId: 'CFI',
    prisonName: 'Cardiff (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 16,
        addressLine1: 'Knox Road',
        addressLine2: null,
        town: 'Cardiff',
        county: null,
        postcode: 'CF24 0UG',
        country: 'Wales',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  CDI: {
    prisonId: 'CDI',
    prisonName: 'Chelmsford (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 18,
        addressLine1: '200 Springfield Road',
        addressLine2: 'Springfield',
        town: 'Chelmsford',
        county: 'Essex',
        postcode: 'CM2 6JT',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  CKI: {
    prisonId: 'CKI',
    prisonName: 'Cookham Wood (HMYOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'His Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 20,
        addressLine1: 'Sir Evelyn Road',
        addressLine2: null,
        town: 'Rochester',
        county: 'Kent',
        postcode: 'ME1 3LU',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  DTI: {
    prisonId: 'DTI',
    prisonName: 'Deerbolt (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 22,
        addressLine1: 'Bowes Road',
        addressLine2: null,
        town: 'Barnard Castle',
        county: 'County Durham',
        postcode: 'DL12 9BG',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  DNI: {
    prisonId: 'DNI',
    prisonName: 'Doncaster (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: true,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['B'],
    addresses: [
      {
        id: 23,
        addressLine1: 'Marshgate',
        addressLine2: null,
        town: 'Doncaster',
        county: 'South Yorkshire',
        postcode: 'DN5 8UX',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'Serco',
      },
    ],
  },
  DWI: {
    prisonId: 'DWI',
    prisonName: 'Downview (HMP & YOI)',
    active: true,
    male: false,
    female: true,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 25,
        addressLine1: 'Sutton Lane',
        addressLine2: null,
        town: 'Sutton',
        county: 'Surrey',
        postcode: 'SM2 5PD',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  DHI: {
    prisonId: 'DHI',
    prisonName: 'Drake Hall (HMP & YOI)',
    active: true,
    male: false,
    female: true,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 26,
        addressLine1: null,
        addressLine2: null,
        town: 'Eccleshall',
        county: 'Staffordshire',
        postcode: 'ST21 6LQ',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  FMI: {
    prisonId: 'FMI',
    prisonName: 'Feltham (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 34,
        addressLine1: 'Bedfont Road',
        addressLine2: null,
        town: 'Feltham',
        county: 'Greater London',
        postcode: 'TW13 4ND',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  FYI: {
    prisonId: 'FYI',
    prisonName: 'Feltham (HMYOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'YCS',
        description: 'Youth Custody Service',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 35,
        addressLine1: 'Bedfont Road',
        addressLine2: null,
        town: 'Feltham',
        county: 'Greater London',
        postcode: 'TW13 4NP',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  DMI: {
    prisonId: 'DMI',
    prisonName: 'Durham (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 27,
        addressLine1: 'Old Elvet',
        addressLine2: null,
        town: 'Durham',
        county: 'County Durham',
        postcode: 'DH1 3HU',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  ESI: {
    prisonId: 'ESI',
    prisonName: 'East Sutton Park (HMP & YOI)',
    active: true,
    male: false,
    female: true,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 28,
        addressLine1: 'Sutton Valence',
        addressLine2: null,
        town: 'Maidstone',
        county: 'Kent',
        postcode: 'ME17 3DF',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  EWI: {
    prisonId: 'EWI',
    prisonName: 'Eastwood Park (HMP & YOI)',
    active: true,
    male: false,
    female: true,
    contracted: false,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 29,
        addressLine1: 'Falfield',
        addressLine2: null,
        town: 'Wotton-under-Edge',
        county: 'Gloucestershire',
        postcode: 'GL12 8DB',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  EYI: {
    prisonId: 'EYI',
    prisonName: 'Elmley (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
    ],
    categories: ['B'],
    addresses: [
      {
        id: 30,
        addressLine1: 'Church Road',
        addressLine2: 'Eastchurch',
        town: 'Sheerness',
        county: 'Kent',
        postcode: 'ME12 4DZ',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  EEI: {
    prisonId: 'EEI',
    prisonName: 'Erlestoke (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 31,
        addressLine1: null,
        addressLine2: null,
        town: 'Devizes',
        county: 'Wiltshire',
        postcode: 'SN10 5TU',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  EXI: {
    prisonId: 'EXI',
    prisonName: 'Exeter (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 32,
        addressLine1: 'New North Road',
        addressLine2: null,
        town: 'Exeter',
        county: 'Devon',
        postcode: 'EX4 4EX',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  HHI: {
    prisonId: 'HHI',
    prisonName: 'Holme House (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 54,
        addressLine1: 'Holme House Road',
        addressLine2: null,
        town: 'Stockton-On-Tees',
        county: 'County Durham',
        postcode: 'TS18 2QU',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  ISI: {
    prisonId: 'ISI',
    prisonName: 'Isis (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 58,
        addressLine1: 'Western Way',
        addressLine2: 'Thamesmead',
        town: 'London',
        county: 'Greater London',
        postcode: 'SE28 0NZ',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  DGI: {
    prisonId: 'DGI',
    prisonName: 'Dovegate (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: true,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['B'],
    addresses: [
      {
        id: 24,
        addressLine1: null,
        addressLine2: null,
        town: 'Uttoxeter',
        county: 'Staffordshire',
        postcode: 'ST14 8XR',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'Serco',
      },
    ],
  },
  FWI: {
    prisonId: 'FWI',
    prisonName: 'Five Wells (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: true,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 36,
        addressLine1: 'Doddington Road',
        addressLine2: null,
        town: 'Wellingborough',
        county: 'Northamptonshire',
        postcode: 'NN8 2NG',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  LGI: {
    prisonId: 'LGI',
    prisonName: 'Lowdham Grange (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: true,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['B'],
    addresses: [
      {
        id: 73,
        addressLine1: null,
        addressLine2: null,
        town: 'Lowdham',
        county: 'Nottinghamshire',
        postcode: 'NG14 7DA',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'Serco',
      },
    ],
  },
  NLI: {
    prisonId: 'NLI',
    prisonName: 'Northumberland (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: true,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 81,
        addressLine1: 'Wansbeck Road',
        addressLine2: 'Acklington',
        town: 'Morpeth',
        county: 'Northumberland',
        postcode: 'NE65 9XG',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'Sodexo',
      },
    ],
  },
  IWI: {
    prisonId: 'IWI',
    prisonName: 'Isle Of Wight (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['B', 'C'],
    addresses: [
      {
        id: 59,
        addressLine1: '55 Parkhurst Road',
        addressLine2: null,
        town: 'Newport',
        county: null,
        postcode: 'PO30 5RS',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  KVI: {
    prisonId: 'KVI',
    prisonName: 'Kirklevington Grange (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 61,
        addressLine1: 'Kirklevington',
        addressLine2: null,
        town: 'Yarm',
        county: 'North Yorkshire',
        postcode: 'TS15 9PA',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  MRI: {
    prisonId: 'MRI',
    prisonName: 'Manchester (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['B', 'A'],
    addresses: [
      {
        id: 75,
        addressLine1: '1 Southall Street',
        addressLine2: null,
        town: 'Manchester',
        county: 'Greater Manchester',
        postcode: 'M60 9AH',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  NMI: {
    prisonId: 'NMI',
    prisonName: 'Nottingham (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 83,
        addressLine1: '112 Perry Road',
        addressLine2: 'Sherwood',
        town: 'Nottingham',
        county: 'Nottingham',
        postcode: 'NG5 3AG',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  RHI: {
    prisonId: 'RHI',
    prisonName: 'Rye Hill (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: true,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['B'],
    addresses: [
      {
        id: 128,
        addressLine1: 'Onley Park',
        addressLine2: 'Willoughby',
        town: 'Sheffield',
        county: null,
        postcode: 'AA11AA',
        country: 'England',
      },
      {
        id: 127,
        addressLine1: 'Onley Park',
        addressLine2: 'Willoughby',
        town: 'Sheffield',
        county: null,
        postcode: 'S1 1AB',
        country: 'England',
      },
      {
        id: 97,
        addressLine1: 'Onley Park',
        addressLine2: 'Willoughby',
        town: 'Rugby',
        county: 'Warwickshire',
        postcode: 'CV23 8SZ',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'G4S',
      },
    ],
  },
  OWI: {
    prisonId: 'OWI',
    prisonName: 'Oakwood (HMP)',
    active: true,
    male: true,
    female: false,
    contracted: true,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['C'],
    addresses: [
      {
        id: 84,
        addressLine1: 'Oaks Drive',
        addressLine2: 'Featherstone',
        town: 'Wolverhampton',
        county: 'West Midlands',
        postcode: 'WV10 7QD',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'G4S',
      },
    ],
  },
  PRI: {
    prisonId: 'PRI',
    prisonName: 'Parc (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: true,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['B'],
    addresses: [
      {
        id: 86,
        addressLine1: 'Heol Hopcyn John',
        addressLine2: 'Coity',
        town: 'Bridgend',
        county: null,
        postcode: 'CF35 6AP',
        country: 'Wales',
      },
    ],
    operators: [
      {
        name: 'G4S',
      },
    ],
  },
  PBI: {
    prisonId: 'PBI',
    prisonName: 'Peterborough (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: true,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: ['B'],
    addresses: [
      {
        id: 89,
        addressLine1: 'Saville Road',
        addressLine2: 'Westwood',
        town: 'Peterborough',
        county: 'Cambridgeshire',
        postcode: 'PE3 7PD',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'Sodexo',
      },
    ],
  },
  PNI: {
    prisonId: 'PNI',
    prisonName: 'Preston (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 93,
        addressLine1: '2 Ribbleton Lane',
        addressLine2: null,
        town: 'Preston',
        county: 'Lancashire',
        postcode: 'PR1 5AB',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  EHI: {
    prisonId: 'EHI',
    prisonName: 'Standford Hill (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 101,
        addressLine1: 'Church Road',
        addressLine2: 'Eastchurch',
        town: 'Sheerness',
        county: 'Kent',
        postcode: 'ME12 4AA',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  SWI: {
    prisonId: 'SWI',
    prisonName: 'Swansea (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: false,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 107,
        addressLine1: '200 Oystermouth Road',
        addressLine2: null,
        town: 'Swansea',
        county: 'South Wales',
        postcode: 'SA1 3SR',
        country: 'Wales',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  TSI: {
    prisonId: 'TSI',
    prisonName: 'Thameside (HMP & YOI)',
    active: true,
    male: true,
    female: false,
    contracted: true,
    types: [
      {
        code: 'YOI',
        description: 'Her Majesty’s Youth Offender Institution',
      },
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 109,
        addressLine1: 'Griffin Manor Way',
        addressLine2: 'Thameside',
        town: 'London',
        county: 'Greater London',
        postcode: 'SE28 0FJ',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'Serco',
      },
    ],
  },
  MWI: {
    prisonId: 'MWI',
    prisonName: 'Medway (STC)',
    active: false,
    male: false,
    female: false,
    contracted: false,
    types: [
      {
        code: 'STC',
        description: 'Secure Training Centre',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 76,
        addressLine1: 'Sir Evelyn Road',
        addressLine2: null,
        town: 'Rochester',
        county: 'Kent',
        postcode: 'ME1 3YB',
        country: 'England',
      },
    ],
    operators: [
      {
        name: 'PSP',
      },
    ],
  },
  AZZ: {
    prisonId: 'AZZ',
    prisonName: 'AZZ Youth',
    active: true,
    male: true,
    female: false,
    contracted: true,
    types: [
      {
        code: 'YCS',
        description: 'Youth Custody Service',
      },
    ],
    categories: [],
    addresses: [
      {
        id: 139,
        addressLine1: '1, Alan Street',
        addressLine2: '',
        town: 'Alan Town',
        county: 'North Yorkshire',
        postcode: 'YO24 4FT',
        country: 'England',
      },
    ],
    operators: [],
  },
  III: {
    prisonId: 'III',
    prisonName: 'My new prison',
    active: false,
    male: false,
    female: true,
    contracted: true,
    types: [
      {
        code: 'HMP',
        description: 'Her Majesty’s Prison',
      },
    ],
    categories: [],
    addresses: [],
    operators: [],
  },
}

const allPrisons: Array<PrisonDto> = Object.entries(prisonsKeyedByPrisonId).map(entry => entry[1])

export { prisonsKeyedByPrisonId, allPrisons }
