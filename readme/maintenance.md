[< Back](../README.md)
---

## Maintenance

To help keep the service up to date consider the following:

### Update dependencies

To see a list of outdated dependencies, run:

```
npm outdated
```

npm update Minor version updates can be applied by running:

```
npx npm-check-updates -t minor -u
```

To update major dependencies run (obviously this may introduce breaking changes to dependencies that
would need to be resolved manually):

```
npx npm-check-updates -u
```

### Imported Types
Some types are imported from the Open API docs for support-additional-needs-api and curious-api.
You will need to install the node module `openapi-typescript` globally with the following command:

`npm install -g openapi-typescript`

To update the types from the Open API docs run the following commands:

```shell
npx openapi-typescript https://support-for-additional-needs-api-dev.hmpps.service.justice.gov.uk/v3/api-docs -o server/@types/supportAdditionalNeedsApi/index.d.ts
npx openapi-typescript https://testservices.sequation.net/sequation-virtual-campus2-api/v3/api-docs -o server/@types/curiousApi/index.d.ts
```

Note that you will need to run prettier over the generated files and possibly handle other errors before compiling.

The types are inherited for use in `server/@types/supportAdditionalNeedsApiClient/index.d.ts` and
`server/@types/curiousApiClient/index.d.ts` which may also need tweaking for use.

Do not re-import the specs lightly! Reformatting the generated code with prettier is no small task, especially with
large specs.
