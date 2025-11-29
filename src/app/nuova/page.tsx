'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NuovaSerata() {
  const [capoA, setCapoA] = useState('');
  const [giocatoriA, setGiocatoriA] = useState('');
  const [capoB, setCapoB] = useState('');
  const [giocatoriB, setGiocatoriB] = useState('');
  const [link, setLink] = useState('');

  const crea = async () => {
    if (!capoA || !capoB || !giocatoriA || !giocatoriB) {
      alert('Compila tutti i campi!');
      return;
    }

    const { data, error } = await supabase
      .from('serate')
      .insert({
        squadra_a: {
          capo: capoA,
          giocatori: giocatoriA.split(',').map(s => s.trim()).filter(s => s)
        },
        squadra_b: {
          capo: capoB,
          giocatori: giocatoriB.split(',').map(s => s.trim()).filter(s => s)
        },
      })
      .select()
      .single();

    if (error) {
      console.error('Errore:', error);
      alert('Errore nella creazione. Riprova.');
      return;
    }

    const id = data.id; // Usa l’intero UUID
    const url = `${window.location.origin}/serata/${id}`;
        setLink(url);

    // SCROLL AUTOMATICO AL LINK (addio pagina bianca!)
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-black text-white p-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-white/10 rounded-xl p-8 backdrop-blur-lg shadow-2xl">
        <h1 className="text-4xl font-bold text-center mb-2 text-yellow-400">TRIONFET</h1>
        <h2 className="text-xl text-center mb-8 opacity-90">Nuova Serata</h2>

        <div className="space-y-6">
          {/* SQUADRA A */}
          <div className="bg-white/5 rounded-lg p-4">
            <label className="block text-sm font-bold text-green-300 mb-1">CAPO SQUADRA A</label>
            <input
              value={capoA}
              onChange={e => setCapoA(e.target.value)}
              placeholder="Mario"
              className="w-full p-3 rounded bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <label className="block text-sm font-bold text-green-300 mb-1">GIOCATORI A (separati da virgola)</label>
            <input
              value={giocatoriA}
              onChange={e => setGiocatoriA(e.target.value)}
              placeholder="Bepino, Ermanno, Tullio"
              className="w-full p-3 rounded bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* SQUADRA B */}
          <div className="bg-white/5 rounded-lg p-4">
            <label className="block text-sm font-bold text-red-300 mb-1">CAPO SQUADRA B</label>
            <input
              value={capoB}
              onChange={e => setCapoB(e.target.value)}
              placeholder="Fabio"
              className="w-full p-3 rounded bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <label className="block text-sm font-bold text-red-300 mb-1">GIOCATORI B (separati da virgola)</label>
            <input
              value={giocatoriB}
              onChange={e => setGiocatoriB(e.target.value)}
              placeholder="Piero, Roberto, Luciano"
              className="w-full p-3 rounded bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <button
            onClick={crea}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold text-xl py-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            CREA SERATA
          </button>

          {link && (
            <div className="mt-6 p-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg text-center">
              <p className="font-bold text-lg mb-2">CONDIVIDI SU WHATSAPP:</p>
              <p className="text-sm break-all font-mono bg-black/30 p-2 rounded">{link}</p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(link);
                  alert('Link copiato!');
                }}
                className="mt-3 bg-white text-green-700 px-4 py-2 rounded font-bold"
              >
                COPIA LINK
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
