import { renderHook } from '@testing-library/react';
import { useFeatures } from '../../src/utils/features';

describe('features', () => {
  describe('browserRedirectConditions', () => {
    it.each([
      ['4.0.0', false],
      ['5.0.0', false],
      ['5.0.99', false],
      ['5.1.0', true],
      ['5.1.1', true],
      ['6.0.0', true],
      ['latest', true],
    ] as const)('enables browserRedirectConditions to %s for server version %s', (serverVersion, expected) => {
      const { result } = renderHook(() => useFeatures(serverVersion));

      expect(result.current.browserRedirectConditions).toBe(expected);
    });
  });
});
