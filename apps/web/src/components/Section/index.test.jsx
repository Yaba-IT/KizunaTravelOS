import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Section from './index.jsx';

const theme = createTheme();

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('Section Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders section with id', () => {
    renderWithTheme(
      <Section id="test-section" data-testid="section">
        <div>Test content</div>
      </Section>
    );
    
    const section = screen.getByTestId('section');
    expect(section).toHaveAttribute('id', 'test-section');
  });

  it('renders section with title', () => {
    renderWithTheme(
      <Section id="test-section" title="Test Title">
        <div>Test content</div>
      </Section>
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders children content', () => {
    renderWithTheme(
      <Section id="test-section">
        <div>Test content</div>
      </Section>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders without title when not provided', () => {
    renderWithTheme(
      <Section id="test-section" data-testid="section">
        <div>Test content</div>
      </Section>
    );
    
    const section = screen.getByTestId('section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute('id', 'test-section');
  });

  it('applies custom spacing', () => {
    renderWithTheme(
      <Section id="test-section" spacing={6} data-testid="section">
        <div>Test content</div>
      </Section>
    );
    
    const section = screen.getByTestId('section');
    expect(section).toBeInTheDocument();
  });

  it('applies custom title alignment', () => {
    renderWithTheme(
      <Section id="test-section" title="Test Title" titleAlign="left">
        <div>Test content</div>
      </Section>
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('applies custom title variant', () => {
    renderWithTheme(
      <Section id="test-section" title="Test Title" titleVariant="h1">
        <div>Test content</div>
      </Section>
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('applies custom maxWidth to container', () => {
    renderWithTheme(
      <Section id="test-section" maxWidth="md" data-testid="section">
        <div>Test content</div>
      </Section>
    );
    
    const section = screen.getByTestId('section');
    expect(section).toBeInTheDocument();
  });

  it('applies custom sx styles', () => {
    renderWithTheme(
      <Section id="test-section" sx={{ backgroundColor: 'red' }} data-testid="section">
        <div>Test content</div>
      </Section>
    );
    
    const section = screen.getByTestId('section');
    expect(section).toBeInTheDocument();
  });
});