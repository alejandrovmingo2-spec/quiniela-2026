"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function QuinielaDashboard() {
  const [partidos, setPartidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState('');
  const [scores, setScores] = useState<Record<number, { local: number, visitante: number }>>({});

  useEffect(() => {
    async function cargarDatos() {
      const { data, error } = await supabase
        .from('partidos')
        .select(`*, local:equipos!partidos_equipo_local_id_fkey(nombre, bandera_url), visitante:equipos!partidos_equipo_visitante_id_fkey(nombre, bandera_url)`)
        .order('fecha', { ascending: true });

      if (!error) setPartidos(data || []);
      setLoading(false);
    }
    cargarDatos();
  }, []);

  const handleScoreChange = (partidoId: number, team: 'local' | 'visitante', value: string) => {
    const val = parseInt(value);
    setScores(prev => ({
      ...prev,
      [partidoId]: { ...prev[partidoId], [team]: isNaN(val) ? 0 : val }
    }));
  };

  // 1. EL CEREBRO DEL CANDADO: Compara la fecha actual con la del partido
  const isMatchLocked = (fechaStr: string) => {
    const matchDate = new Date(fechaStr);
    matchDate.setHours(matchDate.getHours() + 6);
    const now = new Date();
    return now >= matchDate; // Devuelve 'true' si el partido ya empezó
  };

  async function guardarPrediccion(partidoId: number) {
    if (!usuario) { alert("¡Escribe tu nombre arriba primero!"); return; }
    const { local, visitante } = scores[partidoId] || { local: 0, visitante: 0 };
    const { error } = await supabase.from('predicciones').upsert([{ usuario_nombre: usuario, partido_id: partidoId, goles_local: local, goles_visitante: visitante }]);
    if (error) alert("Error al guardar: " + error.message);
    else alert(`¡Guardado!`);
  }

  async function guardarTodos() {
    if (!usuario) { alert("¡Escribe tu nombre arriba primero!"); return; }
    
    // Filtrar para que el botón maestro no guarde partidos bloqueados haciendo trampa
    const prediccionesArray = Object.keys(scores)
      .map(id => parseInt(id))
      .filter(id => {
        const partido = partidos.find(p => p.id === id);
        return partido && !isMatchLocked(partido.fecha);
      })
      .map(id => ({
        usuario_nombre: usuario,
        partido_id: id,
        goles_local: scores[id].local,
        goles_visitante: scores[id].visitante
      }));

    if (prediccionesArray.length === 0) { alert("No has llenado nada o los partidos ya caducaron."); return; }

    const { error } = await supabase.from('predicciones').upsert(prediccionesArray);
    if (error) alert("Error al guardar: " + error.message);
    else alert(`¡Éxito! Se guardaron ${prediccionesArray.length} predicciones válidas.`);
  }

  if (loading) return <div className="p-10 text-center text-white">Cargando quiniela...</div>;

  return (
    <main className="min-h-screen pb-24 bg-slate-900">
      <div className="max-w-2xl mx-auto">
        <div className="pt-8 pb-4 px-4 sm:px-6">
          {/* Título adaptable al tamaño de celular (sm:text-3xl) */}
          <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-white mb-5 text-center uppercase drop-shadow-lg leading-tight">
            🏆 Quiniela Mundial 2026
          </h1>
          
          <div className="bg-white p-4 rounded-xl shadow-lg border-b-4 border-green-600">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Participante
            </label>
            {/* Texto explícitamente color negro (text-black) */}
            <input 
              type="text" 
              className="w-full p-3 pl-4 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all outline-none font-semibold text-black" 
              placeholder="Escribe tu nombre completo..." 
              value={usuario} 
              onChange={(e) => setUsuario(e.target.value)} 
            />
          </div>
        </div>

        <div className="px-4 sm:px-6 grid gap-4 mt-2">
          {partidos.map((p) => {
            // Verificamos si este partido específico ya está bloqueado
            const locked = isMatchLocked(p.fecha);

            return (
              <div key={p.id} className="bg-white p-4 sm:p-5 rounded-xl shadow-md border border-slate-200">
                <div className="bg-slate-50 py-2 rounded-lg mb-4 text-center border border-slate-100">
                  <p className="text-xs text-slate-600 font-semibold mb-1">
                    📅 {p.fecha.replace('T', ' ').substring(0, 16)} | 🏟️ {p.estadio || 'Estadio por definir'}
                  </p>
                  <p className="text-xs font-bold text-green-700 uppercase tracking-widest">{p.fase}</p>
                </div>

                <div className="flex items-center justify-between gap-1 sm:gap-2">
                  {/* Local: En celular se apila arriba-abajo, en PC lado a lado */}
                  <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 flex-1 justify-center sm:justify-end text-center sm:text-right">
                    <span className="font-bold text-[11px] sm:text-sm text-slate-800 leading-tight order-2 sm:order-1">{p.local?.nombre}</span>
                    <img src={p.local?.bandera_url} className="w-7 h-5 sm:w-6 sm:h-4 object-cover shadow-sm order-1 sm:order-2" alt=""/>
                  </div>
                  
                  {/* Cajas de Número */}
                  <div className="flex gap-1.5 sm:gap-2 items-center shrink-0">
                    <input 
                      type="number" min="0" disabled={locked}
                      className="w-10 sm:w-12 border-2 border-slate-200 p-1 sm:p-1.5 rounded-lg text-center font-bold text-lg text-black focus:border-blue-500 outline-none disabled:bg-slate-100 disabled:text-slate-400" 
                      onChange={(e) => handleScoreChange(p.id, 'local', e.target.value)} 
                    />
                    <span className="font-black text-slate-300">-</span>
                    <input 
                      type="number" min="0" disabled={locked}
                      className="w-10 sm:w-12 border-2 border-slate-200 p-1 sm:p-1.5 rounded-lg text-center font-bold text-lg text-black focus:border-blue-500 outline-none disabled:bg-slate-100 disabled:text-slate-400" 
                      onChange={(e) => handleScoreChange(p.id, 'visitante', e.target.value)} 
                    />
                  </div>
                  
                  {/* Visitante: Igual que local */}
                  <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 flex-1 justify-center sm:justify-start text-center sm:text-left">
                    <img src={p.visitante?.bandera_url} className="w-7 h-5 sm:w-6 sm:h-4 object-cover shadow-sm order-1" alt=""/>
                    <span className="font-bold text-[11px] sm:text-sm text-slate-800 leading-tight order-2">{p.visitante?.nombre}</span>
                  </div>
                </div>
                
                {/* 2. EL CANDADO VISUAL */}
                {locked ? (
                  <div className="mt-4 w-full bg-red-50 text-red-600 font-bold text-[13px] py-2.5 rounded-lg text-center border border-red-100">
                    🔒 Partido en juego / Terminado
                  </div>
                ) : (
                  <button onClick={() => guardarPrediccion(p.id)} className="mt-4 w-full bg-slate-100 text-slate-600 font-semibold text-[13px] py-2.5 rounded-lg hover:bg-slate-200 transition-colors">
                    Guardar este marcador
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.1)] flex justify-center z-20">
        <button onClick={guardarTodos} className="max-w-2xl w-full bg-green-600 text-white font-bold text-lg py-3.5 rounded-xl hover:bg-green-700 shadow-lg transition transform hover:scale-[1.01]">
          💾 Guardar Toda Mi Quiniela
        </button>
      </div>
    </main>
  );
}