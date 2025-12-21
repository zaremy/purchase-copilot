import { MobileLayout } from '@/components/MobileLayout';
import { User, Shield, CircleHelp, ChevronRight, ListChecks, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'wouter';

export default function Settings() {
  const [, setLocation] = useLocation();

  const sections = [
    {
      title: 'Preferences',
      items: [
        { icon: ListChecks, label: 'Checklist Presets', href: '/settings/presets' },
      ]
    },
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Profile', href: '/settings/profile' },
      ]
    },
    {
      title: 'App',
      items: [
        { icon: Shield, label: 'Privacy & Security', href: '/settings/privacy' },
        { icon: CircleHelp, label: 'Help & Support', href: '/settings/help' },
      ]
    }
  ];

  return (
    <MobileLayout
      headerStyle="dark"
      header={
        <div className="flex justify-between items-center py-1">
          <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-neutral-800 transition-colors">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="font-bold text-lg text-white font-tech uppercase tracking-wide">Settings</h1>
          <div className="w-10" />
        </div>
      }
    >
      <div className="p-4 space-y-8 bg-[#F0EDE8] min-h-screen">
        {sections.map((section) => (
          <div key={section.title} className="space-y-2">
            <h2 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">{section.title}</h2>
            <div className="bg-white rounded-sm border border-neutral-200 overflow-hidden shadow-sm">
              {section.items.map((item, index) => (
                <Link href={item.href} key={item.label}>
                  <div 
                    className={cn(
                      "flex items-center justify-between p-4 active:bg-neutral-50 transition-colors cursor-pointer group hover:bg-neutral-50",
                      index !== section.items.length - 1 && "border-b border-neutral-100"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-sm bg-neutral-100 flex items-center justify-center text-neutral-500 group-hover:text-neutral-900 transition-colors">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-neutral-900 uppercase tracking-wide">{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        <div className="text-center mt-8 pb-8">
          <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-widest">Pre-Purchase Copilot v1.0.0</p>
        </div>
      </div>
    </MobileLayout>
  );
}
