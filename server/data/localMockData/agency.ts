import Agency from '../interfaces/prisonApi/Agency'

const AgencyMock: Agency = {
  agencyId: 'SHEFCC',
  description: 'Sheffield Crown Court',
  longDescription: 'Sheffield Crown Court',
  agencyType: 'CRT',
  active: true,
  courtType: 'CC',
}

// Prison
export const agencyDetailsMock: Agency = {
  agencyId: 'LEI',
  description: 'Leeds (HMP)',
  active: true,
  agencyType: 'INST',
  courtType: 'CC',
  longDescription: 'Leeds (HMP)',
}

export default AgencyMock
