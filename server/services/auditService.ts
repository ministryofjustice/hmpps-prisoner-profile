import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs'
import logger from '../../logger'
import { HmppsUser } from '../interfaces/HmppsUser'
import { isInUsersCaseLoad } from '../utils/utils'

// The individual pages that contain user information
// eslint-disable-next-line no-shadow
export enum Page {
  ActiveAlerts = 'ACTIVE_ALERTS',
  AddAlert = 'ADD_ALERT',
  AddAppointment = 'ADD_APPOINTMENT',
  AddCaseNote = 'ADD_CASE_NOTE',
  AddDistinguishingMark = 'ADD_DISTINGUISHING_MARK',
  AddDistinguishingMarkPhoto = 'ADD_DISTINGUISHING_MARK_PHOTO',
  AddNewAlias = 'ADD_NEW_ALIAS',
  AddMilitaryServiceInformation = 'ADD_MILITARY_SERVICE_INFORMATION',
  Addresses = 'ADDRESSES',
  AddWithheld = 'ADD_WITHHELD_IMAGE',
  AlertAddMoreDetails = 'ALERT_ADD_MORE_DETAILS',
  AlertChangeEndDate = 'ALERT_CHANGE_END_DATE',
  AlertClose = 'ALERT_CLOSE',
  Alerts = 'ALERTS',
  AppointmentConfirmation = 'APPOINTMENT_CONFIRMATION',
  AppointmentMovementSlips = 'APPOINTMENT_MOVEMENT_SLIPS',
  CaseNotes = 'CASE_NOTES',
  CsraHistory = 'CSRA_HISTORY',
  CsraReview = 'CSRA_REVIEW',
  DistinguishingMarkAllPhotos = 'DISTINGUISHING_MARK_ALL_PHOTOS',
  EditAppointment = 'EDIT_APPOINTMENT',
  EditBuild = 'EDIT_BUILD',
  EditCityOrTownOfBirth = 'EDIT_CITY_OR_TOWN_OF_BIRTH',
  EditConflicts = 'EDIT_CONFLICTS',
  EditCountryOfBirth = 'EDIT_COUNTRY_OF_BIRTH',
  EditDietAndFoodAllergies = 'EDIT_DIET_AND_FOOD_ALLERGIES',
  EditDischargeDetails = 'EDIT_DISCHARGE_DETAILS',
  EditDisciplinaryAction = 'EDIT_DISCIPLINARY_ACTION',
  EditDistinguishingMark = 'EDIT_DISTINGUISHING_MARK',
  EditDistinguishingMarkPhoto = 'EDIT_DISTINGUISHING_MARK_PHOTO',
  EditEyeColour = 'EDIT_EYE_COLOUR',
  EditFaceShape = 'EDIT_FACE_SHAPE',
  EditFacialHair = 'EDIT_FACIAL_HAIR',
  EditHairTypeOrColour = 'EDIT_HAIR_TYPE_OR_COLOUR',
  EditHeight = 'EDIT_HEIGHT',
  EditMainLanguage = 'EDIT_MAIN_LANGUAGE',
  EditMilitaryServiceInformation = 'EDIT_MILITARY_SERVICE_INFORMATION',
  EditNameCorrection = 'EDIT_NAME_CORRECTION',
  EditNameLegal = 'EDIT_NAME_LEGAL',
  EditNamePurpose = 'EDIT_NAME_PURPOSE',
  EditNationality = 'EDIT_NATIONALITY',
  EditPrePostAppointments = 'EDIT_PRE_POST_APPOINTMENTS',
  EditReligion = 'EDIT_RELIGION',
  EditSexualOrientation = 'EDIT_SEXUAL_ORIENTATION',
  EditShoeSize = 'EDIT_SHOE_SIZE',
  EditSmokerOrVaper = 'EDIT_SMOKER_OR_VAPER',
  EditWeight = 'EDIT_WEIGHT',
  EditProfileImage = 'EDIT_PROFILE_IMAGE',
  EditUploadedProfileImage = 'EDIT_UPLOADED_PROFILE_IMAGE',
  EditProfileImageWithheld = 'EDIT_PROFILE_IMAGE_WITHHELD',
  InactiveAlerts = 'INACTIVE_ALERTS',
  MoneyDamageObligations = 'MONEY_DAMAGE_OBLIGATIONS',
  MoneyPrivateCash = 'MONEY_PRIVATE_CASH',
  MoneySavings = 'MONEY_SAVINGS',
  MoneySpends = 'MONEY_SPENDS',
  Offences = 'OFFENCES',
  Overview = 'OVERVIEW',
  PastCareNeeds = 'PAST_CARE_NEEDS',
  Personal = 'PERSONAL',
  Photo = 'PHOTO',
  PhotoList = 'PHOTO_LIST',
  PostAddAlert = 'POST_ADD_ALERT',
  PostAddAppointment = 'POST_ADD_APPOINTMENT',
  PostAddCaseNote = 'POST_ADD_CASE_NOTE',
  PostAlertAddMoreDetails = 'POST_ALERT_ADD_MORE_DETAILS',
  PostAlertClose = 'POST_ALERT_CLOSE',
  PostEditAppointment = 'POST_EDIT_APPOINTMENT',
  PostEditBuild = 'POST_EDIT_BUILD',
  PostEditCityOrTownOfBirth = 'POST_EDIT_CITY_OR_TOWN_OF_BIRTH',
  PostEditCountryOfBirth = 'POST_EDIT_COUNTRY_OF_BIRTH',
  PostEditDietAndFoodAllergies = 'POST_EDIT_DIET_AND_FOOD_ALLERGIES',
  PostEditEyeColour = 'POST_EDIT_EYE_COLOUR',
  PostEditFaceShape = 'POST_EDIT_FACE_SHAPE',
  PostEditFacialHair = 'POST_EDIT_FACIAL_HAIR',
  PostEditHairTypeOrColour = 'POST_EDIT_HAIR_TYPE_OR_COLOUR',
  PostEditHeight = 'POST_EDIT_HEIGHT',
  PostEditNationality = 'POST_EDIT_NATIONALITY',
  PostEditPrePostAppointments = 'POST_EDIT_PRE_POST_APPOINTMENTS',
  PostEditReligion = 'POST_EDIT_RELIGION',
  PostEditSexualOrientation = 'POST_EDIT_SEXUAL_ORIENTATION',
  PostEditShoeSize = 'POST_EDIT_SHOE_SIZE',
  PostEditSmokerOrVaper = 'POST_EDIT_SMOKER_OR_VAPER',
  PostEditWeight = 'POST_EDIT_WEIGHT',
  PostEditProfileImageWithheld = 'POST_EDIT_PROFILE_IMAGE_WITHHELD',
  PostPrePostAppointments = 'POST_PRE_POST_APPOINTMENTS',
  PostUpdateCaseNote = 'POST_UPDATE_CASE_NOTE',
  PrePostAppointmentConfirmation = 'PRE_POST_APPOINTMENT_CONFIRMATION',
  PrePostAppointments = 'PRE_POST_APPOINTMENTS',
  PrisonerCellHistory = 'PRISONER_CELL_HISTORY',
  ProbationDocuments = 'PROBATION_DOCUMENTS',
  ReligionBeliefHistory = 'RELIGION_BELIEF_HISTORY',
  Schedule = 'SCHEDULE',
  UpdateCaseNote = 'UPDATE_CASE_NOTE',
  VirtualCampusGoals = 'VC2_GOALS',
  VisitDetails = 'VISIT_DETAILS',
  WorkAndSkills = 'WORK_AND_SKILLS',
  XRayBodyScans = 'XRAY_BODY_SCANS',
}

