import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { CopilotFab } from './CopilotFab';
import { YStack, XStack, View, ScrollView, styled } from 'tamagui';

interface MobileLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  header?: ReactNode;
  headerStyle?: 'default' | 'dark';
  className?: string;
  showFab?: boolean;
  sheet?: ReactNode;
}

const StyledHeader = styled(View, {
  zIndex: 40,
  backgroundColor: '$background',
  borderBottomWidth: 1,
  borderBottomColor: '$borderColor',
  opacity: 0.98,
  flexShrink: 0,
})

export function MobileLayout({ children, showNav = true, header, headerStyle = 'default', className = '', showFab = true, sheet }: MobileLayoutProps) {
  // Header shell ALWAYS renders to own the safe area
  // MobileLayout owns: safe-area, background, horizontal gutters
  // Pages own: vertical padding (py-*)
  const headerShell = (
    <StyledHeader
      className={`pt-safe backdrop-blur-sm z-40 shrink-0 ${
        headerStyle === 'dark'
          ? 'bg-neutral-950'
          : 'bg-[#F0EDE8]/95 border-b border-neutral-200'
      }`}
      style={{
        ...(headerStyle === 'dark' ? { borderBottomWidth: 0 } : {}),
        touchAction: 'manipulation',
      }}
    >
      <div className="px-6">
        {header ?? null}
      </div>
    </StyledHeader>
  );

  return (
    <View className="min-h-[100dvh] bg-neutral-100 flex justify-center items-center">
      <View className="w-full max-w-md bg-[#F0EDE8] h-[100dvh] relative shadow-2xl shadow-black/10 overflow-hidden flex flex-col sm:rounded-[0px] sm:border-x sm:border-neutral-200">
        {headerShell}

        <ScrollView
          className={`flex-1 ${className} bg-[#F0EDE8]`}
          contentContainerStyle={{ paddingBottom: 100, minHeight: '100%' }}
          bounces={false}
          overScrollMode="never"
        >
          {children}
        </ScrollView>

        {sheet}
        {showFab && <CopilotFab hasNav={showNav} />}
        {showNav && <BottomNav />}
      </View>
    </View>
  );
}
