
interface PaymentSuccessProps {
  onClose: () => void;
}

export default function PaymentSuccess({ onClose }: PaymentSuccessProps) {
  return (
    <div className="w-full max-w-sm bg-white rounded-2xl p-8 text-center shadow-2xl border border-slate-100 flex flex-col items-center">
      <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border border-emerald-100">
        <svg className="h-8 w-8 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Payment Confirmed!</h2>
      <p className="text-sm text-slate-500 leading-relaxed mb-8">
        Your restaurant transaction was processed successfully. Your kitchen order is now active.
      </p>
      <p className="text-sm text-slate-500 leading-relaxed mb-8">Please check your email for your payment receipt.</p>

      <button
        onClick={onClose}
        className="w-full bg-brand-primary text-white font-semibold rounded-xl py-3 text-sm tracking-wide transition-all hover:bg-indigo-700 active:scale-[0.98] cursor-pointer"
      >
        Return to Chat
      </button>
    </div>
  );
}

