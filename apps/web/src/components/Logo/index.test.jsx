import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import Logo from '.';

jest.mock('/src/assets/img/logo.png', () => 'logo.png');
describe('Logo Component', () => {
  afterEach(cleanup);
  it('renders the Logo with the correct src', () => {
    render(<Logo srcUrl="/src/assets/img/logo.png" />);
    const logoImage = screen.getByRole('img', { name: 'logo' });
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('src', '/src/assets/img/logo.png');
  });

});