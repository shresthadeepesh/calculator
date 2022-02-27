import React, { lazy, Suspense } from 'react';
import { CalculatorProvider, Operator } from '../../components/calculator/calculatorContext';

const Screen = lazy(() => import('../../components/calculator/screen'));
const Button = lazy(() => import('../../components/calculator/button'));

type Test = Operator | number;

const values: Test[]  = [
    "AC", "<-", "%", "/",
    7, 8, 9, "*",
    4, 5, 6, "-",
    1, 2, 3, "+",
    0, ".", "="
];

const Calculator = () => {
    return (
        <CalculatorProvider>
            <section className='w-96 mx-auto bg-gray-100 my-5 p-5 rounded-md'>
                <Suspense fallback={"Loading..."}>
                    <div className="">
                        <h2 className="">Calculator</h2>
                    </div>
                    <div className="screen">
                        <Screen />
                    </div>
                    <div className="buttons">
                        <div className="flex flex-wrap">
                            {values.map((value, index) => (
                                <div className="w-1/4">
                                    <Button value={value} />
                                </div>
                            ))}
                        </div>
                    </div>
                </Suspense>
            </section>
        </CalculatorProvider>
    )
}

export default Calculator;