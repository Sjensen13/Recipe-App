import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Camera, 
  MessageCircle, 
  Bell, 
  Plus, 
  User, 
  Compass 
} from 'lucide-react';
import useUnreadMessages from '../../hooks/useUnreadMessages';

const navLinks = [
  { to: '/app/home', label: 'Home', icon: Home },
  { to: '/app/explore', label: 'Explore', icon: Compass },
  { to: '/app/recipe-search', label: 'Picture', icon: Camera },
  { to: '/app/create-post', label: 'Create', icon: Plus },
  { to: '/app/messages', label: 'Messages', icon: MessageCircle, showBadge: true },
  { to: '/app/notifications', label: 'Notifications', icon: Bell },
  { to: '/app/profile/me', label: 'Profile', icon: User },
];

const Layout = () => {
  const location = useLocation();
  const { unreadCount } = useUnreadMessages();

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ link, isMobile = false }) => {
    const IconComponent = link.icon;
    const hasUnreadMessages = link.showBadge && unreadCount > 0;
    
    const baseStyles = isMobile ? {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      height: '100%',
      transition: 'colors 0.2s',
      textDecoration: 'none',
      gap: '0.25rem',
      position: 'relative',
      ...(isActive(link.to)
        ? { color: '#2563eb' }
        : { color: '#6b7280' })
    } : {
      display: 'flex',
      alignItems: 'center',
      padding: '0.75rem 1.5rem',
      fontSize: '1.125rem',
      fontWeight: '500',
      borderRadius: '8px',
      transition: 'colors 0.2s',
      textDecoration: 'none',
      gap: '0.75rem',
      position: 'relative',
      ...(isActive(link.to)
        ? { backgroundColor: '#eff6ff', color: '#2563eb' }
        : { color: '#374151' })
    };

    return (
      <Link
        to={link.to}
        style={baseStyles}
      >
        <div style={{ position: 'relative' }}>
          <IconComponent size={20} />
          {hasUnreadMessages && (
            <span style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              backgroundColor: '#ef4444',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '18px'
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        {!isMobile && link.label}
        {isMobile && (
          <span style={{ fontSize: '0.75rem' }}>
            {link.label}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb' 
    }}>
      {/* Sidebar for desktop */}
      <aside style={{ 
        display: 'none',
        width: '256px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        flexDirection: 'column',
        backgroundColor: 'white',
        borderRight: '1px solid #e5e7eb',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          borderBottom: '1px solid #e5e7eb' 
        }}>
          <span style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#2563eb' 
          }}>
            Recipe Social
          </span>
        </div>
        <nav style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          padding: '1.5rem 0', 
          gap: '0.5rem' 
        }}>
          {navLinks.map((link) => (
            <NavLink key={link.to} link={link} />
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        padding: '1rem 1rem', 
        marginBottom: '64px' 
      }}>
        <Outlet />
      </main>

      {/* Bottom nav for mobile */}
      <nav style={{ 
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
        boxShadow: '0 -1px 3px 0 rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: '64px'
      }}>
        {navLinks.map((link) => (
          <NavLink key={link.to} link={link} isMobile={true} />
        ))}
      </nav>
    </div>
  );
};

export default Layout; 