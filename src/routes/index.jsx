import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/Dashboard';
import Suspects from '../pages/Suspects';
import Timeline from '../pages/Timeline';
import PersonDetail from '../pages/PersonDetail';

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
                element: <Suspects />,
            },
            {
                path: 'suspects/:id',
                element: <PersonDetail />,
            },
            {
                path: 'timeline',
                element: <Timeline />,
            },
            {
                path: 'map',
                element: <div className="p-6">Map page (TBD)</div>,
            }
        ]
    },
    {
        path: '*',
        element: <div className="p-6 text-white">404 - Page Not Found</div>,
    }
]);
