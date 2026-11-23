import type Interface from './Interface'
import type AliasService from '../../server/services/aliasService'
import { PseudonymResponseMock } from '../../server/data/localMockData/personIntegrationApiReferenceDataMock'

export const aliasServiceMock = (): jest.Mocked<AliasService> =>
  ({
    getWorkingNameAlias: jest.fn().mockImplementation(() => Promise.resolve(PseudonymResponseMock)),
    updateWorkingName: jest.fn().mockImplementation(() => Promise.resolve(PseudonymResponseMock)),
    updateDateOfBirth: jest.fn().mockImplementation(() => Promise.resolve(PseudonymResponseMock)),
    updateEthnicity: jest.fn().mockImplementation(() => Promise.resolve(PseudonymResponseMock)),
    createNewWorkingName: jest.fn().mockImplementation(() => Promise.resolve(PseudonymResponseMock)),
    addNewAlias: jest.fn().mockImplementation(() => Promise.resolve(PseudonymResponseMock)),
    checkForDuplicateAlias: jest.fn().mockImplementation(() => Promise.resolve(false)),
  }) satisfies Interface<AliasService> as unknown as jest.Mocked<AliasService>

export default { aliasServiceMock }