// eslint-disable-next-line no-shadow
export enum ApiAction {
  AddressLookup = 'ADDRESS_LOOKUP',
  Image = 'IMAGE',
  LocationEvents = 'LOCATION_EVENTS',
  OffenderEvents = 'OFFENDER_EVENTS',
  PrisonerImage = 'PRISONER_IMAGE',
}

// eslint-disable-next-line no-shadow
export enum PostAction {
  AddDistinguishingMark = 'ADD_DISTINGUISHING_MARK',
  AddDistinguishingMarkPhoto = 'ADD_DISTINGUISHING_MARK_PHOTO',
  AddMilitaryServiceInformation = 'ADD_MILITARY_SERVICE_INFORMATION',
  AddNewAlias = 'ADD_NEW_ALIAS',
  Alert = 'ADD_ALERT',
  AlertAddMoreDetails = 'ALERT_ADD_MORE_DETAILS',
  AlertChangeEndDate = 'ALERT_CHANGE_END_DATE',
  AlertClose = 'ALERT_CLOSE',
  Appointment = 'ADD_APPOINTMENT',
  CaseNote = 'ADD_CASE_NOTE',
  EditBuild = 'EDIT_BUILD',
  EditCityOrTownOfBirth = 'EDIT_CITY_OR_TOWN_OF_BIRTH',
  EditConflicts = 'EDIT_CONFLICTS',
  EditCountryOfBirth = 'EDIT_COUNTRY_OF_BIRTH',
  EditDietAndFoodAllergies = 'EDIT_DIET_AND_FOOD_ALLERGIES',
  EditDischargeDetails = 'EDIT_DISCHARGE_DETAILS',
  EditDisciplinaryAction = 'EDIT_DISCIPLINARY_ACTION',
  EditDistinguishingMark = 'EDIT_DISTINGUISHING_MARK',
  EditDistinguishingMarkPhoto = 'EDIT_DISTINGUISHING_MARK_PHOTO',
  EditEyeColour = 'EDIT_EYE_COLOUR',
  EditFaceShape = 'EDIT_FACE_SHAPE',
  EditFacialHair = 'EDIT_FACIAL_HAIR',
  EditHairTypeOrColour = 'EDIT_HAIR_TYPE_OR_COLOUR',
  EditHeight = 'EDIT_HEIGHT',
  EditMainLanguage = 'EDIT_MAIN_LANGUAGE',
  EditMilitaryServiceInformation = 'EDIT_MILITARY_SERVICE_INFORMATION',
  EditNameCorrection = 'EDIT_NAME_CORRECTION',
  EditNameLegal = 'EDIT_NAME_LEGAL',
  EditNamePurpose = 'EDIT_NAME_PURPOSE',
  EditNationality = 'EDIT_NATIONALITY',
  EditProfileImage = 'EDIT_PROFILE_IMAGE',
  EditProfileImageWithheld = 'EDIT_PROFILE_IMAGE_WITHHELD',
  EditReligion = 'EDIT_RELIGION',
  EditSexualOrientation = 'EDIT_SEXUAL_ORIENTATION',
  EditShoeSize = 'EDIT_SHOE_SIZE',
  EditSmokerOrVaper = 'EDIT_SMOKER_OR_VAPER',
  EditWeight = 'EDIT_WEIGHT',
}

