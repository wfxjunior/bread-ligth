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

const NAV_ITEMS = [
  { name: 'Home', path: '/home', icon: LayoutDashboard },
  { name: 'Reader', path: '/', icon: BookOpen },
  { name: 'Library', path: '/library', icon: Library },
  { name: 'Search', path: '/search', icon: Search },
  { name: 'Vocabulary', path: '/vocabulary', icon: BookText },
  { name: 'Notes', path: '/notes', icon: Feather },
  { name: 'Favorites', path: '/favorites', icon: Bookmark },
  { name: 'Devotionals', path: '/devotionals', icon: BookHeart },
  { name: 'Journey', path: '/journey', icon: Flag },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-sidebar flex flex-col shrink-0 z-10">
        <div className="p-6">
          <Link href="/" className="flex flex-col gap-1 no-underline group">
            <h1 className="font-serif text-2xl text-primary font-medium tracking-tight group-hover:text-primary/80 transition-colors">
              Bible English
            </h1>
            <span className="text-xs text-muted-foreground uppercase tracking-widest">
              Learn English Through The Bible
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.path || (item.path !== '/' && location.startsWith(item.path));
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/5 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'opacity-70'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif italic text-sm">
              W
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">Wilson</span>
              <span className="text-xs text-muted-foreground">Free Plan</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-background">
        {children}
      </main>
    </div>
  );
}
