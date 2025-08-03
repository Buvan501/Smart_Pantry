import { useState, useEffect } from 'react';

/**
 * Custom hook to manage notification stacks
 * Keeps track of active notifications by position
 */
const useNotificationStack = () => {
  // Track notifications by position
  const [stacks, setStacks] = useState({
    'top-right': [],
    'top-left': [],
    'bottom-right': [],
    'bottom-left': []
  });

  // Register a notification in a position
  const registerNotification = (id, position) => {
    setStacks(prev => ({
      ...prev,
      [position]: [...prev[position], id]
    }));

    return stacks[position].length; // Return current stack position
  };

  // Remove a notification from a position
  const removeNotification = (id, position) => {
    setStacks(prev => ({
      ...prev,
      [position]: prev[position].filter(notifId => notifId !== id)
    }));
  };

  // Get the position index of a notification in its stack
  const getStackPosition = (id, position) => {
    const index = stacks[position].indexOf(id);
    return index !== -1 ? index : 0;
  };

  return {
    registerNotification,
    removeNotification,
    getStackPosition
  };
};

// Create a singleton instance to share across all notifications
const notificationStackManager = {
  stacks: {
    'top-right': [],
    'top-left': [],
    'bottom-right': [],
    'bottom-left': []
  },
  
  // Register a notification
  register(id, position) {
    if (!this.stacks[position]) {
      this.stacks[position] = [];
    }
    this.stacks[position].push(id);
    return this.stacks[position].length - 1;
  },
  
  // Remove a notification
  remove(id, position) {
    if (this.stacks[position]) {
      this.stacks[position] = this.stacks[position].filter(item => item !== id);
    }
  },
  
  // Get stack index
  getIndex(id, position) {
    if (!this.stacks[position]) return 0;
    return this.stacks[position].indexOf(id);
  }
};

export { notificationStackManager };
export default useNotificationStack;
