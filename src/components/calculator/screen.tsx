import React from 'react';
import { useCalculatorContext } from './calculatorContext';

const Screen = () => {
    const {state} = useCalculatorContext();

    return (
        <div className='bg-gray-400 h-32 py-4 px-5 my-4 text-right rounded-md border-gray-800 border'>
            <h3 className="text-lg">{state.value.map(value => value)}</h3>
            <h2 className="text-5xl">{state.result}</h2>
        </div>
    )
}

export default Screen;