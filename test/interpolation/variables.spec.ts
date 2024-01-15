import { Variables } from '../../src/interpolation/variables';

describe('Variables', () => {
  describe('expand()', () => {
    it('should expand variables', () => {
      const config = {
        HOST_NAME: '${aws-secrets-manager.host-name}',
        secret: '${aws-secrets-manager.secret}',
        name: '${simple.value}',
        defaultValue: '${NON_EXISTING_ENV:-default-value}',
        'simple.value': 'abc',
        'aws-secrets-manager.secret': 'test',
        'aws-secrets-manager.host-name': 'localhost',
      };

      const expanded = Variables.expand(config);

      expect(expanded).toEqual({
        HOST_NAME: config['aws-secrets-manager.host-name'],
        secret: config['aws-secrets-manager.secret'],
        name: config['simple.value'],
        defaultValue: 'default-value',
        'simple.value': config['simple.value'],
        'aws-secrets-manager.secret': config['aws-secrets-manager.secret'],
        'aws-secrets-manager.host-name':
          config['aws-secrets-manager.host-name'],
      });
    });
  });
});
