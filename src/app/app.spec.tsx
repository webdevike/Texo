import { BaseProvider } from '@texo/ui';
import { render } from '@testing-library/react';

import App from './app';

describe('App', () => {
  it('should render search, button navigation, and button examples', () => {
    const { getByRole } = render(
      <BaseProvider>
        <App />
      </BaseProvider>,
    );

    expect(getByRole('textbox', { name: 'Search' })).toBeTruthy();
    expect(getByRole('heading', { name: 'Buttons' })).toBeTruthy();
    expect(getByRole('button', { name: 'Large' })).toBeTruthy();
    expect(getByRole('button', { name: 'Medium' })).toBeTruthy();
    expect(getByRole('button', { name: 'Small' })).toBeTruthy();
  });
});
