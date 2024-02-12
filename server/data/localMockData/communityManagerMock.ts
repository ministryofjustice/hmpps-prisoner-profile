import { CommunityManager } from '../../interfaces/prisonerProfileDeliusApi/communityManager'

export const communityManagerMock: CommunityManager = {
  code: 'ABC',
  name: { forename: 'Terry', surname: 'Scott' },
  team: { code: 'XYZ', description: 'Probation Team', email: 'team@email.com', telephone: '07711111111' },
  email: 'terry@email.com',
  telephone: '07700000000',
  unallocated: false,
}
