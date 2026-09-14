import { expect } from 'chai';
import { TestContext, MockTestOrgData } from '@salesforce/core/testSetup';
import { Connection } from '@salesforce/core';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import DatakitDeployDevopsStatus from '../../../../../src/commands/datakit/devops/deploy/status.js';

describe('datakit devops deploy status', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();

  beforeEach(async () => {
    await $$.stubAuths(testOrg);
    stubSfCommandUx($$.SANDBOX);
  });

  it('returns the current status immediately when --wait is not provided', async () => {
    $$.SANDBOX.stub(Connection.prototype, 'query').resolves({
      records: [{ Id: '08PFT00000KwdDc', Status: 'Completed', Error: undefined }],
      done: true,
      totalSize: 1,
    });

    const result = await DatakitDeployDevopsStatus.run([
      '--job-id', '08PFT00000KwdDc',
      '--target-org', testOrg.username,
    ]);

    expect(result.jobId).to.equal('08PFT00000KwdDc');
    expect(result.jobStatus).to.equal('Completed');
  });

  it('throws when the deployment has failed and --wait is provided', async () => {
    $$.SANDBOX.stub(Connection.prototype, 'query').resolves({
      records: [{ Id: '08PFT00000KwdDc', Status: 'Failed', Error: 'Connector inactive' }],
      done: true,
      totalSize: 1,
    });

    try {
      await DatakitDeployDevopsStatus.run([
        '--job-id', '08PFT00000KwdDc',
        '--target-org', testOrg.username,
        '--wait', '1',
      ]);
      expect.fail('Expected command to throw on deployment failure');
    } catch (err) {
      expect((err as Error).message).to.include('Connector inactive');
    }
  });
});
