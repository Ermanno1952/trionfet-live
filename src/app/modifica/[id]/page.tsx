'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ModificaSerata({ params }: { params: { id: string } }) {
  const [capoA, setCapoA] = useState('');
  const [giocatoriA, setGiocatoriA] = useState('');
  const [capoB, setCapoB] = useState('');
  const [giocatoriB, setGiocatoriB] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('serate').select('*').eq('id', params.id).single();
      if (data) {
        setCapoA(data.squadra_a.capo);
        setGiocatoriA(data.squadra_a.giocatori.join(' '));
        setCapoB(data.squadra_b.capo);
        setGiocatoriB(data.squadra_b.giocatori.join(' '));
      }
      setLoading(false);
    };
    fetch();
  }, [params.id]);

  const salva = async () => {
    await supabase
      .from('serate')
      .update({
        squadra_a: { capo: capoA, giocatori: giocatoriA.trim().split(/\s+/).filter(Boolean) },
        squadra_b: { capo: capoB, giocatori: giocatoriB.trim().split(/\s+/).filter(Boolean) }
      })
      .eq('id', params.id);

    alert('Nomi aggiornati!');
    router.push(`/serata/${params.id}`);
  };

  if (loading) return <div className="text-white text-3xl text-center mt-20">Caricamento...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-black text-white p-6 flex items-center justify-center">
      <div className="w-full max-w-lg bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-yellow-400">MODIFICA NOMI</h1>

        <div className="space-y-6">
          <input placeholder="Capo Squadra A" value={capoA} onChange={e => setCapoA(e.target.value)} className="w-full p-4 rounded bg-white/20 text-xl" />
          <input placeholder="Giocatori A (spazi)" value={giocatoriA} onChange={e => setGiocatoriA(e.target.value)} className="w-full p-4 rounded bg-white/20 text-xl" />

          <input placeholder="Capo Squadra B" value={capoB} onChange={e => setCapoB(e.target.value)} className="w-full p-4 rounded bg-white/20 text-xl" />
          <input placeholder="Giocatori B (spazi)" value={giocatoriB} onChange={e => setGiocatoriB(e.target.value)} className="w-full p-4 rounded bg-white/20 text-xl" />

          <div className="flex gap-4">
            <button onClick={salva} className="flex-1 bg-green-600 hover:bg-green-500 py-4 rounded-xl font-bold text-xl">
              SALVA
            </button>
            <button onClick={() => router.push(`/serata/${params.id}`)} className="flex-1 bg-gray-700 hover:bg-gray-600 py-4 rounded-xl font-bold text-xl">
              ANNULLA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
