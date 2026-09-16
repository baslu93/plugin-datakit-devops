# plugin-datakit-devops

[![Version](https://img.shields.io/npm/v/plugin-datakit-devops.svg)](https://npmjs.org/package/plugin-datakit-devops)
[![Weekly Downloads](https://badgen.net/npm/dw/plugin-datakit-devops)](https://npmjs.org/package/plugin-datakit-devops)

Salesforce CLI plugin that automates the UI "Deploy Data Kit" action for DevOps Data Kits via the Connect API.

## Overview

A DevOps Data Kit is a versioned bundle of Data 360 components that can be promoted across orgs. This plugin provides two commands built on the Data 360 Connect API:

- **`datakit devops deploy start`** — triggers an async deployment and polls `BackgroundOperation` until it reaches a terminal state, surfacing any errors.
- **`datakit devops deploy report`** — checks the status of a deployment by job ID; pass `--wait` to poll until completion, or omit it to get the current status immediately.

## Installation

```sh
sf plugins install plugin-datakit-devops
```

## Contributing

To work on this plugin locally, clone the repo and link it into your Salesforce CLI:

```sh
git clone https://github.com/baslu93/plugin-datakit-devops.git
cd plugin-datakit-devops
npm install
sf plugins link .
```

After making changes to TypeScript source, recompile before testing:

```sh
npm run build
```

## Commands

<!-- toc -->
* [plugin-datakit-devops](#plugin-datakit-devops)
<!-- tocstop -->

<!-- commands -->
* [`sf datakit devops deploy report`](#sf-datakit-devops-deploy-report)
* [`sf datakit devops deploy start`](#sf-datakit-devops-deploy-start)

## `sf datakit devops deploy report`

Check the status of an in-progress Data Kit deployment.

```
USAGE
  $ sf datakit devops deploy report -i <value> [--json] [--flags-dir <value>] [-o <value>] [--api-version <value>] [-w
  <value>]

FLAGS
  -i, --job-id=<value>       (required) Job ID returned by the "sf datakit devops deploy start" command.
  -o, --target-org=<value>   Username or alias of the target org.
  -w, --wait=<value>         Number of minutes to wait for the deployment to complete. If omitted, returns the current
                             status immediately without waiting.
      --api-version=<value>  Override the api version used for api requests made by this command

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  Check the status of an in-progress Data Kit deployment.

  Polls the BackgroundOperation record for the given job ID until the deployment reaches a terminal status (Completed,
  Failed, Error, or Aborted).

EXAMPLES
  Report deployment status:

    $ sf datakit devops deploy report --job-id 0BkXx000000xxxxx

  Report deployment status and return result as JSON:

    $ sf datakit devops deploy report --job-id 0BkXx000000xxxxx --json
```

## `sf datakit devops deploy start`

Start a DevOps DataKit deployment and wait for the outcome.

```
USAGE
  $ sf datakit devops deploy start -n <value> [--json] [--flags-dir <value>] [-o <value>] [--api-version <value>] [-a | -w
    <value>]

FLAGS
  -a, --async                   Start the deployment and immediately return the job ID without waiting for completion.
  -n, --developer-name=<value>  (required) Developer name of the Data Kit to deploy.
  -o, --target-org=<value>      Username or alias of the target org.
  -w, --wait=<value>            [default: 10 minutes] Number of minutes to wait for the deployment to complete before
                                timing out.
      --api-version=<value>     Override the api version used for api requests made by this command

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  Start a DevOps DataKit deployment and wait for the outcome.

  Calls the Data 360 Connect API to deploy a Data Kit asynchronously, then polls the BackgroundOperation record until
  the deployment reaches a terminal status. Returns the job ID and final status.

EXAMPLES
  Deploy a Data Kit to the default org:

    $ sf datakit devops deploy start --developer-name MyDataKit

  Deploy a Data Kit to a specific org:

    $ sf datakit devops deploy start --developer-name MyDataKit --target-org myOrg

  Deploy and return the result as JSON:

    $ sf datakit devops deploy start --developer-name MyDataKit --target-org myOrg --json
```
<!-- commandsstop -->

## License

This plugin is licensed under the [Apache License 2.0](LICENSE.txt).
