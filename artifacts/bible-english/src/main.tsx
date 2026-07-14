import { createRoot } from 'react-dom/client';

import App from './App';
import { AtmosphereProvider } from './context/atmosphere-context';
import { ReadingSpaceProvider } from './context/reading-space-context';
import { LanguageProvider } from './context/language-context';

import './index.css';

createRoot(document.getElementById('root')!).render(
  <LanguageProvider>
    <AtmosphereProvider>
      <ReadingSpaceProvider>
        <App />
      </ReadingSpaceProvider>
    </AtmosphereProvider>
  </LanguageProvider>,
);
