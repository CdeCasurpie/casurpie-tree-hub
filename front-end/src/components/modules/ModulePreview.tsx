import Button from '@/components/main/Button'
import { 
  Lock, 
  CheckCircle, 
  ShoppingCart, 
  ArrowRight, 
  Play, 
  Clock, 
  GraduationCap, 
  Check, 
  Sparkles,
  Star
} from 'lucide-react'

interface ProcessedModule {
  id: string
  title: string
  slug: string
  description: string
  price: number
  is_free: boolean
  background_color: string
  state: 'completed' | 'available' | 'locked' | 'free'
  hasAccess: boolean
  isCompleted: boolean
  estimated_duration?: number
  difficulty_level?: string
  progress?: {
    completed_exercises: any[]
    last_position: number
    completed_at?: string
  }
}

interface Props {
  module: ProcessedModule | null
  onPurchase?: (moduleId: string) => void
  onVisit?: (moduleId: string) => void
}

export const ModulePreview = ({ module, onPurchase, onVisit }: Props) => {
  if (!module) {
    return (
      <div className="p-6 bg-bg-secondary border-l border-border h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-bg-ternary rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-text-secondary" />
          </div>
          <div className="text-text-secondary text-center">
            Selecciona un módulo para ver los detalles
          </div>
        </div>
      </div>
    )
  }

  const getStatusBadge = () => {
    switch (module.state) {
      case 'completed':
        return (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-green/20 border border-accent-green">
            <CheckCircle className="w-4 h-4 text-accent-green" />
            <span className="text-accent-green font-medium">Módulo Completado</span>
          </div>
        )
      case 'available':
        return (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-ternary border border-border-accent">
            <Star className="w-4 h-4 text-accent-green" />
            <span className="text-text-primary font-medium">Disponible</span>
          </div>
        )
      case 'locked':
        return (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-ternary border border-border opacity-75">
            <Lock className="w-4 h-4 text-text-secondary" />
            <span className="text-text-secondary font-medium">Acceso Restringido</span>
          </div>
        )
      case 'free':
        return (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-low-green/20 to-accent-green/20 border border-accent-green">
            <Sparkles className="w-4 h-4 text-accent-green" />
            <span className="text-accent-green font-medium">Acceso Gratuito</span>
          </div>
        )
      default:
        return null
    }
  }

  const getDifficultyColor = () => {
    switch (module.difficulty_level) {
      case 'beginner': return 'text-accent-green'
      case 'intermediate': return 'text-low-green'
      case 'advanced': return 'text-border-accent'
      case 'expert': return 'text-text-secondary'
      default: return 'text-text-secondary'
    }
  }

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
    }
    return `${minutes}m`
  }

  const calculateProgress = () => {
    if (!module.progress?.completed_exercises) return 0
    // Asumiendo 10 ejercicios por módulo (puedes ajustar)
    const totalExercises = 10
    return Math.round((module.progress.completed_exercises.length / totalExercises) * 100)
  }

  return (
    <div className="p-6 bg-bg-secondary border-l border-border h-full flex flex-col">
      {/* Header con estado */}
      <div className="mb-6">
        {getStatusBadge()}
      </div>

      {/* Categoría y nivel */}
      <div className="mb-4">
        <div className="text-xs text-accent-green font-semibold uppercase tracking-wider mb-1">
          Programación • {module.difficulty_level ? (
            <span className={getDifficultyColor()}>
              Nivel {module.difficulty_level.charAt(0).toUpperCase() + module.difficulty_level.slice(1)}
            </span>
          ) : 'Intermedio'}
        </div>
      </div>

      {/* Título del módulo */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary mb-2 leading-tight">
          {module.title}
        </h1>
        <p className="text-text-secondary text-base">
          Clase completa con ejercicios prácticos
        </p>
      </div>

      {/* Cards de información */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-bg-ternary rounded-lg p-3 text-center border border-border">
          <Clock className="w-5 h-5 text-accent-green mx-auto mb-1" />
          <div className="text-xs text-text-secondary">Duración</div>
          <div className="text-sm font-semibold text-text-primary">
            {module.estimated_duration ? formatDuration(module.estimated_duration) : '1h'}
          </div>
        </div>
        
        <div className="bg-bg-ternary rounded-lg p-3 text-center border border-border">
          <GraduationCap className="w-5 h-5 text-accent-green mx-auto mb-1" />
          <div className="text-xs text-text-secondary">Dificultad</div>
          <div className={`text-sm font-semibold ${getDifficultyColor()}`}>
            {module.difficulty_level ? (
              module.difficulty_level.charAt(0).toUpperCase() + module.difficulty_level.slice(1)
            ) : 'Intermedio'}
          </div>
        </div>
      </div>
      
      {/* Descripción */}
      <div className="flex-1 mb-6">
        <p className="text-text-primary mb-4 leading-relaxed text-base">
          {module.description || 'Este módulo te enseñará conceptos fundamentales de programación de manera práctica e interactiva.'}
        </p>
        
        
      </div>

      {/* Progreso visual si aplica */}
      {module.progress && module.progress.completed_exercises.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-text-secondary">Tu progreso</span>
            <span className="text-accent-green font-medium">
              {calculateProgress()}%
            </span>
          </div>
          <div className="w-full bg-bg-ternary rounded-full h-2 border border-border">
            <div 
              className="bg-gradient-to-r from-accent-green to-low-green h-2 rounded-full transition-all duration-300"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
        </div>
      )}

      {/* Precio destacado (justo arriba del botón) */}
      {!module.hasAccess && !module.is_free && (
        <div className="bg-gradient-to-r from-accent-green/10 to-low-green/10 rounded-xl p-4 border border-accent-green/30 mb-4">
          <div className="text-center">
            <div className="text-text-secondary text-sm mb-1">Precio de acceso único</div>
            <div className="text-4xl font-bold text-accent-green mb-1">
              S/{module.price}
            </div>
            <div className="text-text-secondary text-xs">
              Acceso de por vida • Sin suscripciones
            </div>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="space-y-3">
        {!module.hasAccess && !module.is_free && (
          <Button 
            onClick={() => onPurchase?.(module.id)}
            className="w-full h-14 text-lg font-bold relative overflow-hidden group"
            variant="primary"
          >
            <div className="flex items-center justify-center gap-3">
              <ShoppingCart className="w-5 h-5" />
              <span>OBTENER ACCESO</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Button>
        )}
        
        {(module.hasAccess || module.is_free) && (
          <Button 
            onClick={() => onVisit?.(module.id)}
            className="w-full h-14 text-lg font-bold"
            variant="outline"
          >
            <div className="flex items-center justify-center gap-3">
              <Play className="w-5 h-5" />
              <span>COMENZAR MÓDULO</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </Button>
        )}
      </div>

      {/* Call-to-action secondary */}
      {!module.hasAccess && !module.is_free && (
        <div className="mt-4 p-3 bg-accent-green/5 border border-accent-green/20 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-accent-green" />
            <span className="text-text-primary">
              <strong>Garantía:</strong> Acceso de por vida + ejercicios de práctica
            </span>
          </div>
        </div>
      )}
    </div>
  )
}