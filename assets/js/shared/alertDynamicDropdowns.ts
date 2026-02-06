import type { SelectOption } from '../../../server/utils/utils'

export function alertDynamicDropdowns() {
  const alertTypeElement = document.getElementById('alertType') as HTMLSelectElement

  if (alertTypeElement) {
    const alertCodeElement = document.getElementById('alertCode') as HTMLSelectElement
    const typeCodeMap: Record<string, SelectOption[]> = JSON.parse(document.getElementById('typeCodeMap').textContent)

    alertTypeElement.addEventListener('change', () => {
      alertCodeElement.length = 1
      if (alertTypeElement.value === '') return

      typeCodeMap[alertTypeElement.value]?.forEach((alertCode: SelectOption) => {
        const opt = new Option(alertCode.text, alertCode.value as string)
        opt.disabled = alertCode.attributes?.disabled === 'disabled'
        alertCodeElement.add(opt)
      })
    })
  }
}
