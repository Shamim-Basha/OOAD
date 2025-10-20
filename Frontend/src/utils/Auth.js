export const isAuthenticated = () => {
  return localStorage.getItem('user') !== null;
};

export const isAdmin = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user && user.role === 'ADMIN';
};

export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

export const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('isAdmin');
  window.location.href = '/';
};