// eslint-disable-next-line no-shadow
export enum PutAction {
  CaseNote = 'UPDATE_CASE_NOTE',
}

// eslint-disable-next-line no-shadow
export enum SearchAction {
  Alerts = 'ALERTS',
  CaseNotes = 'CASE_NOTES',
}

// eslint-disable-next-line no-shadow
export enum SubjectType {
  PrisonerId = 'PRISONER_ID',
  SearchTerm = 'SEARCH_TERM',
}

export interface AccessAttemptAudit {
  user: HmppsUser
  prisonerNumber: string
  page: Page | ApiAction
  correlationId: string
}

export interface PageViewAudit {
  user: HmppsUser
  prisonerNumber: string
  prisonId: string
  page: Page
  correlationId: string
}

interface AddAppointmentAudit {
  user: HmppsUser
  prisonerNumber: string
  correlationId: string
  details: object
}

interface SearchAudit {
  user: HmppsUser
  prisonerNumber: string
  prisonId: string
  correlationId: string
  searchPage: SearchAction
  details: object
}

interface PostAudit {
  user: HmppsUser
  prisonerNumber: string
  correlationId: string
  action: PostAction
  details: object
}

interface PutAudit {
  user: HmppsUser
  prisonerNumber: string
  correlationId: string
  action: PutAction
  details: object
}

interface SendEvent {
  what: string
  who: string
  subjectId: string
  subjectType?: SubjectType
  correlationId: string
  details?: string
}

export interface AuditService {
  sendAccessAttempt: (object: AccessAttemptAudit) => Promise<void>
  sendPageView: (object: PageViewAudit) => Promise<void>
  sendAddAppointment: (object: AddAppointmentAudit) => Promise<void>
  sendSearch: (object: SearchAudit) => Promise<void>
  sendPostAttempt: (object: PostAudit) => Promise<void>
  sendPostSuccess: (object: PostAudit) => Promise<void>
  sendPutAttempt: (object: PutAudit) => Promise<void>
  sendPutSuccess: (object: PutAudit) => Promise<void>
  sendEvent: (object: SendEvent) => Promise<void>
}

interface AuditMessage {
  what: string
  when: Date
  who: string
  subjectId: string
  subjectType?: SubjectType
  service: string
  correlationId: string
  details?: string
}

