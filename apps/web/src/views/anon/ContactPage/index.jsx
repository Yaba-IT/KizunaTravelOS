import { Box } from '@mui/material'
import React from 'react'
import { NavBarListItems as links } from '../../../constants/NavBarListItems';
import NavBar from '../../../components/NavBar';

function ContactPage() {
  return (
    <>
        <NavBar links={links} />
        <Box>Contact page</Box>
    </>
  )
}

export default ContactPage