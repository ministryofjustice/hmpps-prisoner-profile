import hmppsConfig from '@ministryofjustice/eslint-config-hmpps'

export default hmppsConfig({
  extraIgnorePaths: ['assets/', 'coverage/'],
  extraPathsAllowingDevDependencies: ['cypress.config*'],
})