/*
  build: the commit hash
*/
export const auditService = ({
  sqsClient,
  queueUrl,
  build,
  serviceName,
  enabled,
}: {
  sqsClient: SQSClient
  queueUrl: string
  build: string
  serviceName: string
  enabled: boolean
}): AuditService => {
  const sendMessage = async (message: AuditMessage) => {
    if (enabled) {
      try {
        const messageResponse = await sqsClient.send(
          new SendMessageCommand({ MessageBody: JSON.stringify(message), QueueUrl: queueUrl }),
        )
        logger.info(`Page view sent to audit (${messageResponse.MessageId})`)
      } catch (error) {
        logger.error('Problem sending page view to audit', error)
      }
    }
  }

  const sendAccessAttempt = async ({ user, prisonerNumber, page, correlationId }: AccessAttemptAudit) => {
    await sendMessage({
      what: `ACCESS_ATTEMPT_${page.toString()}`,
      when: new Date(),
      who: user.username,
      subjectId: prisonerNumber,
      subjectType: SubjectType.PrisonerId,
      service: serviceName,
      correlationId,
      details: JSON.stringify({ build, userRoles: user.userRoles }),
    })
  }

  const sendPostAttempt = async ({ user, prisonerNumber, action, correlationId, details }: PostAudit) => {
    await sendMessage({
      what: `POST_${action.toString()}`,
      when: new Date(),
      who: user.username,
      subjectId: prisonerNumber,
      subjectType: SubjectType.PrisonerId,
      service: serviceName,
      correlationId,
      details: JSON.stringify({ build, ...details }),
    })
  }

  const sendPostSuccess = async ({ user, prisonerNumber, action, correlationId, details }: PostAudit) => {
    await sendMessage({
      what: `POST_SUCCESS_${action.toString()}`,
      when: new Date(),
      who: user.username,
      subjectId: prisonerNumber,
      subjectType: SubjectType.PrisonerId,
      service: serviceName,
      correlationId,
      details: JSON.stringify({ build, ...details }),
    })
  }

  const sendPutAttempt = async ({ user, prisonerNumber, action, correlationId, details }: PutAudit) => {
    await sendMessage({
      what: `PUT_${action.toString()}`,
      when: new Date(),
      who: user.username,
      subjectId: prisonerNumber,
      subjectType: SubjectType.PrisonerId,
      service: serviceName,
      correlationId,
      details: JSON.stringify({ build, ...details }),
    })
  }

  const sendPutSuccess = async ({ user, prisonerNumber, action, correlationId, details }: PutAudit) => {
    await sendMessage({
      what: `PUT_SUCCESS_${action.toString()}`,
      when: new Date(),
      who: user.username,
      subjectId: prisonerNumber,
      subjectType: SubjectType.PrisonerId,
      service: serviceName,
      correlationId,
      details: JSON.stringify({ build, ...details }),
    })
  }

  const sendPageView = async ({ user, prisonerNumber, prisonId, page, correlationId }: PageViewAudit) => {
    const details = {
      globalView: !isInUsersCaseLoad(prisonId, user),
      releasedPrisonerView: ['OUT', 'TRN'].includes(prisonId),
      userRoles: user.userRoles,
      build,
    }

    await sendMessage({
      what: `PAGE_VIEW_${page.toString()}`,
      when: new Date(),
      who: user.username,
      subjectId: prisonerNumber,
      subjectType: SubjectType.PrisonerId,
      service: serviceName,
      correlationId,
      details: JSON.stringify(details),
    })
  }

  const sendAddAppointment = async ({ user, prisonerNumber, details, correlationId }: AddAppointmentAudit) => {
    await sendMessage({
      what: 'ADD_APPOINTMENT',
      correlationId,
      details: JSON.stringify({ ...details, build }),
      service: serviceName,
      subjectId: prisonerNumber,
      subjectType: SubjectType.PrisonerId,
      when: new Date(),
      who: user.username,
    })
  }

  const sendSearch = async ({ user, prisonerNumber, searchPage, details, correlationId }: SearchAudit) => {
    await sendMessage({
      what: `SEARCH_${searchPage}`,
      correlationId,
      details: JSON.stringify({ ...details, build }),
      service: serviceName,
      subjectId: prisonerNumber,
      subjectType: SubjectType.SearchTerm,
      when: new Date(),
      who: user.username,
    })
  }

  const sendEvent = async (event: SendEvent) => {
    await sendMessage({
      service: serviceName,
      when: new Date(),
      ...event,
    })
  }

  return {
    sendAccessAttempt,
    sendPageView,
    sendAddAppointment,
    sendSearch,
    sendPostAttempt,
    sendPostSuccess,
    sendPutAttempt,
    sendPutSuccess,
    sendEvent,
  }
}
