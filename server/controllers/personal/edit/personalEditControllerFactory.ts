import PersonalPageService from '../../../services/personalPageService'
import { AuditService } from '../../../services/auditService'
import HeightController from './height/heightController'
import WeightController from './weight/weightController'
import CityOrTownOfBirthController from './cityOrTownOfBirth/cityOrTownOfBirthController'
import ShoeSizeController from './shoeSize/shoeSizeController'

export default function personalEditControllerFactory(
  personalPageService: PersonalPageService,
  auditService: AuditService,
) {
  return {
    heightController: new HeightController(personalPageService, auditService),
    weightController: new WeightController(personalPageService, auditService),
    cityOrTownOfBirthController: new CityOrTownOfBirthController(personalPageService, auditService),
    shoeSizeController: new ShoeSizeController(personalPageService, auditService),
  }
}
