# summary

Deploy a Data Kit to the target org using the Data 360 Connect API.

# description

Calls the Data 360 Connect API to deploy a Data Kit asynchronously, then polls the BackgroundOperation record until the deployment reaches a terminal status. Returns the job ID and final status.

# flags.developer-name.summary

Developer name of the Data Kit to deploy.

# flags.target-org.summary

Username or alias of the target org.

# flags.wait.summary

Number of minutes to wait for the deployment to complete before timing out.

# examples

- Deploy a Data Kit to the default org:

  <%= config.bin %> <%= command.id %> --developer-name MyDataKit

- Deploy a Data Kit to a specific org:

  <%= config.bin %> <%= command.id %> --developer-name MyDataKit --target-org myOrg

- Deploy and return the result as JSON:

  <%= config.bin %> <%= command.id %> --developer-name MyDataKit --target-org myOrg --json

# info.jobId

Deployment job started. Job ID: %s

# error.noTargetOrg

No target org specified and no default org found. Use --target-org or set a default org with "sf org login".

# error.deployFailed

Deployment of Data Kit "%s" failed: %s

# warning.deployTimeout

Deployment of Data Kit "%s" is still in progress. Run the following command to check its status:

  sf datakit devops deploy status --job-id %s

# success

Data Kit "%s" deployed successfully to org "%s".
