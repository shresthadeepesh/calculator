export interface Unit {
    key: string;
    label: string;
    toBase: (value: number) => number;
    fromBase: (value: number) => number;
}

export interface Category {
    key: string;
    label: string;
    units: Unit[];
}

const linear = (key: string, label: string, factor: number): Unit => ({
    key,
    label,
    toBase: value => value * factor,
    fromBase: value => value / factor,
});

/** Temperature is affine, not a factor, so it carries its own pair. */
const affine = (
    key: string,
    label: string,
    toBase: (value: number) => number,
    fromBase: (value: number) => number
): Unit => ({ key, label, toBase, fromBase });

export const CATEGORIES: Category[] = [
    {
        key: 'length',
        label: 'Length',
        units: [
            linear('mm', 'mm', 0.001),
            linear('cm', 'cm', 0.01),
            linear('m', 'm', 1),
            linear('km', 'km', 1000),
            linear('in', 'in', 0.0254),
            linear('ft', 'ft', 0.3048),
            linear('mi', 'mi', 1609.344),
        ],
    },
    {
        key: 'mass',
        label: 'Mass',
        units: [
            linear('g', 'g', 1),
            linear('kg', 'kg', 1000),
            linear('t', 't', 1e6),
            linear('oz', 'oz', 28.349523125),
            linear('lb', 'lb', 453.59237),
            linear('st', 'st', 6350.29318),
        ],
    },
    {
        key: 'temperature',
        label: 'Temperature',
        units: [
            affine('c', '°C', value => value, value => value),
            affine('f', '°F', value => ((value - 32) * 5) / 9, value => (value * 9) / 5 + 32),
            affine('k', 'K', value => value - 273.15, value => value + 273.15),
        ],
    },
    {
        key: 'volume',
        label: 'Volume',
        units: [
            linear('ml', 'ml', 0.001),
            linear('l', 'L', 1),
            linear('cup', 'cup', 0.2365882365),
            linear('pt', 'pt', 0.473176473),
            linear('qt', 'qt', 0.946352946),
            linear('gal', 'gal', 3.785411784),
        ],
    },
    {
        key: 'speed',
        label: 'Speed',
        units: [
            linear('ms', 'm/s', 1),
            linear('kmh', 'km/h', 1 / 3.6),
            linear('mph', 'mph', 0.44704),
            linear('kn', 'kn', 0.514444444),
        ],
    },
    {
        key: 'data',
        label: 'Data',
        units: [
            linear('b', 'byte', 1),
            linear('kb', 'KB', 1e3),
            linear('mb', 'MB', 1e6),
            linear('gb', 'GB', 1e9),
            linear('kib', 'KiB', 1024),
            linear('mib', 'MiB', 1024 ** 2),
            linear('gib', 'GiB', 1024 ** 3),
        ],
    },
    {
        key: 'time',
        label: 'Time',
        units: [
            linear('ms', 'ms', 0.001),
            linear('s', 's', 1),
            linear('min', 'min', 60),
            linear('h', 'h', 3600),
            linear('d', 'day', 86400),
            linear('wk', 'week', 604800),
        ],
    },
];

export const categoryFor = (key: string) =>
    CATEGORIES.find(category => category.key === key) ?? CATEGORIES[0];

export const unitFor = (category: Category, key: string) =>
    category.units.find(unit => unit.key === key) ?? category.units[0];

export const convert = (value: number, from: Unit, to: Unit) => to.fromBase(from.toBase(value));
