import FeatureCard from './FeatureCard';

export default function Features() {
  return (
    <section className="mt-1">
      <div className="grid md:grid-cols-3 gap-12">
        <FeatureCard
          icon={
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="w-full h-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          }
          title="Aprendizaje Modular"
          description="Cada tema es un módulo independiente con video, teoría y práctica."
        />

        <FeatureCard
          icon={
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="w-full h-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          }
          title="IA Asistente"
          description="Pregunta dudas específicas sobre cada módulo con IA contextual."
          iconBgColor="bg-low-green"
          iconTextColor="text-bg-principal"
        />

        <FeatureCard
          icon={
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="w-full h-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          }
          title="Práctica Infinita"
          description="Ejercicios ilimitados generados por IA para dominar cada concepto."
          iconBgColor="bg-gradient-to-br from-accent-green to-low-green"
        />
      </div>
    </section>
  );
}