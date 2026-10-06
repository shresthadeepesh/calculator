import { useEffect } from 'react';
import { CalculatorActionType, IAction } from './calculatorReducer';

const ENTRIES = '0123456789.+-*/%';

/** Mirrors the keypad on a physical keyboard: digits, operators, Enter, Backspace, Escape. */
export const useKeyboard = (dispatch: React.Dispatch<IAction>) => {
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.metaKey || event.ctrlKey || event.altKey) return;

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

            if (key === 'x' || key === 'X') {
                dispatch({ type: CalculatorActionType.ENTRY, payload: '*' });
                return;
            }

            if (key.length === 1 && ENTRIES.includes(key)) {
                dispatch({ type: CalculatorActionType.ENTRY, payload: key });
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [dispatch]);
};
