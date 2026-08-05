import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Info, AlertTriangle, CheckCircle, X,
  Utensils, Scissors, Dumbbell, Heart, HeartPulse, Wrench, Package, Cake,
} from 'lucide-react';
import { useUnreadMessages, useUnreadNotifications } from '../../hooks/useNotificationCounts';
import { getUserKey } from '../../utils/userKey';
import { ALERT_CATEGORIES } from '../../utils/alertCategories';
import { GROOMING_SCHEDULE_DEFS, TRAINING_SCHEDULE_DEFS } from '../../utils/scheduleFieldDefs';
import { parseLocalDate } from '../../utils/dateFormatter';
import { remapLegacyHealthStatus } from '../../utils/medicalStatus';
import '../NewsTickerBanner.css';

// Day-based "is this overdue" check (grooming/training/maintenance schedules).
const isTaskDue = (lastDate, freqDays) => {
  if (!freqDays) return false;
  if (!lastDate) return true;
  const last = parseLocalDate(lastDate);
  if (!last) return true;
  last.setHours(0, 0, 0, 0);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.floor((today - last) / 86400000) >= Number(freqDays);
};

// Hours-based "is this overdue" check (feeding supports multiple feedings/day).
const isFeedingDue = (lastDate, intervalHours) => {
  if (!intervalHours) return false;
  if (!lastDate) return true;
  const d = new Date(lastDate);
  if (isNaN(d.getTime())) return false;
  return (Date.now() - d.getTime()) / 3600000 >= Number(intervalHours);
};

// Enclosure cleaningTasks store frequency+frequencyUnit, not frequencyDays — convert so isTaskDue works.
const cleaningTaskFreqDays = (t) => {
  if (t.frequencyDays) return t.frequencyDays;
  if (!t.frequency) return null;
  const mult = t.frequencyUnit === 'weeks' ? 7 : t.frequencyUnit === 'months' ? 30 : t.frequencyUnit === 'years' ? 365 : 1;
  return t.frequency * mult;
};

// Same display-name precedence as MessagesView's conversation list (getDisplayName).
const getSenderDisplayName = (user) => {
  if (!user) return 'Unknown User';
  if (user.displayName) return user.displayName;
  if (user.showBreederName && user.breederName) return user.breederName;
  if (user.showPersonalName && user.personalName) return user.personalName;
  return `User ${user.id_public}`;
};

// Fallback descriptions for notification types that lack an animalName/requestedBy_name.
const NOTIFICATION_TYPE_LABELS = {
  breeder_request: 'a breeder request', parent_request: 'a parent request', link_request: 'a link request',
  transfer_request: 'a transfer request', transfer_accepted: 'an accepted transfer', transfer_declined: 'a declined transfer',
  transfer_cancelled: 'a cancelled transfer', animal_returned: 'a returned animal', animal_recalled: 'a recalled animal',
  marketplace_inquiry: 'a marketplace inquiry', litter_assignment: 'a litter assignment', mating_reminder: 'a mating reminder',
  new_rating: 'a new rating',
};
const describeNotification = (n) => {
  if (!n) return '';
  if (n.animalName) return `${n.animalPrefix ? n.animalPrefix + ' ' : ''}${n.animalName}`.trim();
  if (n.requestedBy_name) return n.requestedBy_name;
  return NOTIFICATION_TYPE_LABELS[n.type] || 'an update';
};

// Matches AnimalList's own [prefix, name, suffix] display convention.
const animalDisplayName = (a) => [a.prefix, a.name || 'Unnamed', a.suffix].filter(Boolean).join(' ');

// "(Name1, Name2 +N more)" — keeps the ticker text from growing unbounded.
const formatNameList = (names, max = 2) => {
  if (!names.length) return '';
  if (names.length <= max) return `(${names.join(', ')})`;
  return `(${names.slice(0, max).join(', ')} +${names.length - max} more)`;
};

const defaultAlertSettings = () =>
  Object.keys(ALERT_CATEGORIES).reduce((acc, key) => ({ ...acc, [key]: true }), {});

