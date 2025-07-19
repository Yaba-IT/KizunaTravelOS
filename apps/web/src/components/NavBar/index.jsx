import React, { Suspense } from 'react';
import {
  AppBar,
  Box,
  Button,
  Container,
  Typography,
} from '@mui/material';
import NavBtn from '../NavBtn';
import PropTypes from 'prop-types';
import lazyLoad from '../../utils/lazyLaoad';
import Logo from '../Logo';
function NavBar({ logo, navigationElements }, ...props) {

  return (
    <AppBar data-testid="app-bar" position="static" sx={{ backgroundColor: "#152e44" }}>
      <Container maxWidth="xl">
        <Box sx={{ display: "flex", w: 100, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          {logo && lazyLoad(() => (<Logo srcUrl={logo} height={65} />))}
          <NavBtn links={navigationElements} />
          <Button
            variant="contained"
            sx={{ display: { xs: "none", md: "block" }, borderRadius: 10, textTransform: "capitalize", px: 3, py: 1, backgroundColor: "#f4bb3a", color: "white" }}
            disableElevation
          >
            <Typography variant='body1' sx={{ textTransform: "capitalize" }} color='inherit'>
              Connexion
            </Typography>
          </Button>
        </Box>
      </Container>
    </AppBar>
  );
}

NavBar.propTypes = {
  logo: PropTypes.elementType,
  navigationElements: PropTypes.array,
};

export default NavBar;
