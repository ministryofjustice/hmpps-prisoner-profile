import ninoFormatValidator from './ninoFormatValidator'

describe('ninoFormatValidator', () => {
  const href = '#nationalInsurance-value-input'

  it('should return no errors for a valid NINO (after sanitisation)', () => {
    expect(ninoFormatValidator(' aA123456a ', href)).toEqual([])
  })

  it('should return error for invalid format', () => {
    expect(ninoFormatValidator('INVALID', href)).toEqual([
      {
        text: 'Enter a valid National Insurance number in the correct format',
        href,
      },
    ])
  })

  it('should return error for NINO with invalid prefix (DFIQUV in any position)', () => {
    expect(ninoFormatValidator('DA123456A', href)).toEqual([
      {
        text: 'Enter a valid National Insurance number in the correct format',
        href,
      },
    ])
  })

  it('should return error for NINO with invalid prefix (O in second position)', () => {
    expect(ninoFormatValidator('AO123456A', href)).toEqual([
      {
        text: 'Enter a valid National Insurance number in the correct format',
        href,
      },
    ])
  })

  it('should return error for invalid prefix combination', () => {
    expect(ninoFormatValidator('BG123456A', href)).toEqual([
      {
        text: 'Enter a valid National Insurance number in the correct format',
        href,
      },
    ])
  })

  it('should return error for invalid suffix (!A-D)', () => {
    expect(ninoFormatValidator('AA123456E', href)).toEqual([
      {
        text: 'Enter a valid National Insurance number in the correct format',
        href,
      },
    ])
  })

  it('should return error for PP999999P (invalid pattern)', () => {
    expect(ninoFormatValidator('PP999999P', href)).toEqual([
      {
        text: 'Enter a valid National Insurance number in the correct format',
        href,
      },
    ])
  })

  it('should return no errors for empty value (handled by required validator)', () => {
    expect(ninoFormatValidator('', href)).toEqual([])
  })

  it('should return error for NINO with invalid characters', () => {
    expect(ninoFormatValidator('-AA/12?3456!A-', href)).toEqual([
      {
        text: 'Enter a valid National Insurance number in the correct format',
        href,
      },
    ])
  })

  it('should return error for NINO with invalid whitespace (e.g. tab)', () => {
    expect(ninoFormatValidator('AA\t123456A', href)).toEqual([
      {
        text: 'Enter a valid National Insurance number in the correct format',
        href,
      },
    ])
  })
})
