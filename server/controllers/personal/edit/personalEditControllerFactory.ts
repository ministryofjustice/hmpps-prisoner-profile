import PersonalPageService from '../../../services/personalPageService'
import { AuditService } from '../../../services/auditService'
import ShoeSizeController from './shoeSize/shoeSizeController'

export default function personalEditControllerFactory(
  personalPageService: PersonalPageService,
  auditService: AuditService,
) {
  return {
    shoeSizeController: new ShoeSizeController(personalPageService, auditService),
  }
}
