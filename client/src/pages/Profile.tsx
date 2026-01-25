import { MobileLayout } from '@/components/MobileLayout';
import { ArrowLeft, User, Mail, Phone, MapPin, LogOut } from 'lucide-react';
import { useStore } from '@/lib/store';
import { EditProfileSheet } from '@/components/EditProfileSheet';
import { useState } from 'react';
import { signOut } from '@/lib/supabase';
import { features } from '@/lib/config';

// Detect Apple's private relay email (Hide My Email feature)
const isApplePrivateRelay = (email?: string) =>
  email?.endsWith('@privaterelay.appleid.com');

export default function Profile() {
  const { userProfile, resetStore } = useStore();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      resetStore();
    }
    // App.tsx auth gate auto-redirects to Login when session becomes null
  };

  return (
    <MobileLayout
      headerStyle="dark"
      sheet={
        <EditProfileSheet isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
      }
      header={
        <div className="flex justify-between items-center py-1">
          <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-neutral-800 transition-colors">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="font-bold text-lg text-white font-tech uppercase tracking-wide">Profile</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      }
    >
      <div className="p-4 space-y-6">
        <div className="bg-white p-6 rounded-sm border border-neutral-200 flex flex-col items-center shadow-sm">
          <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
            <User className="w-10 h-10 text-neutral-400" />
          </div>
          <h2 className="font-bold text-lg text-neutral-900 font-tech uppercase tracking-wide" data-testid="text-profile-name">
            {userProfile?.fullName || userProfile?.firstName || 'User'}
          </h2>
          <p className="text-xs text-neutral-500 font-medium uppercase tracking-wide mt-1">Free Plan</p>
        </div>

        <div className="bg-white rounded-sm border border-neutral-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-neutral-100">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Email</label>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-neutral-400" />
              <p className={`text-sm font-medium ${userProfile?.email ? 'text-neutral-900' : 'text-neutral-400'}`} data-testid="text-profile-email">
                {isApplePrivateRelay(userProfile?.email)
                  ? 'Hidden via Apple'
                  : (userProfile?.email || 'Not provided')}
              </p>
            </div>
          </div>
          <div className="p-4 border-b border-neutral-100">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Phone</label>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-neutral-400" />
              <p className={`text-sm font-medium ${userProfile?.phone ? 'text-neutral-900' : 'text-neutral-400'}`} data-testid="text-profile-phone">
                {userProfile?.phone || 'Not provided'}
              </p>
            </div>
          </div>
          <div className="p-4">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Location</label>
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-4 h-4 text-neutral-400" />
              <p className={`text-sm font-medium ${userProfile?.zipCode ? 'text-neutral-900' : 'text-neutral-400'}`} data-testid="text-profile-zip">
                {userProfile?.zipCode ? `ZIP: ${userProfile.zipCode}` : 'Not provided'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsEditOpen(true)}
          className="w-full py-4 border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 font-bold text-xs uppercase tracking-widest rounded-sm transition-colors shadow-sm"
          data-testid="button-edit-profile"
        >
          Edit Profile
        </button>

        {features.auth && (
          <button
            onClick={handleSignOut}
            className="w-full py-4 border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 font-bold text-xs uppercase tracking-widest rounded-sm transition-colors shadow-sm flex items-center justify-center gap-2"
            data-testid="button-sign-out"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        )}
      </div>
    </MobileLayout>
  );
}
