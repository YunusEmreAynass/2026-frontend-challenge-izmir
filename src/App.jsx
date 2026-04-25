import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { router } from './routes';
import { setTheme, setLanguage } from './store/slices/appSlice';
import './App.css';

function App() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { theme, language } = useSelector((state) => state.app);

  const toggleTheme = () => {
    dispatch(setTheme(theme === 'light' ? 'dark' : 'light'));
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    dispatch(setLanguage(lng));
  };

  return (
  
        <div style={{ padding: '20px' }}>
          {/* React Router buradan itibaren sayfaları render eder */}
          <RouterProvider router={router} />
        </div>

  );
}

export default App;
