import { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AdbIcon from '@mui/icons-material/Adb';
import NavBtn from '../NavBtn';


const pages = ['Products', 'Pricing', 'Blog'];

function NavBar() {
  const [anchorElNav, setAnchorElNav] = useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Box disableGutters sx={{ display: "flex", w: 100, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <AdbIcon />
            <NavBtn />
          </Box>
        </Container>
      </AppBar>
    </>);
}

export default NavBar;
