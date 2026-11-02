import logger from '../../logger'
import config from '../config'
import type { RestClientBuilder } from '../data'
import type { ManageUsersApiClient, PrisonUser } from '../data/interfaces/manageUsersApi'
import type { DpsPersonRecord, PersonApiClient } from '../data/interfaces/personApi'
import type { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import type { BeliefHistoryItem } from './interfaces/beliefService/BeliefHistoryItem'

export default class BeliefService {
  constructor(
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly personApiClientBuilder: RestClientBuilder<PersonApiClient>,
    private readonly manageUsersApiClientBuilder: RestClientBuilder<ManageUsersApiClient>,
  ) {}

  /**
   * Handle request for belief history
   *
   * @param token
   * @param prisonerNumber
   */
  public getBeliefHistory(token: string, prisonerNumber: string): Promise<BeliefHistoryItem[]> {
    if (!config.featureToggles.usePersonApi.religion) {
      return this.getBeliefHistoryFromPrisonApi(token, prisonerNumber)
    }
    return this.getBeliefHistoryFromPersonApi(token, prisonerNumber)
  }

  private async getBeliefHistoryFromPrisonApi(token: string, prisonerNumber: string): Promise<BeliefHistoryItem[]> {
    const history = await this.prisonApiClientBuilder(token).getBeliefHistory(prisonerNumber)
    return history.map<BeliefHistoryItem>(item => ({
      current: !item.endDate,
      religionCode: item.beliefCode,
      religionDescription: item.beliefDescription,
      startDate: item.startDate,
      endDate: item.endDate,
      changeReasonKnown: item.changeReason,
      comments: item.comments,
      createUserFirstName: item.addedByFirstName,
      createUserLastName: item.addedByLastName,
      modifyUserFirstName: item.updatedByFirstName,
      modifyUserLastName: item.updatedByLastName,
      modifyDate: item.updatedDate,
    }))
  }

  private async getBeliefHistoryFromPersonApi(token: string, prisonerNumber: string): Promise<BeliefHistoryItem[]> {
    const personApiClient = this.personApiClientBuilder(token)
    const record = await personApiClient.getRecord(prisonerNumber, true)

    const mapUser = await this.makeUserMapper(token, record)

    return record.religionHistory.map<BeliefHistoryItem>(item => {
      const { firstName: createUserFirstName, lastName: createUserLastName } = mapUser(item.createUserId)
      const { firstName: modifyUserFirstName, lastName: modifyUserLastName } = mapUser(item.modifyUserId)
      return {
        current: item.current,
        religionCode: item.religionCode,
        religionDescription: item.religionDescription,
        startDate: item.startDate,
        endDate: item.endDate,
        changeReasonKnown: item.changeReasonKnown,
        comments: item.comments,
        createUserFirstName,
        createUserLastName,
        modifyUserFirstName,
        modifyUserLastName,
        modifyDate: item.modifyDateTime?.split('T')[0] ?? null,
      }
    })
  }

  private async makeUserMapper(
    token: string,
    record: DpsPersonRecord,
  ): Promise<(username: string) => { firstName: string; lastName: string }> {
    const manageUsersApiClient = this.manageUsersApiClientBuilder(token)

    const users = new Map<string, PrisonUser>()
    const unknownUsers = new Set<string>()
    await Promise.allSettled(
      record.religionHistory
        .reduce((usernames, { createUserId, modifyUserId }) => {
          if (createUserId) {
            usernames.add(createUserId)
          }
          if (modifyUserId) {
            usernames.add(modifyUserId)
          }
          return usernames
        }, new Set<string>())
        .values()
        .map(async username => {
          try {
            const user = await manageUsersApiClient.getPrisonUser(username)
            users.set(username, user)
          } catch (error) {
            unknownUsers.add(username)
            throw error
          }
        }),
    )

    if (unknownUsers.size) {
      logger.warn(`Unknown usernames in religion history: ${unknownUsers.values().toArray().sort().join(', ')}`)
    }

    return username => {
      const user = users.get(username)
      if (user) {
        return user
      }
      return { firstName: username, lastName: '' }
    }
  }
}
