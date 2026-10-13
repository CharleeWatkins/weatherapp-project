import { Cloud, Search, MapPin, Bell, Settings, LucideIcon } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'weather', label: 'Weather', icon: Cloud, path: '/' },
  { id: 'search', label: 'Search', icon: Search, path: '/search' },
  { id: 'saved', label: 'Saved', icon: MapPin, path: '/saved' },
  { id: 'alerts', label: 'Alerts', icon: Bell, path: '/alerts' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];