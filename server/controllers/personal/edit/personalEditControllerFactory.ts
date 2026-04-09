import PersonalPageService from '../../../services/personalPageService'
import { AuditService } from '../../../services/auditService'
import CityOrTownOfBirthController from './cityOrTownOfBirth/cityOrTownOfBirthController'
import HeightController from './height/heightController'
import ShoeSizeController from './shoeSize/shoeSizeController'
import SmokerOrVaperController from './smokerOrVaper/smokerOrVaperController'
import WeightController from './weight/weightController'

export default function personalEditControllerFactory(
  personalPageService: PersonalPageService,
  auditService: AuditService,
) {
  return {
    cityOrTownOfBirthController: new CityOrTownOfBirthController(personalPageService, auditService),
    heightController: new HeightController(personalPageService, auditService),
    shoeSizeController: new ShoeSizeController(personalPageService, auditService),
    smokerOrVaperController: new SmokerOrVaperController(personalPageService, auditService),
    weightController: new WeightController(personalPageService, auditService),
  }
}
