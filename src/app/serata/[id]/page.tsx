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
    if (nuoveVinteB >=  >= 7) vincitore = 'B';

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
            <div className="flex justify-center gap-4">
              <button onClick={() => addPunto('a')} disabled={!!batifondo?.vincitore}
                className={`px-10 py-5 rounded-full text-3xl font-bold ${batifondo?.vincitore ? 'bg-gray-600' : 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-xl hover:scale-110'}`}>
                +1
              </button>
              <button onClick={() => removePunto('a')} disabled={vinteA === 0 || !!batifondo?.vincitore}
                className="px-10 py-5 rounded-full text-3xl font-bold bg-gray-700 hover:bg-gray-600 disabled:opacity-30">
                −1
              </button>
            </div>
          </div>

          <div className="bg-red-800/50 rounded-2xl p-6 border-4 border-red-500 text-center">
            <h2 className="text-2xl font-bold text-red-300 truncate">{capoB || '...'}</h2>
            <p className="text-8xl font-bold my-4">{vinteB}</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => addPunto('b')} disabled={!!batifondo?.vincitore}
                className={`px-10 py-5 rounded-full text-3xl font-bold ${batifondo?.vincitore ? 'bg-gray-600' : 'bg-gradient-to-r from-red-500 to-rose-600 shadow-xl hover:scale-110'}`}>
                +1
              </button>
              <button onClick={() => removePunto('b')} disabled={vinteB === 0 || !!batifondo?.vincitore}
                className="px-10 py-5 rounded-full text-3xl font-bold bg-gray-700 hover:bg-gray-600 disabled:opacity-30">
                −1
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
          <button
            onClick={() => setSerataFinita(true)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-6 rounded-2xl text-3xl font-bold shadow-2xl hover:scale-105"
          >
            FINISCI SERATA – DICHIARA IL VINCITORE!
          </button>
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

      {/* PULSANTI FISSI IN BASSO */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-10 z-50">
        <button
          onClick={() => window.location.href = `/modifica/${id}`}
          className="bg-white/20 hover:bg-white/30 backdrop-blur-md p-6 rounded-full shadow-2xl transition-all hover:scale-110"
          title="Modifica nomi"
        >
          Penna
        </button>

        <button
          onClick={() => window.location.href = '/classifica'}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black p-6 rounded-full shadow-2xl transition-all hover:scale-110 flex items-center justify-center"
          title="Classifica storica"
        >
          Trofeo
        </button>
      </div>
    </div>
  );
}
