import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as ScrollLink } from 'react-scroll';
import PropTypes from 'prop-types';

function Navbar({ navItems = [] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavClick = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Kizuna Travel
      </Typography>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.to} disablePadding>
            <ScrollLink
              to={item.to}
              spy={true}
              smooth={true}
              offset={-64}
              duration={500}
              onClick={handleNavClick}
              style={{ width: '100%', textDecoration: 'none', color: 'inherit' }}
            >
              <ListItemText
                primary={item.label}
                sx={{
                  textAlign: 'center',
                  '& .MuiListItemText-primary': {
                    cursor: 'pointer',
                    '&:hover': {
                      color: 'primary.main',
                    },
                  },
                }}
              />
            </ScrollLink>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', md: 'block' } }}
          >
            Kizuna Travel
          </Typography>
          
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {navItems.map((item) => (
              <ScrollLink
                key={item.to}
                to={item.to}
                spy={true}
                smooth={true}
                offset={-64}
                duration={500}
                style={{ textDecoration: 'none' }}
              >
                <Button
                  sx={{
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              </ScrollLink>
            ))}
          </Box>
          
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Toolbar spacer to prevent content from hiding behind fixed navbar */}
      <Toolbar />
    </>
  );
}

Navbar.propTypes = {
  navItems: PropTypes.arrayOf(
    PropTypes.shape({
      to: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
};

export default Navbar;