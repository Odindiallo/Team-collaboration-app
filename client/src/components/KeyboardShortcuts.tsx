import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const KeyboardShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Check if Ctrl/Cmd key is pressed
      const isCtrlPressed = event.ctrlKey || event.metaKey;

      if (isCtrlPressed) {
        switch (event.key.toLowerCase()) {
          case 't':
            // Ctrl/Cmd + T: Navigate to Tasks
            event.preventDefault();
            navigate('/tasks');
            break;
          case 'n':
            // Ctrl/Cmd + N: Create New Task
            event.preventDefault();
            navigate('/tasks/new');
            break;
          case 'd':
            // Ctrl/Cmd + D: Navigate to Dashboard
            event.preventDefault();
            navigate('/dashboard');
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [navigate]);

  return null; // This component doesn't render anything
};

export default KeyboardShortcuts;
