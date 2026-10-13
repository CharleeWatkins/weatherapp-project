import { NavLink } from 'react-router-dom';
import { Cloud, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { NAV_ITEMS } from '../../data/navItems';

interface HeaderProps {
  hasAlerts: boolean;
}

export default function Header({ hasAlerts }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="site-header">
      <div className="site-header__inner container">
        <NavLink to="/" className="site-header__logo">
          <div className="site-header__logo-mark">
            <Cloud size={20} color="#fff" strokeWidth={2} />
          </div>
          <span className="site-header__wordmark">
            <span className="site-header__wordmark-weather">Weather</span>
            <span className="site-header__wordmark-app">App</span>
          </span>
        </NavLink>

        <nav className="site-header__nav">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  'site-header__link' + (isActive ? ' site-header__link--active' : '')
                }
              >
                <Icon size={16} strokeWidth={1.8} />
                {item.label}
                {item.id === 'alerts' && hasAlerts && <span className="site-header__dot" />}
              </NavLink>
            );
          })}
        </nav>

        <button
          type="button"
          className="site-header__theme-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </header>
  );
}