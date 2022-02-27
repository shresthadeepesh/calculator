import React, { FC } from 'react';
import { useCalculatorContext, Operator } from './calculatorContext';
import { CalculatorActionType } from './calculatorReducer';

interface IButton {
    value: number | Operator;
}

const Button: FC<IButton> = ({ value }) => {
    const {state, dispatch} = useCalculatorContext();

    const buttonClicked = () => {
        if(typeof value !== 'number') {
            switch(value) {
                case '=':
                    dispatch({
                        type: CalculatorActionType.EQUAL
                    })
                    return;

                case '<-':
                    dispatch({
                        type: CalculatorActionType.BACKSPACE
                    })
                    return;

                case 'AC':
                    dispatch({
                        type: CalculatorActionType.CLEAR
                    })
                    return;
            }
        }

        dispatch({
            type: CalculatorActionType.ENTRY,
            payload: value
        });
    }

    return (
        <div 
        className="w-16 h-16 my-2 rounded-full flex justify-center items-center bg-orange-600 text-white hover:cursor-pointer hover:bg-orange-400 transition duration-500 text-2xl"
            onClick={buttonClicked}
        >
            {value}
        </div>
    )
}

export default Button;