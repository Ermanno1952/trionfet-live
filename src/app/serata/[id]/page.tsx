'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SerataPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>('');
  const [batifondo, setBatifondo] = useState<any>(null);
  const [capoA, setCapoA] = useState('');
  const [capoB, setCapoB] = useState('');
  const [num, setNum] = useState(1);
  const [vinteA, setVinteA] = useState(0);
  const [vinteB, setVinteB] = useState(0);
  const [totaleA, setTotaleA] = useState(0);
  const [totaleB, setTotaleB] = useState(0);
  const [serataFinita, setSerataFinita] = useState(false);

  useEffect(() => {
    params.then(p => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      const { data: serata } = await supabase
        .from('serate')
        .select('*')
        .eq('id', id)
        .single();

      if (!serata) return;

      setCapoA(serata.squadra_a.capo);
      setCapoB(serata.squadra_b.capo);

      const { data: batifondi } = await supabase
        .from('batifondi')
        .select('*')
        .eq('serata_id', id)
        .order('numero', { ascending: true });

      if (batifondi && batifondi.length > 0) {
        const current = batifondi[batifondi.length - 1];
        setBatifondo(current);
        setNum(current.numero);
        setVinteA(current.vinte_a || 0);
        setVinteB(current.vinte_b || 0);

        setTotaleA(batifondi.filter((b: any) => b.vincitore === 'A').length);
        setTotaleB(batifondi.filter((b: any) => b.vincitore === 'B').length);
      }
    };

    fetchData();

    const channel = supabase
      .channel('batifondi')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'batifondi', filter: `serata_id=eq.${id}` },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const addPunto = async (squadra: 'a' | 'b') => {
    if (!batifondo || batifondo.vincitore) return;

    const nuoveVinteA = squadra === 'a' ? vinteA + 1 : vinteA;
    const nuoveVinteB = squadra === 'b' ? vinteB + 1 : vinteB;

    let vincitore: 'A' | 'B' | null = null;
    if (nuoveVinteA >= 7) vincitore = 'A';
    if (nuoveVinteB >= 7) vincitore = 'B';

    if (vincitore) {
      await supabase
        .from('batifondi')
        .update({ vinte_a: nuoveVinteA, vinte_b: nuoveVinteB, vincitore })
        .eq('id', batifondo.id);

      await supabase
        .from('batifondi')
        .insert({ serata_id: id, numero: num + 1 });
    } else {
      await supabase
        .from('batifondi')
        .update({ vinte_a: nuoveVinteA, vinte_b: nuoveVinteB })
        .eq('id', batifondo.id);
    }
  };

  const removePunto = async (squadra: 'a' | 'b') => {
    if (!batifondo || batifondo.vincitore || (squadra === 'a' && vinteA === 0) || (squadra === 'b' && vinteB === 0)) return;

    const nuoveVinteA = squadra === 'a' ? vinteA - 1 : vinteA;
    const nuoveVinteB = squadra === 'b' ? vinteB - 1 : vinteB;

    await supabase
      .from('batifondi')
      .update({ vinte_a: nuoveVinteA, vinte_b: nuoveVinteB })
      .eq('id', batifondo.id);
  };

  const trashTalkVincitore = () => {
    const frasi = [
      "Alla lunga i più forti vengono fuori… e stasera erano dall’altra parte!",
      "I migliori vincono anche senza fortuna… voi ne avevate zero!",
      "Chi ride ultimo ride meglio… e stasera ridiamo noi!",
      "La classe non è acqua… voi eravate nel Sahara!",
      "Avete perso con stile… ma avete perso lo stesso!"
    ];
    return frasi[Math.floor(Math.random() * frasi.length)];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-black text-white p-4 pb-32 flex flex-col items-center relative">
      <div className="w-full max-w-lg mx-auto space-y-6">

        {/* TITOLO CENTRALE */}
        <div className="text-center pt-6">
          <h1 className="text-6xl md:text-7xl font-bold text-yellow-400 drop-shadow-2xl">TRIONFET</h1>
          <p className="text-xl mt-2 opacity-90">Batifondo {num}</p>
          <div className="text-3xl font-bold text-yellow-300 mt-4">
            TOTALE BATIFONDI<br />
            <span className="text-5xl">{totaleA} - {totaleB}</span>
          </div>
        </div>

        {/* PUNTEGGI */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-green-800/50 rounded-2xl p-6 border-4 border-green-500 text-center">
            <h2 className="text-2xl font-bold text-green-300 truncate">{capoA || '...'}</h2>
            <p className="text-8xl font-bold my-4">{vinteA}</p>
            <div className="flex justify-center gap-6 mt-4">
              <button 
                onClick={() => addPunto('a')} 
                disabled={!!batifondo?.vincitore}
                className={`w-24 h-24 rounded-full text-5xl font-bold shadow-2xl transition-all ${batifondo?.vincitore ? 'bg-gray-600' : 'bg-gradient-to-br from-green-500 to-emerald-600 hover:scale-110 active:scale-95'}`}
              >
                +
              </button>
              <button 
                onClick={() => removePunto('a')} 
                disabled={vinteA === 0 || !!batifondo?.vincitore}
                className="w-24 h-24 rounded-full text-5xl font-bold bg-gray-700 hover:bg-gray-600 disabled:opacity-30 shadow-2xl active:scale-95"
              >
                −
              </button>
            </div>
          </div>

          <div className="bg-red-800/50 rounded-2xl p-6 border-4 border-red-500 text-center">
            <h2 className="text-2xl font-bold text-red-300 truncate">{capoB || '...'}</h2>
            <p className="text-8xl font-bold my-4">{vinteB}</p>
            <div className="flex justify-center gap-6 mt-4">
              <button 
                onClick={() => addPunto('b')} 
                disabled={!!batifondo?.vincitore}
                className={`w-24 h-24 rounded-full text-5xl font-bold shadow-2xl transition-all ${batifondo?.vincitore ? 'bg-gray-600' : 'bg-gradient-to-br from-red-500 to-rose-600 hover:scale-110 active:scale-95'}`}
              >
                +
              </button>
              <button 
                onClick={() => removePunto('b')} 
                disabled={vinteB === 0 || !!batifondo?.vincitore}
                className="w-24 h-24 rounded-full text-5xl font-bold bg-gray-700 hover:bg-gray-600 disabled:opacity-30 shadow-2xl active:scale-95"
              >
                −
              </button>
            </div>
          </div>
        </div>

        {batifondo?.vincitore && (
          <div className="p-6 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl text-center animate-pulse">
            <p className="text-3xl font-bold">
              BATIFONDO {num} VINTO DA <span className="text-4xl">{batifondo.vincitore === 'A' ? capoA : capoB}!</span>
            </p>
          </div>
        )}

    {(totaleA > 0 || totaleB > 0) && !serataFinita && (
          <div className="mt-12 px-8">
            <button
              onClick={() => setSerataFinita(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-8 rounded-3xl text-4xl font-bold shadow-2xl hover:scale-105 transition-all active:scale-95"
            >
              FINISCI SERATA – DICHIARA IL VINCITORE!
            </button>
          </div>
        )}

        {serataFinita && (
          <div className="p-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-3xl text-center animate-bounce">
            <h2 className="text-6xl font-bold mb-6">SERATA FINITA!</h2>
            {totaleA > totaleB ? (
              <>
                <p className="text-4xl font-bold text-green-300 mb-4">{capoA} CAMPIONE! {totaleA}-{totaleB}</p>
                <p className="text-2xl italic">{trashTalkVincitore()}</p>
              </>
            ) : totaleB > totaleA ? (
              <>
                <p className="text-4xl font-bold text-red-300 mb-4">{capoB} DOMINA! {totaleB}-{totaleA}</p>
                <p className="text-2xl italic">{trashTalkVincitore()}</p>
              </>
            ) : (
              <p className="text-4xl font-bold">PAREGGIO EPICO!</p>
            )}
            <p className="text-2xl mt-8">Alla prossima batosta!</p>
          </div>
        )}
      </div>

{/* PULSANTI IN BASSO – ICONA PENNA VERA + STORICO COMPATTO */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-8 items-center z-50">
        {/* ICONA PENNA */}
        <button
          onClick={() => window.location.href = `/modifica/${id}`}
          className="bg-white/20 hover:bg-white/30 backdrop-blur-md p-5 rounded-full shadow-2xl transition-all hover:scale-110"
          title="Modifica nomi"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11l14 14a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11 21H9v-2L19.586 8.414a2 2 0 010-2.828z" />
          </svg>
        </button>

        {/* STORICO PARTITE – COMPATTO */}
        <button
          onClick={() => window.location.href = '/classifica'}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black px-6 py-4 rounded-full font-bold text-lg shadow-2xl transition-all hover:scale-105"
        >
          STORICO
        </button>
      </div>
    </div>
  );
}
