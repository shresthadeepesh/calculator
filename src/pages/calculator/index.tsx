import React, { lazy, Suspense } from 'react';
import { CalculatorProvider, useCalculatorContext } from '../../components/calculator/calculatorContext';

const Screen = lazy(() => import('../../components/calculator/screen'));
const Keypad = lazy(() => import('../../components/calculator/keypad'));
const ModeSwitcher = lazy(() => import('../../components/calculator/modeSwitcher'));
const FunctionPanel = lazy(() => import('../../components/calculator/functionPanel'));
const ConverterPanel = lazy(() => import('../../components/calculator/converterPanel'));
const History = lazy(() => import('../../components/calculator/history'));

const Panel = () => {
    const { state } = useCalculatorContext();
    const wide = state.mode === 'scientific' || state.mode === 'programmer';

    return (
        <div className={`glass w-full rounded-[1.75rem] p-5 ${wide ? 'max-w-[34rem]' : 'max-w-[21rem]'}`}>
            <ModeSwitcher />
            <Screen />
            {state.mode === 'converter' ? (
                <div className="space-y-4">
                    <ConverterPanel />
                    <Keypad />
                </div>
            ) : (
                <div className={wide ? 'grid gap-3 sm:grid-cols-[12.5rem_minmax(0,1fr)]' : ''}>
                    {wide ? <FunctionPanel /> : null}
                    <Keypad />
                </div>
            )}
            <History />
        </div>
    );
};

const Calculator = () => (
    <CalculatorProvider>
        <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
            <Suspense fallback={<div className="h-[32rem]" />}>
                <Panel />
            </Suspense>
        </main>
    </CalculatorProvider>
);

export default Calculator;
