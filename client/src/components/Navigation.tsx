import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ChatBubbleLeftRightIcon,
  DocumentIcon,
  ListBulletIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import ShortcutsModal from './ShortcutsModal';

const Navigation: React.FC = () => {
  const location = useLocation();
  const [showShortcuts, setShowShortcuts] = useState(false);

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
    { name: 'Tasks', path: '/tasks', icon: ListBulletIcon },
    { name: 'Documents', path: '/documents', icon: DocumentIcon },
    { name: 'Chat', path: '/chat', icon: ChatBubbleLeftRightIcon },
  ];

  // Add keyboard shortcut for showing shortcuts modal
  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === '?') {
        setShowShortcuts(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <>
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center px-4 pt-1 border-b-2 text-sm font-medium ${
                    isActive(item.path)
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="flex items-center">
              <button
                onClick={() => setShowShortcuts(true)}
                className="p-2 text-gray-400 hover:text-gray-500"
                title="Keyboard shortcuts"
              >
                <QuestionMarkCircleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <ShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </>
  );
};

export default Navigation;
