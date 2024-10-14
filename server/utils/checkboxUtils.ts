import { CheckboxOptions } from './utils'
import { ReferenceDataDomain } from '../data/interfaces/prisonPersonApi/prisonPersonApiClient'

export const checkboxInputToSelectedValues = (
  rootFieldName: string,
  selectedOptions: { [key: string]: string[] } | null,
) => {
  if (!selectedOptions) return []
  // Get the selected values not including sub-values
  const selectedValues = selectedOptions[rootFieldName]

  // Ensure only exclusive options are returned in the case of hanging around sub-value options
  if (selectedValues.includes('DONT_KNOW')) return ['DONT_KNOW']
  if (selectedValues.includes('NO')) return ['NO']

  return selectedValues.reduce((res, val) => {
    res.push(val)
    if (selectedOptions[`${res}-subvalues`]) {
      res.push(selectedOptions[`${res}-subvalues`])
    }

    return res.flat()
  }, [])
}

export const checkboxFieldDataToInputs = (
  fieldData: CheckboxOptions[],
  checked: string[] = [],
  valuePrefix: string = '',
): {
  value: string
  text: string
  checked: boolean
  subValues?: { title: string; hint: string; items: { value: string; text: string; checked: boolean }[] }
}[] => {
  return fieldData.map(i => {
    if (i.subValues) {
      return {
        value: i.value,
        text: i.text,
        checked: checked.includes(i.value),
        subValues: {
          title: i.subValues.title,
          hint: i.subValues.hint,
          items: checkboxFieldDataToInputs(i.subValues.options, checked, i.value),
        },
      }
    }

    const value = valuePrefix ? `${valuePrefix}__${i.value}` : i.value

    return {
      value,
      text: i.text,
      checked: checked.includes(value),
    }
  })
}

export const referenceDataDomainToCheckboxOptions = (referenceDataDomain: ReferenceDataDomain): CheckboxOptions[] => {
  const subDomainCodes: {
    [key: string]: CheckboxOptions['subValues']
  } = referenceDataDomain.subDomains.reduce(
    (result, subDomain) => ({
      ...result,
      [subDomain.code]: {
        title: subDomain.description,
        hint: 'Select all that apply',
        options: subDomain.referenceDataCodes.map(code => ({
          text: code.description,
          value: code.id,
        })),
      },
    }),
    {} as { [key: string]: CheckboxOptions['subValues'] },
  )

  return referenceDataDomain.referenceDataCodes.map(code => {
    const subValues = subDomainCodes[code.code]
    if (subValues) {
      return {
        text: code.description,
        value: code.id,
        subValues,
      }
    }
    return {
      text: code.description,
      value: code.id,
    }
  })
}
