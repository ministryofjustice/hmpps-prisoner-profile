import PersonalPageService from '../../../services/personalPageService'
import { AuditService } from '../../../services/auditService'
import ShoeSizeController from './shoeSize/shoeSizeController'
import HeightController from './height/heightController'
import WeightController from './weight/weightController'

export default function personalEditControllerFactory(
  personalPageService: PersonalPageService,
  auditService: AuditService,
) {
  return {
    heightController: new HeightController(personalPageService, auditService),
    shoeSizeController: new ShoeSizeController(personalPageService, auditService),
    weightController: new WeightController(personalPageService, auditService),
  }
}
