import { createBrowserRouter } from 'react-router-dom';
import lazyLoad from '../utils/lazyLaoad';

//  Shared Views
import HomePage from '../views/anon/HomePage';
import ErrorPage from '../views/anon/ErrorPage';

const routesDefinitions = [
  //anon = no auth user
  {
    path: '/',
    isProtected: false,
    element: HomePage,
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
