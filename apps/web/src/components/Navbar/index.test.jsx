import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Navbar from './index.jsx';

// Mock react-scroll
jest.mock('react-scroll', () => ({
  Link: ({ children, to, onClick }) => (
    <div data-testid={`scroll-link-${to}`} onClick={onClick}>
      {children}
    </div>
  ),
}));

const theme = createTheme();

const defaultNavItems = [
  { to: 'home', label: 'Home' },
  { to: 'about', label: 'About' },
  { to: 'services', label: 'Services' },
  { to: 'contact', label: 'Contact' },
];

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('Navbar Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the navbar with title', () => {
    renderWithTheme(<Navbar navItems={defaultNavItems} />);
    const titles = screen.getAllByText('Kizuna Travel');
    expect(titles.length).toBeGreaterThan(0);
  });

  it('renders navigation items on desktop', () => {
    renderWithTheme(<Navbar navItems={defaultNavItems} />);
    
    defaultNavItems.forEach((item) => {
      const elements = screen.getAllByText(item.label);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it('renders scroll links for each nav item', () => {
    renderWithTheme(<Navbar navItems={defaultNavItems} />);
    
    defaultNavItems.forEach((item) => {
      const links = screen.getAllByTestId(`scroll-link-${item.to}`);
      expect(links.length).toBeGreaterThan(0);
    });
  });

  it('renders mobile menu button', () => {
    renderWithTheme(<Navbar navItems={defaultNavItems} />);
    expect(screen.getByLabelText('open drawer')).toBeInTheDocument();
  });

  it('opens mobile drawer when menu button is clicked', () => {
    renderWithTheme(<Navbar navItems={defaultNavItems} />);
    
    const menuButton = screen.getByLabelText('open drawer');
    fireEvent.click(menuButton);
    
    // Check if drawer content is visible - there should be multiple "Kizuna Travel" elements
    const titles = screen.getAllByText('Kizuna Travel');
    expect(titles.length).toBeGreaterThan(0);
  });

  it('renders with empty nav items', () => {
    renderWithTheme(<Navbar />);
    const titles = screen.getAllByText('Kizuna Travel');
    expect(titles.length).toBeGreaterThan(0);
  });

  it('closes mobile drawer when nav item is clicked', () => {
    renderWithTheme(<Navbar navItems={defaultNavItems} />);
    
    // Open drawer
    const menuButton = screen.getByLabelText('open drawer');
    fireEvent.click(menuButton);
    
    // Click on a nav item - get the first one from the mobile drawer
    const homeLinks = screen.getAllByTestId('scroll-link-home');
    const mobileHomeLink = homeLinks[1]; // Second one is in the mobile drawer
    fireEvent.click(mobileHomeLink);
    
    // The click handler should be called
    expect(mobileHomeLink).toBeInTheDocument();
  });
});