import { MultiStageOutput } from '@oclif/multi-stage-output';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages, Org } from '@salesforce/core';
import { Duration } from '@salesforce/kit';
import { pollBackgroundOperation, TERMINAL_FAILURE } from '../../../../helpers/deploymentStatusPoller.js';
import { DatakitDevopsDeployResponse } from '../../../../types/datapackagedefinition.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('plugin-datakit-devops', 'datakit.devops.deploy.start');

export type DatakitDevopsStartResult = {
  developerName: string;
  jobId: string;
  jobStatus: string;
  errorMessage?: string;
};

type DeployData = {
  jobId?: string;
  status?: string;
  username?: string;
};

export default class DatakitDeployDevopsStart extends SfCommand<DatakitDevopsStartResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    'developer-name': Flags.string({
      summary: messages.getMessage('flags.developer-name.summary'),
      char: 'n',
      required: true,
    }),
    'target-org': Flags.optionalOrg({
      summary: messages.getMessage('flags.target-org.summary'),
    }),
    'api-version': Flags.orgApiVersion(),
    async: Flags.boolean({
      summary: messages.getMessage('flags.async.summary'),
      char: 'a',
      exclusive: ['wait'],
    }),
    wait: Flags.duration({
      summary: messages.getMessage('flags.wait.summary'),
      char: 'w',
      unit: 'minutes',
      defaultValue: 10,
      min: 1,
      exclusive: ['async'],
    }),
  };

  public async run(): Promise<DatakitDevopsStartResult> {
    const { flags } = await this.parse(DatakitDeployDevopsStart);

    const org = flags['target-org'] as Org | undefined;
    if (!org) throw messages.createError('error.noTargetOrg');
    const developerName = flags['developer-name'] as string;
    const isAsync = flags['async'] as boolean | undefined;
    const waitDuration = flags['wait'] as Duration;
    const connection = org.getConnection(flags['api-version'] as string | undefined);
    const username = org.getUsername() ?? org.getOrgId() ?? '';

    const mso = new MultiStageOutput<DeployData>({
      stages: [`Deploying Data Kit ${developerName}`],
      jsonEnabled: this.jsonEnabled(),
      timerUnit: 's',
      data: { username, status: '', jobId: ' ' },
      postStagesBlock: [
        {
          label: 'Status',
          get: (data) => data?.status,
          bold: true,
          type: 'dynamic-key-value',
          onlyShowAtEndInCI: true,
        },
        {
          label: 'Deploy ID',
          get: (data) => data?.jobId,
          type: 'static-key-value',
          neverCollapse: true,
        },
        {
          label: 'Target Org',
          get: (data) => data?.username,
          type: 'static-key-value',
        },
      ],
    });

    mso.skipTo(`Deploying Data Kit ${developerName}`, { username });

    const response = await connection.request<DatakitDevopsDeployResponse>({
      method: 'POST',
      url: `/ssot/data-kits/${developerName}?asyncMode=true`,
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });

    const { jobId } = response;
    mso.updateData({ jobId, status: 'Queued' });

    if (isAsync) {
      mso.stop();
      this.log(messages.getMessage('info.asyncQueued', [this.config.bin, jobId]));
      return { developerName, jobId, jobStatus: 'Queued' };
    }

    const { jobStatus, timedOut, errorMessage } = await pollBackgroundOperation(
      connection,
      jobId,
      waitDuration,
      (status) => mso.updateData({ status })
    );

    mso.updateData({ status: jobStatus });

    if (timedOut) {
      mso.error();
      this.warn(messages.getMessage('warning.deployTimeout', [developerName, jobId]));
      return { developerName, jobId, jobStatus: 'InProgress' };
    }

    if (TERMINAL_FAILURE.has(jobStatus)) {
      mso.error();
      throw messages.createError('error.deployFailed', [errorMessage ?? 'Unknown error']);
    }

    mso.stop();

    return { developerName, jobId, jobStatus };
  }
}
