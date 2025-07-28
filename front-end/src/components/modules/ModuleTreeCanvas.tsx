'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

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
  position: { x: number, y: number }
}

interface ProcessedTree {
  modules: Map<string, ProcessedModule>
  rootModules: string[]
  connections: Array<{ from: { x: number, y: number }, to: { x: number, y: number } }>
}

interface Props {
  tree: ProcessedTree | null
  selectedModule: string | null
  onModuleClick: (moduleId: string) => void
}

export const ModuleTreeCanvas = ({ tree, selectedModule, onModuleClick }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Estados para navegación
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 100, y: 50 }) // Se calculará automáticamente
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
  const [hoveredModule, setHoveredModule] = useState<string | null>(null)
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null)
  const [lastTouchCenter, setLastTouchCenter] = useState<{ x: number, y: number } | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 }) // Para detectar clicks vs drags

  // Constantes de diseño
  const GRID_SIZE = 25
  const NODE_WIDTH = 150  // Más pequeño
  const NODE_HEIGHT = 75  // Más pequeño
  const BORDER_RADIUS = 6
  const BORDER_WIDTH = 2
  const NODE_SPACING_X = 220  // Más separación horizontal
  const NODE_SPACING_Y = 140  // Más separación vertical

  // Colores ÚNICAMENTE del globals.css
  const COLORS = {
    background: '#141710',        // --color-bg-principal
    gridLine: '#32332e',          // --color-border (más sutil)
    gridLineSecondary: '#20231c', // --color-bg-ternary
    textPrimary: '#ffffff',       // --color-text-primary
    textSecondary: '#cccccc',     // --color-text-secondary
    accentGreen: '#3ad768',       // --color-accent-green
    lowGreen: '#90ffb7',          // --color-low-green
    border: '#32332e',            // --color-border
    borderAccent: '#868b7e',      // --color-border-accent
    bgSecondary: '#1a1c15',       // --color-bg-secondary
    bgTernary: '#20231c',         // --color-bg-ternary
    connectionLine: '#868b7e'     // --color-border-accent
  }

  // Función para dibujar rectángulo con bordes redondeados
  const drawRoundedRect = useCallback((
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    radius: number
  ) => {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
  }, [])

  // Función para dibujar la grilla que se mueve con el offset
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const { width, height } = canvas
    
    // Calcular el desplazamiento de la grilla basado en el offset actual
    const gridOffsetX = offset.x % (GRID_SIZE * scale)
    const gridOffsetY = offset.y % (GRID_SIZE * scale)
    
    // Grilla fina
    ctx.strokeStyle = COLORS.gridLine
    ctx.lineWidth = 0.5
    
    // Líneas verticales
    for (let x = gridOffsetX; x < width + GRID_SIZE * scale; x += GRID_SIZE * scale) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    
    // Líneas horizontales
    for (let y = gridOffsetY; y < height + GRID_SIZE * scale; y += GRID_SIZE * scale) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
    
    // Grilla más gruesa cada 4 líneas
    ctx.strokeStyle = COLORS.gridLineSecondary
    ctx.lineWidth = 1
    
    const bigGridSize = GRID_SIZE * 4 * scale
    const bigGridOffsetX = offset.x % bigGridSize
    const bigGridOffsetY = offset.y % bigGridSize
    
    for (let x = bigGridOffsetX; x < width + bigGridSize; x += bigGridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    
    for (let y = bigGridOffsetY; y < height + bigGridSize; y += bigGridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
  }, [offset, scale])

  // Función para dibujar las conexiones
  const drawConnections = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!tree) return
    
    ctx.strokeStyle = COLORS.connectionLine
    ctx.lineWidth = 2
    ctx.setLineDash([])
    
    tree.connections.forEach(conn => {
      const fromX = conn.from.x * scale + offset.x
      const fromY = conn.from.y * scale + offset.y
      const toX = conn.to.x * scale + offset.x
      const toY = conn.to.y * scale + offset.y
      
      // Dibujar línea curva suave
      ctx.beginPath()
      ctx.moveTo(fromX, fromY)
      
      // Punto de control para curva más suave
      const controlY = fromY + (toY - fromY) * 0.6
      ctx.bezierCurveTo(fromX, controlY, toX, controlY, toX, toY)
      ctx.stroke()
    })
  }, [tree, scale, offset])

  // Función para dibujar texto en múltiples líneas
  const drawMultiLineText = useCallback((
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    maxLines: number = 2
  ) => {
    const words = text.split(' ')
    let lines: string[] = []
    let currentLine = words[0]

    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + ' ' + words[i]
      const metrics = ctx.measureText(testLine)
      
      if (metrics.width > maxWidth && i > 0) {
        lines.push(currentLine)
        currentLine = words[i]
      } else {
        currentLine = testLine
      }
    }
    lines.push(currentLine)

    // Limitar a maxLines
    if (lines.length > maxLines) {
      lines = lines.slice(0, maxLines)
      // Agregar "..." al final de la última línea si se cortó
      const lastLine = lines[maxLines - 1]
      const testText = lastLine + '...'
      const metrics = ctx.measureText(testText)
      
      if (metrics.width <= maxWidth) {
        lines[maxLines - 1] = testText
      } else {
        // Reducir palabras hasta que quepa con "..."
        const wordsInLastLine = lastLine.split(' ')
        for (let i = wordsInLastLine.length - 1; i > 0; i--) {
          const truncatedLine = wordsInLastLine.slice(0, i).join(' ') + '...'
          const testMetrics = ctx.measureText(truncatedLine)
          if (testMetrics.width <= maxWidth) {
            lines[maxLines - 1] = truncatedLine
            break
          }
        }
      }
    }

    // Dibujar las líneas centradas verticalmente
    const totalHeight = lines.length * lineHeight
    const startY = y - totalHeight / 2 + lineHeight / 2

    lines.forEach((line, index) => {
      ctx.fillText(line, x, startY + index * lineHeight)
    })
  }, [])

  // Función para dibujar un módulo
  const drawModule = useCallback((ctx: CanvasRenderingContext2D, module: ProcessedModule) => {
    const x = module.position.x * scale + offset.x
    const y = module.position.y * scale + offset.y
    const width = NODE_WIDTH * scale
    const height = NODE_HEIGHT * scale
    const radius = BORDER_RADIUS * scale
    
    const isSelected = selectedModule === module.id
    const isHovered = hoveredModule === module.id
    
    // Determinar colores según estado - SOLO colores del globals.css
    let bgColor = COLORS.bgTernary
    let borderColor = COLORS.border
    let textColor = COLORS.textPrimary
    let statusText = ''
    
    switch (module.state) {
      case 'completed':
        bgColor = COLORS.accentGreen
        borderColor = COLORS.accentGreen
        statusText = 'Completado'
        break
      case 'available':
        // Usar SOLO colores del globals.css, NO el background_color del módulo
        bgColor = COLORS.bgSecondary
        borderColor = COLORS.borderAccent
        statusText = `S/${module.price}`
        break
      case 'locked':
        bgColor = COLORS.bgTernary
        borderColor = COLORS.border
        textColor = COLORS.textSecondary
        statusText = 'Bloqueado'
        break
      case 'free':
        bgColor = COLORS.bgSecondary
        borderColor = COLORS.lowGreen
        statusText = 'GRATIS'
        break
    }
    
    // Efecto hover - escalar ligeramente
    let drawX = x, drawY = y, drawWidth = width, drawHeight = height
    if (isHovered) {
      const hoverScale = 1.03  // Menos hover effect
      drawWidth = width * hoverScale
      drawHeight = height * hoverScale
      drawX = x - (drawWidth - width) / 2
      drawY = y - (drawHeight - height) / 2
    }
    
    // Dibujar fondo del módulo con bordes redondeados
    ctx.fillStyle = bgColor
    drawRoundedRect(ctx, drawX, drawY, drawWidth, drawHeight, radius)
    ctx.fill()
    
    // Dibujar borde
    ctx.strokeStyle = borderColor
    ctx.lineWidth = BORDER_WIDTH
    drawRoundedRect(ctx, drawX, drawY, drawWidth, drawHeight, radius)
    ctx.stroke()
    
    // Borde de selección adicional
    if (isSelected) {
      ctx.strokeStyle = COLORS.accentGreen
      ctx.lineWidth = BORDER_WIDTH + 2
      drawRoundedRect(ctx, drawX - 3, drawY - 3, drawWidth + 6, drawHeight + 6, radius + 3)
      ctx.stroke()
    }
    
    // Texto del módulo
    ctx.fillStyle = textColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // Título - con soporte para 2 líneas
    const fontSize = Math.max(11, 13 * scale)
    const lineHeight = fontSize * 1.2
    ctx.font = `600 ${fontSize}px system-ui, -apple-system, sans-serif`
    
    // Dibujar título en múltiples líneas (max 2)
    const titleMaxWidth = drawWidth - 20 * scale // Padding interno
    drawMultiLineText(
      ctx, 
      module.title, 
      drawX + drawWidth / 2, 
      drawY + drawHeight / 2 - lineHeight / 3, 
      titleMaxWidth, 
      lineHeight, 
      2
    )
    
    // Estado - texto más pequeño y sutil
    const statusFontSize = Math.max(9, 10 * scale)
    ctx.font = `400 ${statusFontSize}px system-ui, -apple-system, sans-serif`
    ctx.fillStyle = module.state === 'completed' ? COLORS.textPrimary : COLORS.textSecondary
    
    ctx.fillText(statusText, drawX + drawWidth / 2, drawY + drawHeight - statusFontSize * 1.5)
  }, [selectedModule, hoveredModule, scale, offset, drawRoundedRect, drawMultiLineText])

  // Función principal de dibujo
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Habilitar antialiasing
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    
    // Limpiar canvas
    ctx.fillStyle = COLORS.background
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Dibujar grilla
    drawGrid(ctx, canvas)
    
    // Dibujar conexiones
    drawConnections(ctx)
    
    // Dibujar módulos
    if (tree) {
      Array.from(tree.modules.values()).forEach(module => {
        drawModule(ctx, module)
      })
    }
  }, [tree, selectedModule, hoveredModule, scale, offset, drawGrid, drawConnections, drawModule])

  // Función para obtener módulo en posición del mouse
  const getModuleAtPosition = useCallback((mouseX: number, mouseY: number): string | null => {
    if (!tree) return null
    
    for (const module of tree.modules.values()) {
      const x = module.position.x * scale + offset.x
      const y = module.position.y * scale + offset.y
      const width = NODE_WIDTH * scale
      const height = NODE_HEIGHT * scale
      
      if (mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height) {
        return module.id
      }
    }
    
    return null
  }, [tree, scale, offset])

  // Función para centrar en el módulo root automáticamente
  const centerOnRootModule = useCallback(() => {
    if (!tree || !containerRef.current || tree.rootModules.length === 0) return
    
    // Encontrar el primer módulo root
    const rootModuleId = tree.rootModules[0]
    const rootModule = tree.modules.get(rootModuleId)
    
    if (!rootModule) return
    
    const container = containerRef.current
    const containerRect = container.getBoundingClientRect()
    
    // Calcular posición para centrar el módulo root
    const centerX = containerRect.width / 2
    const centerY = containerRect.height / 5
    
    // Calcular offset necesario para centrar el módulo
    const moduleX = rootModule.position.x * scale
    const moduleY = rootModule.position.y * scale
    const nodeCenterX = moduleX + (NODE_WIDTH * scale) / 2
    const nodeCenterY = moduleY + (NODE_HEIGHT * scale) / 2
    
    const newOffset = {
      x: centerX - nodeCenterX,
      y: centerY - nodeCenterY
    }
    
    setOffset(newOffset)
    setIsInitialized(true)
  }, [tree, scale])

  // Función para manejar click/tap tanto en mouse como touch
  const handleInteraction = useCallback((clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return false
    
    const mouseX = clientX - rect.left
    const mouseY = clientY - rect.top
    
    const moduleId = getModuleAtPosition(mouseX, mouseY)
    if (moduleId) {
      onModuleClick(moduleId)
      return true // Se hizo click en un módulo
    }
    return false // No se hizo click en ningún módulo
  }, [getModuleAtPosition, onModuleClick])

  // Handlers de eventos del mouse
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    setLastMousePos({ x: e.clientX, y: e.clientY })
    setDragStartPos({ x: e.clientX, y: e.clientY })
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    if (isDragging) {
      const deltaX = e.clientX - lastMousePos.x
      const deltaY = e.clientY - lastMousePos.y
      
      setOffset(prev => ({
        x: prev.x + deltaX*0.0,
        y: prev.y + deltaY*0.0
      }))
      
      setLastMousePos({ x: e.clientX, y: e.clientY })
    } else {
      // Detectar hover solo si no estamos arrastrando
      const moduleId = getModuleAtPosition(mouseX, mouseY)
      setHoveredModule(moduleId)
    }
  }, [isDragging, lastMousePos, getModuleAtPosition])

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    // Detectar si fue un click (sin movimiento significativo)
    if (isDragging) {
      const deltaX = Math.abs(e.clientX - dragStartPos.x)
      const deltaY = Math.abs(e.clientY - dragStartPos.y)
      
      // Si el movimiento fue mínimo, considerarlo un click
      if (deltaX < 5 && deltaY < 5) {
        handleInteraction(e.clientX, e.clientY)
      }
    }
    
    setIsDragging(false)
  }, [isDragging, dragStartPos, handleInteraction])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    
    const zoomFactor = 1.1
    const newScale = e.deltaY < 0 ? scale * zoomFactor : scale / zoomFactor
    
    // Limitar zoom
    if (newScale >= 0.3 && newScale <= 2) {
      setScale(newScale)
    }
  }, [scale])

  // Redimensionar canvas
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    
    const { width, height } = container.getBoundingClientRect()
    canvas.width = width * window.devicePixelRatio
    canvas.height = height * window.devicePixelRatio
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'
    
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    
    draw()
  }, [draw])

  // Effects
  useEffect(() => {
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [resizeCanvas])

  useEffect(() => {
    draw()
  }, [draw])

  useEffect(() => {
    const handleGlobalMouseUp = (e: MouseEvent) => {
      // Detectar si fue un click (sin movimiento significativo) también en eventos globales
      if (isDragging) {
        const deltaX = Math.abs(e.clientX - dragStartPos.x)
        const deltaY = Math.abs(e.clientY - dragStartPos.y)
        
        // Si el movimiento fue mínimo, considerarlo un click
        if (deltaX < 5 && deltaY < 5) {
          handleInteraction(e.clientX, e.clientY)
        }
      }
      setIsDragging(false)
    }
    
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - lastMousePos.x
        const deltaY = e.clientY - lastMousePos.y
        
        setOffset(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }))
        
        setLastMousePos({ x: e.clientX, y: e.clientY })
      }
    }
    
    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalMouseUp)
      document.addEventListener('mousemove', handleGlobalMouseMove)
    }
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('mousemove', handleGlobalMouseMove)
    }
  }, [isDragging, lastMousePos, dragStartPos, handleInteraction])

  // Handlers para touch events móviles
  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault()
    if (e.touches.length === 1) {
      // Inicio de arrastre con un dedo
      setIsDragging(true)
      const touch = e.touches[0]
      setLastMousePos({ x: touch.clientX, y: touch.clientY })
    } else if (e.touches.length === 2) {
      // Inicio de zoom con dos dedos
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const dx = touch2.clientX - touch1.clientX
      const dy = touch2.clientY - touch1.clientY
      setLastTouchDistance(Math.sqrt(dx * dx + dy * dy))
      
      const centerX = (touch1.clientX + touch2.clientX) / 2
      const centerY = (touch1.clientY + touch2.clientY) / 2
      setLastTouchCenter({ x: centerX, y: centerY })
    }
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault()
    if (isDragging && e.touches.length === 1) {
      // Arrastre con un dedo
      const touch = e.touches[0]
      const deltaX = touch.clientX - lastMousePos.x
      const deltaY = touch.clientY - lastMousePos.y
      
      setOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }))
      
      setLastMousePos({ x: touch.clientX, y: touch.clientY })
    } else if (e.touches.length === 2) {
      // Zoom con dos dedos
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const dx = touch2.clientX - touch1.clientX
      const dy = touch2.clientY - touch1.clientY
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (lastTouchDistance !== null) {
        const zoomFactor = distance / lastTouchDistance
        const newScale = scale * zoomFactor
        
        // Limitar zoom
        if (newScale >= 0.3 && newScale <= 2) {
          setScale(newScale)
        }
        setLastTouchDistance(distance)
      }
    }
  }, [isDragging, lastMousePos, lastTouchDistance, scale])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    // Detectar si fue un tap (sin movimiento significativo)
    if (e.changedTouches.length === 1 && isDragging) {
      const touch = e.changedTouches[0]
      const deltaX = Math.abs(touch.clientX - lastMousePos.x)
      const deltaY = Math.abs(touch.clientY - lastMousePos.y)
      
      // Si el movimiento fue mínimo, considerarlo un tap
      if (deltaX < 10 && deltaY < 10) {
        handleInteraction(touch.clientX, touch.clientY)
      }
    }
    
    if (e.touches.length === 0) {
      // Fin del arrastre o zoom
      setIsDragging(false)
      setLastTouchDistance(null)
      setLastTouchCenter(null)
    }
  }, [isDragging, lastMousePos, handleInteraction])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Agregar event listeners para touch events móviles
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  // Effect para centrar automáticamente en el módulo root cuando se carga
  useEffect(() => {
    if (tree && !isInitialized && containerRef.current) {
      // Dar un pequeño delay para asegurar que el container esté completamente renderizado
      setTimeout(() => {
        centerOnRootModule()
      }, 100)
    }
  }, [tree, isInitialized, centerOnRootModule])

  // Effect para re-centrar si cambia el tamaño del container
  useEffect(() => {
    if (tree && isInitialized && containerRef.current) {
      centerOnRootModule()
    }
  }, [tree, centerOnRootModule]) // Removí isInitialized para que siempre se re-centre

  if (!tree) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-secondary">Cargando árbol de módulos...</div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      />
      
      {/* Controles de zoom minimalistas */}
      <div className="absolute top-4 right-4 bg-bg-secondary/80 backdrop-blur border border-border rounded-lg p-1 space-y-1">
        <button
          onClick={() => setScale(prev => Math.min(prev * 1.2, 2))}
          className="block w-7 h-7 bg-bg-ternary hover:bg-border text-text-primary rounded text-sm font-bold"
        >
          +
        </button>
        <button
          onClick={() => setScale(prev => Math.max(prev / 1.2, 0.3))}
          className="block w-7 h-7 bg-bg-ternary hover:bg-border text-text-primary rounded text-sm font-bold"
        >
          −
        </button>
        <button
          onClick={() => {
            setScale(1)
            centerOnRootModule()
          }}
          className="block w-7 h-7 bg-bg-ternary hover:bg-border text-text-primary rounded text-xs"
        >
          ⌂
        </button>
      </div>
      
      {/* Indicador de zoom sutil */}
      <div className="absolute bottom-4 right-4 bg-bg-secondary/60 backdrop-blur border border-border rounded px-3 py-1 text-text-secondary text-xs">
        {Math.round(scale * 100)}%
      </div>
    </div>
  )
}