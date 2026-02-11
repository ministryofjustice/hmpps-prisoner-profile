import config from '../../config'
import { PersonalRelationshipsContact } from '../../data/interfaces/personalRelationshipsApi/personalRelationshipsApiClient'
import generateContactChangeLink from './generateContactChangeLink'

describe('generateContactChangeLink', () => {
  it('should generate the correct contact change link', () => {
    const prisonerNumber = 'A1234BC'

    const contact: Partial<PersonalRelationshipsContact> = {
      contactId: 321,
      prisonerContactId: 123,
    }

    const result = generateContactChangeLink(prisonerNumber, contact as PersonalRelationshipsContact)

    const expectedReturnPath = `/prisoner/${prisonerNumber}/personal#next-of-kin`
    const expectedRedirectPath = `/prisoner/${prisonerNumber}/contacts/manage/${contact.contactId}/relationship/${contact.prisonerContactId}`

    const expected =
      `${config.serviceUrls.contacts}/save-backlink?` +
      `service=prisoner-profile&` +
      `returnPath=${expectedReturnPath}&` +
      `redirectPath=${expectedRedirectPath}`

    expect(result).toEqual(expected)
  })
})
