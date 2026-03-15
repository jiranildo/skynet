import React from 'react';
import HeaderActions from '../HeaderActions';

interface PageHeaderProps {
  title: string;
  badge?: string;
  /** Custom left action replacing the back button */
  leftAction?: React.ReactNode;
  /** Primary action button to be rendered on the right side */
  primaryAction?: React.ReactNode;
  /** Allows overriding the Back handler */
  onBack?: () => void;
  /** Allows hiding the back button (for root pages) */
  hideBack?: boolean;
}

export default function PageHeader({
  title,
  badge,
  leftAction,
  primaryAction,
  onBack,
  hideBack = false
}: PageHeaderProps) {

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto w-full px-4 h-14 md:h-16 flex items-center justify-between">
        
        {/* Left Side: Back / Title / Badge */}
        <div className="flex items-center gap-3 overflow-hidden">
          {leftAction ? leftAction : (
            !hideBack && (
              <button
                onClick={handleBack}
                className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                title="Voltar"
              >
                <i className="ri-arrow-left-s-line text-xl md:text-2xl text-gray-700"></i>
              </button>
            )
          )}
          
          <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-theme-primary via-orange-500 to-red-500 bg-clip-text text-transparent truncate">
            {title}
          </h1>
          
          {badge && (
            <span className="hidden sm:inline-block px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-[10px] md:text-xs font-medium whitespace-nowrap whitespace-nowrap">
              {badge}
            </span>
          )}
        </div>
        
        {/* Right Side: Primary Action + Global Notifications/Menu */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <HeaderActions
            onShowNotifications={() => window.dispatchEvent(new CustomEvent('show-notifications'))}
            showMenu={true}
            onShowMenu={() => window.dispatchEvent(new CustomEvent('show-mobile-menu'))}
          />
          {primaryAction && (
             <div className="hidden sm:block border-l border-gray-200 pl-2">
                 {primaryAction}
             </div>
          )}
        </div>
      </div>
    </header>
  );
}
