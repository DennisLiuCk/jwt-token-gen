/**
 * Mock for electron-store
 * Provides in-memory storage for testing
 */

class Store {
  constructor(options = {}) {
    this.name = options.name || 'mock-store';
    this.defaults = options.defaults || {};
    this.store = { ...this.defaults };
  }

  get(key, defaultValue) {
    if (key === undefined) {
      return this.store;
    }

    const value = this.store[key];
    return value !== undefined ? value : defaultValue;
  }

  set(key, value) {
    if (typeof key === 'object') {
      this.store = { ...this.store, ...key };
    } else {
      this.store[key] = value;
    }
  }

  has(key) {
    return key in this.store;
  }

  delete(key) {
    delete this.store[key];
  }

  clear() {
    this.store = { ...this.defaults };
  }

  reset(...keys) {
    if (keys.length === 0) {
      this.store = { ...this.defaults };
    } else {
      keys.forEach(key => {
        if (key in this.defaults) {
          this.store[key] = this.defaults[key];
        } else {
          delete this.store[key];
        }
      });
    }
  }

  get size() {
    return Object.keys(this.store).length;
  }

  get store() {
    return this._store;
  }

  set store(value) {
    this._store = value;
  }

  onDidChange(key, callback) {
    // Mock implementation - doesn't actually watch for changes
    return () => {}; // Return unsubscribe function
  }

  onDidAnyChange(callback) {
    // Mock implementation
    return () => {};
  }

  openInEditor() {
    // Mock implementation
  }

  get path() {
    return `/mock/path/to/${this.name}.json`;
  }
}

module.exports = Store;
