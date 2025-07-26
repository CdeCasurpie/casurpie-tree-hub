'use client'

import Link from 'next/link';
import Button from './Button';
import { useAuth } from '@/hooks/useAuth';
import UserProfile from '@/components/auth/UserProfile';

export default function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="container mx-auto px-6 py-4">
      <nav className="flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-text-primary hover:text-accent-green transition-colors">
          Casurpie Tree Hub
        </Link>
        
        <div className="flex items-center space-x-4">
          {loading ? (
            <div className="text-text-secondary text-sm">Cargando...</div>
          ) : user ? (
            <UserProfile />
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-text-primary hover:text-accent-green transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Button href="/auth/register" size="sm">
                Registrarse
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}