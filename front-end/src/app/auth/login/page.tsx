'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authService } from '@/services/authService'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/main/Button'
import Input from '@/components/main/Input'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/modules')
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Basic validation
    if (!email || !password) {
      setError('Por favor completa todos los campos')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await authService.signIn(email, password)
      
      if (error) {
        setError(error.message === 'Invalid login credentials' 
          ? 'Credenciales inválidas. Verifica tu email y contraseña.' 
          : error.message)
      } else if (data.user) {
        router.push('/modules')
      }
    } catch (err) {
      setError('Error inesperado. Inténtalo de nuevo.')
    }
    
    setLoading(false)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-bg-principal flex items-center justify-center">
        <div className="text-text-primary">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-principal flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="bg-bg-secondary rounded-xl border border-border p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Iniciar Sesión
            </h1>
            <p className="text-text-secondary">
              Accede a tu cuenta de Casurpie Tree Hub
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />

            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link
              href="/auth/forgot-password"
              className="text-accent-green hover:text-low-green transition-colors text-sm"
            >
              ¿Olvidaste tu contraseña?
            </Link>
            <div className="text-text-secondary text-sm">
              ¿No tienes cuenta?{' '}
              <Link
                href="/auth/register"
                className="text-accent-green hover:text-low-green transition-colors"
              >
                Regístrate
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-text-secondary hover:text-text-primary transition-colors text-sm"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}