import { screen } from '@testing-library/react';
import { createElement, type FC } from 'react';
import type { Feature } from '../../src/utils/features';
import { useFeatures } from '../../src/utils/features';
import { renderWithEvents } from '../__helpers__/setUpTest';

const FeaturesSnapshot: FC<{ serverVersion: '5.0.0' | '5.1.0' }> = ({ serverVersion }) => {
  const features = useFeatures(serverVersion);

  return createElement('div', { 'data-testid': 'features-json' }, JSON.stringify(features));
};

describe('features', () => {
  const renderFeaturesForVersion = (serverVersion: '5.0.0' | '5.1.0') => {
    renderWithEvents(createElement(FeaturesSnapshot, { serverVersion }));
    return JSON.parse(screen.getByTestId('features-json').textContent ?? '{}') as Record<Feature, boolean>;
  };

  it('REQ-1 enables browserRedirectConditions for server version 5.1.0', () => {
    const features = renderFeaturesForVersion('5.1.0');

    expect(features).toHaveProperty('browserRedirectConditions', true);
  });

  it('REQ-1 disables browserRedirectConditions for server version 5.0.0', () => {
    const features = renderFeaturesForVersion('5.0.0');

    expect(features).toHaveProperty('browserRedirectConditions', false);
  });

  it('REQ-1 includes browserRedirectConditions in the feature map from getFeaturesForVersion', () => {
    const features = renderFeaturesForVersion('5.1.0');

    expect(Object.keys(features)).toContain('browserRedirectConditions');
  });
});
