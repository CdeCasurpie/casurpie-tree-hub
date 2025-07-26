import { ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  iconBgColor?: string;
  iconTextColor?: string;
}

export default function FeatureCard({
  icon,
  title,
  description,
  iconBgColor = 'bg-accent-green',
  iconTextColor = 'text-text-primary'
}: FeatureCardProps) {
  return (
    <div className="text-center p-6 bg-bg-secondary rounded-xl border border-border hover:border-border-accent transition-colors">
      <div className={`w-16 h-16 ${iconBgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
        <div className={`w-8 h-8 ${iconTextColor}`}>
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-semibold text-text-primary mb-2">
        {title}
      </h3>
      <p className="text-text-secondary">
        {description}
      </p>
    </div>
  );
}