'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';
import Button from '@/components/main/Button';

interface UserProfileProps {
  showModulesButton?: boolean;
  onLogout?: () => void;
}

export default function UserProfile({ 
  showModulesButton = true, 
  onLogout 
}: UserProfileProps) {
  const { user, loading } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authService.signOut();
      if (onLogout) {
        onLogout();
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  const getDisplayName = () => {
    if (!user) return '';
    
    // Try to get display name from user metadata first
    const displayName = user.user_metadata?.display_name;
    if (displayName) {
      // Get first two words/names
      const names = displayName.trim().split(' ');
      return names.slice(0, 2).join(' ');
    }
    
    // Fallback to email username
    const emailName = user.email?.split('@')[0] || '';
    return emailName.charAt(0).toUpperCase() + emailName.slice(1);
  };

  const getInitial = () => {
    const displayName = getDisplayName();
    return displayName.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="text-text-secondary text-sm">Cargando...</div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center space-x-4">
      {/* User Info */}
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <div className="text-text-primary font-medium">
            {getDisplayName()}
          </div>
          <div className="text-text-secondary text-xs">
            {user.email}
          </div>
        </div>
        <div className="w-8 h-8 bg-accent-green rounded-full flex items-center justify-center">
          <span className="text-text-primary font-medium text-sm">
            {getInitial()}
          </span>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        {showModulesButton && (
          <Button 
            href="/modules" 
            variant="outline" 
            size="sm"
          >
            Módulos
          </Button>
        )}
        <Button 
          onClick={handleLogout}
          variant="secondary" 
          size="sm"
          loading={loggingOut}
          disabled={loggingOut}
        >
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}