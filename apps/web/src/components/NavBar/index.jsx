import React from 'react';
import {
  AppBar,
  Box,
  Container,
} from '@mui/material';
import AdbIcon from '@mui/icons-material/Adb';
import NavBtn from '../NavBtn';

function NavBar() {
  return (
    <AppBar data-testid="app-bar" position="static">
      <Container maxWidth="xl">
        <Box disableGutters sx={{ display: "flex", w: 100, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <AdbIcon />
          <NavBtn />
        </Box>
      </Container>
    </AppBar>
  );
}

export default NavBar;
