import React, { lazy, Suspense } from 'react';
import { CalculatorProvider } from '../../components/calculator/calculatorContext';

const Screen = lazy(() => import('../../components/calculator/screen'));
const Keypad = lazy(() => import('../../components/calculator/keypad'));

const Calculator = () => {
    return (
        <CalculatorProvider>
            <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
                <div className="glass w-full max-w-[21rem] rounded-[1.75rem] p-5 pt-1">
                    <Suspense fallback={<div className="h-[28rem]" />}>
                        <Screen />
                        <Keypad />
                    </Suspense>
                </div>
            </main>
        </CalculatorProvider>
    );
};

export default Calculator;
