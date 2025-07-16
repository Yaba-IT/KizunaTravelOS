import { createBrowserRouter } from 'react-router-dom';
import lazyLoad from '../utils/lazyLaoad';

//  Shared Views
import HomePage from '../views/anon/HomePage';
import ErrorPage from '../views/anon/ErrorPage';
import ProductsPage from '../views/anon/ProductsPage';
import ContactPage from '../views/anon/ContactPage';

const routesDefinitions = [
  //anon = no auth user
  {
    path: '/',
    isProtected: false,
    element: HomePage,
  },
  {
    path: '/products',
    isProtected: false,
    element: ProductsPage,
  },
  {
    path: '/contact',
    isProtected: false,
    element: ContactPage,
  },
];

const routes = createBrowserRouter(
  routesDefinitions.map((route) => ({
    path: route.path,
    element: lazyLoad(route.element),
    errorElement: lazyLoad(ErrorPage),
  })),
);

export default routes;
