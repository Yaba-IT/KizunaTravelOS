import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import SectionWapper from './index.jsx';

describe('SectionWapper Component in index.jsx', () => {
  afterEach(() => {
    cleanup();
  }),
    it('renders an <div> with the text "SectionWapper"', () => {
      render(<SectionWapper />);
      const div = screen.getByRole('div');
      expect(div).toHaveTextContent('SectionWapper');
    });
});