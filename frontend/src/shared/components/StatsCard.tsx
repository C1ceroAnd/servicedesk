import { FiAlertCircle, FiClock, FiCheckCircle } from 'react-icons/fi';

interface StatsCardProps {
  label: string;
  value: number;
  type?: 'total' | 'pending' | 'inProgress' | 'completed';
}

const getIcon = (type?: string) => {
  switch (type) {
    case 'pending':
      return <FiAlertCircle size={24} />;
    case 'inProgress':
      return <FiClock size={24} />;
    case 'completed':
      return <FiCheckCircle size={24} />;
    default:
      return null;
  }
};

const getIconColor = (type?: string) => {
  switch (type) {
    case 'pending':
      return '#f59e0b'; // amber
    case 'inProgress':
      return '#3b82f6'; // blue
    case 'completed':
      return '#10b981'; // emerald
    default:
      return '#6b7280'; // gray
  }
};

export function StatsCard({ label, value, type }: StatsCardProps) {
  const icon = getIcon(type);
  const iconColor = getIconColor(type);
  return (
    <div 
      style={{ 
        minHeight: '118px', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        gap: '6px',
        padding: '20px',
        margin: '0',
        background: 'linear-gradient(145deg, var(--color-surface), var(--color-surface-alt))',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-md)',
        color: 'var(--color-text)',
        boxSizing: 'border-box',
        position: 'relative'
      }}
    >
      {icon && (
        <div style={{ position: 'absolute', top: '12px', right: '12px', color: iconColor, opacity: 0.6 }}>
          {icon}
        </div>
      )}
      <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontSize: '28px', fontWeight: '700' }}>
        {value}
      </div>
    </div>
  );
}

export default StatsCard;
