"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminPanel() {
  const [partidos, setPartidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resultados, setResultados] = useState<Record<number, { local: number, visitante: number, metodo?: string, ganador?: string }>>({});

  useEffect(() => {
    async function cargarDatos() {
      const { data, error } = await supabase
        .from('partidos')
        .select(`
          *,
          local:equipos!partidos_equipo_local_id_fkey(nombre, bandera_url),
          visitante:equipos!partidos_equipo_visitante_id_fkey(nombre, bandera_url)
        `)
        .order('fecha', { ascending: true });

      if (!error) setPartidos(data || []);
      setLoading(false);
    }
    cargarDatos();
  }, []);

  const handleInputChange = (partidoId: number, field: string, value: string | number) => {
    setResultados(prev => ({
      ...prev,
      [partidoId]: { ...prev[partidoId], [field]: value }
    }));
  };

  async function finalizarPartido(partido: any) {
    const res = resultados[partido.id];
    if (!res || res.local === undefined || res.visitante === undefined) {
      alert("Faltan los marcadores reales."); return;
    }

    const isEliminatoria = !partido.fase.includes("Jornada");
    if (isEliminatoria && res.local === res.visitante && (!res.metodo || !res.ganador)) {
      alert("Es eliminatoria y empataron. Indica el método y ganador."); return;
    }

    const { error } = await supabase
      .from('partidos')
      .update({ 
        goles_local_real: res.local, 
        goles_visitante_real: res.visitante,
        metodo_desempate_real: res.metodo || null,
        ganador_real: res.ganador || null,
        estado: 'finalizado' 
      })
      .eq('id', partido.id);

    if (error) alert("Error: " + error.message);
    else {
      alert("¡Partido Finalizado!");
      setPartidos(prev => prev.map(p => p.id === partido.id ? { ...p, estado: 'finalizado' } : p));
    }
  }

  if (loading) return <div className="p-10 text-center">Cargando panel...</div>;

  return (
    <main className="p-6 bg-slate-900 min-h-screen max-w-3xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-2 text-center text-red-500">PANEL DE ADMINISTRADOR</h1>
      <p className="text-center text-slate-400 mb-8">Nadie más puede ver esto.</p>
      
      <div className="grid gap-6">
        {partidos.map((p) => {
          const isEliminatoria = !p.fase.includes("Jornada");
          const res = resultados[p.id] || {};
          const hayEmpate = res.local === res.visitante && res.local !== undefined;
          
          return (
            <div key={p.id} className={`p-5 rounded-xl border ${p.estado === 'finalizado' ? 'bg-slate-800 border-green-500' : 'bg-slate-800 border-slate-700'}`}>
              <div className="flex justify-between items-center mb-3 text-xs text-slate-400">
                <span>{p.fase} | {p.fecha.split('T')[0]}</span>
                {p.estado === 'finalizado' && <span className="bg-green-600 text-white px-2 py-1 rounded">FINALIZADO</span>}
              </div>
              
              <div className="flex items-center justify-between bg-slate-950 p-2 sm:p-4 rounded-lg gap-1 sm:gap-2">
                
                {/* Equipo Local */}
                <div className="flex items-center gap-1 sm:gap-3 flex-1">
                  <img src={p.local?.bandera_url || ''} className="w-5 sm:w-6 h-3 sm:h-4 object-cover shrink-0" alt="" />
                  <span className="font-medium text-[11px] sm:text-sm flex-1 leading-tight">{p.local?.nombre}</span>
                  <input type="number" min="0" className="w-10 sm:w-12 shrink-0 border border-slate-600 bg-slate-800 p-1 rounded text-center text-white font-bold" 
                    onChange={(e) => handleInputChange(p.id, 'local', parseInt(e.target.value))} />
                </div>

                <span className="font-bold text-slate-500 text-[10px] sm:text-xs shrink-0 px-1">VS</span>

                {/* Equipo Visitante */}
                <div className="flex items-center gap-1 sm:gap-3 flex-1 justify-end">
                  <input type="number" min="0" className="w-10 sm:w-12 shrink-0 border border-slate-600 bg-slate-800 p-1 rounded text-center text-white font-bold" 
                    onChange={(e) => handleInputChange(p.id, 'visitante', parseInt(e.target.value))} />
                  <span className="font-medium text-[11px] sm:text-sm text-right flex-1 leading-tight">{p.visitante?.nombre}</span>
                  <img src={p.visitante?.bandera_url || ''} className="w-5 sm:w-6 h-3 sm:h-4 object-cover shrink-0" alt="" />
                </div>

              </div>

              {isEliminatoria && hayEmpate && (
                <div className="mt-4 p-4 bg-orange-950/50 border border-orange-800 rounded-lg flex gap-4 items-center justify-center">
                  <select className="bg-slate-800 border border-slate-600 p-2 rounded text-sm" onChange={(e) => handleInputChange(p.id, 'metodo', e.target.value)}>
                    <option value="">Método...</option><option value="tiempo_extra">Tiempo Extra</option><option value="penales">Penales</option>
                  </select>
                  <select className="bg-slate-800 border border-slate-600 p-2 rounded text-sm" onChange={(e) => handleInputChange(p.id, 'ganador', e.target.value)}>
                    <option value="">¿Quién ganó?</option><option value={p.local?.nombre}>{p.local?.nombre}</option><option value={p.visitante?.nombre}>{p.visitante?.nombre}</option>
                  </select>
                </div>
              )}

              <button onClick={() => finalizarPartido(p)} disabled={p.estado === 'finalizado'}
                className={`mt-4 w-full py-2 rounded-lg font-semibold ${p.estado === 'finalizado' ? 'bg-slate-700 text-slate-500' : 'bg-red-600 text-white hover:bg-red-700'}`}>
                Finalizar Partido
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}