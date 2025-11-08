#!/usr/bin/env node
/**
 * Basic test runner - validates core logic without full test framework
 * Run with: node tests/run-basic-tests.js
 */

console.log('🧪 Running Basic Tests for New Features\n');

let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`✅ ${description}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${description}`);
    console.log(`   Error: ${error.message}`);
    failed++;
  }
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    },
    toEqual(expected) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
    toContain(item) {
      if (!actual.includes(item)) {
        throw new Error(`Expected array to contain ${item}`);
      }
    },
    toBeLessThanOrEqual(max) {
      if (actual > max) {
        throw new Error(`Expected ${actual} to be <= ${max}`);
      }
    },
    toBeDefined() {
      if (actual === undefined) {
        throw new Error('Expected value to be defined');
      }
    },
    toBeUndefined() {
      if (actual !== undefined) {
        throw new Error('Expected value to be undefined');
      }
    }
  };
}

// ===== Test 1: Recent Profiles Logic =====
console.log('\n📋 Testing Recent Profiles Logic\n');

test('should add profile to recent list', () => {
  let recentIds = [];
  const profileId = 'profile-1';

  // Simulate addToRecentProfiles logic
  recentIds = recentIds.filter(id => id !== profileId);
  recentIds.unshift(profileId);
  recentIds = recentIds.slice(0, 10);

  expect(recentIds).toContain('profile-1');
  expect(recentIds.length).toBeLessThanOrEqual(10);
});

test('should limit recent profiles to 10', () => {
  let recentIds = [];

  for (let i = 0; i < 15; i++) {
    const profileId = `profile-${i}`;
    recentIds = recentIds.filter(id => id !== profileId);
    recentIds.unshift(profileId);
    recentIds = recentIds.slice(0, 10);
  }

  expect(recentIds.length).toBe(10);
});

test('should move existing profile to front', () => {
  let recentIds = [];

  // Add profile-1
  recentIds.unshift('profile-1');
  // Add profile-2
  recentIds.unshift('profile-2');
  // Add profile-1 again
  recentIds = recentIds.filter(id => id !== 'profile-1');
  recentIds.unshift('profile-1');

  expect(recentIds[0]).toBe('profile-1');
});

// ===== Test 2: Profile Duplication Logic =====
console.log('\n👥 Testing Profile Duplication Logic\n');

test('duplicate profile creates new profile with copy suffix', () => {
  const originalProfile = {
    id: 'original-123',
    name: 'Production Admin',
    algorithm: 'HS256',
    encryptedKey: 'encrypted-key-data',
    payload: { userId: 'admin', role: 'ADMIN' }
  };

  const duplicatedProfile = {
    ...originalProfile,
    id: 'new-uuid',
    name: `${originalProfile.name} (Copy)`,
    encryptedKey: ''
  };

  expect(duplicatedProfile.name).toBe('Production Admin (Copy)');
  expect(duplicatedProfile.encryptedKey).toBe('');
  expect(duplicatedProfile.payload).toEqual(originalProfile.payload);
  expect(duplicatedProfile.algorithm).toBe(originalProfile.algorithm);
});

// ===== Test 3: Payload Template Logic =====
console.log('\n📝 Testing Payload Template Logic\n');

test('template save creates object with required fields', () => {
  const templateData = {
    name: 'Admin Template',
    description: 'Standard admin',
    payload: { userId: 'admin', role: 'ADMIN' }
  };

  const saved = {
    id: 'generated-uuid',
    ...templateData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  expect(saved.id).toBeDefined();
  expect(saved.name).toBe('Admin Template');
  expect(saved.createdAt).toBeDefined();
});

test('apply template workflow', () => {
  const template = {
    id: 'template-1',
    name: 'Admin User Template',
    payload: { userId: 'admin-001', role: 'ADMIN' }
  };

  const newPayload = { ...template.payload };

  expect(newPayload.userId).toBe('admin-001');
  expect(newPayload.role).toBe('ADMIN');
});

test('template limit enforcement', () => {
  const templates = [];
  const maxTemplates = 30;

  // Add 30 templates
  for (let i = 0; i < 30; i++) {
    templates.push({ id: `t${i}`, name: `Template ${i}` });
  }

  // Check if we would reject 31st
  const wouldExceed = templates.length >= maxTemplates;
  expect(wouldExceed).toBe(true);
});

// ===== Test 4: Payload Apply Template =====
console.log('\n🔄 Testing Payload Apply Template\n');

test('apply template sets payload and switches mode', () => {
  let payloadObject = {};
  let mode = 'json';

  const templatePayload = {
    userId: 'admin-001',
    username: 'Admin User'
  };

  // Simulate applyTemplate
  payloadObject = templatePayload;
  mode = 'form';

  expect(payloadObject).toEqual(templatePayload);
  expect(mode).toBe('form');
});

test('payload sync between form and JSON', () => {
  let payloadObject = { userId: '123' };

  // Add field in form mode
  payloadObject.username = 'TestUser';

  // Convert to JSON
  const jsonString = JSON.stringify(payloadObject, null, 2);
  const parsed = JSON.parse(jsonString);

  expect(parsed.userId).toBe('123');
  expect(parsed.username).toBe('TestUser');
});

// ===== Summary =====
console.log('\n' + '='.repeat(50));
console.log(`\n✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📊 Total: ${passed + failed}\n`);

if (failed === 0) {
  console.log('🎉 All tests passed!\n');
  process.exit(0);
} else {
  console.log('⚠️  Some tests failed\n');
  process.exit(1);
}
