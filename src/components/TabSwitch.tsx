import React from 'react';

interface Tab {
  id: string;
  label: string;
}

interface TabSwitchProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const TabSwitch: React.FC<TabSwitchProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex justify-center mb-8">
      <div className="inline-flex items-center gap-2 p-2 bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative px-6 py-3 rounded-md font-medium text-sm transition-all duration-300 ease-fluid
              ${activeTab === tab.id
                ? 'text-gray-900 dark:text-white bg-white dark:bg-white/10 shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }
              hover:scale-105 active:scale-95
            `}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-brand-lime rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabSwitch;
