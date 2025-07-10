import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Menu,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NavBtnItem from '../NavBtnItem';
import NavBtnList from '../NavBtnList';
import { NavBarListItems as Links } from '../../constants/NavBarListItems';


function NavBtn() {
  const [anchorElNav, setAnchorElNav] = useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };


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
          <NavBtnList lists={Links} handleCloseNavMenu={handleCloseNavMenu}/>
        </Menu>
      </Box>
      <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
        {Links.map(({name, target, sub}, key) => (
          <NavBtnItem key={key} name={name} target={target} sub={sub} />
        ))}
      </Box>
    </>);
}

export default NavBtn;
