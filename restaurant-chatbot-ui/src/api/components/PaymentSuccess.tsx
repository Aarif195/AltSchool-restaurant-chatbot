
export default function PaymentSuccess() {
  const handleReturn = () => {
    // Redirect back to the main chatbot interface home page window
    window.location.href = '/';
  };

  return (
    <div className="flex h-screen w-screen bg-brand-dark justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 text-center shadow-2xl border border-slate-100 flex flex-col items-center">
        
        {/* Success Visual Checkmark Icon Badge */}
        <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border border-emerald-100">
          <svg 
            className="h-8 w-8 text-emerald-500" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Informational Text Messaging */}
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">
          Payment Confirmed!
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-8">
          Your restaurant transaction was processed successfully. The chatbot state has been updated, and your kitchen order is now active.
        </p>

        {/* Action Button Controls */}
        <button
          onClick={handleReturn}
          className="w-full bg-brand-primary text-white font-semibold rounded-xl py-3 text-sm tracking-wide transition-all hover:bg-indigo-700 active:scale-[0.98] shadow-lg shadow-indigo-100"
        >
          Return to Chat
        </button>
      </div>
    </div>
  );
}