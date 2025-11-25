/* eslint-disable no-param-reassign */
import path from 'path'
import nunjucks from 'nunjucks'
import express from 'express'
import { setupNunjucksPermissions } from '@ministryofjustice/hmpps-prison-permissions-lib'
import fs from 'fs'
import {
  addDefaultSelectedValue,
  addressToLines,
  addressToSummaryItems,
  apiErrorMessage,
  apostrophe,
  arrayIncludes,
  contactAddressToHtml,
  findError,
  formatMoney,
  formatName,
  formatPhoneNumber,
  formatScheduleItem,
  initialiseName,
  isInUsersCaseLoad,
  latestImageId,
  lengthOfService,
  neurodiversityEnabled,
  prependBaseUrl,
  prependHmppsAuthBaseUrl,
  prisonerIsOut,
  prisonerIsTRN,
  sentenceCase,
  sortByLatestAndUuid,
  summaryListOneHalfWidth,
  toFullCourtLink,
  toNonAssociationRows,
  unavailableApiErrorMessage,
  unavailablePlaceholder,
  userHasRoles,
} from './utils'
import { pluralise } from './pluralise'
import {
  formatAddressDate,
  formatDate,
  formatDateTime,
  formatDateToPattern,
  formatDateWithAge,
  timeFormat,
} from './dateHelpers'
import config from '../config'
import releaseDatesToSummaryRows from '../views/dataUtils/releaseDatesToSummaryRows'
import mapCsraReviewToSummaryList from '../mappers/csraReviewToSummaryListMapper'
import mapCsraQuestionsToSummaryList from '../mappers/csraQuestionsToSummaryListMapper'
import visitsWithVisitorsToListMapper from '../mappers/visitsWithVisitorsToListMapper'
import moneySummaryToMiniSummary from '../views/dataUtils/moneySummaryToMiniSummary'
import adjudicationsSummaryToMiniSummary from '../views/dataUtils/adjudicationsSummaryToMiniSummary'
import visitsSummaryToMiniSummary from '../views/dataUtils/visitsSummaryToMiniSummary'
import csraSummaryToMiniSummary from '../views/dataUtils/csraSummaryToMiniSummary'
import categorySummaryToMiniSummary from '../views/dataUtils/categorySummaryToMiniSummary'
import incentiveSummaryToMiniSummary from '../views/dataUtils/incentiveSummaryToMiniSummary'
import summaryListRowWithOptionalChangeLink, {
  listToSummaryListRows,
} from '../views/dataUtils/summaryListRowWithOptionalChangeLink'
import groupDistinguishingMarks, {
  getBodyPartDescription,
  getBodyPartToken,
  getMarkLocationDescription,
} from '../views/dataUtils/groupDistinguishingMarksForView'
import distinguishingMarkBodyPartsToDisplay from '../views/dataUtils/distinguishingMarkBodyPartsToDisplay'
import getDistinguishingFeatureDetailsFormData from '../views/dataUtils/getDistinguishingMarkDetailsFormConfig'
import currentCsipDetailToMiniCardContent from '../views/dataUtils/currentCsipDetailToMiniCardContent'
import {
  appInsightsWebAnalyticsEnabled,
  externalContactsEnabled,
  militaryHistoryEnabled,
  useCurious2Api,
} from './featureToggles'
import nonAssociationSummaryToMiniSummary from '../views/dataUtils/nonAssociationSummaryToMiniSummary'
import appendRefererToUrl from './appendRefererToUrl'
import { mapSexualOrientationText } from './referenceDataMapping'
import logger from '../../logger'
import { ApplicationInfo } from '../applicationInfo'

