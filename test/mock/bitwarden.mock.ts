import {
  AuthClient,
  BitwardenClient,
  SecretsClient,
} from '@bitwarden/sdk-napi';

export const bitwardenLoginAccessTokenMock = jest.fn();
export const bitwardenSecretsClientGetMock = jest.fn();

export const bitwardenClientMock = {
  auth: () =>
    ({
      loginAccessToken: bitwardenLoginAccessTokenMock,
    }) as unknown as AuthClient,

  secrets: () =>
    ({ get: bitwardenSecretsClientGetMock }) as unknown as SecretsClient,
} as unknown as BitwardenClient;

jest.mock('@bitwarden/sdk-napi', () => {
  return {
    BitwardenClient: jest.fn(() => bitwardenClientMock),
    DeviceType: { SDK: 'SDK' },
  };
});
