export const apps = [
  { id: 'standalone', kind: 'static', output: 'dist', expectedSpritePath: '/app-icons/sprite.svg' },
  { id: 'standalone-vite', kind: 'static', output: 'dist' },
  { id: 'standalone-webpack', kind: 'static', output: 'dist' },
  { id: 'react-vite', kind: 'static', output: 'dist' },
  { id: 'react-webpack', kind: 'static', output: 'dist' },
  { id: 'next-app-turbopack', kind: 'next' },
  { id: 'next-app-webpack', kind: 'next' },
  { id: 'next-pages-turbopack', kind: 'next' },
  { id: 'next-pages-webpack', kind: 'next' },
]
