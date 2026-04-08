import PersonalPageService from '../../../services/personalPageService'
import { AuditService } from '../../../services/auditService'
import CityOrTownOfBirthController from './cityOrTownOfBirth/cityOrTownOfBirthController'
import CountryOfBirthController from './countryOfBirth/countryOfBirthController'
import DietAndFoodAllergiesController from './dietAndFoodAllergies/dietAndFoodAllergiesController'
import EyeColourController from './eyeColour/eyeColourController'
import HeightController from './height/heightController'
import NationalityController from './nationality/nationalityController'
import PhysicalCharacteristicsController from './physicalCharacteristics/physicalCharacteristicsController'
import ReligionController from './religion/religionController'
import SexualOrientationController from "./sexualOrientation/sexualOrientationController";
import ShoeSizeController from './shoeSize/shoeSizeController'
import SmokerOrVaperController from './smokerOrVaper/smokerOrVaperController'
import WeightController from './weight/weightController'

export default function personalEditControllerFactory(
  personalPageService: PersonalPageService,
  auditService: AuditService,
) {
  return {
    cityOrTownOfBirthController: new CityOrTownOfBirthController(personalPageService, auditService),
    countryOfBirthController: new CountryOfBirthController(personalPageService, auditService),
    dietAndFoodAllergiesController: new DietAndFoodAllergiesController(personalPageService, auditService),
    eyeColourController: new EyeColourController(personalPageService, auditService),
    heightController: new HeightController(personalPageService, auditService),
    nationalityController: new NationalityController(personalPageService, auditService),
    physicalCharacteristicsController: new PhysicalCharacteristicsController(personalPageService, auditService),
    religionController: new ReligionController(personalPageService, auditService),
    sexualOrientationController: new SexualOrientationController(personalPageService, auditService),
    shoeSizeController: new ShoeSizeController(personalPageService, auditService),
    smokerOrVaperController: new SmokerOrVaperController(personalPageService, auditService),
    weightController: new WeightController(personalPageService, auditService),
  }
}
