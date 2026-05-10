import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import DownloadPopup from './components/DownloadPopup';

function App() {
  return (
    <>
      <AppRoutes />
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <DownloadPopup />
    </>
  );
}

export default App;
