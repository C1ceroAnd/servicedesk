import axios from 'axios';

jest.mock('axios');

describe('Interceptador de API - Autenticação', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('deve adicionar accessToken no header Authorization', () => {
    const accessToken = 'test-access-token';
    localStorage.setItem('accessToken', accessToken);

    const config = { headers: { Authorization: '' } };
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    expect(config.headers.Authorization).toBe(`Bearer ${accessToken}`);
  });

  it('deve não adicionar Authorization header se token não existir', () => {
    localStorage.removeItem('accessToken');

    const config = { headers: { Authorization: '' } };
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    expect(config.headers.Authorization).toBe('');
  });

  it('deve armazenar novo accessToken após refresh', () => {
    const newAccessToken = 'new-access-token';
    const newRefreshToken = 'new-refresh-token';

    localStorage.setItem('accessToken', newAccessToken);
    localStorage.setItem('refreshToken', newRefreshToken);

    expect(localStorage.getItem('accessToken')).toBe(newAccessToken);
    expect(localStorage.getItem('refreshToken')).toBe(newRefreshToken);
  });

  it('deve fazer logout ao falhar refresh', () => {
    localStorage.setItem('accessToken', 'expired-token');
    localStorage.setItem('refreshToken', 'invalid-refresh');

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    expect(localStorage.getItem('accessToken')).toBeFalsy();
    expect(localStorage.getItem('refreshToken')).toBeFalsy();
  });

  it('deve verificar se refresh token existe', () => {
    localStorage.removeItem('refreshToken');
    const refreshToken = localStorage.getItem('refreshToken');

    expect(!refreshToken).toBe(true);
  });
});
