import { expect } from 'chai';
import sinon from 'sinon';
import { TestContext, MockTestOrgData } from '@salesforce/core/testSetup';
import { Connection } from '@salesforce/core';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import DatakitDevopsDeployStart from '../../../../../src/commands/datakit/devops/deploy/start.js';

describe('datakit devops deploy start', () => {
  const $$ = new TestContext();
  const testOrg = new MockTestOrgData();

  beforeEach(async () => {
    await $$.stubAuths(testOrg);
    stubSfCommandUx($$.SANDBOX);
  });

  it('deploys a DataKit and polls BackgroundOperation until completion', async () => {
    // TestContext already wraps Connection.prototype.request — configure it rather than re-stub
    (Connection.prototype.request as sinon.SinonStub).resolves({ jobId: '08PFT00000KwdDc' });

    $$.SANDBOX.stub(Connection.prototype, 'query').resolves({
      records: [{ Id: '08PFT00000KwdDc', Status: 'Complete', Error: undefined }],
      done: true,
      totalSize: 1,
    });

    const result = await DatakitDevopsDeployStart.run([
      '--developer-name', 'MyDataKit',
      '--target-org', testOrg.username,
    ]);

    expect(result.jobId).to.equal('08PFT00000KwdDc');
    expect(result.jobStatus).to.equal('Complete');
    expect(result.developerName).to.equal('MyDataKit');
  });
});
