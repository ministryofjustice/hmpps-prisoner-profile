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
