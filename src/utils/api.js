const API_BASE =
  process.env.REACT_APP_API_BASE_URL  
  || '/api';                        

export function api(path) {
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}
