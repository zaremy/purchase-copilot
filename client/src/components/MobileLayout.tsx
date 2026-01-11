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
  paddingHorizontal: 16,
  paddingBottom: 16,
  opacity: 0.98,
  flexShrink: 0,
})

export function MobileLayout({ children, showNav = true, header, headerStyle = 'default', className = '', showFab = true, sheet }: MobileLayoutProps) {
  return (
    <View className="min-h-[100dvh] bg-neutral-100 flex justify-center items-center">
      {/* Safe area gradient overlay - fades content under status bar */}
      <div
        className="fixed top-0 left-0 right-0 max-w-md mx-auto z-30 pointer-events-none"
        style={{
          height: 'env(safe-area-inset-top)',
          background: 'linear-gradient(to bottom, #0a0a0a 60%, transparent)'
        }}
      />
      <View className="w-full max-w-md bg-[#F0EDE8] h-[100dvh] relative shadow-2xl shadow-black/10 overflow-hidden flex flex-col sm:rounded-[0px] sm:border-x sm:border-neutral-200">
        {header && (
          <StyledHeader
            className={`backdrop-blur-sm z-40 ${
              headerStyle === 'dark'
                ? 'bg-neutral-950'
                : 'bg-[#F0EDE8]/95 border-b border-neutral-200'
            }`}
            style={{
              ...(headerStyle === 'dark' ? { borderBottomWidth: 0 } : {}),
              touchAction: 'manipulation',
            }}
          >
            {header}
          </StyledHeader>
        )}
        
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
