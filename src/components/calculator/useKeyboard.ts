import { useEffect } from 'react';
import { useCalculatorContext } from './calculatorContext';
import { CalculatorActionType } from './calculatorReducer';

const SHARED = '0123456789.+-*/%';
const SCIENTIFIC = '()^!';
const HEX = 'ABCDEF';

/** Mirrors the keypad on a physical keyboard, following the active mode. */
export const useKeyboard = () => {
    const { state, dispatch } = useCalculatorContext();
    const { mode } = state;

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.metaKey || event.ctrlKey || event.altKey) return;

            const target = event.target as HTMLElement | null;
            if (target && /^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) return;

            const { key } = event;

            if (key === 'Enter' || key === '=') {
                event.preventDefault();
                dispatch({ type: CalculatorActionType.EQUAL });
                return;
            }

            if (key === 'Backspace') {
                dispatch({ type: CalculatorActionType.BACKSPACE });
                return;
            }

            if (key === 'Escape' || key === 'Delete') {
                dispatch({ type: CalculatorActionType.CLEAR });
                return;
            }

            if (key.length !== 1) return;

            const allowed =
                mode === 'converter'
                    ? '0123456789.'
                    : mode === 'programmer'
                    ? `${SHARED}()${HEX}${HEX.toLowerCase()}`
                    : mode === 'scientific'
                    ? `${SHARED}${SCIENTIFIC}`
                    : SHARED;

            if (key === 'x' && mode !== 'programmer') {
                dispatch({ type: CalculatorActionType.ENTRY, payload: '*' });
                return;
            }

            if (!allowed.includes(key)) return;

            const payload = mode === 'programmer' && HEX.includes(key.toUpperCase()) ? key.toUpperCase() : key;
            dispatch({ type: CalculatorActionType.ENTRY, payload });
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [dispatch, mode]);
};
