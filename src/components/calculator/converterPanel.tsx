import React from 'react';
import { CATEGORIES, categoryFor } from '../../engine';
import { useCalculatorContext } from './calculatorContext';
import { CalculatorActionType } from './calculatorReducer';

const SELECT =
    'w-full appearance-none rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/80';

const ConverterPanel = () => {
    const { state, dispatch } = useCalculatorContext();
    const category = categoryFor(state.converter.category);

    const set = (converter: Partial<typeof state.converter>) =>
        dispatch({ type: CalculatorActionType.SET_CONVERTER, converter });

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(item => {
                    const selected = item.key === state.converter.category;

                    return (
                        <button
                            key={item.key}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => set({ category: item.key })}
                            className={[
                                'rounded-lg px-2.5 py-1 text-xs transition-colors duration-150 motion-reduce:transition-none',
                                'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/80',
                                selected
                                    ? 'bg-amber-300/20 text-amber-100'
                                    : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.1]',
                            ].join(' ')}
                        >
                            {item.label}
                        </button>
                    );
                })}
            </div>

            <div className="flex items-end gap-2">
                <label className="flex-1">
                    <span className="sr-only">Convert from</span>
                    <select
                        className={SELECT}
                        value={state.converter.from}
                        onChange={event => set({ from: event.target.value })}
                    >
                        {category.units.map(unit => (
                            <option key={unit.key} value={unit.key} className="bg-[#0B1B24]">
                                {unit.label}
                            </option>
                        ))}
                    </select>
                </label>

                <button
                    type="button"
                    onClick={() => dispatch({ type: CalculatorActionType.SWAP_UNITS })}
                    aria-label="Swap units"
                    className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-slate-200 transition-colors duration-150 hover:bg-white/[0.12] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/80 motion-reduce:transition-none"
                >
                    {'⇄'}
                </button>

                <label className="flex-1">
                    <span className="sr-only">Convert to</span>
                    <select
                        className={SELECT}
                        value={state.converter.to}
                        onChange={event => set({ to: event.target.value })}
                    >
                        {category.units.map(unit => (
                            <option key={unit.key} value={unit.key} className="bg-[#0B1B24]">
                                {unit.label}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
        </div>
    );
};

export default ConverterPanel;
