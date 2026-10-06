import React, { FC } from 'react';

export type KeyKind = 'digit' | 'operator' | 'function' | 'equal' | 'panel';

export interface IButton {
    label: string;
    onPress: () => void;
    kind?: KeyKind;
    /** Toggle keys (deg/rad, inv, base) show their state here. */
    active?: boolean;
    disabled?: boolean;
    describe?: string;
    className?: string;
}

const KIND_STYLES: Record<KeyKind, string> = {
    digit: 'bg-white/[0.06] text-slate-50 hover:bg-white/[0.12]',
    operator: 'bg-white/[0.1] text-amber-100 hover:bg-white/[0.16]',
    function: 'bg-white/[0.03] text-slate-300 hover:bg-white/[0.1] hover:text-slate-100',
    equal: 'bg-amber-300 text-[#0B1B24] hover:bg-amber-200',
    panel: 'bg-white/[0.04] text-slate-200 hover:bg-white/[0.1]',
};

const Button: FC<IButton> = ({
    label,
    onPress,
    kind = 'digit',
    active = false,
    disabled = false,
    describe,
    className = '',
}) => (
    <button
        type="button"
        onClick={onPress}
        disabled={disabled}
        aria-pressed={active || undefined}
        aria-label={describe}
        className={[
            'flex items-center justify-center rounded-2xl border border-white/10 font-medium',
            'shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-sm',
            'transition-colors duration-150 motion-reduce:transition-none',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1B24]',
            'active:scale-[0.97] motion-reduce:active:scale-100',
            'disabled:pointer-events-none disabled:opacity-25',
            active ? 'bg-amber-300/20 text-amber-100 ring-1 ring-amber-200/40' : KIND_STYLES[kind],
            className,
        ].join(' ')}
    >
        {label}
    </button>
);

export default Button;
