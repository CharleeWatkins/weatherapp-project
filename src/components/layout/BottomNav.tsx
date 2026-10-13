import { NAV_ITEMS } from '../../data/navItems';

interface BottomNavProps {
  hasAlerts: boolean;
}

export default function BottomNav({ hasAlerts }: BottomNavProps) {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(item => {
        const Icon = item.icon;
        const pathname = window.location.pathname;
        const isActive = item.path === '/'
          ? pathname === '/'
          : pathname === item.path || pathname.startsWith(`${item.path}/`);
        return (
          <a
            key={item.id}
            href={item.path}
            className={'bottom-nav__item' + (isActive ? ' bottom-nav__item--active' : '')}
          >
            <div className="bottom-nav__icon-wrap">
              <Icon size={20} strokeWidth={1.8} />
              {item.id === 'alerts' && hasAlerts && <span className="bottom-nav__badge" />}
            </div>
            <span className="bottom-nav__label">{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}