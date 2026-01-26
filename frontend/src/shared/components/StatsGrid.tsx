import { StatsCard } from './StatsCard';

interface StatsGridProps {
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  };
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(4, 1fr)', 
      gap: '16px',
      marginBottom: '24px'
    }}>
      <StatsCard label="Total" value={stats.total} type="total" />
      <StatsCard label="Pendentes" value={stats.pending} type="pending" />
      <StatsCard label="Em Progresso" value={stats.inProgress} type="inProgress" />
      <StatsCard label="Finalizados" value={stats.completed} type="completed" />
    </div>
  );
}
