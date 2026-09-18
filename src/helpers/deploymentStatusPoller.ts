import { Connection, PollingClient, StatusResult } from '@salesforce/core';
import { Duration } from '@salesforce/kit';
import { BackgroundOperationRecord, DataKitDeploymentLogRecord } from '../types/datapackagedefinition.js';

export const TERMINAL_SUCCESS = new Set(['Complete']);
export const TERMINAL_FAILURE = new Set(['Failed', 'Error', 'Aborted']);

export type DeploymentStatusPollResult = {
  jobId: string;
  jobStatus: string;
  timedOut: boolean;
  errorMessage?: string;
};

// BackgroundOperation.Error is capped at 255 chars — use as fallback when DataKitDeploymentLog returns no record or empty error
async function getDeploymentError(connection: Connection, jobId: string, fallbackError?: string): Promise<string | undefined> {
  const { records } = await connection.query<DataKitDeploymentLogRecord>(
    `SELECT DeploymentError FROM DataKitDeploymentLog WHERE JobIdentifier = '${jobId}' ORDER BY CreatedDate DESC LIMIT 1`
  );
  return records[0]?.DeploymentError || fallbackError;
}

export async function getBackgroundOperationStatus(
  connection: Connection,
  jobId: string
): Promise<Omit<DeploymentStatusPollResult, 'timedOut'>> {
  const { records } = await connection.query<BackgroundOperationRecord>(
    `SELECT Id, Status, Error FROM BackgroundOperation WHERE Id = '${jobId}' LIMIT 1`
  );

  if (records.length === 0) return { jobId, jobStatus: 'Unknown' };

  const jobStatus = records[0].Status;
  const errorMessage = TERMINAL_FAILURE.has(jobStatus)
    ? await getDeploymentError(connection, jobId, records[0].Error)
    : undefined;

  return { jobId, jobStatus, errorMessage };
}

export async function pollBackgroundOperation(
  connection: Connection,
  jobId: string,
  waitDuration: Duration,
  onPoll?: (status: string) => void
): Promise<DeploymentStatusPollResult> {
  let jobStatus = '';
  let backgroundOperationError: string | undefined;

  const pollingClient = await PollingClient.create({
    frequency: Duration.seconds(3),
    timeout: waitDuration,
    timeoutErrorName: 'DeploymentStatusTimeoutError',
    poll: async (): Promise<StatusResult> => {
      const { records } = await connection.query<BackgroundOperationRecord>(
        `SELECT Id, Status, Error FROM BackgroundOperation WHERE Id = '${jobId}' LIMIT 1`
      );

      if (records.length === 0) return { completed: false };

      jobStatus = records[0].Status;
      backgroundOperationError = records[0].Error;
      onPoll?.(jobStatus);

      return { completed: TERMINAL_SUCCESS.has(jobStatus) || TERMINAL_FAILURE.has(jobStatus) };
    },
  });

  try {
    await pollingClient.subscribe();
  } catch (err) {
    if ((err as Error).name === 'DeploymentStatusTimeoutError') {
      return { jobId, jobStatus, timedOut: true };
    }
    throw err;
  }

  const errorMessage = TERMINAL_FAILURE.has(jobStatus)
    ? await getDeploymentError(connection, jobId, backgroundOperationError)
    : undefined;

  return { jobId, jobStatus, timedOut: false, errorMessage };
}
