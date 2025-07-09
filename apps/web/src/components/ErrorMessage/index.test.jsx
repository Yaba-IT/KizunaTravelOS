import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import ErrorMessage from './index.jsx';

describe('ErrorMessage Component in index.jsx', () => {
  afterEach(() => {
    cleanup();
  }),
    it('renders a h3 with the text "404 NOT FOUND"', () => {
      render(<ErrorMessage />);
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('404 NOT FOUND');
    });
});
