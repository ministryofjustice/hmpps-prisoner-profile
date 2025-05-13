import { isSameYear, startOfYear } from 'date-fns'
import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import { HealthDomainReferenceCode, PersonalCareNeed } from '../data/interfaces/prisonApi/PersonalCareNeeds'
import ReferenceCode, { ReferenceCodeDomain } from '../data/interfaces/prisonApi/ReferenceCode'
import ReasonableAdjustment from '../data/interfaces/prisonApi/ReasonableAdjustment'

export interface CareNeed {
  type: string
  description: string
  comment: string
  startDate: string
  endDate?: string
  isOngoing: boolean
  reasonableAdjustments: CareNeedAdjustment[]
}

export interface CareNeedAdjustment {
  type: string
  description: string
  comment: string
  startDate: string
  endDate?: string
  agency: string
}

export interface XrayBodyScan {
  comment: string
  scanDate: string
}

export default class CareNeedsService {
  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  /**
   * Handle request for personal care needs
   *
   * @param token
   * @param bookingId
   */
  public async getCareNeedsAndAdjustments(token: string, bookingId: number): Promise<CareNeed[]> {
    const prisonApiClient = this.prisonApiClientBuilder(token)
    const [healthCodes] = await Promise.all([prisonApiClient.getReferenceCodesByDomain(ReferenceCodeDomain.Health)])
    const [{ personalCareNeeds }, { reasonableAdjustments }] = await Promise.all([
      prisonApiClient.getAllPersonalCareNeeds(bookingId),
      prisonApiClient.getAllReasonableAdjustments(bookingId),
    ])
    return this.toCareNeeds(healthCodes, personalCareNeeds, reasonableAdjustments)
  }

  /**
   * Handle request for x-ray body scans
   *
   * @param token
   * @param bookingId
   */
  public async getXrayBodyScans(token: string, bookingId: number): Promise<XrayBodyScan[]> {
    const prisonApiClient = this.prisonApiClientBuilder(token)

    const { personalCareNeeds } = await prisonApiClient.getPersonalCareNeeds(bookingId, [
      HealthDomainReferenceCode.XRayBodyScan,
    ])
    return this.toXrayBodyScan(personalCareNeeds)
  }

  /**
   * Handle request for x-ray body scan summary
   *
   * @param token
   * @param bookingId
   */
  public async getXrayBodyScanSummary(token: string, bookingId: number): Promise<{ total: number; since?: string }> {
    const prisonApiClient = this.prisonApiClientBuilder(token)

    const healthCodes = await prisonApiClient.getReferenceCodesByDomain(ReferenceCodeDomain.Health)

    const { personalCareNeeds } = await prisonApiClient.getPersonalCareNeeds(
      bookingId,
      healthCodes.map(({ code }) => code),
    )
    return this.toXrayBodyScanSummary(personalCareNeeds)
  }

  private toCareNeeds(
    healthReferenceCodes: ReferenceCode[],
    personalCareNeeds: PersonalCareNeed[],
    reasonableAdjustments: ReasonableAdjustment[],
  ): CareNeed[] {
    const careNeedType = (problemType: string) => {
      return healthReferenceCodes.find(({ code }) => code === problemType)?.description || problemType
    }

    const healthCodes = healthReferenceCodes.map(({ code }) => code)
    const problemStatusOngoing = 'ON'
    const excludedProblemCodes = ['NR']
    const excludedProblemTypes = [HealthDomainReferenceCode.XRayBodyScan.toString()]

    return personalCareNeeds
      ?.filter(
        careNeed =>
          healthCodes.includes(careNeed.problemType) &&
          !excludedProblemCodes.includes(careNeed.problemCode) &&
          !excludedProblemTypes.includes(careNeed.problemType),
      )
      .map(careNeed => ({
        comment: careNeed.commentText,
        startDate: careNeed.startDate,
        endDate: careNeed.endDate,
        isOngoing: careNeed.problemStatus === problemStatusOngoing,
        type: careNeedType(careNeed.problemType),
        description: careNeed.problemDescription,
        reasonableAdjustments: this.toCareNeedAdjustments(reasonableAdjustments, careNeed.personalCareNeedId),
      }))
  }

  private toCareNeedAdjustments(
    reasonableAdjustments: ReasonableAdjustment[],
    careNeedId?: number,
  ): CareNeedAdjustment[] {
    if (careNeedId) {
      return reasonableAdjustments
        ?.filter(adjustment => adjustment.personalCareNeedId === careNeedId)
        .map(adjustment => ({
          type: 'Support needed',
          description: adjustment.treatmentDescription,
          startDate: adjustment.startDate,
          endDate: adjustment.endDate,
          comment: adjustment.commentText,
          agency: adjustment.agencyDescription,
        }))
    }
    return []
  }

  private toXrayBodyScan(personalCareNeeds: PersonalCareNeed[]): XrayBodyScan[] {
    return personalCareNeeds
      ?.filter(need => need.problemType === HealthDomainReferenceCode.XRayBodyScan)
      .map(careNeed => ({
        comment: careNeed.commentText,
        scanDate: careNeed.startDate,
      }))
  }

  private toXrayBodyScanSummary(personalCareNeeds: PersonalCareNeed[]): { total: number; since?: string } {
    const yearStart = startOfYear(new Date())
    const xrayNeeds = personalCareNeeds
      ?.filter(need => need.problemType === HealthDomainReferenceCode.XRayBodyScan)
      .filter(need => isSameYear(new Date(need.startDate), yearStart))
    return {
      total: xrayNeeds.length,
      since: xrayNeeds.length > 0 ? yearStart.toISOString() : undefined,
    }
  }
}
