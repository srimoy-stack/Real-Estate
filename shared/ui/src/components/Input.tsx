import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    helperText,
    className = '',
    id,
    ...props
}) => {
    return (
        <div className="space-y-3 w-full group">
            {label && (
                <label
                    htmlFor={id}
                    className="text-[11px] font-black text-slate-400 uppercase tracking-widest block transition-colors group-focus-within:text-slate-900"
                >
                    {label}
                </label>
            )}
            <input
                id={id}
                className={`
                    w-full rounded-2xl border bg-slate-50 px-6 py-5 
                    text-slate-900 font-bold outline-none transition-all
                    placeholder:text-slate-300 placeholder:font-medium
                    focus:bg-white focus:border-indigo-500 focus:shadow-xl focus:shadow-indigo-500/5
                    disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed
                    ${error ? 'border-rose-300 bg-rose-50 focus:border-rose-500' : 'border-slate-200'}
                    ${className}
                `}
                {...props}
            />
            {error && (
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest pl-2 italic">
                    {error}
                </p>
            )}
            {helperText && !error && (
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 italic">
                    {helperText}
                </p>
            )}
        </div>
    );
};
