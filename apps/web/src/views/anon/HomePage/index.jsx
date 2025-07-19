import React from 'react';
import HelloWorld from '../../../components/HelloWorld';
import { PublicLayout } from '../../../utils/layouts.jsx';

function HomePage() {
  return (
    <PublicLayout>
      <h1>Home Page</h1>
      <HelloWorld />
    </PublicLayout>
  );
}

export default HomePage;
