import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Anuj from './anuj';

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StrictMode>
    <Anuj />
  </StrictMode>
);

