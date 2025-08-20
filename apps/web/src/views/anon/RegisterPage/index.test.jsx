import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import RegisterPage from './index.jsx';

describe('RegisterPage Component in index.jsx', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders an <h1> with the text "Register Page"', () => {
    render(<RegisterPage />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Register Page');
  });

  it('renders a paragraph with registration page text', () => {
    render(<RegisterPage />);
    const paragraph = screen.getByText('This is the registration page component.');
    expect(paragraph).toBeInTheDocument();
  });
});
