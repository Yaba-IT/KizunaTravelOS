import React from 'react';
import { render, screen } from '@testing-library/react';
import LoginPage from '.';

describe('LoginPage', () => {
  it('renders without crashing', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
