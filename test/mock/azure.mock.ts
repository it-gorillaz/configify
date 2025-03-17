import { SecretClient } from '@azure/keyvault-secrets';

export const getSecretMock = jest.fn();

export const secretClientMock: SecretClient = {
  getSecret: getSecretMock,
} as unknown as SecretClient;

jest.mock('@azure/keyvault-secrets', () => {
  return {
    SecretClient: jest.fn(() => secretClientMock),
  };
});
