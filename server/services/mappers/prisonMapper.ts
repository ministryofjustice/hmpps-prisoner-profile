import { PrisonDto } from '../../data/interfaces/prisonRegisterApi/prisonRegisterApiTypes'
import { Prison } from '../interfaces/prisonService/PrisonServicePrisons'

export default function toPrison(prisonDto: PrisonDto): Prison {
  return {
    prisonId: prisonDto.prisonId,
    prisonName: prisonDto.prisonName,
  }
}
