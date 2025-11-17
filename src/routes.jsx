import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Loader from './components/Loader/Loader';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from 'components/ProtectedRoute';
import { BASE_URL } from './config/constant';

export const renderRoutes = (routes = []) => (
  <Suspense fallback={<Loader />}>
    <Routes>
      {routes.map((route, i) => {
        const Guard = route.guard || React.Fragment;
        const Layout = route.layout || React.Fragment;
        const Element = route.element;

        return (
          <Route
            key={i}
            path={route.path}
            element={
              <Guard>
                <Layout>{route.routes ? renderRoutes(route.routes) : <Element />}</Layout>
              </Guard>
            }
          />
        );
      })}
    </Routes>
  </Suspense>
);

const routes = [
  {
    path: '/login',
    element: lazy(() => import('./views/auth/signin/SignIn1'))
  },
  {
    path: '/auth/reset-password',
    element: lazy(() => import('./views/auth/reset/sendresetlink'))
  },
  {
    path: '/auth/reset-password/:token',
    element: lazy(() => import('./views/auth/reset/adminresetpassword'))
  },
  {
    path: '/student/reset/:token',
    element: lazy(() => import('./views/auth/reset/resetpassword'))
  },
  {
    path: '/chat/individual',
    layout: AdminLayout,
    guard: ProtectedRoute,
    routes: [{ exact: true, path: '/', element: lazy(() => import('./views/chat/chat-ts/src/index')) }]
  },
  {
    path: '*',
    layout: AdminLayout,
    guard: ProtectedRoute,
    routes: [
      {
        exact: true,
        path: '/dashboard',
        element: lazy(() => import('./views/dashboard'))
      },
      {
        exact: true,
        path: '/students/enrollment',
        element: lazy(() => import('./views/students/Enrollment'))
      },
      {
        exact: true,
        path: '/students/groups',
        element: lazy(() => import('./views/students/Groups'))
      },
      {
        exact: true,
        path: '/students/details',
        element: lazy(() => import('./views/students/Details'))
      },
      {
        exact: true,
        path: '/students/attendance',
        element: lazy(() => import('./views/students/Attendance'))
      },
      {
        exact: true,
        path: '/students/create-friday-practice',
        element: lazy(() => import('./views/students/CreateFridayPractice'))
      },
      {
        exact: true,
        path: '/programs/create',
        element: lazy(() => import('./views/programs/Create'))
      },
      {
        exact: true,
        path: '/programs/schedules',
        element: lazy(() => import('./views/programs/Schedules'))
      },
      {
        exact: true,
        path: '/programs/details',
        element: lazy(() => import('./views/programs/Details'))
      },
      {
        exact: true,
        path: '/announcements/create',
        element: lazy(() => import('./views/announcements/Create'))
      },
      {
        exact: true,
        path: '/setting',
        element: lazy(() => import('./views/setting/index'))
      },
      {
        exact: true,
        path: '/announcements/view',
        element: lazy(() => import('./views/announcements/View'))
      },
      {
        exact: true,
        path: '/media/master-list',
        element: lazy(() => import('./views/media/MasterList'))
      },
      {
        exact: true,
        path: '/media/upload',
        element: lazy(() => import('./views/media/Upload'))
      },
      {
        exact: true,
        path: '/media/edit/:id/:week',
        element: lazy(() => import('./views/media/EditVideo'))
      },
      {
        exact: true,
        path: '/support/chat',
        element: lazy(() => import('./views/support/Chat'))
      },
      {
        exact: true,
        path: '/support/bug-reports',
        element: lazy(() => import('./views/support/BugReports'))
      },
      {
        exact: true,
        path: '/static-content/manage',
        element: lazy(() => import('./views/staticContent/Manage'))
      },
      {
        exact: true,
        path: '/static-content/links',
        element: lazy(() => import('./views/staticContent/Links'))
      },

      /**additional routes */
      {
        exact: true,
        path: '/app/dashboard/default',
        element: lazy(() => import('./views/dashboard'))
      },
      {
        exact: true,
        path: '/basic/button',
        element: lazy(() => import('./views/ui-elements/basic/BasicButton'))
      },
      {
        exact: true,
        path: '/basic/badges',
        element: lazy(() => import('./views/ui-elements/basic/BasicBadges'))
      },
      {
        exact: true,
        path: '/basic/breadcrumb-paging',
        element: lazy(() => import('./views/ui-elements/basic/BasicBreadcrumb'))
      },
      {
        exact: 'true',
        path: '/basic/collapse',
        element: lazy(() => import('./views/ui-elements/basic/BasicCollapse'))
      },
      {
        exact: 'true',
        path: '/basic/tabs-pills',
        element: lazy(() => import('./views/ui-elements/basic/BasicTabsPills'))
      },
      {
        exact: 'true',
        path: '/basic/typography',
        element: lazy(() => import('./views/ui-elements/basic/BasicTypography'))
      },
      {
        exact: 'true',
        path: '/forms/form-basic',
        element: lazy(() => import('./views/forms/FormsElements'))
      },
      {
        exact: 'true',
        path: '/tables/bootstrap',
        element: lazy(() => import('./views/tables/BootstrapTable'))
      },
      {
        exact: 'true',
        path: '/charts/nvd3',
        element: lazy(() => import('./views/charts/nvd3-chart'))
      },
      {
        exact: 'true',
        path: '/maps/google-map',
        element: lazy(() => import('./views/maps/GoogleMaps'))
      },
      {
        exact: 'true',
        path: '/sample-page',
        element: lazy(() => import('./views/extra/SamplePage'))
      },
      {
        path: '*',
        exact: 'true',
        element: () => <Navigate to={BASE_URL} />
      }
    ]
  }
];

export default routes;
