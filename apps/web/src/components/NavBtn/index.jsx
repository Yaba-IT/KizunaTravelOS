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
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import Shevron from '../Shevron';
import NavBtnV2 from '../NavBtnV2';

const Links = [
  {
    name: "Home",
    target: "/",
    sub: null
  },
  {
    name: "Service",
    target: "product",
    sub: [
      {
        name: "cloud",
        target: "/product/cloud"
      }
    ]
  },
  {
    name: "Contact us",
    target: "contactUs",
    sub: null
  },
]

function NavBtn() {
  const [anchorElNav, setAnchorElNav] = useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleClick = (event) => {
    handleCloseNavMenu(event)

  };

  const [openDetail, setOpenDetail] = useState(false)

  return (
    <>
      <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleOpenNavMenu}
          color="inherit"
        >
          <MenuIcon />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorElNav}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          open={Boolean(anchorElNav)}
          onClose={handleCloseNavMenu}
          sx={{ display: { xs: 'block', md: 'none' } }}
        >
          {Links.map((linkItem, key) => (
          <NavBtnV2 key={key} elements={linkItem} />
        ))}
        </Menu>
      </Box>
      <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
        {Links.map((linkItem, key) => (
          <NavBtnV2 key={key} elements={linkItem} />
        ))}
      </Box>
    </>);
}

export default NavBtn;
