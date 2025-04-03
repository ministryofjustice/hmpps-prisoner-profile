import AliasService from '../../server/services/aliasService'
import { PseudonymResponseMock } from '../../server/data/localMockData/personIntegrationApiReferenceDataMock'
import Interface from './Interface'

export const aliasServiceMock = (): Interface<AliasService> => ({
  getWorkingNameAlias: jest.fn().mockImplementation(() => Promise.resolve(PseudonymResponseMock)),
  updateWorkingName: jest.fn().mockImplementation(() => Promise.resolve(PseudonymResponseMock)),
  updateDateOfBirth: jest.fn().mockImplementation(() => Promise.resolve(PseudonymResponseMock)),
  createNewWorkingName: jest.fn().mockImplementation(() => Promise.resolve(PseudonymResponseMock)),
  addNewAlias: jest.fn().mockImplementation(() => Promise.resolve(PseudonymResponseMock)),
})
