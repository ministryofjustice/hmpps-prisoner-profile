import ReferenceDataService from '../referenceData/referenceDataService'
import OsAddress from '../../data/interfaces/osPlacesApi/osAddress'
import {
  AddressRequestDto,
  CorePersonRecordReferenceDataDomain,
} from '../../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { formatDateISO } from '../../utils/dateHelpers'
import { ReferenceDataCodeDto } from '../../data/interfaces/referenceData'

// eslint-disable-next-line no-shadow
export enum AddressLocation {
  uk = 'uk',
  overseas = 'overseas',
  no_fixed_address = 'no_fixed_address',
}

const ukMainlandCountryCodes: string[] = ['GBR', 'ENG', 'NI', 'SCOT', 'WALES']
const ukNomisCountryCodes: string[] = [...ukMainlandCountryCodes, 'GGY', 'IOM', 'JEY']

const osPlacesCountryCodeToNomisCode: Record<string, string> = {
  E: 'ENG', // England
  J: 'XX', // Unknown
  L: 'CI', // Channel Islands
  M: 'IOM', // Isle of Man
  N: 'NI', // Northern Ireland
  S: 'SCOT', // Scotland
  W: 'WALES', // Wales
}

const osPlacesPostTownToNomisCode: Record<string, string> = {
  'PURFLEET-ON-THAMES': '10402', // Purfleet
  GARNDOLBENMAEN: '12021', // Garn Dolbenmaen
  'Y FELINHELI': '12134', // Port Dinorwic
  'ROWLANDS CASTLE': '12720', // Rowland's Castle
  CARRBRIDGE: '13699', // Carr Bridge
  'STAINES-UPON-THAMES': '18249', // Staines
  'BARROW-UPON-HUMBER': '24974', // Barrow-On-Humber
  'BARTON-UPON-HUMBER': '24978', // Barton-On-Humber
  'HOUGHTON-LE-SPRING': '27034', // Houghton Le Spring
  'HENLEY-ON-THAMES': '31951', // Henley-On Thames
  BILLINGSHURST: '32556', // Billinghurst
  SWADLINCOTE: '36146', // Swadlingcote
  LLANBRYNMAIR: '38301', // Llanbryn-Mair
  'Y DRENEWYDD': '38657', // Y Drefnewydd
  PRENTON: '90202', // Prenton Do
}

export default class AddressMapper {
  constructor(private readonly referenceDataService: ReferenceDataService) {}

  public async toAddressRequestDto(address: OsAddress, token: string): Promise<AddressRequestDto> {
    const postTownCode = await this.getNomisCodeFromOsPlacesPostTown(address.postTown, token)

    return {
      uprn: address.uprn,
      buildingNumber: address.buildingNumber ? `${address.buildingNumber}` : null,
      subBuildingName: address.subBuildingName,
      buildingName: address.buildingName,
      thoroughfareName: address.thoroughfareName,
      dependantLocality: address.dependentLocality,
      postTownCode,
      countryCode: osPlacesCountryCodeToNomisCode[address.country],
      postCode: address.postcode,
      fromDate: formatDateISO(new Date()),
      addressTypes: [],
    }
  }

  public filterCountryCodes(
    referenceData: ReferenceDataCodeDto[],
    addressLocation?: AddressLocation,
  ): ReferenceDataCodeDto[] {
    if (addressLocation === AddressLocation.overseas) {
      return referenceData.filter(code => !ukMainlandCountryCodes.includes(code.code))
    }

    return referenceData.filter(code => ukNomisCountryCodes.includes(code.code))
  }

  private async getNomisCodeFromOsPlacesPostTown(osPlacesPostTown: string, token: string): Promise<string> {
    const mapping = osPlacesPostTownToNomisCode[osPlacesPostTown?.toUpperCase()?.trim()]
    if (mapping) return mapping

    const cityCodes = await this.referenceDataService.getActiveReferenceDataCodes(
      CorePersonRecordReferenceDataDomain.city,
      token,
    )

    return cityCodes.find(code => code.description?.toUpperCase()?.trim() === osPlacesPostTown?.toUpperCase()?.trim())
      ?.code
  }
}
