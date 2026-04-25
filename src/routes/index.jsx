import { createBrowserRouter } from 'react-router-dom';
// import Home from '../pages/Home';

// Burası React Router projelerinde yönlendirmelerinizi yapılandırdığınız yerdir
export const router = createBrowserRouter([
    {
        path: '/',
        element: <div>Anasayfa Rotası - Proje Hazır!</div>, // İleride <Home /> bileşenine bağlanacak
    },
    {
        path: '*',
        element: <div>404 Sayfa Bulunamadı</div>,
    }
]);
