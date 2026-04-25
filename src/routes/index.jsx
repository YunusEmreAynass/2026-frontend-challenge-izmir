import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/Dashboard';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <Dashboard />
            },
            {
                path: 'suspects',
                element: <div className="p-6">Suspects page (TBD)</div>,
            },
            {
                path: 'timeline',
                element: <div className="p-6">Timeline page (TBD)</div>,
            },
            {
                path: 'map',
                element: <div className="p-6">Map page (TBD)</div>,
            },
            {
                path: 'suspects/:id',
                element: <div className="p-6">Person Detail (TBD)</div>,
            }
        ]
    },
    {
        path: '*',
        element: <div className="p-6 text-white">404 - Page Not Found</div>,
    }
]);
