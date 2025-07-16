import React from 'react';
import HelloWorld from '../../../components/HelloWorld';
import NavBar from '../../../components/NavBar';
import { NavBarListItems as links } from '../../../constants/NavBarListItems';

function HomePage() {
  return (
    <>
      <NavBar links={links} />
      <h1>Home Page</h1>
      <HelloWorld />

    </>
  );
}

export default HomePage;
