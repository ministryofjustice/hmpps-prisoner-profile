import { isGranted, PrisonerPermission } from '@ministryofjustice/hmpps-prison-permissions-lib'

export default function mockPermissions(permissions: Partial<Record<PrisonerPermission, boolean>>) {
  const isGrantedMock = isGranted as jest.MockedFunction<typeof isGranted>

  isGrantedMock.mockImplementation((perm, _perms) => permissions[perm] || false)
}
