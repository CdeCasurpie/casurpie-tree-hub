import Button from './Button';

export default function Hero() {
  return (
    <main className="container mx-auto px-6 py-20">
      <div className="text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-text-primary mb-6">
          Aprende{" "}
          <span className="bg-gradient-to-r from-accent-green to-low-green bg-clip-text text-transparent">
            Programación
          </span>
          <br />por Módulos
        </h1>
        <p className="text-xl text-text-secondary mb-8 max-w-3xl mx-auto">
          Una plataforma interactiva donde cada módulo es un nodo de conocimiento.
          Aprende a tu ritmo, practica ilimitadamente y domina la programación
          paso a paso.
        </p>

        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <Button href="/modules" size="lg">
            Ver Módulos
          </Button>
          <Button href="/demo" variant="outline" size="lg">
            Demo Gratuito
          </Button>
        </div>
      </div>
    </main>
  );
}