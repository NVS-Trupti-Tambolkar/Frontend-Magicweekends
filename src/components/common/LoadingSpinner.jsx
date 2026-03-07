import React from 'react';

/**
 * Reusable Loading Spinner Component - Premium Double Ring (V3 Deep Gold)
 * 
 * Variants:
 * - "page"    → Full page loader
 * - "overlay" → Transparent overlay for active operations
 * - "inline"  → Minimalist inline spinner
 * - "skeleton"→ Sleek shimmer placeholders
 */

// ─── Shared Styles ──────────────────────────────────────────
const loaderStyles = `
  @keyframes spin-clockwise {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes spin-counter-clockwise {
    0% { transform: rotate(360deg); }
    100% { transform: rotate(0deg); }
  }
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-spin-slow { animation: spin-clockwise 3s linear infinite; }
  .animate-spin-reverse { animation: spin-counter-clockwise 1.5s linear infinite; }
  .animate-fadeIn { animation: fade-in 0.3s ease-out forwards; }
`;

// ─── Premium Double Ring Animation ──────────────────────
export const PremiumDoubleRing = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-8 h-8 border-2',
        md: 'w-16 h-16 border-[3px]',
        lg: 'w-24 h-24 border-[4px]',
        xl: 'w-32 h-32 border-[5px]'
    };

    const innerSizes = {
        sm: 'w-5 h-5',
        md: 'w-10 h-10',
        lg: 'w-15 h-15',
        xl: 'w-20 h-20'
    };

    return (
        <div className="relative flex items-center justify-center">
            <style>{loaderStyles}</style>
            {/* Outer Ring - Amber Gold */}
            <div className={`${sizeClasses[size]} border-transparent border-t-amber-500 border-b-amber-500/20 rounded-full animate-spin shadow-[0_0_15px_rgba(245,158,11,0.2)]`}></div>
            
            {/* Inner Ring (Reverse) - Warm Orange */}
            <div className={`absolute ${innerSizes[size]} border-[2px] border-transparent border-l-orange-400 border-r-orange-400/10 rounded-full animate-spin-reverse`}></div>
            
            {/* Core Glow */}
            <div className="absolute w-1.5 h-1.5 bg-amber-400 rounded-full blur-[1px] animate-pulse"></div>
        </div>
    );
};

// ─── Full Page Loader ──────────────────────────────────────────
export const PageLoader = ({ message = 'Loading' }) => (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/5 backdrop-blur-xl z-[9999] animate-fadeIn">
        <div className="relative mb-10">
            {/* Radial glow background */}
            <div className="absolute inset-[-60px] bg-amber-500/5 rounded-full blur-3xl animate-pulse"></div>
            <PremiumDoubleRing size="lg" />
        </div>
        
        <div className="flex flex-col items-center space-y-3">
            <h2 className="text-white text-2xl font-black tracking-[0.3em] uppercase opacity-90 drop-shadow-md">{message}</h2>
            <div className="h-[2px] w-16 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
            <p className="text-amber-500/80 text-xs font-bold uppercase tracking-[0.4em] animate-pulse">Magic Weekends</p>
        </div>
    </div>
);

// ─── Overlay Loader (for CRUD operations) ──────────────────────
export const OverlayLoader = ({ message = 'Processing...' }) => (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-md flex items-center justify-center z-[9999] animate-fadeIn">
        <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-2xl flex flex-col items-center max-w-sm w-full mx-4 transform transition-all hover:scale-[1.02]">
            <div className="mb-8 relative">
                <div className="absolute inset-[-30px] bg-amber-500/10 rounded-full blur-2xl animate-pulse"></div>
                <PremiumDoubleRing size="md" />
            </div>
            
            <div className="flex flex-col items-center space-y-4 text-center">
                <p className="text-white text-lg font-bold tracking-wide drop-shadow-sm">{message}</p>
                <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"></div>
                </div>
            </div>
        </div>
    </div>
);

// ─── Inline Spinner (for buttons / small sections) ─────────────
export const InlineSpinner = ({ size = 'sm', color = 'amber' }) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };
    const colors = {
        amber: 'border-[#b45309]',
        white: 'border-white',
        gray: 'border-gray-400',
    };
    return (
        <div className={`relative flex items-center justify-center ${sizes[size]}`}>
            <div className={`w-full h-full rounded-full border-2 border-transparent border-t-current animate-spin ${colors[color]}`}></div>
        </div>
    );
};

// ─── Skeleton Card (for grid/card loading) ─────────────────────
export const SkeletonCard = () => (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse border border-gray-100">
        <div className="h-48 bg-gray-50/50"></div>
        <div className="p-5 space-y-4">
            <div className="h-6 bg-gray-100/80 rounded-lg w-3/4"></div>
            <div className="flex gap-2">
                <div className="h-4 bg-gray-50 rounded-md w-1/4"></div>
                <div className="h-4 bg-gray-50 rounded-md w-1/4"></div>
            </div>
            <div className="pt-2 h-10 bg-gray-50 rounded-xl w-full"></div>
        </div>
    </div>
);

// ─── Skeleton Grid (multiple cards) ────────────────────────────
export const SkeletonGrid = ({ count = 3, cols = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' }) => (
    <div className={`grid ${cols} gap-6`}>
        {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} />
        ))}
    </div>
);

// ─── Button with loading state ─────────────────────────────────
export const LoadingButton = ({ loading, children, className = '', ...props }) => (
    <button
        className={`${className} flex items-center justify-center transition-all ${loading ? 'opacity-80 cursor-not-allowed scale-[0.98]' : ''}`}
        disabled={loading}
        {...props}
    >
        {loading ? (
            <div className="py-0.5">
                <InlineSpinner size="sm" color="white" />
            </div>
        ) : children}
    </button>
);

export default { PageLoader, OverlayLoader, InlineSpinner, SkeletonCard, SkeletonGrid, LoadingButton };
