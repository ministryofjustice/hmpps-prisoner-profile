import { prisonApiAdditionalCaseNoteTextLength, UpdateCaseNoteValidator } from './updateCaseNoteValidator'

describe('Validation middleware', () => {
  it('should pass validation with good data', async () => {
    const updateCaseNoteForm = {
      text: 'Test',
      currentLength: '0',
      isExternal: 'false',
      username: 'AB123456',
    }

    const result = UpdateCaseNoteValidator(updateCaseNoteForm)

    expect(result).toEqual([])
  })

  it('should fail validation with no text', async () => {
    const updateCaseNoteForm = {
      text: '',
      currentLength: '100',
      isExternal: 'false',
      username: 'AB123456',
    }

    const result = UpdateCaseNoteValidator(updateCaseNoteForm)

    expect(result).toEqual([{ text: 'Enter additional details', href: '#text' }])
  })

  it('should fail validation when additional text is too long', async () => {
    const currentLength = 3999 - prisonApiAdditionalCaseNoteTextLength - 'AB123456'.length
    const updateCaseNoteForm = {
      text: 'Test too long',
      currentLength: `${currentLength}`,
      isExternal: 'false',
      username: 'AB123456',
    }

    const result = UpdateCaseNoteValidator(updateCaseNoteForm)

    expect(result).toEqual([{ text: 'Enter additional details using 1 character or less', href: '#text' }])
  })
})
