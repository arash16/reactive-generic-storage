import rgs from '@/index.js';

describe('rgs', () => {
  it('should get what is set', () => {
    const store = rgs({ store: 'memory' });
    const value = {};
    store.set('key', value);
    expect(store.get('key')).toBe(value);
  });
});
