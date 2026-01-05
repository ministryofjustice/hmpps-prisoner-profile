import type { HasNeed } from '../interfaces/supportForAdditionalNeedsApi/SupportForAdditionalNeeds'

export const prisonerHasNeedsMock: HasNeed = {
  hasNeed: true,
  url: 'http://localhost:9091/supportForAdditionalNeedsUI/profile/G6123VU/overview',
  modalUrl: 'http://localhost:9091/supportForAdditionalNeedsUI/profile/G6123VU/overview/modal',
}

export const prisonerWithoutAdditionalNeedsMock: HasNeed = {
  hasNeed: false,
  url: 'http://localhost:9091/supportForAdditionalNeedsUI/profile/G6123VU/overview',
  modalUrl: 'http://localhost:9091/supportForAdditionalNeedsUI/profile/G6123VU/overview/modal',
}
