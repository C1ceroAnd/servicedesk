import { useState } from 'react';
import { FiMessageCircle } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao fazer login');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-primary)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: '24px' }}>
            <FiMessageCircle size={28} />
          </div>
          <div>
            <h1 style={{ margin: 0 }}>ServiceDesk</h1>
            <p style={{ margin: '4px 0 0 0' }}>Sistema de Gestão de Chamados</p>
          </div>
        </div>
        
        {error && (
          <div className="error" style={{ margin: '16px 16px 0 16px' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="login-spinner" style={{ marginRight: '8px' }}></span>
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>


      </div>

      <div style={{ position: 'relative', zIndex: 1, marginTop: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          © 2026 ServiceDesk. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
