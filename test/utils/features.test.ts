import { getFeaturesForVersion, supportedFeatures } from '../../src/utils/features';

describe('features', () => {
  it('REQ-1 registers browserRedirectConditions in supportedFeatures with minimum version 5.1.0', () => {
    expect(supportedFeatures.browserRedirectConditions).toEqual({ minVersion: '5.1.0' });
  });

  it('REQ-1 enables browserRedirectConditions for server version 5.1.0', () => {
    const features = getFeaturesForVersion('5.1.0');

    expect(features).toHaveProperty('browserRedirectConditions', true);
  });

  it('REQ-1 disables browserRedirectConditions for server version 5.0.0', () => {
    const features = getFeaturesForVersion('5.0.0');

    expect(features).toHaveProperty('browserRedirectConditions', false);
  });

  it('REQ-1 includes browserRedirectConditions in the feature map from getFeaturesForVersion', () => {
    const features = getFeaturesForVersion('5.1.0');

    expect(Object.keys(features)).toContain('browserRedirectConditions');
  });
});
