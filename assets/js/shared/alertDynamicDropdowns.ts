import type { GovukSelectItem } from '../../../server/interfaces/govukComponents'

export function alertDynamicDropdowns() {
  const alertTypeElement = document.getElementById('alertType') as HTMLSelectElement

  if (alertTypeElement) {
    const alertCodeElement = document.getElementById('alertCode') as HTMLSelectElement
    const typeCodeMap: Record<string, GovukSelectItem[]> = JSON.parse(
      document.getElementById('typeCodeMap').textContent,
    )

    alertTypeElement.addEventListener('change', () => {
      alertCodeElement.length = 1
      if (alertTypeElement.value === '') return

      typeCodeMap[alertTypeElement.value]?.forEach((alertCode: GovukSelectItem) => {
        const opt = new Option(alertCode.text, alertCode.value as string)
        opt.disabled = alertCode.attributes?.disabled === 'disabled'
        alertCodeElement.add(opt)
      })
    })
  }
}
