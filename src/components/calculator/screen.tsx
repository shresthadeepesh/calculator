import React, { useMemo } from 'react';
import {
    BASES,
    evaluate,
    formatBits,
    formatNumber,
    groupDigits,
    prettify,
} from '../../engine';
import { useCalculatorContext } from './calculatorContext';
import { converterValue } from './calculatorReducer';
import { categoryFor, unitFor } from '../../engine';
import { tableFor } from './state';

const sizeFor = (text: string) => {
    if (text.length > 18) return 'text-2xl';
    if (text.length > 14) return 'text-3xl';
    if (text.length > 10) return 'text-4xl';
    if (text.length > 7) return 'text-5xl';
    return 'text-6xl';
};

const ConverterReadout = () => {
    const { state } = useCalculatorContext();
    const { input, output } = converterValue(state);
    const category = categoryFor(state.converter.category);
    const from = unitFor(category, state.converter.from);
    const to = unitFor(category, state.converter.to);
    const headline = groupDigits(output);

    return (
        <div className="px-1 pb-5 pt-6 text-right">
            <p className="truncate text-sm text-slate-300/60">
                {groupDigits(input)} {from.label}
            </p>
            <p className={`mt-1 truncate font-light leading-none tabular-nums text-slate-50 ${sizeFor(headline)}`}>
                {headline}
            </p>
            <p className="mt-2 text-sm text-slate-300/60">{to.label}</p>
        </div>
    );
};

const BaseRow = () => {
    const { state } = useCalculatorContext();

    const values = useMemo(() => {
        try {
            const value = evaluate(state.tokens, tableFor(state), { angle: state.angle }) as bigint;
            return BASES.map(base => ({ label: base.label, text: formatBits(value, base.key) }));
        } catch {
            return null;
        }
    }, [state]);

    if (!values) return null;

    return (
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-left text-xs text-slate-400">
            {values.map(base => (
                <div key={base.label} className="flex justify-between gap-3">
                    <dt>{base.label}</dt>
                    <dd className="truncate tabular-nums text-slate-200">{base.text}</dd>
                </div>
            ))}
        </dl>
    );
};

const ExpressionReadout = () => {
    const { state } = useCalculatorContext();
    const table = tableFor(state);
    const expression = prettify(state.tokens, table);

    const preview = useMemo(() => {
        if (state.settled || state.tokens.length < 3) return null;

        try {
            const value = evaluate(state.tokens, table, { angle: state.angle });
            return state.mode === 'programmer'
                ? formatBits(value as bigint, state.base)
                : formatNumber(value as number);
        } catch {
            return null;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);

    const value = state.result ?? preview;
    const headline = state.error ?? (value === null ? expression || '0' : groupDigits(value));
    const dimmed = !state.error && state.result === null && preview !== null;

    return (
        <div className="px-1 pb-5 pt-6 text-right">
            <p className="h-5 truncate text-sm tabular-nums tracking-wide text-slate-300/60">
                {value !== null ? expression : ' '}
            </p>
            <output
                aria-live="polite"
                className={[
                    'mt-2 block truncate font-light leading-none tracking-tight tabular-nums',
                    state.error ? 'text-xl text-rose-200/90' : sizeFor(headline),
                    dimmed ? 'text-slate-100/55' : 'text-slate-50',
                ].join(' ')}
            >
                {headline}
            </output>
            {state.mode === 'programmer' && !state.error ? <BaseRow /> : null}
            {state.memory !== 0 && state.mode !== 'programmer' ? (
                <p className="mt-2 text-xs text-slate-400">M {formatNumber(state.memory)}</p>
            ) : null}
        </div>
    );
};

const Screen = () => {
    const { state } = useCalculatorContext();
    return state.mode === 'converter' ? <ConverterReadout /> : <ExpressionReadout />;
};

export default Screen;
