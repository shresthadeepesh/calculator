import React, { lazy, Suspense } from 'react';
import './style.css';

const Calculator = lazy(() => import('./pages/calculator'));

const App = () => {
    return (
        <Suspense fallback={<div className="min-h-screen" />}>
            <Calculator />
        </Suspense>
    )
}

export default App;