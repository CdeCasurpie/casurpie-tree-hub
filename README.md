# Plataforma Modular de Aprendizaje Interactivo

**Autor:** César Perales  
**Inicio:** 22/07/2025  
**Primer MVP:** 29/07/2025

## Descripción

Plataforma web para aprender programación y temas técnicos mediante módulos independientes conectados en un árbol de conocimiento. Cada módulo incluye video, teoría interactiva en Markdown, ejercicios tipo examen y un "modo infinito" de práctica generada por IA.

## Características principales

- Módulos con video, texto enriquecido, ejercicios y prácticas.
- Árbol visual de aprendizaje con jerarquía libre.
- Acceso por compra única por módulo.
- Generador de ejercicios infinitos tipo Duolingo.
- Panel administrador completo para modificar contenido.
- Recuperación de contraseña obligatoria.
- Asistente IA por módulo (GPT contextual).

## Stack Tecnológico

- **Frontend:** Next.js + TailwindCSS  
- **Backend & DB:** Supabase (PostgreSQL, Auth, Storage)  
- **Video:** Vimeo o YouTube no listado  
- **Pagos:** Stripe o MercadoPago  
- **IA:** OpenAI API con contexto  
- **Hosting:** Vercel

## Estructura del contenido

- Árbol de módulos: miniatura, nombre, conexión padre-hijo.
- Vista previa del módulo: descripción, imagen, precio.
- Vista completa: video, notas (Markdown + imágenes + código), ejercicios insertados y finales.
- Botones: visitar módulo, resolver examen, practicar en modo infinito.

## Cómo correr el proyecto

```bash
git clone https://github.com/CdeCasurpie/casurpie-tree-hub.git
cd casurpie-tree-hub
pnpm install
pnpm dev
````

Recuerda configurar las variables de entorno (`.env`) con las credenciales de Supabase y Stripe.

## Licencia

Este proyecto es privado. Todos los derechos reservados.
No está permitida su copia, redistribución o modificación sin autorización expresa.
