import { NameFormatStyle } from '../../data/enums/nameFormatStyle'
import Prisoner from '../../data/interfaces/prisonerSearchApi/Prisoner'
import { formatLocation, formatName } from '../../utils/utils'

export default (prisonerData: Prisoner) => {
  const { firstName, lastName, cellLocation, prisonerNumber } = prisonerData
  const prisonerBannerName = formatName(firstName, null, lastName, { style: NameFormatStyle.lastCommaFirst })

  return {
    miniBannerData: {
      prisonerName: prisonerBannerName,
      prisonerNumber,
      cellLocation: formatLocation(cellLocation),
    },
  }
}
