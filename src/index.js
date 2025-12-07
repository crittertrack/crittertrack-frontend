import './index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
// FIX: Changed import from './App' to './app' to match the lowercase file name on disk.
import App from './app'; 

// Find the root element where the app will attach
const container = document.getElementById('root');
const root = createRoot(container);

// Render the main App component
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);