import React, { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

const NotificationScheduler = () => {
  const { pantryItems, showNotification, getItemStatus } = useAppContext();

  const getSettings = () => {
    try {
      return JSON.parse(localStorage.getItem('smartPantrySettings') || '{}');
    } catch {
      return {};
    }
  };

  const canNotify = () => typeof Notification !== 'undefined' && Notification.permission === 'granted';

  useEffect(() => {
    const settings = getSettings();
    if (!settings) return;

    const today = new Date();
    const expiring = pantryItems.filter(i => getItemStatus(i.expiry) === 'expiring');
    const expired = pantryItems.filter(i => getItemStatus(i.expiry) === 'expired');
    const lowStock = pantryItems.filter(i => (parseInt(i.quantity)||0) <= 1);

    if (settings['Expiry Alerts'] && expiring.length > 0) {
      if (canNotify()) {
        new Notification('Smart Pantry', { body: `${expiring.length} item(s) expiring soon` });
      } else {
        showNotification(`${expiring.length} item(s) expiring soon`, 'warning');
      }
    }
    if (settings['Low Stock Alerts'] && lowStock.length > 0) {
      if (canNotify()) {
        new Notification('Smart Pantry', { body: `${lowStock.length} item(s) low on stock` });
      } else {
        showNotification(`${lowStock.length} item(s) low on stock`, 'info');
      }
    }

    // Daily digest and metric logging
    const todayKey = new Date().toDateString();
    const last = localStorage.getItem('sp_last_digest');
    if (settings['Daily Digest'] && last !== todayKey) {
      const msg = `Daily Digest: ${expiring.length} expiring, ${lowStock.length} low stock, ${expired.length} expired`;
      if (canNotify()) new Notification('Smart Pantry', { body: msg });
      showNotification(msg, 'info');
      localStorage.setItem('sp_last_digest', todayKey);
    }

    // Log metrics history once per day
    try {
      const history = JSON.parse(localStorage.getItem('sp_metrics_history') || '[]');
      const lastEntry = history[history.length - 1];
      if (!lastEntry || lastEntry.date !== todayKey) {
        history.push({
          date: todayKey,
          totals: {
            total: pantryItems.length,
            expiring: expiring.length,
            expired: expired.length,
            lowStock: lowStock.length
          }
        });
        // keep last 30 days
        const trimmed = history.slice(-30);
        localStorage.setItem('sp_metrics_history', JSON.stringify(trimmed));
      }
    } catch {}
  }, [pantryItems, showNotification, getItemStatus]);

  return null;
};

export default NotificationScheduler;
