import PersonalPageService from '../../../services/personalPageService'
import { AuditService } from '../../../services/auditService'
import ShoeSizeController from './shoeSize/shoeSizeController'
import HeightController from './height/heightController'
import WeightController from './weight/weightController'
import CityOrTownOfBirthController from './cityOrTownOfBirth/cityOrTownOfBirthController'

export default function personalEditControllerFactory(
  personalPageService: PersonalPageService,
  auditService: AuditService,
) {
  return {
    cityOrTownOfBirthController: new CityOrTownOfBirthController(personalPageService, auditService),
    heightController: new HeightController(personalPageService, auditService),
    shoeSizeController: new ShoeSizeController(personalPageService, auditService),
    weightController: new WeightController(personalPageService, auditService),
  }
}
