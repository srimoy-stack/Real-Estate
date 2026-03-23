import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    helperText?: string;
    options: { label: string; value: string | number }[];
}

export const Select: React.FC<SelectProps> = ({
    label,
    error,
    helperText,
    options,
    className = '',
    id,
    ...props
}) => {
    return (
        <div className="space-y-3 w-full group relative">
            {label && (
                <label
                    htmlFor={id}
                    className="text-[11px] font-black text-slate-400 uppercase tracking-widest block transition-colors group-focus-within:text-slate-900"
                >
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    id={id}
                    className={`
                        w-full rounded-2xl border bg-slate-50 px-6 py-5 
                        text-slate-900 font-bold outline-none transition-all
                        appearance-none cursor-pointer
                        focus:bg-white focus:border-indigo-500 focus:shadow-xl focus:shadow-indigo-500/5
                        disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed
                        ${error ? 'border-rose-300 bg-rose-50 focus:border-rose-500' : 'border-slate-200'}
                        ${className}
                    `}
                    {...props}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
            {error && (
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest pl-2 ">
                    {error}
                </p>
            )}
            {helperText && !error && (
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 ">
                    {helperText}
                </p>
            )}
        </div>
    );
};
