import React, { useMemo } from 'react';
import { useCalculatorContext } from './calculatorContext';
import { evaluate, format, prettify } from './evaluate';

const sizeFor = (text: string) => {
    if (text.length > 16) return 'text-3xl';
    if (text.length > 11) return 'text-4xl';
    if (text.length > 8) return 'text-5xl';
    return 'text-6xl';
};

const Screen = () => {
    const { state } = useCalculatorContext();

    const expression = prettify(state.tokens);

    const preview = useMemo(() => {
        if (state.settled || state.tokens.length < 3) return null;

        try {
            return format(evaluate(state.tokens));
        } catch {
            return null;
        }
    }, [state.tokens, state.settled]);

    const headline = state.error ?? state.result ?? preview ?? expression ?? '0';
    const showsPreview = !state.error && state.result === null && preview !== null;

    return (
        <div className="px-1 pb-6 pt-8 text-right">
            <p
                className="h-6 truncate font-sans text-sm tabular-nums tracking-wide text-slate-300/60"
                aria-hidden={!expression}
            >
                {state.result !== null || preview !== null ? expression : ' '}
            </p>
            <output
                aria-live="polite"
                className={[
                    'mt-2 block truncate font-sans font-light leading-none tracking-tight tabular-nums',
                    state.error ? 'text-xl text-rose-200/90' : sizeFor(headline),
                    showsPreview ? 'text-slate-100/55' : 'text-slate-50',
                ].join(' ')}
            >
                {headline || '0'}
            </output>
        </div>
    );
};

export default Screen;
