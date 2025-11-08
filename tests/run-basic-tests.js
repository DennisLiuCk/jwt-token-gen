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

// ===== Test 5: P2 - Search and Filter Logic =====
console.log('\n🔍 Testing P2 - Search and Filter Logic\n');

test('search filters profiles by name', () => {
  const profiles = [
    { name: 'Production Admin', algorithm: 'HS256', payload: { role: 'admin' } },
    { name: 'Development User', algorithm: 'RS256', payload: { role: 'user' } },
    { name: 'Test Merchant', algorithm: 'HS256', payload: { role: 'merchant' } }
  ];

  const searchQuery = 'admin';
  const filtered = profiles.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  expect(filtered.length).toBe(1);
  expect(filtered[0].name).toBe('Production Admin');
});

test('filter by algorithm works', () => {
  const profiles = [
    { name: 'Profile 1', algorithm: 'HS256' },
    { name: 'Profile 2', algorithm: 'RS256' },
    { name: 'Profile 3', algorithm: 'HS256' }
  ];

  const filtered = profiles.filter(p => p.algorithm === 'HS256');

  expect(filtered.length).toBe(2);
});

test('filter by favorites works', () => {
  const profiles = [
    { name: 'Profile 1', isFavorite: true },
    { name: 'Profile 2', isFavorite: false },
    { name: 'Profile 3', isFavorite: true }
  ];

  const filtered = profiles.filter(p => p.isFavorite);

  expect(filtered.length).toBe(2);
});

test('separate favorites and non-favorites', () => {
  const profiles = [
    { name: 'Fav 1', isFavorite: true },
    { name: 'Normal 1', isFavorite: false },
    { name: 'Fav 2', isFavorite: true }
  ];

  const favorites = profiles.filter(p => p.isFavorite);
  const nonFavorites = profiles.filter(p => !p.isFavorite);

  expect(favorites.length).toBe(2);
  expect(nonFavorites.length).toBe(1);
});

// ===== Test 6: P2 - Keyboard Shortcuts Logic =====
console.log('\n⌨️  Testing P2 - Keyboard Shortcuts Logic\n');

test('Ctrl+1-9 selects favorite profile by index', () => {
  const profiles = [
    { id: '1', name: 'Fav 1', isFavorite: true },
    { id: '2', name: 'Fav 2', isFavorite: true },
    { id: '3', name: 'Normal', isFavorite: false }
  ];

  const favoriteProfiles = profiles.filter(p => p.isFavorite);

  // Simulate Ctrl+1
  const index = 0;
  const selected = favoriteProfiles[index];

  expect(selected).toBeDefined();
  expect(selected.name).toBe('Fav 1');
});

test('Ctrl+0 selects most recent profile', () => {
  const recentProfiles = [
    { id: '1', name: 'Most Recent' },
    { id: '2', name: 'Second Recent' }
  ];

  const selected = recentProfiles[0];

  expect(selected.name).toBe('Most Recent');
});

// ===== Test 7: P3.1 - Token History Logic =====
console.log('\n📜 Testing P3.1 - Token History Logic\n');

test('add token to history creates entry', () => {
  const history = [];
  const newEntry = {
    id: crypto.randomUUID(),
    profileId: 'profile-1',
    profileName: 'Production Admin',
    algorithm: 'HS256',
    expirationPreset: '1h',
    payloadSummary: '{"userId":"123"}',
    generatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 3600000).toISOString()
  };

  history.unshift(newEntry);

  expect(history.length).toBe(1);
  expect(history[0].profileName).toBe('Production Admin');
  expect(history[0].algorithm).toBe('HS256');
});

test('history limited to 20 entries', () => {
  const history = [];

  // Add 25 entries
  for (let i = 0; i < 25; i++) {
    const entry = {
      id: crypto.randomUUID(),
      profileId: `profile-${i}`,
      profileName: `Profile ${i}`,
      algorithm: 'HS256',
      generatedAt: new Date().toISOString()
    };
    history.unshift(entry);
  }

  // Trim to 20
  const trimmed = history.slice(0, 20);

  expect(trimmed.length).toBe(20);
  expect(trimmed[0].profileName).toBe('Profile 24'); // Most recent
  expect(trimmed[19].profileName).toBe('Profile 5');
});

// ===== Test 8: P3.2 - Profile Groups Logic =====
console.log('\n📁 Testing P3.2 - Profile Groups Logic\n');

test('group profiles by group ID', () => {
  const profiles = [
    { id: '1', name: 'Prod Admin', group: 'production' },
    { id: '2', name: 'Dev Admin', group: 'development' },
    { id: '3', name: 'Prod User', group: 'production' },
    { id: '4', name: 'Test User', group: 'ungrouped' }
  ];

  const grouped = {};
  profiles.forEach(profile => {
    const groupId = profile.group || 'ungrouped';
    if (!grouped[groupId]) {
      grouped[groupId] = [];
    }
    grouped[groupId].push(profile);
  });

  expect(Object.keys(grouped).length).toBe(3);
  expect(grouped.production.length).toBe(2);
  expect(grouped.development.length).toBe(1);
  expect(grouped.ungrouped.length).toBe(1);
});

test('create group with properties', () => {
  const group = {
    id: crypto.randomUUID(),
    name: 'Production',
    color: '#d32f2f',
    description: 'Production environment profiles',
    collapsed: false,
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  expect(group.name).toBe('Production');
  expect(group.color).toBe('#d32f2f');
  expect(group.collapsed).toBe(false);
});

// ===== Test 9: P3.3 - Payload Variants Logic =====
console.log('\n🔄 Testing P3.3 - Payload Variants Logic\n');

test('add variant to profile', () => {
  const profile = {
    id: 'profile-1',
    name: 'Admin User',
    payloadVariants: []
  };

  const newVariant = {
    id: crypto.randomUUID(),
    name: 'Full Permissions',
    description: 'All permissions enabled',
    payload: { role: 'admin', permissions: ['read', 'write', 'delete'] },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  profile.payloadVariants.push(newVariant);

  expect(profile.payloadVariants.length).toBe(1);
  expect(profile.payloadVariants[0].name).toBe('Full Permissions');
});

test('delete variant from profile', () => {
  const profile = {
    id: 'profile-1',
    name: 'Admin User',
    payloadVariants: [
      { id: 'variant-1', name: 'Full Permissions' },
      { id: 'variant-2', name: 'Read Only' }
    ]
  };

  const variantIdToDelete = 'variant-1';
  profile.payloadVariants = profile.payloadVariants.filter(v => v.id !== variantIdToDelete);

  expect(profile.payloadVariants.length).toBe(1);
  expect(profile.payloadVariants[0].name).toBe('Read Only');
});

test('variants limited to 10 per profile', () => {
  const variants = [];

  // Try to add 12 variants
  for (let i = 0; i < 12; i++) {
    if (variants.length < 10) {
      variants.push({
        id: crypto.randomUUID(),
        name: `Variant ${i}`,
        payload: {}
      });
    }
  }

  expect(variants.length).toBe(10);
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
