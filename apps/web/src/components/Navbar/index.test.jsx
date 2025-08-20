import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import Navbar from './index.jsx';

describe('Navbar Component in index.jsx', () => {
  afterEach(() => {
    cleanup();
  }),
    it('renders an <div> with the text "Navbar"', () => {
      render(<Navbar />);
      const div = screen.getByRole('div');
      expect(div).toHaveTextContent('Navbar');
    });
});