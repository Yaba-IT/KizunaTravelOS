import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import ErrorPage from '.';

describe('ErrorPage', () => {
  afterEach(cleanup);

  it('renders a level-1 heading with the error message', () => {
    render(<ErrorPage />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Error loading...');
  });
});
