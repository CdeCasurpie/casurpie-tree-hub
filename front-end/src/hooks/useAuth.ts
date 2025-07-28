import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { authService } from '../services/authService'
import { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const creatingProfile = useRef<string | null>(null)

  // Función para verificar y crear perfil si no existe
  const ensureUserProfile = async (currentUser: User) => {
    // Evitar múltiples intentos para el mismo usuario
    if (creatingProfile.current === currentUser.id) {
      return
    }

    try {
      // Verificar si ya tiene perfil
      const { data: profile, error } = await authService.getUserProfile(currentUser.id)
      
      // Si no tiene perfil, crearlo
      if (error && error.code === 'PGRST116') { // No rows returned
        creatingProfile.current = currentUser.id
        
        const displayName = currentUser.user_metadata?.display_name || 
                           currentUser.email?.split('@')[0] || 
                           'Usuario'
        
        const { error: createError } = await authService.createUserProfile(
          currentUser.id, 
          displayName
        )
        
        // Ignorar errores de duplicado (código 23505)
        if (createError && createError.code !== '23505') {
          // En producción podrías enviar esto a un servicio de logging
          // como Sentry, LogRocket, etc.
        }
        
        creatingProfile.current = null
      }
    } catch (error) {
      creatingProfile.current = null
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user || null
      
      setUser(currentUser)
      setLoading(false)
      
      if (currentUser) {
        setTimeout(() => {
          ensureUserProfile(currentUser)
        }, 500)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user || null
        
        setUser(currentUser)
        setLoading(false)
        
        if (currentUser && event === 'SIGNED_IN') {
          setTimeout(() => {
            ensureUserProfile(currentUser)
          }, 1000)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}