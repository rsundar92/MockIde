import ErrorBoundary from '@/components/ErrorBoundary';
import { MockIDE } from '@/components/MockIDE';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  return (
    <div>
      <ErrorBoundary>
        <MockIDE />
      </ErrorBoundary>
      <ToastContainer />
    </div>
  );
}
