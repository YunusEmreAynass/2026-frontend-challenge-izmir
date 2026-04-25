import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import './App.css';

function App() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-gray-950 text-white">Loading...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;
