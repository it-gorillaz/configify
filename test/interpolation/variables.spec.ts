import { Variables } from '../../src/interpolation/variables';

describe('Variables', () => {
  describe('expand()', () => {
    const baseConfig = {
      'simple.value': 'abc',
      'aws-secrets-manager.secret': 'test',
      'aws-secrets-manager.host-name': 'localhost',
    };

    it('should expand a simple dot-notation variable reference', () => {
      const { name } = Variables.expand({ name: '${simple.value}', ...baseConfig });
      expect(name).toBe('abc');
    });

    it('should expand a kebab-case variable reference', () => {
      const { secret } = Variables.expand({ secret: '${aws-secrets-manager.secret}', ...baseConfig });
      expect(secret).toBe('test');
    });

    it('should expand a variable used as part of a larger key name', () => {
      const { HOST_NAME } = Variables.expand({ HOST_NAME: '${aws-secrets-manager.host-name}', ...baseConfig });
      expect(HOST_NAME).toBe('localhost');
    });

    it('should use the inline default when the referenced variable is not defined', () => {
      const { value } = Variables.expand({ value: '${NON_EXISTING:-default-value}' });
      expect(value).toBe('default-value');
    });

    it('should expand an undefined variable to the string "undefined"', () => {
      const { value } = Variables.expand({ value: '${UNDEFINED_VAR}' });
      expect(value).toBe('undefined');
    });

    it('should pass non-string values through unchanged', () => {
      const result = Variables.expand({ count: 42, flag: true, nothing: null } as any);
      expect(result).toEqual({ count: 42, flag: true, nothing: null });
    });

    it('should unescape \\$ to $ without treating it as a variable reference', () => {
      const { literal } = Variables.expand({ literal: '\\$NOT_A_VAR' });
      expect(literal).toBe('$NOT_A_VAR');
    });

    it('should throw on circular variable references', () => {
      expect(() => Variables.expand({ A: '${B}', B: '${A}' })).toThrow(
        'Circular variable reference detected',
      );
    });
  });
});
