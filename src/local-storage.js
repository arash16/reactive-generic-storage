import createBrowserStore from './browser-storage';

export default function createLsStore(options) {
  return createBrowserStore({
    ...options,
    storageApi: localStorage,
  });
}
