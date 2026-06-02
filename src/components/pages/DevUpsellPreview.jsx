import { useState } from 'react';
import DfyUpsellModal from '../upsell/DfyUpsellModal';
import { shouldShowDfyUpsell } from '../../constants/upsell';

// DEV-ONLY preview harness for the DFY upsell modal.
// Lets us screenshot the real component and eyeball the login-schedule logic
// without needing Supabase auth. Not registered in production builds.
export default function DevUpsellPreview() {
  const [open, setOpen] = useState(true);

  const schedule = Array.from({ length: 60 }, (_, i) => i + 1).filter(shouldShowDfyUpsell);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      {/* Faux dashboard backdrop */}
      <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-amber-400 to-cyan-400 bg-clip-text text-transparent mb-4">
        Course Dashboard (preview backdrop)
      </h1>
      <p className="text-gray-400 max-w-2xl mb-6">
        This page exists only in dev to preview the DFY upsell modal. The modal below is the exact
        component shown on the real dashboard.
      </p>

      <div className="bg-[#111111] border border-gray-800 rounded-xl p-6 max-w-xl mb-6">
        <p className="text-sm text-gray-400 mb-2">Upsell fires on login #:</p>
        <p className="text-cyan-400 font-mono">{schedule.join(', ')}, …</p>
      </div>

      <button
        onClick={() => setOpen(true)}
        className="px-5 py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-amber-400 text-black font-bold"
      >
        Re-open modal
      </button>

      <DfyUpsellModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
