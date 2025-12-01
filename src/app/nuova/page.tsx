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
          giocatori: giocatoriA.trim().split(/\s+/).filter(Boolean)
        },
        squadra_b: {
          capo: capoB,
          giocatori: giocatoriB.trim().split(/\s+/).filter(Boolean)
        },
      })
      .select()
      .single();

    if (error || !data) {
      alert('Errore nella creazione. Riprova.');
      return;
    }

    const url = `${window.location.origin}/serata/${data.id}`;
    setLink(url);

    // FORZA IL RENDER + SCROLL IMMEDIATO
    setTimeout(() => {
      const linkElement = document.getElementById('link-container');
      if (linkElement) {
        linkElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-black text-white p-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-white/10 rounded-xl p-8 backdrop-blur-lg shadow-2xl">
        <h1 className="text-4xl font-bold text-center mb-2 text-yellow-400">TRIONFET</h1>
        <h2 className="text-xl text-center mb-8 opacity-90">Nuova Serata</h2>

        <div className="space-y-6">
          <div className="bg-white/5 rounded-lg p-4">
            <label className="block text-sm font-bold text-green-300 mb-1">CAPO SQUADRA A</label>
            <input
              value={capoA}
              onChange={e => setCapoA(e.target.value)}
              placeholder=" "
              className="w-full p-3 rounded bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <label className="block text-sm font-bold text-green-300 mb-1">GIOCATORI A (separati da spazio)</label>
            <input
              value={giocatoriA}
  onChange={e => setGiocatoriA(e.target.value)}
  placeholder=""
  className="w-full p-3 rounded bg-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
  // MAGIA CELLULARE: tastiera con punto e spazio grandi
  inputMode="text"
  autoComplete="off"
            />
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <label className="block text-sm font-bold text-red-300 mb-1">CAPO SQUADRA B</label>
            <input
              value={capoB}
              onChange={e => setCapoB(e.target.value)}
              placeholder=""
              className="w-full p-3 rounded bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <label className="block text-sm font-bold text-red-300 mb-1">GIOCATORI B (separati da spazio)</label>
            <input
              value={giocatoriB}
  onChange={e => setGiocatoriB(e.target.value)}
  placeholder=""
  className="w-full p-3 rounded bg-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
  inputMode="text"
  autoComplete="off"
            />
          </div>

          <button
            onClick={crea}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold text-xl py-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            CREA SERATA
          </button>

                    {link && (
            <div id="link-container" className="mt-12 p-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl text-center shadow-2xl animate-in fade-in slide-in-from-bottom duration-500">
              <p className="font-bold text-2xl mb-4 text-yellow-300">SERATA CREATA!</p>
              <p className="text-lg mb-4 opacity-90">Condividi questo link:</p>
              <p className="text-sm break-all font-mono bg-black/50 p-4 rounded-lg mb-6 text-green-200">
                {link}
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(link);
                  alert('Link copiato negli appunti!');
                }}
                className="bg-white text-green-700 px-8 py-4 rounded-full font-bold text-xl shadow-lg hover:scale-110 transition-all"
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
