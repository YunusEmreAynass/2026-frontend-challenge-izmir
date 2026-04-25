import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/Dashboard';
import Suspects from '../pages/Suspects';
import Timeline from '../pages/Timeline';
import PersonDetail from '../pages/PersonDetail';
import MapView from '../pages/MapView';

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
                element: <MapView />,
            }
        ]
    },
    {
        path: '*',
        element: <div className="p-6 text-white">404 - Page Not Found</div>,
    }
]);
