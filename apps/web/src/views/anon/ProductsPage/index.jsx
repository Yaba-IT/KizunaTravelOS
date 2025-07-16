import { Box } from '@mui/material'
import React from 'react'
import { NavBarListItems as links } from '../../../constants/NavBarListItems';
import NavBar from '../../../components/NavBar';

function ProductsPage() {
  return (
    <>
      <NavBar links={links} />
      <Box>Products page</Box>
    </>
  )
}

export default ProductsPage