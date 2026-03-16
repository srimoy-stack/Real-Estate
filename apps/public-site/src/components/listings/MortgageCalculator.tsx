'use client';

import React, { useState, useMemo } from 'react';

interface MortgageCalculatorProps {
    price: number;
}

export const MortgageCalculator = ({ price: initialPrice }: MortgageCalculatorProps) => {
    const [totalAmount, setTotalAmount] = useState(initialPrice);
    const [downPayment, setDownPayment] = useState(initialPrice * 0.2);
    const [downPaymentPercent, setDownPaymentPercent] = useState(20);
    const [loanTerms, setLoanTerms] = useState(30);
    const [interestRate, setInterestRate] = useState(4.125);
    const [propertyTaxRate, setPropertyTaxRate] = useState(0.6875);
    const [pmi, setPmi] = useState(0);
    const hoaFees = 0;

    const calculateMonthlyPayment = useMemo(() => {
        const principal = totalAmount - downPayment;
        const monthlyInterest = interestRate / 100 / 12;
        const numberOfPayments = loanTerms * 12;

        let monthlyPrincipalInterest = 0;
        if (monthlyInterest === 0) {
            monthlyPrincipalInterest = principal / numberOfPayments;
        } else {
            monthlyPrincipalInterest =
                (principal * monthlyInterest * Math.pow(1 + monthlyInterest, numberOfPayments)) /
                (Math.pow(1 + monthlyInterest, numberOfPayments) - 1);
        }

        const monthlyPropertyTax = (totalAmount * (propertyTaxRate / 100)) / 12;
        const monthlyPmi = pmi; // Assuming pmi is monthly
        const monthlyHoa = hoaFees;

        const totalMonthly = monthlyPrincipalInterest + monthlyPropertyTax + monthlyPmi + monthlyHoa;

        return {
            principalInterest: monthlyPrincipalInterest,
            propertyTax: monthlyPropertyTax,
            pmi: monthlyPmi,
            hoa: monthlyHoa,
            totalMonthly: totalMonthly
        };
    }, [totalAmount, downPayment, interestRate, loanTerms, propertyTaxRate, pmi, hoaFees]);

    const handleDownPaymentChange = (val: number) => {
        setDownPayment(val);
        setDownPaymentPercent((val / totalAmount) * 100);
    };

    const handleDownPaymentPercentChange = (val: number) => {
        setDownPaymentPercent(val);
        setDownPayment((val / 100) * totalAmount);
    };

    return (
        <section id="calculator" className="bg-white p-8 sm:p-12 rounded-[40px] border border-slate-100 shadow-sm space-y-12">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight italic">Calculator</h2>
                <button className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center transition-colors">
                    <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
            </div>

            <div className="flex flex-col xl:flex-row gap-16 items-start">
                {/* Chart Side */}
                <div className="w-full xl:w-1/3 flex flex-col items-center space-y-8">
                    <div className="relative w-64 h-64">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            {/* Simplified doughnut chart - in a real app use specialized lib */}
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E2E8F0" strokeWidth="12" />
                            <circle
                                cx="50" cy="50" r="40" fill="transparent" stroke="#4F46E5" strokeWidth="12"
                                strokeDasharray={`${(calculateMonthlyPayment.principalInterest / calculateMonthlyPayment.totalMonthly) * 251.2} 251.2`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <p className="text-3xl font-black text-slate-900">
                                ${calculateMonthlyPayment.totalMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">per month</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 w-full">
                        {[
                            { label: 'Principal and Interest', color: 'bg-indigo-600', value: calculateMonthlyPayment.principalInterest },
                            { label: 'Property Tax', color: 'bg-sky-400', value: calculateMonthlyPayment.propertyTax },
                            { label: 'HOA fee', color: 'bg-rose-400', value: calculateMonthlyPayment.hoa },
                            { label: 'Private Mortgage Insurance', color: 'bg-purple-400', value: calculateMonthlyPayment.pmi },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-[11px] font-bold">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-1.5 rounded-full ${item.color}`} />
                                    <span className="text-slate-500 uppercase tracking-widest">{item.label}</span>
                                </div>
                                <span className="text-slate-900">${Math.round(item.value)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Controls Side */}
                <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Amount</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={totalAmount}
                                    onChange={(e) => setTotalAmount(Number(e.target.value))}
                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-4 py-4 font-bold text-slate-900 focus:bg-white focus:border-indigo-500 transition-all outline-none"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold">$</span>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Down Payment</label>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <input
                                        type="number"
                                        value={downPayment}
                                        onChange={(e) => handleDownPaymentChange(Number(e.target.value))}
                                        className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-4 py-4 font-bold text-slate-900 focus:bg-white focus:border-indigo-500 transition-all outline-none"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold">$</span>
                                </div>
                                <div className="relative w-24">
                                    <input
                                        type="number"
                                        value={Math.round(downPaymentPercent)}
                                        onChange={(e) => handleDownPaymentPercentChange(Number(e.target.value))}
                                        className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-4 py-4 font-bold text-slate-900 focus:bg-white focus:border-indigo-500 transition-all outline-none"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold">%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loan Terms (Years)</label>
                                <input
                                    type="number"
                                    value={loanTerms}
                                    onChange={(e) => setLoanTerms(Number(e.target.value))}
                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-4 py-4 font-bold text-slate-900 focus:bg-white focus:border-indigo-500 transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Interest (%)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.001"
                                        value={interestRate}
                                        onChange={(e) => setInterestRate(Number(e.target.value))}
                                        className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-4 py-4 font-bold text-slate-900 focus:bg-white focus:border-indigo-500 transition-all outline-none"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold">%</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Property Tax (%)</label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    value={propertyTaxRate}
                                    onChange={(e) => setPropertyTaxRate(Number(e.target.value))}
                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-4 py-4 font-bold text-slate-900 focus:bg-white focus:border-indigo-500 transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">PMI</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={pmi}
                                        onChange={(e) => setPmi(Number(e.target.value))}
                                        className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-4 py-4 font-bold text-slate-900 focus:bg-white focus:border-indigo-500 transition-all outline-none"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold">$</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
