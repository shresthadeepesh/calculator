import React from 'react';
import { groupDigits } from '../../engine';
import { useCalculatorContext } from './calculatorContext';
import { CalculatorActionType } from './calculatorReducer';

const History = () => {
    const { state, dispatch } = useCalculatorContext();

    if (state.mode === 'converter' || !state.history.length) return null;

    return (
        <div className="mt-4 border-t border-white/10 pt-3">
            <ul className="space-y-1">
                {state.history.slice(0, 4).map(entry => (
                    <li key={entry.id}>
                        <button
                            type="button"
                            onClick={() =>
                                dispatch({ type: CalculatorActionType.RECALL, payload: entry.result })
                            }
                            className="flex w-full items-baseline justify-between gap-4 rounded-lg px-2 py-1 text-left transition-colors duration-150 hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/80 motion-reduce:transition-none"
                        >
                            <span className="truncate text-xs text-slate-400">{entry.expression}</span>
                            <span className="shrink-0 text-sm tabular-nums text-slate-200">
                                {groupDigits(entry.result)}
                            </span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default History;
