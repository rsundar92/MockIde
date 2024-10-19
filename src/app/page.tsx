import ErrorBoundary from '@/components/ErrorBoundary';
import { MockIDE } from '@/components/vscode-clone';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  return (
    <div className="">
      <ErrorBoundary>
        <MockIDE />
      </ErrorBoundary>
      <ToastContainer />
    </div>
  );
}
