import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import HomePage from '.';

describe('HomePage component', () => {
  afterEach(cleanup);

  it('renders the main heading', () => {
    render(<HomePage />);
    const mainHeading = screen.getByRole('heading', { level: 1, name: 'Home Page' });
    expect(mainHeading).toBeInTheDocument();
  });

  it('renders the HelloWorld component inside', () => {
    render(<HomePage />);
    const helloText = screen.getByText('Hello World!');
    expect(helloText).toBeInTheDocument();
  });
});
