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
import ReligionController from './religion/religionController'
import SexualOrientationController from './sexualOrientation/sexualOrientationController'
import NumberOfChildrenController from './numberOfChildren/numberOfChildrenController'
import DomesticStatusController from './domesticStatus/domesticStatusController'
import PhoneNumberController from './phoneNumbers/phoneNumberController'
import EmailAddressController from './emailAddress/emailAddressController'

export default function personalEditControllerFactory(
  personalPageService: PersonalPageService,
  auditService: AuditService,
) {
  return {
    cityOrTownOfBirthController: new CityOrTownOfBirthController(personalPageService, auditService),
    countryOfBirthController: new CountryOfBirthController(personalPageService, auditService),
    dietAndFoodAllergiesController: new DietAndFoodAllergiesController(personalPageService, auditService),
    domesticStatusController: new DomesticStatusController(personalPageService, auditService),
    emailAddressController: new EmailAddressController(personalPageService, auditService),
    eyeColourController: new EyeColourController(personalPageService, auditService),
    heightController: new HeightController(personalPageService, auditService),
    nationalityController: new NationalityController(personalPageService, auditService),
    numberOfChildrenController: new NumberOfChildrenController(personalPageService, auditService),
    phoneNumberController: new PhoneNumberController(personalPageService, auditService),
    physicalCharacteristicsController: new PhysicalCharacteristicsController(personalPageService, auditService),
    religionController: new ReligionController(personalPageService, auditService),
    sexualOrientationController: new SexualOrientationController(personalPageService, auditService),
    shoeSizeController: new ShoeSizeController(personalPageService, auditService),
    smokerOrVaperController: new SmokerOrVaperController(personalPageService, auditService),
    weightController: new WeightController(personalPageService, auditService),
  }
}
