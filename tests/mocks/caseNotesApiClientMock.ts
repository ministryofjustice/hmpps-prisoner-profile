import CaseNotesApiClient from '../../server/data/interfaces/caseNotesApi/caseNotesApiClient'

export const caseNotesApiClientMock = (): CaseNotesApiClient => ({
  getCaseNotes: jest.fn(),
  getCaseNoteTypes: jest.fn(),
  addCaseNote: jest.fn(),
  addCaseNoteAmendment: jest.fn(),
  getCaseNote: jest.fn(),
  getCaseNoteUsage: jest.fn(),
  getIncentivesCaseNoteCount: jest.fn(),
})

export default { caseNotesApiClientMock }
