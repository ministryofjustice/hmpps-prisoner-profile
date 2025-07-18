import { mapSexualOrientationText } from './referenceDataMapping'

describe('mapSexualOrientationText', () => {
  it.each([
    [undefined, 'Not entered'],
    [null, 'Not entered'],
    ['', 'Not entered'],
    ['heterosexual / straight', 'Heterosexual or straight'],
    ['Heterosexual / Straight', 'Heterosexual or straight'],
    ['Gay / Lesbian', 'Gay or lesbian'],
    ['Not answered', 'They prefer not to say'],
    ['SOME OTHER VALUE', 'Some other value'],
  ])('maps data correctly: %s -> %s', (input, expected) => {
    const output = mapSexualOrientationText(input)
    expect(output).toEqual(expected)
  })
})
