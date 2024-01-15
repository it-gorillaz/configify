export const secretsManagerSendMock = jest.fn();
export const systemsManagerSendMock = jest.fn();

jest.mock('@aws-sdk/client-secrets-manager', () => {
  return {
    GetSecretValueCommand: jest.fn(),
    SecretsManagerClient: jest.fn(() => ({
      send: secretsManagerSendMock,
    })),
  };
});

jest.mock('@aws-sdk/client-ssm', () => {
  return {
    GetParameterCommand: jest.fn(),
    SSMClient: jest.fn(() => ({
      send: systemsManagerSendMock,
    })),
  };
});