export default function nunjucksSetup(app: express.Express, applicationInfo: ApplicationInfo): void {
  app.set('view engine', 'njk')

  app.locals.asset_path = '/assets/'
  app.locals.applicationName = 'DPS'
  app.locals.config = config
  app.locals.appInsightsConnectionString = config.appInsightsConnectionString
  app.locals.appInsightsApplicationName = applicationInfo.applicationName
  app.locals.buildNumber = config.buildNumber

  let assetManifest: Record<string, string> = {}

  try {
    const assetMetadataPath = path.resolve(__dirname, '../../assets/manifest.json')
    assetManifest = JSON.parse(fs.readFileSync(assetMetadataPath, 'utf8'))
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_e) {
    if (process.env.NODE_ENV !== 'test') {
      logger.error('Could not read asset manifest file')
    }
  }

  const njkEnv = nunjucks.configure(
    [
      path.join(__dirname, '../../server/views'),
      'node_modules/govuk-frontend/dist/',
      'node_modules/govuk-frontend/dist/components/',
      'node_modules/@ministryofjustice/frontend/',
      'node_modules/@ministryofjustice/frontend/moj/components/',
      'node_modules/@ministryofjustice/hmpps-connect-dps-components/dist/assets/',
      'node_modules/@ministryofjustice/hmpps-connect-dps-shared-items/dist/assets/',
    ],
    {
      autoescape: true,
      express: app,
    },
  )

  // Expose the google tag manager container ID to the nunjucks environment
  const {
    analytics: { tagManagerContainerId },
  } = config

  // Enable permissions checking in templates:
  setupNunjucksPermissions(njkEnv)

  njkEnv.addGlobal('tagManagerContainerId', tagManagerContainerId.trim())
  njkEnv.addGlobal('isInUsersCaseLoad', isInUsersCaseLoad)
  njkEnv.addGlobal('userHasRoles', userHasRoles)
  njkEnv.addGlobal('prisonerIsTRN', prisonerIsTRN)
  njkEnv.addGlobal('prisonerIsOut', prisonerIsOut)
  njkEnv.addGlobal('neurodiversityEnabled', neurodiversityEnabled)
  njkEnv.addGlobal('standardApiErrorText', apiErrorMessage)
  njkEnv.addGlobal('unavailableApiErrorText', unavailableApiErrorMessage)
  njkEnv.addGlobal('unavailablePlaceholderText', unavailablePlaceholder)
  njkEnv.addGlobal('placeholderPrisonerImageUrl', '/assets/images/prisoner-profile-image.png')
  njkEnv.addGlobal('toSummaryListRows', listToSummaryListRows)
  njkEnv.addGlobal('militaryHistoryEnabled', militaryHistoryEnabled)
  njkEnv.addGlobal('externalContactsEnabled', externalContactsEnabled)
  njkEnv.addGlobal('appInsightsWebAnalyticsEnabled', appInsightsWebAnalyticsEnabled)
  njkEnv.addGlobal('useCurious2Api', useCurious2Api)
  njkEnv.addGlobal('currentTimeMillis', () => Date.now().toString())

  njkEnv.addFilter('assetMap', (url: string) => assetManifest[url] || url)
  njkEnv.addFilter('initialiseName', initialiseName)
  njkEnv.addFilter('formatMoney', formatMoney)
  njkEnv.addFilter('formatDate', formatDate)
  njkEnv.addFilter('formatDateTime', formatDateTime)
  njkEnv.addFilter('formatScheduleItem', formatScheduleItem)
  njkEnv.addFilter('summaryListOneHalfWidth', summaryListOneHalfWidth)
  njkEnv.addFilter('pluralise', pluralise)

  njkEnv.addFilter('filterNot', <T>(l: T[], iteratee: keyof T, eq: T[keyof T]) => l.filter(o => o[iteratee] !== eq))
  njkEnv.addFilter('addressToLines', addressToLines)
  njkEnv.addFilter('contactAddressToHtml', contactAddressToHtml)
  njkEnv.addFilter('find', <T>(l: T[], iteratee: keyof T, eq: T[keyof T]) => l.find(o => o[iteratee] === eq))
  njkEnv.addFilter('findError', findError)
  njkEnv.addFilter('addDefaultSelectedValue', addDefaultSelectedValue)
  njkEnv.addFilter('containsSelected', (items: { selected: boolean }[]) => items && items.some(item => item.selected))
  njkEnv.addFilter('removeNullish', (arr: unknown[]) => arr.filter(o => o !== undefined && o !== null))

  njkEnv.addFilter(
    'setSelected',
    (items: { value: string; text: string }[], selected) =>
      items &&
      items.map(entry => ({
        ...entry,
        selected: entry && String(entry.value) === String(selected),
      })),
  )

  njkEnv.addFilter(
    'setChecked',
    (items: { value: string; text: string }[], checked: string[]) =>
      items &&
      items.map(entry => ({
        ...entry,
        checked: entry && checked.includes(String(entry.value)),
      })),
  )

  njkEnv.addFilter('apostrophe', apostrophe)
  njkEnv.addFilter('prependBaseUrl', prependBaseUrl)
  njkEnv.addFilter('prependHmppsAuthBaseUrl', prependHmppsAuthBaseUrl)
  njkEnv.addFilter('toNonAssociationTableRows', toNonAssociationRows)
  njkEnv.addFilter('timeFormat', timeFormat)
  njkEnv.addFilter('toTextValue', (array: string[], selected: string) => {
    if (!array) return null

    const items = array.map(entry => ({
      text: entry,
      value: entry,
      selected: entry && entry === selected,
    }))

    return [
      {
        text: '--',
        value: '',
        selected: true,
        attributes: {
          hidden: 'hidden',
        },
      },
      ...items,
    ]
  })
  njkEnv.addFilter('releaseDatesToSummaryRows', releaseDatesToSummaryRows)
  njkEnv.addFilter('formatName', formatName)
  njkEnv.addFilter('toCsraAssessmentSummaryList', mapCsraReviewToSummaryList)
  njkEnv.addFilter('toCsraQuestionsSummaryList', mapCsraQuestionsToSummaryList)
  njkEnv.addFilter('toVisitsWithVisitorsList', visitsWithVisitorsToListMapper)
  njkEnv.addFilter('formatAddressDate', formatAddressDate)
  njkEnv.addFilter('addressToSummaryItems', addressToSummaryItems)
  njkEnv.addFilter('toMoneySummaryDisplay', moneySummaryToMiniSummary)
  njkEnv.addFilter('toAdjudicationsSummaryDisplay', adjudicationsSummaryToMiniSummary)
  njkEnv.addFilter('toNonAssociationSummaryDisplay', nonAssociationSummaryToMiniSummary)
  njkEnv.addFilter('toVisitsSummaryDisplay', visitsSummaryToMiniSummary)
  njkEnv.addFilter('toCsraSummaryDisplay', csraSummaryToMiniSummary)
  njkEnv.addFilter('toCsipMiniCardContent', currentCsipDetailToMiniCardContent)
  njkEnv.addFilter('toCategorySummaryDisplay', categorySummaryToMiniSummary)
  njkEnv.addFilter('toIncentiveSummaryDisplay', incentiveSummaryToMiniSummary)
  njkEnv.addFilter('summaryListRowWithOptionalChangeLink', summaryListRowWithOptionalChangeLink)
  njkEnv.addFilter('groupDistinguishingMarks', groupDistinguishingMarks)
  njkEnv.addFilter('toBodyPartDisplayText', distinguishingMarkBodyPartsToDisplay)
  njkEnv.addFilter('toBodyPartSpecificFormData', getDistinguishingFeatureDetailsFormData)
  njkEnv.addFilter('toMarkLocationDescription', getMarkLocationDescription)
  njkEnv.addFilter('toBodyPartDescription', getBodyPartDescription)
  njkEnv.addFilter('toBodyPartToken', getBodyPartToken)
  njkEnv.addFilter('sortByLatestAndUuid', sortByLatestAndUuid)
  njkEnv.addFilter('latestImageId', latestImageId)
  njkEnv.addFilter('lengthOfService', lengthOfService)
  njkEnv.addFilter('formatDateToPattern', formatDateToPattern)
  njkEnv.addFilter('formatDateWithAge', formatDateWithAge)
  njkEnv.addFilter('formatPhoneNumber', formatPhoneNumber)
  njkEnv.addFilter('includes', arrayIncludes)
  njkEnv.addFilter('appendRefererToUrl', appendRefererToUrl)
  njkEnv.addFilter('sexualOrientationText', mapSexualOrientationText)
  njkEnv.addFilter('sentenceCase', sentenceCase)

  // BVLS specific filter
  njkEnv.addFilter('toFullCourtLink', toFullCourtLink)
}
