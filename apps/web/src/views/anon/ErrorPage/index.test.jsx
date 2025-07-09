import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import ErrorPage from '.';
import ErrorMessage from '../../../components/ErrorMessage';

describe('ErrorPage', () => {
  afterEach(cleanup);

  it('renders a level-1 heading with the error message', () => {
    render(<ErrorPage />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Error Page...');
  });

  it('renders the ErrorMesage component inside', () => {
    render(<ErrorMessage />);
    const errorText = screen.getByText('404 NOT FOUND');
    expect(errorText).toBeInTheDocument();
  });
});
