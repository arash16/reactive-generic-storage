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
  const allListeners = [];
  const listeners = {};
  function notify(changes) {
    const { key } = changes;
    if (listeners[key]) {
      listeners[key].forEach(handler => handler(changes));
    }
    allListeners.forEach(handler => handler(changes));
  }

  const store = createTtlStore({
    createStore: StoreCreatorByName[storeType],
    ...storeOptions,
    notify,
  });

  return {
    ...store,
    destroy() {
      this.off();
      store.destroy();
    },
    on(key, handler) {
      if (typeof key === 'function') {
        // listen for all keys
        allListeners.push(key);
        return () => this.off(key);
      }

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
        Object.keys(listeners).forEach(this.off);
      } else if (!handler) {
        if (typeof key === 'function') {
          // remove listener of all keys
          const ind = allListeners.indexOf(key);
          if (ind >= 0) allListeners.splice(ind, 1);
        } else {
          // remove all listeners for a specific key
          delete listeners[key];
        }
      } else if (!listeners[key]) {
        // remove a specific listener for a specific key
        listeners[key] = listeners[key].filter(x => x !== handler);
      }
    },
  };
}
