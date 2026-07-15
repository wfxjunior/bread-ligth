import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  BookOpen, 
  Search, 
  Bookmark, 
  LayoutDashboard, 
  Library, 
  BookText, 
  Settings, 
  Flag,
  Feather,
  BookHeart
} from 'lucide-react';
import { Show, useUser } from '@clerk/react';
import { useReadingSpace } from '../context/reading-space-context';
import { useAtmosphere } from '../context/atmosphere-context';
import { useLanguage } from '../context/language-context';
import { useBillingStatus } from '../hooks/use-billing';
import { isPremium } from '../lib/billing';
import { SpaceBackground } from './space-background';
import type { I18nKey } from '../lib/i18n';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from './ui/sidebar';

const NAV_ITEMS: { key: I18nKey; path: string; icon: typeof LayoutDashboard }[] = [
  { key: 'nav_home',        path: '/home',        icon: LayoutDashboard },
  { key: 'nav_reader',      path: '/',            icon: BookOpen },
  { key: 'nav_library',     path: '/library',     icon: Library },
  { key: 'nav_search',      path: '/search',      icon: Search },
  { key: 'nav_vocabulary',  path: '/vocabulary',  icon: BookText },
  { key: 'nav_notes',       path: '/notes',       icon: Feather },
  { key: 'nav_favorites',   path: '/favorites',   icon: Bookmark },
  { key: 'nav_devotionals', path: '/devotionals', icon: BookHeart },
  { key: 'nav_journey',     path: '/journey',     icon: Flag },
  { key: 'nav_settings',    path: '/settings',    icon: Settings },
];

function SignedInFooter() {
  const { user } = useUser();
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const { data: billingStatus } = useBillingStatus();
  const initial = (user?.firstName || user?.primaryEmailAddress?.emailAddress || '?')[0]?.toUpperCase();
  const name = user?.fullName || user?.primaryEmailAddress?.emailAddress || t('auth_guest');
  const planLabel = isPremium(billingStatus) ? t('plan_premium_plan_label') : t('plan_free_plan_label');

  return (
    <button
      type="button"
      onClick={() => navigate('/settings')}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-left"
    >
      {user?.imageUrl ? (
        <img src={user.imageUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif italic text-sm">
          {initial}
        </div>
      )}
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium text-foreground truncate">{name}</span>
        <span className="text-xs text-muted-foreground">{planLabel}</span>
      </div>
    </button>
  );
}

function NavLink({ href, isActive, icon: Icon, children }: {
  href: string; isActive: boolean; icon: typeof LayoutDashboard; children: React.ReactNode;
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  return (
    <SidebarMenuButton asChild isActive={isActive} className="h-auto data-[active=true]:bg-primary/5 data-[active=true]:text-primary">
      <Link
        href={href}
        onClick={() => { if (isMobile) setOpenMobile(false); }}
        className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium no-underline"
      >
        <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'opacity-70'}`} />
        {children}
      </Link>
    </SidebarMenuButton>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { space } = useReadingSpace();
  const { isDark: atmosphereIsDark } = useAtmosphere();
  const { t } = useLanguage();

  // The Reading Space gradient is a calm *mood wash*, but the Atmosphere owns
  // the base background/foreground contrast. When a Reading Space's own
  // light/dark tone disagrees with the current atmosphere (e.g. a light space
  // under a Dark/Night/Library atmosphere), fade the gradient back so the
  // atmosphere's own background — and the text sitting on it — stays legible.
  // When they agree (the common case), the gradient renders exactly as before.
  const spaceMismatch = atmosphereIsDark !== space.isDark;

  return (
    <SidebarProvider className="h-screen min-h-0 overflow-hidden text-foreground">
      {/* Sidebar — a static column on desktop, an off-canvas drawer on mobile */}
      <Sidebar collapsible="offcanvas">
        <SidebarHeader className="p-6">
          <Link href="/" className="flex flex-col gap-1 no-underline group">
            <h1 className="font-serif text-2xl text-primary font-medium tracking-tight group-hover:text-primary/80 transition-colors">
              {t('app_name')}
            </h1>
            <span className="text-xs text-muted-foreground uppercase tracking-widest">
              {t('app_tagline')}
            </span>
          </Link>
        </SidebarHeader>

        <SidebarContent className="px-4 py-4 gap-1">
          <SidebarMenu className="gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = location === item.path || (item.path !== '/' && location.startsWith(item.path));
              return (
                <SidebarMenuItem key={item.key}>
                  <NavLink href={item.path} isActive={isActive} icon={item.icon}>
                    {t(item.key)}
                  </NavLink>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t border-border/50">
          <Show when="signed-in">
            <SignedInFooter />
          </Show>
          <Show when="signed-out">
            <Link
              href="/sign-in"
              className="flex items-center gap-3 px-3 py-2 rounded-md no-underline hover:bg-muted transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Feather className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">{t('auth_sign_in')}</span>
                <span className="text-xs text-muted-foreground">{t('auth_sign_in_prompt')}</span>
              </div>
            </Link>
          </Show>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content — the active Reading Space's calm gradient sits behind it,
          on top of the current Atmosphere's own background. */}
      <SidebarInset className="min-w-0">
        {/* Mobile-only top bar: hamburger opens the sidebar as a drawer */}
        <div className="md:hidden flex items-center gap-3 h-14 px-3 border-b border-border shrink-0 bg-background z-10">
          <SidebarTrigger />
          <span className="font-serif text-lg text-primary font-medium tracking-tight">
            {t('app_name')}
          </span>
        </div>
        <main className="relative flex-1 flex flex-col min-w-0 min-h-0 bg-background">
          <SpaceBackground space={space} className={spaceMismatch ? 'opacity-25' : undefined} />
          <div className="relative flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
