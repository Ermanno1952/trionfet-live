'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Serata() {
  const { id } = useParams() as { id: string };
  const [serata, setSerata] = useState<any>(null);
  const [batifondo, setBatifondo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // Carica la serata
    const loadSerata = async () => {
      const { data, error } = await supabase
        .from('serate')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Errore caricamento serata:', error);
        setLoading(false);
        return;
      }

      setSerata(data);
      setLoading(false);
    };

    loadSerata();

    // Realtime sul batifondo corrente
    const channel = supabase
      .channel(`batifondo-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'batifondi',
          filter: `serata_id=eq.${id}`,
        },
        (payload: any) => {
          const newBatifondo = payload.new;
          // Trova il batifondo corrente (senza vincitore o più alto numero)
          if (!newBatifondo.vincitore) {
            setBatifondo(newBatifondo);
          } else if (!batifondo || batifondo.id === newBatifondo.id) {
            setBatifondo(newBatifondo);
          }
        }
      )
      .subscribe();

    // Carica batifondo corrente iniziale
    supabase
      .from('batifondi')
      .select('*')
      .eq('serata_id', id)
      .order('numero', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setBatifondo(data);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const addPunto = async (squadra: 'a' | 'b') => {
    if (!batifondo || batifondo.vincitore) return;

    const field = squadra === 'a' ? 'vinte_a' : 'vinte_b';
    const current = batifondo[field] || 0;
    const nuovo = current + 1;

    const { error } = await supabase
      .from('batifondi')
      .update({ [field]: nuovo })
      .eq('id', batifondo.id);

    if (error) {
      console.error('Errore aggiornamento:', error);
      return;
    }

    // Se arriva a 7 → chiudi e crea nuovo
    if (nuovo === 7) {
      await supabase
        .from('batifondi')
        .update({ vincitore: squadra.toUpperCase() })
        .eq('id', batifondo.id);

      await supabase
        .from('batifondi')
        .insert({
          serata_id: id,
          numero: (batifondo.numero || 1) + 1,
          vinte_a: 0,
          vinte_b: 0,
        });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 to-black text-white flex items-center justify-center">
        <p className="text-2xl">Caricamento serata...</p>
      </div>
    );
  }

  if (!serata) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 to-black text-white flex items-center justify-center">
        <p className="text-2xl text-red-400">Serata non trovata!</p>
      </div>
    );
  }

  const capoA = serata.squadra_a.capo;
  const capoB = serata.squadra_b.capo;
  const num = batifondo?.numero || 1;
  const vinteA = batifondo?.vinte_a || 0;
  const vinteB = batifondo?.vinte_b || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-black text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-lg">
        <h1 className="text-5xl font-bold text-center mb-2 text-yellow-400">TRIONFET</h1>
        <p className="text-center text-xl mb-8 opacity-90">Batifondo {num}</p>

        {/* PUNTEGGIO */}
        <div className="grid grid-cols-2 gap-6 text-center mb-10">
          <div className="bg-green-800/50 rounded-xl p-6 border-4 border-green-500">
            <h2 className="text-3xl font-bold text-green-300">{capoA}</h2>
            <p className="text-6xl font-bold mt-2">{vinteA}</p>
          </div>
          <div className="bg-red-800/50 rounded-xl p-6 border-4 border-red-500">
            <h2 className="text-3xl font-bold text-red-300">{capoB}</h2>
            <p className="text-6xl font-bold mt-2">{vinteB}</p>
          </div>
        </div>

        {/* PULSANTI +1 */}
        <div className="flex justify-center gap-8 mb-8">
          <button
            onClick={() => addPunto('a')}
            disabled={batifondo?.vincitore}
            className={`px-10 py-6 rounded-full text-3xl font-bold transition-all transform hover:scale-110 ${
              batifondo?.vincitore
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
            }`}
          >
            +1 {capoA}
          </button>
          <button
            onClick={() => addPunto('b')}
            disabled={batifondo?.vincitore}
            className={`px-10 py-6 rounded-full text-3xl font-bold transition-all transform hover:scale-110 ${
              batifondo?.vincitore
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg'
            }`}
          >
            +1 {capoB}
          </button>
        </div>

        {/* VITTORIA BATIFONDO */}
        {batifondo?.vincitore && (
          <div className="mt-10 p-6 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl text-center animate-pulse">
            <p className="text-3xl font-bold">
              BATIFONDO {num} VINTO DA{' '}
              <span className="text-4xl">
                {batifondo.vincitore === 'A' ? capoA : capoB}!
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}