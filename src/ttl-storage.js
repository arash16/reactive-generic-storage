// we need to ensure whatever comes in, goes out with the same shape!
// storing as {e,v} is an internal representation of this file,
// but from user's viewpoint, it's just a key-value store
// with the same key, we respond the same value we were given

export default function createTtlStore({
  createStore,
  defaultTtl,
  notify,
  ...storeOptions
}) {
  const internalStore = createStore({
    ...storeOptions,
    notify({ key, oldValue = {}, newValue = {} }) {
      notify({
        key,
        oldValue: oldValue.v,
        newValue: newValue.v,
      });
    },
  });

  const timers = {};
  function scheduleRemove(key, ttl) {
    if (!timers[key]) {
      timers[key] = setTimeout(() => {
        delete timers[key];
        internalStore.remove(key);
      }, ttl);
    }
  }

  function clearSchedule(key) {
    if (timers[key]) {
      clearTimeout(timers[key]);
      delete timers[key];
    }
  }

  const ttlStore = {
    ...internalStore,
    get(key) {
      const ev = internalStore.get(key);
      if (ev) {
        const { e, v } = ev;
        if (e < Date.now()) {
          // when e is not a number, this is not executed
          internalStore.remove(key);
        } else {
          if (isFinite(e)) {
            scheduleRemove(key, e - Date.now());
          }
          return v;
        }
      }
      return undefined;
    },
    set(key, v, { ttl } = {}) {
      // third argument could be provided to set default ttl to none
      const actualTtl = +(arguments.length === 3 ? ttl : defaultTtl);
      const e = isFinite(actualTtl) ? Date.now() + actualTtl : undefined;
      internalStore.set(key, { e, v });

      if (isFinite(actualTtl)) {
        scheduleRemove(key, actualTtl);
      } else {
        clearSchedule(key);
      }
    },
    remove(key) {
      clearSchedule(key);
      internalStore.remove(key);
    },
  };

  // make sure everything initialized is scheduled to be removed
  ttlStore.keys().forEach(key => ttlStore.get(key));

  return ttlStore;
}
