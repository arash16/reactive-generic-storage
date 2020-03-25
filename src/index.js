import createTtlStore from './ttl-storage';
import createLsStore from './local-storage';
import createSsStore from './session-storage';
import createMemoryStore from './memory-storage';

const StoreCreatorByName = {
  memory: createMemoryStore,
  ls: createLsStore,
  ss: createSsStore,
};

export default function createStore({
  store: storeType = 'ls',
  ...storeOptions
} = {}) {
  const listeners = {};
  function notify(changes) {
    const { key } = changes;
    if (listeners[key]) {
      listeners[key].forEach(handler => handler(changes));
    }
  }

  const store = createTtlStore({
    createStore: StoreCreatorByName[storeType],
    ...storeOptions,
    notify,
  });

  return {
    get: store.get,
    set: store.set,
    remove: store.remove,
    clear: store.clear,
    destroy() {
      this.off();
      store.destroy();
    },
    on(key, handler) {
      if (!listeners[key]) {
        listeners[key] = [handler];
      } else {
        listeners[key].push(handler);
      }

      // return a dispose function
      return () => this.off(key, handler);
    },
    off(key, handler) {
      if (!key) {
        // remove listeners for all keys
        Object.keys(listeners).keys.forEach(this.off);
      } else if (!handler || !listeners[key]) {
        // remove all listeners for a specific key
        delete listeners[key];
      } else {
        // remove a specific listener for a specific key
        listeners[key] = listeners[key].filter(x => x !== handler);
      }
    },
  };
}
