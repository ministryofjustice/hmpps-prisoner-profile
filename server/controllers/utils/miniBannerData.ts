import { PrisonerPermissions } from '@ministryofjustice/hmpps-prison-permissions-lib'
import { NameFormatStyle } from '../../data/enums/nameFormatStyle'
import { formatLocation, formatName } from '../../utils/utils'
import InmateDetail from '../../data/interfaces/prisonApi/InmateDetail'
import Prisoner from '../../data/interfaces/prisonerSearchApi/Prisoner'

export default (prisonerData: Prisoner, inmateDetail: InmateDetail, prisonerPermissions: PrisonerPermissions) => {
  const { firstName, lastName, cellLocation, prisonerNumber } = prisonerData
  const prisonerBannerName = formatName(firstName, null, lastName, { style: NameFormatStyle.lastCommaFirst })

  return {
    prisonerName: prisonerBannerName,
    prisonerNumber,
    cellLocation: formatLocation(cellLocation),
    prisonerThumbnailImageUrl: `/api/prisoner/${prisonerNumber}/image?imageId=${inmateDetail.facialImageId}&fullSizeImage=false`,
    prisonerPermissions,
  }
}
