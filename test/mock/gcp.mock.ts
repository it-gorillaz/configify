import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

export const accessSecretVersionMock = jest.fn();

export const secretManagerServiceClientMock: SecretManagerServiceClient = {
  accessSecretVersion: accessSecretVersionMock,
} as unknown as SecretManagerServiceClient;

jest.mock('@google-cloud/secret-manager', () => {
  return {
    SecretManagerServiceClient: jest.fn(() => secretManagerServiceClientMock),
  };
});
