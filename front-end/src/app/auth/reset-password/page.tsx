'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authService } from '@/services/authService'
import { supabase } from '@/lib/supabase'
import Button from '@/components/main/Button'
import Input from '@/components/main/Input'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [validSession, setValidSession] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  
  const router = useRouter()

  useEffect(() => {
    // Check if user came from password reset email
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          setValidSession(true)
        } else {
          // Listen for auth state changes (when user clicks email link)
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
              if (event === 'PASSWORD_RECOVERY' && session) {
                setValidSession(true)
              }
            }
          )
          
          return () => subscription.unsubscribe()
        }
      } catch (err) {
        setError('Sesión inválida')
      } finally {
        setCheckingSession(false)
      }
    }

    checkSession()
  }, [])

  const validateForm = () => {
    if (!password || !confirmPassword) {
      setError('Por favor completa todos los campos')
      return false
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return false
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const { error } = await authService.updatePassword(password)
      
      if (error) {
        setError('Error al actualizar la contraseña. Inténtalo de nuevo.')
      } else {
        setSuccess(true)
        // Redirect to modules after 3 seconds
        setTimeout(() => {
          router.push('/modules')
        }, 3000)
      }
    } catch (err) {
      setError('Error inesperado. Inténtalo de nuevo.')
    }
    
    setLoading(false)
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-bg-principal flex items-center justify-center">
        <div className="text-text-primary">Verificando sesión...</div>
      </div>
    )
  }

  if (!validSession) {
    return (
      <div className="min-h-screen bg-bg-principal flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="bg-bg-secondary rounded-xl border border-border p-8 text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-4">
              Enlace inválido
            </h1>
            <p className="text-text-secondary mb-6">
              El enlace de recuperación de contraseña es inválido o ha expirado. 
              Por favor solicita un nuevo enlace.
            </p>
            <Link
              href="/auth/forgot-password"
              className="text-accent-green hover:text-low-green transition-colors"
            >
              Solicitar nuevo enlace
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-bg-principal flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="bg-bg-secondary rounded-xl border border-border p-8 text-center">
            <div className="w-16 h-16 bg-accent-green rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-4">
              ¡Contraseña actualizada!
            </h1>
            <p className="text-text-secondary mb-6">
              Tu contraseña ha sido actualizada exitosamente. Serás redirigido automáticamente en unos segundos.
            </p>
            <Button href="/modules">
              Ir a módulos
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-principal flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="bg-bg-secondary rounded-xl border border-border p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Nueva Contraseña
            </h1>
            <p className="text-text-secondary">
              Ingresa tu nueva contraseña
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Nueva contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Input
              label="Confirmar nueva contraseña"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? 'Actualizando...' : 'Actualizar contraseña'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <Link
              href="/auth/login"
              className="text-text-secondary hover:text-text-primary transition-colors text-sm"
            >
              ← Volver al login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}