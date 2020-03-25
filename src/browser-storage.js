import createMemoryStore from './memory-storage';

// we may prefix keys inside storage api or we may JSON.stringify values
// but from user's viewpoint, it's just a key-value store
// with the same key, we respond the same value we were given

// we have used a memory-store internal to handle following issues:
// 1. changes to localStorage data won't call event handlers inside current tab.
// 2. localStorage/sessionStorage.clear() is not emitting events for each key separately,
// 3. browser storage apis store values as strings, so writing json and reading back
//    will result in different object references (after stringify and parsing).
// 4. there's no notion of namespace for browser storage apis, there exists only storage

function tryParse(val) {
  try {
    return val && JSON.parse(val);
  } catch (e) {}
  // we expect it to be JSON string
  // if it's not, return undefined
  return undefined;
}

export default function createBrowserStore({
  storageApi,
  namespace = 'rgs',
  notify,
  serialize = JSON.stringify,
  deserialize = tryParse,
} = {}) {
  const keyPrefix = `${namespace}:`;

  // if internal is changed, we update LS and notify outer
  const internalMemoryStore = createMemoryStore({
    notify({ key, oldValue, newValue }) {
      if (newValue === undefined) {
        storageApi.removeItem(keyPrefix + key);
      } else {
        storageApi.setItem(keyPrefix + key, serialize(newValue));
      }
      notify({ key, oldValue, newValue });
    },
  });

  // initialize internal storage just once
  for (const key in storageApi) {
    if (key.startsWith(keyPrefix)) {
      internalMemoryStore.set(
        key.substring(keyPrefix.length),
        deserialize(storageApi.getItem(key))
      );
    }
  }

  // if LS is changed (another window?), we update internal
  // and internal will notify upper handler, and that notifies outer
  const storageHandler = ({ key, oldValue, newValue }) => {
    if (!key) {
      // storageApi.clear() is called
      internalMemoryStore.clear();
    } else if (oldValue !== newValue && key.startsWith(keyPrefix)) {
      const actualKey = key.substring(keyPrefix.length);

      if (newValue == null) {
        internalMemoryStore.remove(actualKey);
      } else {
        internalMemoryStore.set(actualKey, deserialize(newValue));
      }
    }
  };

  if (typeof notify === 'function') {
    window.addEventListener('storage', storageHandler);
  }

  // everything else works directly with internal storage
  return {
    get: internalMemoryStore.get,
    set: internalMemoryStore.set,
    remove: internalMemoryStore.remove,
    clear: internalMemoryStore.clear,
    keys: internalMemoryStore.keys,
    destroy() {
      window.removeEventListener('storage', storageHandler);
    },
  };
}
