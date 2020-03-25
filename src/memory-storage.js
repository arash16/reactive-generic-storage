export default function createMemoryStore({ notify }) {
  // it should be generic enough that keys existing on Object.prototype
  // may not put us in trouble. we don't know in what dirty ways we may use this module
  const store = Object.create(null);

  return {
    get(key) {
      return store[key];
    },
    set(key, newValue) {
      const oldValue = store[key];
      if (oldValue !== newValue) {
        store[key] = newValue;
        notify({ key, oldValue, newValue });
      }
    },
    remove(key) {
      if (key in store) {
        const oldValue = store[key];
        delete store[key];
        notify({ key, oldValue });
      }
    },
    clear() {
      this.keys().forEach(key => this.remove(key));
    },
    keys: () => Object.keys(store),
    destroy() {},
  };
}
