import { expect } from 'chai';
import { TestContext, MockTestOrgData } from '@salesforce/core/testSetup';
import { Connection } from '@salesforce/core';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import DatakitDeployDevopsReport from '../../../../../src/commands/datakit/devops/deploy/report.js';

describe('datakit devops deploy report', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();

  beforeEach(async () => {
    await $$.stubAuths(testOrg);
    stubSfCommandUx($$.SANDBOX);
  });

  it('returns the current status immediately when --wait is not provided', async () => {
    $$.SANDBOX.stub(Connection.prototype, 'query').resolves({
      records: [{ Id: '08PFT00000KwdDc', Status: 'Complete' }],
      done: true,
      totalSize: 1,
    });

    const result = await DatakitDeployDevopsReport.run([
      '--job-id', '08PFT00000KwdDc',
      '--target-org', testOrg.username,
    ]);

    expect(result.jobId).to.equal('08PFT00000KwdDc');
    expect(result.jobStatus).to.equal('Complete');
  });

  it('throws when the deployment has failed and --wait is provided', async () => {
    const errorMessage = 'Deployment has failed due to user exception.';

    $$.SANDBOX.stub(Connection.prototype, 'query').callsFake((soql: string) => {
      if (soql.includes('DataKitDeploymentLog')) {
        return Promise.resolve({ records: [{ DeploymentError: errorMessage }], done: true, totalSize: 1 });
      }
      return Promise.resolve({ records: [{ Id: '08PFT00000KwdDc', Status: 'Failed' }], done: true, totalSize: 1 });
    });

    try {
      await DatakitDeployDevopsReport.run([
        '--job-id', '08PFT00000KwdDc',
        '--target-org', testOrg.username,
        '--wait', '1',
      ]);
      expect.fail('Expected command to throw on deployment failure');
    } catch (err) {
      expect((err as Error).message).to.include(errorMessage);
    }
  });
});
