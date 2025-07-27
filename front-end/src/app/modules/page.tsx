'use client'

import { useAuth } from '@/hooks/useAuth'
import { useModuleData } from '@/hooks/useModuleData'
import { useModuleLinker } from '@/hooks/useModuleLinker'
import { ModuleTreeCanvas } from '@/components/modules/ModuleTreeCanvas'
import { ModulePreview } from '@/components/modules/ModulePreview'
import UserProfile from '@/components/auth/UserProfile'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Shield, BookOpen, Sparkles, CheckCircle, ArrowUp } from 'lucide-react'

// Componente de pantalla de carga
const LoadingScreen = ({ stage, isVisible }: { stage: 'auth' | 'data' | 'processing' | 'complete', isVisible: boolean }) => {
  const [dots, setDots] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const getStageInfo = () => {
    switch (stage) {
      case 'auth':
        return {
          icon: Shield,
          title: 'Verificando identidad',
          subtitle: 'Validando tu acceso al sistema',
          color: 'text-accent-green'
        }
      case 'data':
        return {
          icon: BookOpen,
          title: 'Cargando módulos',
          subtitle: 'Obteniendo tu árbol de conocimiento',
          color: 'text-low-green'
        }
      case 'processing':
        return {
          icon: Sparkles,
          title: 'Organizando contenido',
          subtitle: 'Preparando tu experiencia personalizada',
          color: 'text-accent-green'
        }
      case 'complete':
        return {
          icon: CheckCircle,
          title: 'Todo listo',
          subtitle: 'Preparando tu espacio de aprendizaje',
          color: 'text-accent-green'
        }
    }
  }

  const { icon: Icon, title, subtitle, color } = getStageInfo()

  return (
    <div 
      className={`fixed inset-0 bg-bg-principal z-50 flex items-center justify-center transition-transform duration-700 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      {/* Fondo animado */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-96 h-96 bg-accent-green/5 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-96 h-96 bg-low-green/5 rounded-full animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 text-center">
        {/* Icono principal animado */}
        <div className="mb-8 relative">
          <div className={`w-20 h-20 ${color} mx-auto mb-4 animate-bounce`}>
            <Icon className="w-full h-full" />
          </div>
          
          {/* Anillos animados alrededor del icono */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-2 border-accent-green/20 rounded-full animate-spin"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 border border-low-green/10 rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Texto principal */}
        <h2 className="text-3xl font-bold text-text-primary mb-2">
          {title}
        </h2>
        <p className="text-text-secondary text-lg mb-8">
          {subtitle}{dots}
        </p>

        {/* Barra de progreso animada */}
        <div className="w-64 mx-auto">
          <div className="w-full bg-bg-secondary rounded-full h-2 border border-border">
            <div 
              className="bg-gradient-to-r from-accent-green to-low-green h-full rounded-full transition-all duration-1000 ease-out"
              style={{ 
                width: stage === 'auth' ? '25%' : 
                       stage === 'data' ? '50%' : 
                       stage === 'processing' ? '75%' : '100%' 
              }}
            ></div>
          </div>
          
          {/* Etapas */}
          <div className="flex justify-between text-xs text-text-secondary mt-2">
            <span className={(stage as string) === 'auth' ? 'text-accent-green' : (stage as string) !== 'auth' ? 'text-low-green' : ''}>
              Acceso
            </span>
            <span className={stage === 'data' ? 'text-accent-green' : ['processing', 'complete'].includes(stage) ? 'text-low-green' : ''}>
              Datos
            </span>
            <span className={stage === 'processing' ? 'text-accent-green' : stage === 'complete' ? 'text-low-green' : ''}>
              Procesando
            </span>
            <span className={stage === 'complete' ? 'text-accent-green' : ''}>
              Listo
            </span>
          </div>
        </div>

        {/* Mensaje adicional para la etapa final */}
        {stage === 'complete' && (
          <div className="mt-8 animate-fadeIn">
            <div className="flex items-center justify-center gap-2 text-accent-green">
              <ArrowUp className="w-5 h-5 animate-bounce" />
              <span className="text-sm font-medium">Deslizando hacia tu experiencia</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Pantalla de error mejorada
const ErrorScreen = ({ error }: { error: string }) => (
  <div className="min-h-screen bg-bg-principal flex items-center justify-center">
    <div className="text-center max-w-md mx-auto p-8">
      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
        <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-text-primary mb-4">
        Algo salió mal
      </h3>
      <p className="text-text-secondary mb-6">
        No pudimos cargar los módulos. Por favor, intenta nuevamente.
      </p>
      <p className="text-text-secondary text-sm mb-6 bg-bg-secondary p-3 rounded-lg border border-border">
        {error}
      </p>
      <button 
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-accent-green text-text-primary rounded-lg font-medium hover:bg-accent-green/80 transition-colors"
      >
        Intentar nuevamente
      </button>
    </div>
  </div>
)

export default function ModulesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loadingStage, setLoadingStage] = useState<'auth' | 'data' | 'processing' | 'complete'>('auth')
  const [showContent, setShowContent] = useState(false)
  
  // Proteger ruta - redirigir a login si no está autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  // Data Layer - cargar datos desde Supabase
  const { rawModules, userProgress, activeSubscription, loading: dataLoading, error } = useModuleData()
  
  // Linker Layer - procesar datos para visualización
  const { 
    processedTree, 
    selectedModule, 
    setSelectedModule,
    loading: linkerLoading 
  } = useModuleLinker({ rawModules, userProgress, user })

  // Gestión de las etapas de carga
  useEffect(() => {
    if (!authLoading) {
      setLoadingStage('data')
      
      if (!dataLoading) {
        setLoadingStage('processing')
        
        if (!linkerLoading) {
          setLoadingStage('complete')
          
          // Esperar un momento antes de mostrar el contenido
          const timer = setTimeout(() => {
            setShowContent(true)
          }, 1000)
          
          return () => clearTimeout(timer)
        }
      }
    }
  }, [authLoading, dataLoading, linkerLoading])

  // Event Handlers
  const handleModuleClick = (moduleId: string) => {
    setSelectedModule(moduleId)
  }

  const handlePurchase = (moduleId: string) => {
    // TODO: Integrar con Stripe/MercadoPago
    console.log('Purchase module:', moduleId)
    // Aquí implementarías la lógica de compra
  }

  const handleVisit = (moduleId: string) => {
    const module = processedTree?.modules.get(moduleId)
    if (module) {
      router.push(`/modules/${module.slug}`)
    }
  }

  // Si hay error, mostrar pantalla de error
  if (error) {
    return <ErrorScreen error={error} />
  }

  // Si no hay usuario, no mostrar nada (se redirigirá)
  if (!authLoading && !user) {
    return null
  }

  const selectedModuleData = selectedModule ? processedTree?.modules.get(selectedModule) ?? null : null
  const isLoading = authLoading || dataLoading || linkerLoading || !showContent

  return (
    <>
      {/* Pantalla de carga */}
      <LoadingScreen stage={loadingStage} isVisible={isLoading} />

      {/* Contenido principal */}
      <div 
        className={`min-h-screen bg-bg-principal transition-all duration-700 ease-in-out ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Navbar principal */}
        <div className="border-b border-border bg-bg-secondary h-[80px]">
          <div className="container mx-auto px-6 py-4 h-full">
            <div className="flex justify-between items-center h-full">
              <div className="flex items-center space-x-6">
                <nav className="hidden md:flex space-x-6">
                  <span className="text-accent-green font-medium border-b-2 border-accent-green pb-1">
                    Módulos
                  </span>
                  <span className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
                    Progreso
                  </span>
                  <span className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
                    Certificados
                  </span>
                </nav>
              </div>
              <UserProfile showModulesButton={false} />
            </div>
          </div>
        </div>

        {/* Layout Principal */}
        
        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-[60%_40%] h-[calc(100vh-80px)]">
          {/* Área del árbol de módulos */}
          <div className="relative bg-bg-principal">
            {/* Contenedor del árbol */}
            <div className="h-full">
              <ModuleTreeCanvas
                tree={processedTree}
                selectedModule={selectedModule}
                onModuleClick={handleModuleClick}
              />
            </div>
          </div>
          
          {/* Panel de preview a la derecha */}
          <div className="bg-bg-secondary">
            <ModulePreview
              module={selectedModuleData}
              onPurchase={handlePurchase}
              onVisit={handleVisit}
            />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden h-[calc(100vh-80px)]">
          {/* En mobile, mostrar árbol arriba y preview abajo */}
          <div className="grid grid-rows-[60%_40%] h-full">
            {/* Área del árbol compacta */}
            <div className="relative bg-bg-principal">
              <div className="h-full">
                <ModuleTreeCanvas
                  tree={processedTree}
                  selectedModule={selectedModule}
                  onModuleClick={handleModuleClick}
                />
              </div>
            </div>
            
            {/* Preview como panel inferior */}
            <div className="bg-bg-secondary border-t border-border">
              <ModulePreview
                module={selectedModuleData}
                onPurchase={handlePurchase}
                onVisit={handleVisit}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Estilos adicionales para animaciones */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </>
  )
}