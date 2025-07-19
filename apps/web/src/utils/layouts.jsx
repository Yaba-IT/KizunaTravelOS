import * as React from 'react'
import NavBar from '../components/NavBar'
import navbarItemsLists from '../constants/navbarItemsLists'
import { Box } from '@mui/material'


// en tapan le code demo je me rend compte que on auras plusieur navbarElement (Public, Private, Admin, etc...) a modifier plus tard
function PublicLayout ({ children, ...props}) { 
  return (
    <>
      <NavBar logo={navbarItemsLists.logo} navigationElements={navbarItemsLists.navigationElements} />
      <Box component={"main"} px={8} py={4} {...props}>
        {children}
      </Box>
    </>
  )
}

export { PublicLayout }