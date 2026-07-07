import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import ReaderPage from './pages/reader';
import HomePage from './pages/home';
import LibraryPage from './pages/library';
import BookPage from './pages/book';
import SearchPage from './pages/search';
import VocabularyPage from './pages/vocabulary';
import NotesPage from './pages/notes';
import FavoritesPage from './pages/favorites';
import JourneyPage from './pages/journey';
import SettingsPage from './pages/settings';
import DevotionalsPage from './pages/devotionals';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={ReaderPage} />
      <Route path="/home" component={HomePage} />
      <Route path="/library" component={LibraryPage} />
      <Route path="/book/:name" component={BookPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/vocabulary" component={VocabularyPage} />
      <Route path="/notes" component={NotesPage} />
      <Route path="/favorites" component={FavoritesPage} />
      <Route path="/journey" component={JourneyPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/devotionals" component={DevotionalsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
