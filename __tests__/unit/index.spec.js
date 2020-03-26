import rgs from '@/index.js';

describe('rgs', () => {
  it('should get what is set', () => {
    const store = rgs({ store: 'memory' });
    const value = {};
    store.set('key', value);
    expect(store.get('key')).toBe(value);
  });

  it('should return keys', () => {
    const store = rgs({ store: 'memory' });
    store.set('k1', 1);
    store.set('k2', 2);
    store.set('k3', 3);
    expect(store.keys().sort()).toEqual(['k1', 'k2', 'k3']);
  });
});
