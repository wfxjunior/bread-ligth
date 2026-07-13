import { createRoot } from 'react-dom/client';

import App from './App';
import { ReadingSpaceProvider } from './context/reading-space-context';

import './index.css';

createRoot(document.getElementById('root')!).render(
  <ReadingSpaceProvider>
    <App />
  </ReadingSpaceProvider>,
);
