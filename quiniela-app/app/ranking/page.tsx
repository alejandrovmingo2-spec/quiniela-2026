"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Ranking() {
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarRanking() {
      const { data, error } = await supabase
        .from('vista_ranking')
        .select('*')
        .order('total_puntos', { ascending: false });

      if (!error && data) setRanking(data);
      setLoading(false);
    }
    cargarRanking();
  }, []);

  if (loading) return <div className="p-10 text-center font-bold text-slate-500">Cargando Ranking...</div>;

  return (
    <main className="p-4 sm:p-6 bg-slate-50 min-h-screen max-w-2xl mx-auto">
      <h1 className="text-3xl font-black mb-6 text-center text-indigo-900 uppercase tracking-wider">
        🏆 Top Global
      </h1>
      
      <div className="flex flex-col gap-3">
        {ranking.map((user, index) => {
          const isTop1 = index === 0;
          const isTop3 = index > 0 && index < 3;
          const puntos = user.total_puntos || 0;

          return (
            <div 
              key={user.usuario_nombre} 
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 ${
                isTop1 
                  ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)] transform scale-[1.02] z-10 relative' 
                  : isTop3 
                    ? 'bg-orange-50 border-orange-300 shadow-sm' 
                    : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-9 h-9 flex items-center justify-center rounded-full font-black text-lg ${
                  isTop1 ? 'bg-yellow-400 text-yellow-900 shadow-inner' :
                  isTop3 ? 'bg-orange-300 text-orange-900' :
                  'bg-slate-200 text-slate-600'
                }`}>
                  {index + 1}
                </div>
                <span className={`font-bold text-lg ${isTop1 ? 'text-yellow-900' : 'text-slate-800'}`}>
                  {user.usuario_nombre}
                  {isTop1 && <span className="ml-2 text-xl" title="¡Líder indiscutible!">👑</span>}
                  {isTop3 && <span className="ml-2 animate-pulse inline-block" title="¡On Fire!">🔥</span>}
                </span>
              </div>
              
              <div className="text-right">
                <span className={`font-black text-3xl leading-none ${
                  isTop1 ? 'text-yellow-600 drop-shadow-sm' : 
                  isTop3 ? 'text-orange-500' : 
                  'text-indigo-600'
                }`}>
                  {puntos}
                </span>
                <span className="text-[10px] font-black text-slate-400 block -mt-1 tracking-widest">PTS</span>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}