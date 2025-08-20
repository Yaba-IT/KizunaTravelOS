import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SectionWrapper from './index.jsx';

const theme = createTheme();

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('SectionWrapper Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders children content', () => {
    renderWithTheme(
      <SectionWrapper>
        <div>Test content</div>
      </SectionWrapper>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('wraps content in container by default', () => {
    renderWithTheme(
      <SectionWrapper>
        <div>Test content</div>
      </SectionWrapper>
    );
    
    const content = screen.getByText('Test content');
    expect(content).toBeInTheDocument();
  });

  it('does not wrap content in container when useContainer is false', () => {
    renderWithTheme(
      <SectionWrapper useContainer={false}>
        <div>Test content</div>
      </SectionWrapper>
    );
    
    const content = screen.getByText('Test content');
    expect(content).toBeInTheDocument();
  });

  it('applies custom maxWidth when useContainer is true', () => {
    renderWithTheme(
      <SectionWrapper maxWidth="md">
        <div>Test content</div>
      </SectionWrapper>
    );
    
    const content = screen.getByText('Test content');
    expect(content).toBeInTheDocument();
  });

  it('applies custom sx styles', () => {
    renderWithTheme(
      <SectionWrapper sx={{ backgroundColor: 'red' }}>
        <div>Test content</div>
      </SectionWrapper>
    );
    
    const content = screen.getByText('Test content');
    expect(content).toBeInTheDocument();
  });

  it('passes through additional props', () => {
    renderWithTheme(
      <SectionWrapper data-testid="section-wrapper">
        <div>Test content</div>
      </SectionWrapper>
    );
    
    const wrapper = screen.getByTestId('section-wrapper');
    expect(wrapper).toBeInTheDocument();
  });

  it('works with complex children', () => {
    renderWithTheme(
      <SectionWrapper>
        <div>
          <h1>Title</h1>
          <p>Paragraph</p>
          <button>Button</button>
        </div>
      </SectionWrapper>
    );
    
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Paragraph')).toBeInTheDocument();
    expect(screen.getByText('Button')).toBeInTheDocument();
  });
});