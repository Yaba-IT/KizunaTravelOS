import React from 'react';
import HelloWorld from '../../../components/HelloWorld';
import MenuComponent from '../../../components/NavBar';
import { AppBar, Box, Container, Toolbar } from '@mui/material';
import AdbIcon from '@mui/icons-material/Adb';
import NavBar from '../../../components/NavBar';

function HomePage() {
  return (
    <>
      <NavBar />
      <h1>Home Page</h1>
      <HelloWorld />

    </>
  );
}

export default HomePage;
