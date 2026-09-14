# plugin-devops-datakit

[![Version](https://img.shields.io/npm/v/plugin-devops-datakit.svg)](https://npmjs.org/package/plugin-devops-datakit)
[![License](https://img.shields.io/npm/l/plugin-devops-datakit.svg)](https://github.com/baslu93/plugin-devops-datakit/blob/main/LICENSE)

A Salesforce CLI plugin for deploying and tracking Data 360 DevOps DataKits using the Data 360 Connect API.

## Overview

A DevOps DataKit is a versioned bundle of Data 360 components that can be promoted across orgs. This plugin provides two commands built on the Data 360 Connect API:

- **`datakit devops deploy start`** — triggers an async deployment and polls `BackgroundOperation` until it reaches a terminal state, surfacing any errors.
- **`datakit devops deploy status`** — checks the status of a deployment by job ID; pass `--wait` to poll until completion, or omit it to get the current status immediately.

## Installation

```sh
sf plugins install plugin-devops-datakit
```

## Contributing

To work on this plugin locally, clone the repo and link it into your Salesforce CLI:

```sh
git clone https://github.com/baslu93/plugin-devops-datakit.git
cd plugin-devops-datakit
npm install
sf plugins link .
```

After making changes to TypeScript source, recompile before testing:

```sh
npm run build
```

## Commands

<!-- toc -->
* [plugin-devops-datakit](#plugin-devops-datakit)
<!-- tocstop -->

<!-- commands -->
* [`sf datakit devops deploy start`](#sf-datakit-devops-deploy-start)
* [`sf datakit devops deploy status`](#sf-datakit-devops-deploy-status)

## `sf datakit devops deploy start`

Deploy a DataKit to the target org using the Data 360 Connect API.

```
USAGE
  $ sf datakit devops deploy start -n <value> [-o <value>] [--api-version <value>] [-w <value>]

FLAGS
  -n, --developer-name=<value>  (required) Developer name of the DataKit to deploy.
  -o, --target-org=<value>      Username or alias of the target org.
  -w, --wait=<value>            [default: 10 minutes] Number of minutes to wait for the deployment to complete before
                                timing out.
  --api-version=<value>         Override the api version used for api requests made by this command

DESCRIPTION
  Deploy a DataKit to the target org using the Data 360 Connect API.

  Calls the Data 360 Connect API to deploy a DataKit asynchronously, then polls the BackgroundOperation record until the
  deployment reaches a terminal status. Returns the job ID and final status.

EXAMPLES
  Deploy a DataKit to the default org:

    $ sf datakit devops deploy start --developer-name MyDataKit

  Deploy a DataKit to a specific org:

    $ sf datakit devops deploy start --developer-name MyDataKit --target-org myOrg

  Deploy and return the result as JSON:

    $ sf datakit devops deploy start --developer-name MyDataKit --target-org myOrg --json
```

## `sf datakit devops deploy status`

Check the status of an in-progress DataKit deployment.

```
USAGE
  $ sf datakit devops deploy status -i <value> [-o <value>] [--api-version <value>] [-w <value>]

FLAGS
  -i, --job-id=<value>      (required) Job ID returned by the "sf datakit devops deploy start" command.
  -o, --target-org=<value>  Username or alias of the target org.
  -w, --wait=<value>        Number of minutes to wait for the deployment to complete. If omitted, returns the current
                            status immediately without waiting.
  --api-version=<value>     Override the api version used for api requests made by this command

DESCRIPTION
  Check the status of an in-progress DataKit deployment.

  Polls the BackgroundOperation record for the given job ID until the deployment reaches a terminal status (Completed,
  Failed, Error, or Aborted).

EXAMPLES
  Check deployment status:

    $ sf datakit devops deploy status --job-id 0BkXx000000xxxxx

  Check deployment status and return result as JSON:

    $ sf datakit devops deploy status --job-id 0BkXx000000xxxxx --json
```
<!-- commandsstop -->

## License

This plugin is licensed under the [Apache License 2.0](LICENSE.txt).
