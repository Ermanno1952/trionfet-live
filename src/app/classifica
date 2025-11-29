'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Classifica() {
  const [serate, setSerate] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStorico = async () => {
      const { data } = await supabase
        .from('serate')
        .select('*')
        .order('created_at', { ascending: false });

      // Per ogni serata, conta i batifondi vinti
      const serateConRisultato = await Promise.all(
        (data || []).map(async (serata) => {
          const { data: batifondi } = await supabase
            .from('batifondi')
            .select('vincitore')
            .eq('serata_id', serata.id);

          const vinteA = batifondi?.filter(b => b.vincitore === 'A').length || 0;
          const vinteB = batifondi?.filter(b => b.vincitore === 'B').length || 0;

          return { ...serata, vinteA, vinteB };
        })
      );

      setSerate(serateConRisultato);
      setLoading(false);
    };

    fetchStorico();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 to-black text-white flex items-center justify-center">
        <p className="text-3xl">Caricamento classifica...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-8 text-yellow-400">CLASSIFICA STORICA</h1>

        {serate.length === 0 ? (
          <p className="text-center text-xl opacity-80">Nessuna serata giocata ancora!</p>
        ) : (
          <div className="space-y-6">
            {serate.map((s) => (
              <div
                key={s.id}
                className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="text-green-300">
                    <p className="font-bold text-xl">{s.squadra_a.capo}</p>
                    <p className="text-sm opacity-80">{s.squadra_a.giocatori.join(' • ')}</p>
                  </div>

                  <div className="text-4xl font-bold text-yellow-300">
                    {s.vinteA} - {s.vinteB}
                  </div>

                  <div className="text-red-300 text-right">
                    <p className="font-bold text-xl">{s.squadra_b.capo}</p>
                    <p className="text-sm opacity-80">{s.squadra_b.giocatori.join(' • ')}</p>
                  </div>
                </div>

                {s.vinteA > s.vinteB && (
                  <p className="text-center text-green-400 font-bold text-lg mt-3">
                    VITTORIA DI {s.squadra_a.capo.toUpperCase()}!
                  </p>
                )}
                {s.vinteB > s.vinteA && (
                  <p className="text-center text-red-400 font-bold text-lg mt-3">
                    VITTORIA DI {s.squadra_b.capo.toUpperCase()}!
                  </p>
                )}
                {s.vinteA === s.vinteB && s.vinteA > 0 && (
                  <p className="text-center text-yellow-400 font-bold text-lg mt-3">
                    PAREGGIO EPICO!
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <button
            onClick={() => window.history.back()}
            className="bg-gray-700 hover:bg-gray-600 px-8 py-4 rounded-full text-xl font-bold"
          >
            ← TORNA ALLA SERATA
          </button>
        </div>
      </div>
    </div>
  );
}
