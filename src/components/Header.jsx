import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { 
  ArrowLeft, 
  ChevronDown, 
  Settings2, 
  LayoutGrid,
  Waves,
  LogOut,
  User,
  X,
  Mail,
  Lock,
  Trash2,
  AlertTriangle,
  Loader2,
  Check,
  SlidersHorizontal
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AmbientMixer from './AmbientMixer';
import Timeline from './Timeline';

// Profile Modal Component
const ProfileModal = ({ user, onClose }) => {
  const { updateProfile, resetPassword } = useAuth();
  const [name, setName] = useState(user?.user_metadata?.full_name || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const modalRef = useRef(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Close when clicking backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleUpdateName = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const { error } = await updateProfile({ full_name: name.trim() });
      if (error) throw error;
      setMessage({ type: 'success', text: 'Name updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const { error } = await resetPassword(user.email);
      if (error) throw error;
      setMessage({ type: 'success', text: 'Password reset email sent! Check your inbox.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    // This would require a backend function to delete the user
    // For now, show a message
    setMessage({ type: 'error', text: 'Please contact support to delete your account.' });
    setShowDeleteConfirm(false);
  };

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop with blur and dim */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-backdrop-in" />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-md rounded-2xl overflow-hidden animate-modal-in"
      >
        {/* Background layers */}
        <div className="absolute inset-0 bg-wave-dark/95 backdrop-blur-xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-wave-accent/5" />
        <div className="absolute inset-0 border border-white/10 rounded-2xl" />
        
        {/* Content */}
        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Profile Settings</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {/* User Avatar & Email */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-wave-accent to-wave-purple flex items-center justify-center text-white font-semibold text-xl">
              {user?.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                user?.user_metadata?.full_name?.charAt(0).toUpperCase() || 
                user?.email?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div>
              <p className="text-white font-medium">{user?.user_metadata?.full_name || 'User'}</p>
              <p className="text-sm text-white/50">{user?.email}</p>
            </div>
          </div>

          {/* Message */}
          {message.text && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {message.type === 'success' ? (
                <Check className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          {/* Update Name */}
          <div className="mb-4">
            <label className="block text-sm text-white/70 mb-2">Display Name</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/30 border border-white/15 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-wave-accent/50 transition-colors"
                />
              </div>
              <button
                onClick={handleUpdateName}
                disabled={loading || !name.trim() || name === user?.user_metadata?.full_name}
                className="px-4 py-2.5 bg-wave-accent/20 text-wave-accent rounded-xl hover:bg-wave-accent/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>

          {/* Reset Password */}
          <div className="mb-4">
            <label className="block text-sm text-white/70 mb-2">Password</label>
            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full px-4 py-2.5 bg-black/30 border border-white/15 rounded-xl text-white/80 hover:bg-black/40 hover:text-white transition-colors flex items-center gap-3 disabled:opacity-50"
            >
              <Lock className="w-4 h-4 text-white/40" />
              <span>Send Password Reset Email</span>
              {loading && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
            </button>
          </div>

          {/* Danger Zone */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <label className="block text-sm text-red-400/70 mb-2">Danger Zone</label>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-3"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Account</span>
              </button>
            ) : (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-sm text-red-400 mb-3">
                  Are you sure? This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 bg-white/10 rounded-lg text-white/70 hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex-1 px-4 py-2 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

const Header = ({ 
  currentMode = 'Focus', 
  onModeChange, 
  onBack, 
  user, 
  onSignOut,
  // Timeline props
  currentTime = 0,
  duration = 0,
  onSeek,
  onLoopChange,
  isPlaying = false,
}) => {
  const modes = ['Focus', 'Liminal', 'Games'];
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAmbientMixer, setShowAmbientMixer] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const menuRef = useRef(null);
  const ambientButtonRef = useRef(null);
  const timelineButtonRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const getUserInitial = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  return (
    <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4">
      {/* Left section */}
      <div className="flex items-center gap-4">
        
        {/* Mode selector */}
        <div className="relative group">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full glass hover:bg-white/10 transition-all">
            <Waves className="w-4 h-4 text-wave-accent" />
            <span className="text-sm font-medium text-white/90">
              Custom {currentMode} Mix
            </span>
            <ChevronDown className="w-4 h-4 text-white/60 group-hover:text-white/90 transition-colors" />
          </button>
          
          {/* Dropdown menu (hidden by default) */}
          <div className="absolute top-full left-0 mt-2 py-2 min-w-[180px] rounded-xl glass opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            {modes.map((mode) => (
              <button
                key={mode}
                onClick={() => onModeChange?.(mode)}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-colors ${
                  currentMode === mode ? 'text-wave-accent' : 'text-white/70'
                }`}
              >
                {mode} Mix
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        <button 
          ref={ambientButtonRef}
          onClick={() => setShowAmbientMixer(!showAmbientMixer)}
          className={`p-2 rounded-full transition-colors ${showAmbientMixer ? 'bg-white/10' : 'hover:bg-white/10'}`}
          aria-label="Ambient Sounds Mixer"
        >
          <SlidersHorizontal className={`w-5 h-5 transition-colors ${showAmbientMixer ? 'text-wave-accent' : 'text-white/60 hover:text-white/90'}`} />
        </button>
        <button 
          ref={timelineButtonRef}
          onClick={() => setShowTimeline(!showTimeline)}
          className={`p-2 rounded-full transition-colors ${showTimeline ? 'bg-white/10' : 'hover:bg-white/10'}`}
          aria-label="Timeline"
        >
          <LayoutGrid className={`w-5 h-5 transition-colors ${showTimeline ? 'text-wave-accent' : 'text-white/60 hover:text-white/90'}`} />
        </button>

        {/* User menu */}
        {user && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="ml-2 w-9 h-9 rounded-full bg-gradient-to-br from-wave-accent to-wave-purple flex items-center justify-center text-white font-medium text-sm hover:opacity-90 transition-opacity cursor-pointer"
            >
              {user.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt={getUserName()}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getUserInitial()
              )}
            </button>

            {/* User dropdown */}
            {showUserMenu && (
              <div className="absolute top-full right-0 mt-2 py-2 min-w-[200px] rounded-xl bg-wave-dark/95 backdrop-blur-xl border border-white/10 shadow-xl">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    setShowProfileModal(true);
                  }}
                  className="w-full px-4 py-3 border-b border-white/10 hover:bg-white/5 transition-colors cursor-pointer text-left"
                >
                  <p className="text-sm font-medium text-white truncate">{getUserName()}</p>
                  <p className="text-xs text-white/50 truncate">{user.email}</p>
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onSignOut?.();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal 
          user={user} 
          onClose={() => setShowProfileModal(false)} 
        />
      )}

      {/* Ambient Sounds Mixer */}
      <AmbientMixer 
        isOpen={showAmbientMixer}
        onClose={() => setShowAmbientMixer(false)}
        anchorRef={ambientButtonRef}
      />

      {/* Timeline */}
      <Timeline
        isOpen={showTimeline}
        onClose={() => setShowTimeline(false)}
        anchorRef={timelineButtonRef}
        currentTime={currentTime}
        duration={duration}
        onSeek={onSeek}
        onLoopChange={onLoopChange}
        isPlaying={isPlaying}
      />
    </header>
  );
};

export default Header;
