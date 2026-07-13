import { createRoot } from 'react-dom/client';

import App from './App';
import { AtmosphereProvider } from './context/atmosphere-context';
import { ReadingSpaceProvider } from './context/reading-space-context';

import './index.css';

createRoot(document.getElementById('root')!).render(
  <AtmosphereProvider>
    <ReadingSpaceProvider>
      <App />
    </ReadingSpaceProvider>
  </AtmosphereProvider>,
);
