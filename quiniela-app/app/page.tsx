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
  const [scores, setScores] = useState<Record<number, { local: number, visitante: number, metodo?: string, ganador?: string }>>({});

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

  const handleInputChange = (partidoId: number, field: string, value: string | number) => {
    setScores(prev => ({
      ...prev,
      [partidoId]: { ...prev[partidoId], [field]: value }
    }));
  };


  // EL CEREBRO DEL CANDADO (Blindado para hora local)
  const isMatchLocked = (fechaStr: string) => {
    const fechaLimpia = fechaStr.split('+')[0].split('Z')[0];
    const matchDate = new Date(fechaLimpia);
    const now = new Date();
    return now >= matchDate; 
  };

  async function guardarPrediccion(partidoId: number) {
    if (!usuario) { alert("¡Escribe tu nombre arriba primero!"); return; }
    
    const p = scores[partidoId];
    if (!p || p.local === undefined || p.visitante === undefined) {
      alert("Faltan los marcadores de este partido."); return;
    }

    // Validación de Empate en Eliminatorias
    const partidoDB = partidos.find(x => x.id === partidoId);
    const isEliminatoria = partidoDB && !partidoDB.fase.includes("Jornada");
    if (isEliminatoria && p.local === p.visitante && (!p.metodo || !p.ganador)) {
      alert("Marcaste un empate. Debes seleccionar el método de desempate y quién avanza."); return;
    }

    const { error } = await supabase.from('predicciones').upsert([{ 
      usuario_nombre: usuario, 
      partido_id: partidoId, 
      goles_local: p.local, 
      goles_visitante: p.visitante,
      metodo_desempate: p.metodo || null,
      equipo_ganador: p.ganador || null
    }]);

    if (error) alert("Error al guardar: " + error.message);
    else alert(`¡Guardado!`);
  }

  async function guardarTodos() {
    if (!usuario) { alert("¡Escribe tu nombre arriba primero!"); return; }
    
    let hayErrorEmpate = false;

    // Preparar datos filtrando los que no están bloqueados
    const prediccionesArray = Object.keys(scores)
      .map(id => parseInt(id))
      .filter(id => {
        const partido = partidos.find(p => p.id === id);
        return partido && !isMatchLocked(partido.fecha);
      })
      .map(id => {
        const p = scores[id];
        const partidoDB = partidos.find(x => x.id === id);
        const isEliminatoria = partidoDB && !partidoDB.fase.includes("Jornada");
        
        if (isEliminatoria && p.local === p.visitante && (!p.metodo || !p.ganador)) {
            hayErrorEmpate = true;
        }

        return {
          usuario_nombre: usuario,
          partido_id: id,
          goles_local: p.local,
          goles_visitante: p.visitante,
          metodo_desempate: p.metodo || null,
          equipo_ganador: p.ganador || null
        };
      });

    if (hayErrorEmpate) {
      alert("Tienes empates sin definir (te falta seleccionar método o ganador). Revísalos por favor."); return;
    }

    if (prediccionesArray.length === 0) { alert("No has llenado nada o los partidos ya caducaron."); return; }

    const { error } = await supabase.from('predicciones').upsert(prediccionesArray);
    if (error) alert("Error al guardar: " + error.message);
    else alert(`¡Éxito! Se guardaron ${prediccionesArray.length} predicciones válidas.`);
  }

  if (loading) return <div className="p-10 text-center text-white">Cargando quiniela...</div>;

  // FILTRO MÁGICO: Oculta los partidos pasados/bloqueados y los de Fase de Grupos
  const partidosVisibles = partidos.filter(p => !isMatchLocked(p.fecha) && !p.fase.includes("Jornada"));

  return (
    <main className="min-h-screen pb-24 bg-slate-900">
      <div className="max-w-2xl mx-auto">
        <div className="pt-8 pb-4 px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-white mb-5 text-center uppercase drop-shadow-lg leading-tight">
            🏆 Quiniela Mundial 2026
          </h1>
          
          <div className="bg-white p-4 rounded-xl shadow-lg border-b-4 border-green-600">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Participante
            </label>
            <input 
              type="text" 
              className="w-full p-3 pl-4 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all outline-none font-semibold text-black dark:text-black dark:bg-slate-50"
              placeholder="Escribe tu nombre completo..." 
              value={usuario} 
              onChange={(e) => setUsuario(e.target.value)} 
            />
          </div>
        </div>

        <div className="px-4 sm:px-6 grid gap-4 mt-2">
          {partidosVisibles.length === 0 ? (
             <div className="bg-white p-8 rounded-xl text-center text-slate-500 font-bold">
               No hay partidos disponibles para pronosticar en este momento.
             </div>
          ) : (
            partidosVisibles.map((p) => {
              const res = scores[p.id] || {};
              const hayEmpate = res.local === res.visitante && res.local !== undefined;

              return (
                <div key={p.id} className="bg-white p-4 sm:p-5 rounded-xl shadow-md border border-slate-200">
                  <div className="bg-slate-50 py-2 rounded-lg mb-4 text-center border border-slate-100">
                    <p className="text-xs text-slate-600 font-semibold mb-1">
                      📅 {p.fecha.replace('T', ' ').substring(0, 16)} | 🏟️ {p.estadio || 'Estadio por definir'}
                    </p>
                    <p className="text-xs font-bold text-green-700 uppercase tracking-widest">{p.fase}</p>
                  </div>

                  <div className="flex items-center justify-between gap-1 sm:gap-2">
                    {/* Local */}
                    <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 flex-1 justify-center sm:justify-end text-center sm:text-right">
                      <span className="font-bold text-[11px] sm:text-sm text-slate-800 leading-tight order-2 sm:order-1">{p.local?.nombre}</span>
                      <img src={p.local?.bandera_url} className="w-7 h-5 sm:w-6 sm:h-4 object-cover shadow-sm order-1 sm:order-2" alt=""/>
                    </div>
                    
                    {/* Marcadores */}
                    <div className="flex gap-1.5 sm:gap-2 items-center shrink-0">
                      <input 
                        type="number" min="0" 
                        className="w-10 sm:w-12 border-2 border-slate-200 p-1 sm:p-1.5 rounded-lg text-center font-bold text-lg text-black focus:border-blue-500 outline-none" 
                        onChange={(e) => handleInputChange(p.id, 'local', parseInt(e.target.value))} 
                      />
                      <span className="font-black text-slate-300">-</span>
                      <input 
                        type="number" min="0" 
                        className="w-10 sm:w-12 border-2 border-slate-200 p-1 sm:p-1.5 rounded-lg text-center font-bold text-lg text-black focus:border-blue-500 outline-none" 
                        onChange={(e) => handleInputChange(p.id, 'visitante', parseInt(e.target.value))} 
                      />
                    </div>
                    
                    {/* Visitante */}
                    <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 flex-1 justify-center sm:justify-start text-center sm:text-left">
                      <img src={p.visitante?.bandera_url} className="w-7 h-5 sm:w-6 sm:h-4 object-cover shadow-sm order-1" alt=""/>
                      <span className="font-bold text-[11px] sm:text-sm text-slate-800 leading-tight order-2">{p.visitante?.nombre}</span>
                    </div>
                  </div>

                  {/* MENÚ DE DESEMPATE (Solo aparece si es eliminatoria y hay empate) */}
                  {hayEmpate && (
                    <div className="mt-4 p-3 sm:p-4 bg-orange-50 border border-orange-200 rounded-lg flex flex-col sm:flex-row gap-2 sm:gap-4 items-center justify-center">
                      <select className="bg-white border border-slate-300 p-2 rounded-lg text-xs sm:text-sm font-semibold w-full sm:w-auto text-black outline-none focus:ring-2 focus:ring-orange-400" 
                        onChange={(e) => handleInputChange(p.id, 'metodo', e.target.value)}>
                        <option value="">¿Cómo se define?</option>
                        <option value="tiempo_extra">Tiempos Extra</option>
                        <option value="penales">Penales</option>
                      </select>
                      <select className="bg-white border border-slate-300 p-2 rounded-lg text-xs sm:text-sm font-semibold w-full sm:w-auto text-black outline-none focus:ring-2 focus:ring-orange-400" 
                        onChange={(e) => handleInputChange(p.id, 'ganador', e.target.value)}>
                        <option value="">¿Quién avanza?</option>
                        <option value={p.local?.nombre}>{p.local?.nombre}</option>
                        <option value={p.visitante?.nombre}>{p.visitante?.nombre}</option>
                      </select>
                    </div>
                  )}
                  
                  <button onClick={() => guardarPrediccion(p.id)} className="mt-4 w-full bg-slate-100 text-slate-600 font-semibold text-[13px] py-2.5 rounded-lg hover:bg-slate-200 transition-colors">
                    Guardar este marcador
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 w-full p-4 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.3)] flex justify-center z-20">
        <button onClick={guardarTodos} className="max-w-2xl w-full bg-green-600 text-white font-bold text-lg py-3.5 rounded-xl hover:bg-green-700 shadow-lg transition transform hover:scale-[1.01]">
          💾 Guardar Toda Mi Quiniela
        </button>
      </div>
    </main>
  );
}