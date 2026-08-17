import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { NotificationItem } from '../../../../shared/types/lifeos.types';
import { getNotifications } from '../../services/notifications.api';
import { NotificationCenter } from './NotificationCenter';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchNotificationData = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (e) {}
  };

  useEffect(() => {
    fetchNotificationData();
    const interval = setInterval(fetchNotificationData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const badgeText = unreadCount > 9 ? '9+' : unreadCount > 0 ? `${unreadCount}` : null;

  return (
    <div ref={containerRef} className="relative select-none">
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotificationData();
        }}
        title="Notification Center"
        className="relative p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors focus:outline-none"
      >
        <Bell size={20} />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white font-mono font-bold text-[10px] flex items-center justify-center border border-slate-950 shadow-md animate-pulse">
            {badgeText}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationCenter
          notifications={notifications}
          onClose={() => setIsOpen(false)}
          onRefresh={fetchNotificationData}
        />
      )}
    </div>
  );
};
