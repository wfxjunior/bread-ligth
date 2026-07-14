import { useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ClerkProvider, SignIn, SignUp, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { useLanguage } from './context/language-context';

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

// REQUIRED — copy verbatim. Resolves the key from window.location.hostname so the
// same build serves multiple Clerk custom domains. Do not inline the env var, leave
// publishableKey undefined, or replace publishableKeyFromHost with anything else.
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

// REQUIRED — copy verbatim. Empty in dev (Clerk hits dev FAPI directly), auto-set
// in prod. Do NOT gate on import.meta.env.PROD / NODE_ENV — the empty dev value
// is intentional, and any branching breaks the prod proxy.
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

// Clerk passes full paths to routerPush/routerReplace, but wouter's
// setLocation prepends the base — strip it to avoid doubling.
function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || '/'
    : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: 'hsl(353 43% 30%)',
    colorForeground: 'hsl(21 18% 19%)',
    colorMutedForeground: 'hsl(21 10% 45%)',
    colorDanger: 'hsl(0 84% 60%)',
    colorBackground: 'hsl(36 40% 99%)',
    colorInput: 'hsl(36 33% 97%)',
    colorInputForeground: 'hsl(21 18% 19%)',
    colorNeutral: 'hsl(36 20% 88%)',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '0.5rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-[hsl(36,40%,99%)] border border-[hsl(36,20%,88%)] shadow-lg rounded-2xl w-[440px] max-w-full overflow-hidden',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'font-serif text-2xl text-[hsl(21,18%,19%)]',
    headerSubtitle: 'text-[hsl(21,10%,45%)]',
    socialButtonsBlockButtonText: 'text-[hsl(21,18%,19%)] font-medium',
    formFieldLabel: 'text-[hsl(21,18%,19%)] font-medium',
    footerActionLink: 'text-[hsl(353,43%,30%)] font-medium hover:text-[hsl(353,43%,25%)]',
    footerActionText: 'text-[hsl(21,10%,45%)]',
    dividerText: 'text-[hsl(21,10%,45%)]',
    identityPreviewEditButton: 'text-[hsl(353,43%,30%)]',
    formFieldSuccessText: 'text-[hsl(21,10%,45%)]',
    alertText: 'text-[hsl(21,18%,19%)]',
    logoBox: 'mb-2',
    logoImage: 'h-12 w-12',
    socialButtonsBlockButton: 'border border-[hsl(36,20%,88%)] hover:bg-[hsl(36,25%,90%)]',
    formButtonPrimary: 'bg-[hsl(353,43%,30%)] hover:bg-[hsl(353,43%,25%)] text-[hsl(36,33%,97%)]',
    formFieldInput: 'bg-[hsl(36,33%,97%)] border border-[hsl(36,20%,88%)] text-[hsl(21,18%,19%)]',
    footerAction: 'text-[hsl(21,10%,45%)]',
    dividerLine: 'bg-[hsl(36,20%,88%)]',
    alert: 'border border-[hsl(0,84%,60%)]/30 bg-[hsl(0,84%,60%)]/5',
    otpCodeFieldInput: 'border border-[hsl(36,20%,88%)] text-[hsl(21,18%,19%)]',
    formFieldRow: '',
    main: '',
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

// Helps the webview stay up-to-date when the signed-in user changes by invalidating
// the QueryClient cache.
function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const client = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        client.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, client]);

  return null;
}

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
      {/* REQUIRED — copy "/sign-in/*?" and "/sign-up/*?" verbatim. The /*? optional
          wildcard is the only wouter syntax that matches both the bare URL and Clerk's
          OAuth sub-paths. Not /sign-in, not /sign-in/*, not /sign-in/:rest*. */}
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: t('auth_welcome_back_title'),
            subtitle: t('auth_welcome_back_subtitle'),
          },
        },
        signUp: {
          start: {
            title: t('auth_create_account_title'),
            subtitle: t('auth_create_account_subtitle'),
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
