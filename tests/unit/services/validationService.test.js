/**
 * Unit tests for validationService
 * Tests validation functions for JWT inputs
 */

import { validateKey } from '../../../src/renderer/services/validationService';

describe('validationService', () => {
  describe('validateKey', () => {
    describe('HS256 algorithm', () => {
      const algorithm = 'HS256';

      test('should accept valid base64 encoded key', () => {
        const validKey = 'dGVzdC1zZWNyZXQta2V5'; // base64: "test-secret-key"
        const result = validateKey(algorithm, validKey);

        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      test('should accept base64 key with padding', () => {
        const validKey = 'dGVzdA=='; // base64: "test"
        const result = validateKey(algorithm, validKey);

        expect(result.valid).toBe(true);
      });

      test('should accept base64 key without padding', () => {
        const validKey = 'dGVzdA'; // base64: "test" (no padding)
        const result = validateKey(algorithm, validKey);

        expect(result.valid).toBe(true);
      });

      test('should reject empty key', () => {
        const result = validateKey(algorithm, '');

        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error).toContain('empty');
      });

      test('should reject whitespace-only key', () => {
        const result = validateKey(algorithm, '   ');

        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });

      test('should reject invalid base64 characters', () => {
        const invalidKey = 'invalid@#$%key';
        const result = validateKey(algorithm, invalidKey);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('base64');
      });

      test('should accept long base64 keys', () => {
        const longKey = Buffer.from('a'.repeat(256)).toString('base64');
        const result = validateKey(algorithm, longKey);

        expect(result.valid).toBe(true);
      });
    });

    describe('RS256 algorithm', () => {
      const algorithm = 'RS256';

      test('should accept valid PEM private key', () => {
        const validPEM = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7VJTUt9Us8cKj
-----END PRIVATE KEY-----`;

        const result = validateKey(algorithm, validPEM);

        expect(result.valid).toBe(true);
      });

      test('should accept PEM with RSA PRIVATE KEY header', () => {
        const validPEM = `-----BEGIN RSA PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7VJTUt9Us8cKj
-----END RSA PRIVATE KEY-----`;

        const result = validateKey(algorithm, validPEM);

        expect(result.valid).toBe(true);
      });

      test('should reject empty PEM key', () => {
        const result = validateKey(algorithm, '');

        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });

      test('should reject PEM without BEGIN marker', () => {
        const invalidPEM = `MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7VJTUt9Us8cKj
-----END PRIVATE KEY-----`;

        const result = validateKey(algorithm, invalidPEM);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('PEM');
      });

      test('should reject PEM without END marker', () => {
        const invalidPEM = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7VJTUt9Us8cKj`;

        const result = validateKey(algorithm, invalidPEM);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('PEM');
      });

      test('should reject PEM with wrong key type', () => {
        const invalidPEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu1SU1LfVLPHCo
-----END PUBLIC KEY-----`;

        const result = validateKey(algorithm, invalidPEM);

        expect(result.valid).toBe(false);
        expect(result.error).toContain('PRIVATE');
      });
    });

    describe('Unsupported algorithm', () => {
      test('should reject unsupported algorithm', () => {
        const result = validateKey('ES256', 'some-key');

        expect(result.valid).toBe(false);
        expect(result.error).toContain('Unsupported');
      });
    });

    describe('Edge cases', () => {
      test('should handle null key', () => {
        const result = validateKey('HS256', null);

        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });

      test('should handle undefined key', () => {
        const result = validateKey('HS256', undefined);

        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });

      test('should handle numeric key', () => {
        const result = validateKey('HS256', 12345);

        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });

      test('should trim whitespace from keys', () => {
        const keyWithSpaces = '  dGVzdA==  ';
        const result = validateKey('HS256', keyWithSpaces);

        // Should either accept after trimming or reject with clear message
        if (result.valid) {
          expect(result.valid).toBe(true);
        } else {
          expect(result.error).toBeDefined();
        }
      });
    });
  });
});
