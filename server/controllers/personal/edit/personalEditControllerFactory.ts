import PersonalPageService from '../../../services/personalPageService'
import { AuditService } from '../../../services/auditService'
import HeightController from './height/heightController'
import WeightController from './weight/weightController'
import CityOrTownOfBirthController from './cityOrTownOfBirth/cityOrTownOfBirthController'

export default function personalEditControllers(personalPageService: PersonalPageService, auditService: AuditService) {
  return {
    heightController: new HeightController(personalPageService, auditService),
    weightController: new WeightController(personalPageService, auditService),
    cityOrTownOfBirthController: new CityOrTownOfBirthController(personalPageService, auditService),
  }
}