// Single global banner shown on every page: unread messages/notifications, moderator
// warnings/notices, and the user's optional care/breeding alert categories. Auto-scrolls
// (ticker-style, matching NewsTickerBanner's motion) when there's more than one item.
const NotificationBar = ({ authToken, API_BASE_URL, userProfile, setShowNotifications, setShowMessages }) => {
  const navigate = useNavigate();
  const userKey = useMemo(() => getUserKey(authToken), [authToken]);

  const { count: totalMessageCount, adminCount, isLoading: messagesLoading, refetch: refetchMessages } = useUnreadMessages(authToken, API_BASE_URL);
  const { count: notificationCount, isLoading: notificationsLoading, refetch: refetchNotifications } = useUnreadNotifications(authToken, API_BASE_URL);

  const [modMessages, setModMessages] = useState([]);
  const [processingModMessage, setProcessingModMessage] = useState(null);
  const [latestNotification, setLatestNotification] = useState(null);
  const [latestMessageSender, setLatestMessageSender] = useState(null);
  const [animals, setAnimals] = useState([]);
  const [litters, setLitters] = useState([]);
  const [enclosures, setEnclosures] = useState([]);
  const [supplies, setSupplies] = useState([]);
  const [careDataLoaded, setCareDataLoaded] = useState(false);
  const [alertSettings, setAlertSettings] = useState(defaultAlertSettings);
  const [expandedId, setExpandedId] = useState(null); // which item's detail popover is open, if any

  // -- Alert category preferences (shared with AnimalList's Alerts dropdown) --
  useEffect(() => {
    const load = () => {
      try {
        const saved = localStorage.getItem(`ct_alert_settings_${userKey}`);
        setAlertSettings(saved ? { ...defaultAlertSettings(), ...JSON.parse(saved) } : defaultAlertSettings());
      } catch { setAlertSettings(defaultAlertSettings()); }
    };
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, [userKey]);

  // -- Moderator notice messages (require explicit acknowledgement) --
  const fetchModMessages = useCallback(async () => {
    if (!authToken) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const all = Array.isArray(response.data) ? response.data : response.data?.notifications || [];
      setModMessages(all.filter(n => n.type === 'moderator_message' && n.status === 'pending'));
      // Backend already sorts newest-first — grab the most recent unread, non-admin notification
      // so the ticker can say what it's actually about (e.g. "regarding <animal name>").
      const unread = all.filter(n => !n.read && n.status === 'pending' && !['broadcast', 'announcement', 'moderator_message'].includes(n.type));
      setLatestNotification(unread[0] || null);
    } catch (error) {
      console.error('Failed to fetch moderator messages:', error);
    }
  }, [authToken, API_BASE_URL]);

  useEffect(() => {
    fetchModMessages();
    window.addEventListener('notifications-changed', fetchModMessages);
    return () => window.removeEventListener('notifications-changed', fetchModMessages);
  }, [fetchModMessages]);

  // -- Which contact the most recent unread (non-staff) message is from, for the ticker text --
  const fetchMessagePreview = useCallback(async () => {
    if (!authToken) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/messages/conversations`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const conversations = Array.isArray(response.data) ? response.data : [];
      const unreadConvos = conversations
        .filter(c => c.unreadCount > 0)
        .sort((a, b) => new Date(b.lastMessageDate) - new Date(a.lastMessageDate));
      // Prefer a non-staff sender, but a conversation that once had a mod message (flagged
      // "isStaff") can still carry an unread regular reply counted in regularMessageCount —
      // fall back to it rather than leaving the preview blank.
      const preview = unreadConvos.find(c => !c.otherUser?.isStaff) || unreadConvos[0] || null;
      setLatestMessageSender(preview?.otherUser || null);
    } catch (error) {
      console.error('Failed to fetch message preview:', error);
    }
  }, [authToken, API_BASE_URL]);

  useEffect(() => {
    fetchMessagePreview();
    const interval = setInterval(fetchMessagePreview, 60000);
    window.addEventListener('notifications-changed', fetchMessagePreview);
    return () => {
      clearInterval(interval);
      window.removeEventListener('notifications-changed', fetchMessagePreview);
    };
  }, [fetchMessagePreview]);

  const handleAcknowledgeModMessage = async (id) => {
    setProcessingModMessage(id);
    try {
      await axios.post(`${API_BASE_URL}/notifications/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setModMessages(prev => prev.filter(m => m._id !== id));
      setExpandedId(null);
    } catch (error) {
      console.error('Failed to acknowledge moderation notice:', error);
    } finally {
      setProcessingModMessage(null);
    }
  };

  // -- Care/breeding data used to compute the optional alert categories --
  const fetchCareData = useCallback(async () => {
    if (!authToken) return;
    try {
      const headers = { Authorization: `Bearer ${authToken}` };
      // Deliberately NOT passing isOwned=true — the Dashboard's own "Needs Attention" widgets
      // (AnimalList's activeAnimalsForDashboard) include every non-archived, non-view-only animal
      // regardless of ownership, so restricting to owned-only here silently hid alerts for
      // animals not marked "owned" and made the ticker disagree with the Dashboard.
      const [ar, lr, er, sr] = await Promise.all([
        axios.get(`${API_BASE_URL}/animals`, { headers }),
        axios.get(`${API_BASE_URL}/litters`, { headers }),
        axios.get(`${API_BASE_URL}/enclosures`, { headers }),
        axios.get(`${API_BASE_URL}/supplies`, { headers }).catch(() => ({ data: [] })),
      ]);
      const ownAnimals = (Array.isArray(ar.data) ? ar.data : []).filter(a => !a.isViewOnly && !a.archived);
      setAnimals(ownAnimals);
      setLitters(Array.isArray(lr.data) ? lr.data : []);
      setEnclosures(Array.isArray(er.data) ? er.data : []);
      setSupplies(Array.isArray(sr.data) ? sr.data : []);
    } catch (error) {
      console.error('Failed to fetch care data for alerts:', error);
    } finally {
      setCareDataLoaded(true);
    }
  }, [authToken, API_BASE_URL]);

  useEffect(() => {
    fetchCareData();
    const interval = setInterval(fetchCareData, 5 * 60 * 1000); // refresh every 5 minutes
    return () => clearInterval(interval);
  }, [fetchCareData]);

  // -- Compute the optional care/breeding alert items, gated by alertSettings --
  const careItems = useMemo(() => {
    if (!careDataLoaded) return [];
    const items = [];
    const today = new Date(); today.setHours(0, 0, 0, 0);

    if (alertSettings.feeding) {
      const due = animals.filter(a => isFeedingDue(a.lastFedDate, a.feedingIntervalHours));
      if (due.length > 0) items.push({ id: 'feeding', icon: Utensils, iconColor: 'text-amber-300', text: `Feeding: ${due.length} animal${due.length !== 1 ? 's' : ''} overdue ${formatNameList(due.map(animalDisplayName))}`, onClick: () => navigate('/') });
    }
    if (alertSettings.grooming) {
      let count = 0;
      const names = new Set();
      animals.forEach(a => GROOMING_SCHEDULE_DEFS.forEach(def => { if (isTaskDue(a[def.key]?.lastDoneDate, a[def.key]?.frequencyDays)) { count++; names.add(animalDisplayName(a)); } }));
      if (count > 0) items.push({ id: 'grooming', icon: Scissors, iconColor: 'text-teal-300', text: `Grooming/Special Care: ${count} task${count !== 1 ? 's' : ''} due ${formatNameList([...names])}`, onClick: () => navigate('/') });
    }
    if (alertSettings.training) {
      let count = 0;
      const names = new Set();
      animals.forEach(a => TRAINING_SCHEDULE_DEFS.forEach(def => { if (isTaskDue(a[def.key]?.lastDoneDate, a[def.key]?.frequencyDays)) { count++; names.add(animalDisplayName(a)); } }));
      if (count > 0) items.push({ id: 'training', icon: Dumbbell, iconColor: 'text-lime-300', text: `Training: ${count} session${count !== 1 ? 's' : ''} due ${formatNameList([...names])}`, onClick: () => navigate('/') });
    }
    if (alertSettings.reproduction) {
      let mated = 0, due = 0, weaned = 0;
      litters.forEach(l => {
        if (l.matingDate && !l.pregnancyDate && !l.birthDate) {
          const d = parseLocalDate(l.matingDate);
          if (d && Math.round((d.setHours(0, 0, 0, 0) - today) / 86400000) === 0) mated++;
        }
        if (l.expectedDueDate && !l.birthDate) {
          const d = parseLocalDate(l.expectedDueDate);
          if (d && Math.round((d.setHours(0, 0, 0, 0) - today) / 86400000) <= 0) due++;
        }
        if (l.birthDate && !l.weaningConfirmed && l.weaningDate) {
          const d = parseLocalDate(l.weaningDate);
          if (d && Math.round((d.setHours(0, 0, 0, 0) - today) / 86400000) <= 0) weaned++;
        }
      });
      const total = mated + due + weaned;
      if (total > 0) {
        const parts = [];
        if (mated > 0) parts.push(`${mated} mating${mated !== 1 ? 's' : ''} today`);
        if (due > 0) parts.push(`${due} birth${due !== 1 ? 's' : ''} due`);
        if (weaned > 0) parts.push(`${weaned} weaning${weaned !== 1 ? 's' : ''} due`);
        items.push({ id: 'reproduction', icon: Heart, iconColor: 'text-pink-300', text: `Reproduction: ${parts.join(', ')}`, onClick: () => navigate('/') });
      }
    }
    if (alertSettings.health) {
      const due = animals.filter(a => a.isQuarantine || a.isInTreatment || ['Concern', 'Critical'].includes(remapLegacyHealthStatus(a.healthStatusOverride || a.healthStatus)));
      if (due.length > 0) items.push({ id: 'health', icon: HeartPulse, iconColor: 'text-red-300', text: `Health: ${due.length} animal${due.length !== 1 ? 's' : ''} need attention ${formatNameList(due.map(animalDisplayName))}`, onClick: () => navigate('/') });
    }
    if (alertSettings.maintenance) {
      const due = enclosures.filter(enc => (enc.cleaningTasks || []).some(t => isTaskDue(t.lastDoneDate, cleaningTaskFreqDays(t))));
      if (due.length > 0) items.push({ id: 'maintenance', icon: Wrench, iconColor: 'text-orange-300', text: `Maintenance: ${due.length} enclosure${due.length !== 1 ? 's' : ''} overdue ${formatNameList(due.map(enc => enc.name || 'Unnamed'))}`, onClick: () => navigate('/') });
    }
    if (alertSettings.supplies) {
      const count = supplies.filter(s => (s.reorderThreshold != null && Number(s.currentStock) <= Number(s.reorderThreshold)) || (s.nextOrderDate && parseLocalDate(s.nextOrderDate) <= today)).length;
      if (count > 0) items.push({ id: 'supplies', icon: Package, iconColor: 'text-cyan-300', text: `Supplies: ${count} item${count !== 1 ? 's' : ''} need restocking`, onClick: () => navigate('/') });
    }
    if (alertSettings.birthdays) {
      const due = animals.filter(a => {
        if (!a.birthDate || a.status === 'Deceased') return false;
        const b = new Date(a.birthDate);
        return !isNaN(b.getTime()) && b.getMonth() === today.getMonth() && b.getDate() === today.getDate();
      });
      if (due.length > 0) items.push({ id: 'birthdays', icon: Cake, iconColor: 'text-fuchsia-300', text: `Birthdays: ${due.length} animal${due.length !== 1 ? 's' : ''} today ${formatNameList(due.map(animalDisplayName))}`, onClick: () => navigate('/') });
    }
    return items;
  }, [careDataLoaded, alertSettings, animals, litters, enclosures, supplies, navigate]);

  useEffect(() => {
    const handleNotificationsChanged = () => {
      if (refetchMessages) refetchMessages();
      if (refetchNotifications) refetchNotifications();
    };
    window.addEventListener('notifications-changed', handleNotificationsChanged);
    return () => window.removeEventListener('notifications-changed', handleNotificationsChanged);
  }, [refetchMessages, refetchNotifications]);

  const activeWarnings = (userProfile?.warnings || []).filter(w => !w.isLifted);
  const regularMessageCount = totalMessageCount > adminCount ? totalMessageCount - adminCount : 0;
  const isUrgent = adminCount > 0 || activeWarnings.length > 0;
  const isLoading = messagesLoading || notificationsLoading;

  const items = [];
  if (activeWarnings.length > 0) {
    items.push({
      id: 'warnings', icon: AlertTriangle, iconColor: 'text-yellow-300',
      text: `Official Warning${activeWarnings.length !== 1 ? 's' : ''} from Moderation Team (${activeWarnings.length})`,
      onClick: () => setExpandedId(prev => prev === 'warnings' ? null : 'warnings'),
    });
  }
  modMessages.forEach(msg => {
    items.push({
      id: `mod-${msg._id}`, icon: Info, iconColor: 'text-blue-300',
      text: `Notice from Moderation Team: ${msg.message}`,
      onClick: () => setExpandedId(prev => prev === `mod-${msg._id}` ? null : `mod-${msg._id}`),
    });
  });
  if (isUrgent && adminCount > 0) {
    items.push({
      id: 'admin-messages', icon: Shield, iconColor: 'text-red-300',
      text: `(${adminCount}) unread message${adminCount > 1 ? 's' : ''} from CritterTrack`,
      onClick: () => { if (setShowMessages) setShowMessages(true); refetchMessages(); },
    });
  }
  if (notificationCount > 0) {
    const notifDesc = describeNotification(latestNotification);
    items.push({
      id: 'notifications', icon: Info, iconColor: 'text-purple-300',
      text: notifDesc
        ? (notificationCount === 1 ? `(1) unread Notification regarding ${notifDesc}` : `(${notificationCount}) unread Notifications, latest regarding ${notifDesc}`)
        : `(${notificationCount}) unread Notification${notificationCount > 1 ? 's' : ''}`,
      onClick: () => { if (setShowNotifications) setShowNotifications(true); refetchNotifications(); },
    });
  }
  if (regularMessageCount > 0) {
    const senderName = latestMessageSender ? getSenderDisplayName(latestMessageSender) : null;
    items.push({
      id: 'regular-messages', icon: Shield, iconColor: 'text-purple-300',
      text: senderName
        ? (regularMessageCount === 1 ? `(1) unread Message from ${senderName}` : `(${regularMessageCount}) unread Messages, latest from ${senderName}`)
        : `(${regularMessageCount}) unread Message${regularMessageCount > 1 ? 's' : ''}`,
      onClick: () => { if (setShowMessages) setShowMessages(true); refetchMessages(); },
    });
  }
  items.push(...careItems);

  if (!authToken || (isLoading && items.length === 0) || items.length === 0) {
    return null;
  }

  const bgColor = isUrgent ? 'bg-red-600' : 'bg-purple-600';
  const animationDuration = (items.length + 1) * 20; // Match NewsTickerBanner speed

  const renderItem = (item) => (
    <button
      onClick={item.onClick}
      className="hover:underline bg-transparent border-none text-white p-0 cursor-pointer flex items-center font-semibold"
    >
      <item.icon size={14} className={`inline-block mr-1.5 flex-shrink-0 ${item.iconColor}`} />
      {item.text}
    </button>
  );

  const expandedWarnings = expandedId === 'warnings' ? activeWarnings : null;
  const expandedModMessage = modMessages.find(m => `mod-${m._id}` === expandedId);

  return (
    <div className="w-full max-w-7xl mx-auto mb-4 relative">
      <div className={`w-full ${bgColor} text-white text-sm py-1.5 overflow-hidden relative rounded-lg shadow-md`}>
        {items.length === 1 ? (
          <div className="flex justify-center items-center px-4">{renderItem(items[0])}</div>
        ) : (
          <div className="news-ticker-container whitespace-nowrap" style={{ animationDuration: `${animationDuration}s` }}>
            {items.map((item, index) => (
              <span key={item.id} className="inline-flex items-center px-4">
                {renderItem(item)}
                {index < items.length - 1 && <span className="mx-4 opacity-50">|</span>}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Expanded detail popover for warnings / moderator notices (need full text + explicit ack) */}
      {(expandedWarnings || expandedModMessage) && (
        <div className="absolute left-0 right-0 top-full mt-2 z-20 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 text-sm">
          <button onClick={() => setExpandedId(null)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
          {expandedWarnings && (
            <div>
              <h3 className="font-bold text-yellow-800 dark:text-yellow-400 mb-2 flex items-center gap-1">
                <AlertTriangle size={16} /> Official Warning{expandedWarnings.length !== 1 ? 's' : ''} from Moderation Team
              </h3>
              <div className="space-y-2">
                {expandedWarnings.map((warning, index) => (
                  <div key={index} className="bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded text-xs text-yellow-800 dark:text-yellow-200">
                    <p className="font-semibold">Warning #{index + 1}</p>
                    {warning.subject && <p className="mt-1"><strong>Regarding:</strong> {warning.subject}</p>}
                    <p className="mt-1"><strong>Reason:</strong> {warning.reason}</p>
                    <p className="mt-1"><strong>Date:</strong> {new Date(warning.date).toLocaleString()}</p>
                    {warning.category && <p className="mt-1"><strong>Category:</strong> {warning.category}</p>}
                  </div>
                ))}
              </div>
              {expandedWarnings.length >= 3 && (
                <p className="text-xs mt-2 text-red-600 font-semibold">
                  You have reached 3 warnings — your account is suspended. Contact moderators for appeal.
                </p>
              )}
            </div>
          )}
          {expandedModMessage && (
            <div>
              <h3 className="font-bold text-blue-800 dark:text-blue-400 mb-2 flex items-center gap-1">
                <Info size={16} /> Notice from Moderation Team
              </h3>
              <p className="text-blue-700 dark:text-blue-300">{expandedModMessage.message}</p>
              {expandedModMessage.metadata?.subject && (
                <p className="text-xs font-semibold mt-1 text-blue-600 dark:text-blue-300"><strong>Regarding:</strong> {expandedModMessage.metadata.subject}</p>
              )}
              <p className="text-xs text-blue-500 mt-1">{new Date(expandedModMessage.createdAt).toLocaleString()}</p>
              <button
                onClick={() => handleAcknowledgeModMessage(expandedModMessage._id)}
                disabled={processingModMessage === expandedModMessage._id}
                className="mt-3 flex items-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
              >
                <CheckCircle size={14} />
                <span>Acknowledge</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBar;