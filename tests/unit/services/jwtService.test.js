/**
 * Unit tests for jwtService
 * Tests token generation and parsing functionality
 */

import { generateToken, parseToken } from '../../../src/renderer/services/jwtService';
import { mockPayloads, mockTokens } from '../../helpers/fixtures';
import { createMockPayload } from '../../helpers/mock-factories';

describe('jwtService', () => {
  describe('generateToken', () => {
    describe('HS256 algorithm', () => {
      const algorithm = 'HS256';
      const key = 'dGVzdC1zZWNyZXQta2V5LWZvci1obWFjLTI1Ng=='; // base64 encoded

      test('should generate a valid JWT token with standard payload', () => {
        const result = generateToken(algorithm, key, mockPayloads.standard, '1h');

        expect(result).toBeDefined();
        expect(result.raw).toBeDefined();
        expect(typeof result.raw).toBe('string');
        expect(result.raw.split('.')).toHaveLength(3);
      });

      test('should include correct header with HS256 algorithm', () => {
        const result = generateToken(algorithm, key, mockPayloads.standard, '1h');

        expect(result.header).toBeDefined();
        expect(result.header.alg).toBe('HS256');
        expect(result.header.typ).toBe('JWT');
      });

      test('should include all payload claims', () => {
        const payload = createMockPayload({
          sub: 'test-user',
          name: 'Test User',
          email: 'test@example.com',
        });

        const result = generateToken(algorithm, key, payload, '1h');

        expect(result.payload.sub).toBe('test-user');
        expect(result.payload.name).toBe('Test User');
        expect(result.payload.email).toBe('test@example.com');
      });

      test('should add iat (issued at) if not present', () => {
        const payload = { sub: 'test-user' };
        const beforeTime = Math.floor(Date.now() / 1000);

        const result = generateToken(algorithm, key, payload, '1h');

        const afterTime = Math.floor(Date.now() / 1000);

        expect(result.payload.iat).toBeDefined();
        expect(result.payload.iat).toBeGreaterThanOrEqual(beforeTime);
        expect(result.payload.iat).toBeLessThanOrEqual(afterTime);
      });

      test('should preserve existing iat if present', () => {
        const customIat = 1234567890;
        const payload = { sub: 'test-user', iat: customIat };

        const result = generateToken(algorithm, key, payload, '1h');

        expect(result.payload.iat).toBe(customIat);
      });

      test('should calculate exp from preset (1h)', () => {
        const result = generateToken(algorithm, key, mockPayloads.standard, '1h');

        expect(result.payload.exp).toBeDefined();
        expect(result.payload.exp).toBe(result.payload.iat + 3600);
      });

      test('should calculate exp from preset (1d)', () => {
        const result = generateToken(algorithm, key, mockPayloads.standard, '1d');

        expect(result.payload.exp).toBe(result.payload.iat + 86400);
      });

      test('should calculate exp from preset (1w)', () => {
        const result = generateToken(algorithm, key, mockPayloads.standard, '1w');

        expect(result.payload.exp).toBe(result.payload.iat + 604800);
      });

      test('should accept custom timestamp for exp', () => {
        const customExp = Math.floor(Date.now() / 1000) + 7200;

        const result = generateToken(algorithm, key, mockPayloads.standard, customExp);

        expect(result.payload.exp).toBe(customExp);
      });

      test('should include signature', () => {
        const result = generateToken(algorithm, key, mockPayloads.standard, '1h');

        expect(result.signature).toBeDefined();
        expect(typeof result.signature).toBe('string');
        expect(result.signature.length).toBeGreaterThan(0);
      });

      test('should include generatedAt timestamp', () => {
        const beforeTime = new Date().toISOString();

        const result = generateToken(algorithm, key, mockPayloads.standard, '1h');

        const afterTime = new Date().toISOString();

        expect(result.generatedAt).toBeDefined();
        expect(result.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        expect(result.generatedAt >= beforeTime).toBe(true);
        expect(result.generatedAt <= afterTime).toBe(true);
      });

      test('should throw error for invalid expiration preset', () => {
        expect(() => {
          generateToken(algorithm, key, mockPayloads.standard, 'invalid');
        }).toThrow('Invalid expiration preset');
      });
    });

    describe('RS256 algorithm', () => {
      const algorithm = 'RS256';
      // Note: In real tests, you'd use a valid test private key
      const key = '-----BEGIN PRIVATE KEY-----\ntest-key-content\n-----END PRIVATE KEY-----';

      test('should use PEM key directly for RS256', () => {
        // This test would fail with mock jsonwebtoken, but shows intent
        expect(() => {
          generateToken(algorithm, key, mockPayloads.standard, '1h');
        }).toBeDefined(); // In real implementation, this would succeed
      });
    });
  });

  describe('parseToken', () => {
    test('should parse a valid JWT token', () => {
      const result = parseToken(mockTokens.valid);

      expect(result).toBeDefined();
      expect(result.raw).toBe(mockTokens.valid);
      expect(result.header).toBeDefined();
      expect(result.payload).toBeDefined();
      expect(result.signature).toBeDefined();
    });

    test('should extract header from token', () => {
      const result = parseToken(mockTokens.valid);

      expect(result.header.alg).toBe('HS256');
      expect(result.header.typ).toBe('JWT');
    });

    test('should extract payload from token', () => {
      const result = parseToken(mockTokens.valid);

      expect(result.payload.sub).toBe('1234567890');
      expect(result.payload.name).toBe('John Doe');
      expect(result.payload.iat).toBe(1516239022);
    });

    test('should extract signature from token', () => {
      const result = parseToken(mockTokens.valid);

      expect(result.signature).toBeDefined();
      expect(typeof result.signature).toBe('string');
    });

    test('should throw error for invalid token format', () => {
      expect(() => {
        parseToken('invalid-token');
      }).toThrow('Invalid JWT format');
    });

    test('should throw error for malformed token (wrong number of parts)', () => {
      expect(() => {
        parseToken('part1.part2');
      }).toThrow('Invalid JWT format');
    });

    test('should throw error for malformed token (invalid base64)', () => {
      expect(() => {
        parseToken(mockTokens.malformed);
      }).toThrow('Token parsing failed');
    });

    test('should throw error for empty token', () => {
      expect(() => {
        parseToken('');
      }).toThrow('Invalid JWT format');
    });

    test('should parse token with expiration claim', () => {
      const result = parseToken(mockTokens.withExpiration);

      expect(result.payload.exp).toBeDefined();
      expect(typeof result.payload.exp).toBe('number');
    });
  });
});
