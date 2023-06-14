[< Back](./building_and_running.md)
---

## NVM

It is recommended to use [nvm](https://github.com/nvm-sh/nvm#about) to ensure that you are running the same version of node that is being used in CI and in
production.

To do this on a mac:

```shell
brew install nvm
```

Then create a new folder `~/.nvm`.

Then add the following lines to your .bashrc or .zshrc:

```shell
export NVM_DIR=~/.nvm
source $(brew --prefix nvm)/nvm.sh
```

Close the terminal and reopen. Then run **within the repository folder**:

```shell
nvm install --latest-npm
```

This will pick up the `.nvmrc` file which contains the node version that should be used.

