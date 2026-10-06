const PRECISION = 12;
/** Conversions are measurements, not identities: 12 significant digits is noise. */
export const CONVERSION_PRECISION = 9;
const UPPER = 1e15;
const LOWER = 1e-9;

/** Trims floating-point noise: 0.1 + 0.2 reads 0.3, and 2 + 2 reads 4. */
export const formatNumber = (value: number, precision = PRECISION) => {
    if (value === 0) return '0';

    const magnitude = Math.abs(value);
    if (magnitude >= UPPER || magnitude < LOWER) {
        return value.toExponential(6).replace(/\.?0+e/, 'e').replace('e+', 'e');
    }

    return String(parseFloat(value.toPrecision(precision)));
};

/** Thousands separators for the readout, left alone past 1e15 and in exponent form. */
export const groupDigits = (text: string) => {
    if (text.includes('e')) return text;

    const [whole, fraction] = text.split('.');
    const sign = whole.startsWith('-') ? '-' : '';
    const digits = sign ? whole.slice(1) : whole;
    const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    return `${sign}${grouped}${fraction === undefined ? '' : `.${fraction}`}`;
};
