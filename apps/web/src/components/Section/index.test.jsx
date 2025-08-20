import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import Section from './index.jsx';

describe('Section Component in index.jsx', () => {
  afterEach(() => {
    cleanup();
  }),
    it('renders an <div> with the text "Section"', () => {
      render(<Section />);
      const div = screen.getByRole('div');
      expect(div).toHaveTextContent('Section');
    });
});