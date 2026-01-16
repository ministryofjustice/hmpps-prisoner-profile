import PersonalPageService from '../../../services/personalPageService'
import { AuditService } from '../../../services/auditService'
import HeightController from './height/heightController'
import WeightController from './weight/weightController'
import CityOrTownOfBirthController from './cityOrTownOfBirth/cityOrTownOfBirthController'
import ShoeSizeController from './shoeSize/shoeSizeController'
import SmokerOrVaperController from './smokerOrVaper/smokerOrVaperController'
import NationalityController from './nationality/nationalityController'
import PhysicalCharacteristicsController from './physicalCharacteristics/physicalCharacteristicsController'
import EyeColourController from './eyeColour/eyeColourController'
import DietAndFoodAllergiesController from './dietAndFoodAllergies/dietAndFoodAllergiesController'
import CountryOfBirthController from './countryOfBirth/countryOfBirthController'

export default function personalEditControllerFactory(
  personalPageService: PersonalPageService,
  auditService: AuditService,
) {
  return {
    heightController: new HeightController(personalPageService, auditService),
    weightController: new WeightController(personalPageService, auditService),
    cityOrTownOfBirthController: new CityOrTownOfBirthController(personalPageService, auditService),
    shoeSizeController: new ShoeSizeController(personalPageService, auditService),
    smokerOrVaperController: new SmokerOrVaperController(personalPageService, auditService),
    nationalityController: new NationalityController(personalPageService, auditService),
    physicalCharacteristicsController: new PhysicalCharacteristicsController(personalPageService, auditService),
    eyeColourController: new EyeColourController(personalPageService, auditService),
    dietAndFoodAllergiesController: new DietAndFoodAllergiesController(personalPageService, auditService),
    countryOfBirthController: new CountryOfBirthController(personalPageService, auditService),
  }
}
