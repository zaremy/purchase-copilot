import { Link, useLocation } from 'wouter';
import { Home, ClipboardList, Settings, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const [location] = useLocation();

  // Reports temporarily hidden - will reactivate in future
  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/compare', icon: ClipboardList, label: 'Compare' },
    // { href: '/library', icon: FileText, label: 'Reports' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-neutral-200 pb-6 pt-2 px-6 z-40">
      <div className="flex justify-between items-center h-16">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== '/' && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex flex-col items-center justify-center space-y-1.5 w-16 transition-all duration-300 cursor-pointer group",
                isActive ? "text-primary" : "text-neutral-400 hover:text-neutral-900"
              )}>
                <item.icon 
                  className={cn(
                    "h-6 w-6 transition-transform duration-300", 
                    isActive && "scale-105"
                  )} 
                  strokeWidth={isActive ? 2.5 : 1.5} 
                />
                <span className={cn(
                  "text-[10px] font-medium tracking-wide uppercase",
                  isActive ? "text-primary font-bold" : "text-neutral-400"
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
