import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const HomePage = lazy(() => import('../pages/home/page'));
const MessagesPage = lazy(() => import('../pages/messages/page'));
const ProfilePage = lazy(() => import('../pages/profile/page'));
const TravelPage = lazy(() => import('../pages/travel/page'));
const DrinksFoodPage = lazy(() => import('../pages/drinks-food/page'));
const CellarPage = lazy(() => import('../pages/cellar/page'));
const AdminPage = lazy(() => import('../pages/admin/page'));
// ... imports
const AdminLoginPage = lazy(() => import('../pages/admin-login/page'));
const LoginPage = lazy(() => import('../pages/auth/login'));
const SignupPage = lazy(() => import('../pages/auth/signup'));
const SettingsPage = lazy(() => import('../pages/settings/page'));
const NotFound = lazy(() => import('../pages/NotFound'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  // ... rest of routes
  {
    path: '/messages',
    element: <MessagesPage />,
  },
  {
    path: '/profile',
    element: <ProfilePage />,
  },
  {
    path: '/profile/:userId',
    element: <ProfilePage />,
  },
  {
    path: '/travel',
    element: <TravelPage />,
  },
  {
    path: '/drinks-food',
    element: <DrinksFoodPage />,
  },
  {
    path: '/cellar',
    element: <CellarPage />,
  },
  {
    path: '/admin',
    element: <AdminPage />,
  },
  {
    path: '/admin/login',
    element: <AdminLoginPage />,
  },
  {
    path: '/settings',
    element: <SettingsPage />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;
