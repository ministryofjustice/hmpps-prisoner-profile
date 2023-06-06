import { isBefore, compareAsc } from 'date-fns'
import { Address } from '../interfaces/prisonApi/address'

const sortAddressesByStartDate = (leftAddress: Address, rightAddress: Address) => {
  const left = leftAddress.startDate ? new Date(leftAddress.startDate) : new Date()
  const right = rightAddress.startDate ? new Date(rightAddress.startDate) : new Date()
  return compareAsc(left, right)
}

// eslint-disable-next-line import/prefer-default-export
export const getMostRecentAddress = (addresses: Address[] = []): Address | undefined => {
  const activeAddresses = addresses.filter(
    address => !address.endDate || isBefore(new Date(), new Date(address.endDate)),
  )

  if (activeAddresses.length === 0) {
    return undefined
  }

  const primaryAddress = activeAddresses.find(address => address.primary)
  if (primaryAddress) {
    return primaryAddress
  }

  const homeAddress = activeAddresses
    .filter(address => address.addressType.toLowerCase().includes('home'))
    .sort(sortAddressesByStartDate)[0]

  if (homeAddress) {
    return homeAddress
  }

  return activeAddresses.sort(sortAddressesByStartDate)[0]
}
