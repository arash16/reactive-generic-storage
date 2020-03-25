import createBrowserStore from './browser-storage';

export default function createSsStore(options) {
  return createBrowserStore({
    ...options,
    storageApi: sessionStorage,
  });
}
