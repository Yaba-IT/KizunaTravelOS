import React from 'react';
import {
  AppBar,
  Box,
  Button,
  Container,
  Typography,
} from '@mui/material';
import NavBtn from '../NavBtn';
import logo from '../../assets/logo.png'

function NavBar() {
  return (
    <AppBar data-testid="app-bar" position="static" sx={{ backgroundColor: "#152e44"}}>
      <Container maxWidth="xl">
        <Box sx={{ display: "flex", w: 100, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Box component={"img"} src={logo} height={65} alt={`${logo}-image`} />
          <NavBtn />
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

export default NavBar;
