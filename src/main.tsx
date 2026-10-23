import { createRoot } from 'react-dom/client';
import { lazy, Suspense } from 'react';
import App from './App';
import './styles.css';
const thumb = new URLSearchParams(location.search).get('thumb');
const Thumb = lazy(() => import('./Thumb'));
createRoot(document.getElementById('root')!).render(thumb ? <Suspense><Thumb slug={thumb} /></Suspense> : <App />);
