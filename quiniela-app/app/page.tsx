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

  async function guardarPrediccion(partidoId: number) {
    if (!usuario) { alert("¡Escribe tu nombre arriba primero!"); return; }
    const { local, visitante } = scores[partidoId] || { local: 0, visitante: 0 };
    const { error } = await supabase.from('predicciones').upsert([{ usuario_nombre: usuario, partido_id: partidoId, goles_local: local, goles_visitante: visitante }]);
    if (error) alert("Error al guardar: " + error.message);
    else alert(`¡Guardado!`);
  }

  async function guardarTodos() {
    if (!usuario) { alert("¡Escribe tu nombre arriba primero!"); return; }
    
    const prediccionesArray = Object.keys(scores).map(id => ({
      usuario_nombre: usuario,
      partido_id: parseInt(id),
      goles_local: scores[parseInt(id)].local,
      goles_visitante: scores[parseInt(id)].visitante
    }));

    if (prediccionesArray.length === 0) { alert("No has llenado ningún marcador."); return; }

    const { error } = await supabase.from('predicciones').upsert(prediccionesArray);
    if (error) alert("Error al guardar: " + error.message);
    else alert(`¡Éxito! Se guardaron ${prediccionesArray.length} predicciones.`);
  }

  if (loading) return <div className="p-10 text-center">Cargando quiniela...</div>;

  return (
    <main className="min-h-screen pb-24 bg-slate-900 text-slate-100">
      
      {/* Contenedor central para alinear todo */}
      <div className="max-w-2xl mx-auto">
        
        {/* Cabecera (desaparece al hacer scroll) */}
        <div className="pt-8 pb-4 px-6">
          <h1 className="text-3xl font-black tracking-tighter text-white mb-5 text-center uppercase drop-shadow-lg">
            🏆 Quiniela Mundial 2026
          </h1>
          
          <div className="bg-white p-4 rounded-xl shadow-lg border-b-4 border-green-600">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Participante
            </label>
            <input 
              type="text" 
              className="w-full p-3.5 pl-4 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all outline-none font-semibold text-slate-900" 
              placeholder="Escribe tu nombre..." 
              value={usuario} 
              onChange={(e) => setUsuario(e.target.value)} 
            />
          </div>
        </div>

        {/* Contenedor de los Partidos */}
        <div className="px-6 grid gap-5 mt-4">
          {partidos.map((p) => (
            <div key={p.id} className="bg-white p-5 rounded-xl shadow-md border border-slate-200">
              
              {/* Etiqueta de Fecha, Estadio y Fase */}
              <div className="bg-slate-50 py-2 rounded-lg mb-4 text-center border border-slate-100">
                <p className="text-xs text-slate-600 font-semibold mb-1">
                  📅 {p.fecha.split('T')[0]} | 🏟️ {p.estadio || 'Estadio por definir'}
                </p>
                <p className="text-xs font-bold text-green-700 uppercase tracking-widest">{p.fase}</p>
              </div>

              {/* Marcadores con Banderas */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 w-1/3">
                  <img src={p.local?.bandera_url} className="w-6 h-4 object-cover shadow-sm" alt=""/>
                  <span className="font-bold text-sm text-slate-800">{p.local?.nombre}</span>
                </div>
                
                <div className="flex gap-2 items-center">
                  <input type="number" min="0" className="w-12 border-2 border-slate-200 p-1.5 rounded-lg text-center font-bold text-lg focus:border-blue-500 outline-none" onChange={(e) => handleScoreChange(p.id, 'local', e.target.value)} />
                  <span className="font-black text-slate-300">-</span>
                  <input type="number" min="0" className="w-12 border-2 border-slate-200 p-1.5 rounded-lg text-center font-bold text-lg focus:border-blue-500 outline-none" onChange={(e) => handleScoreChange(p.id, 'visitante', e.target.value)} />
                </div>
                
                <div className="flex items-center gap-2 w-1/3 justify-end">
                  <span className="font-bold text-sm text-right text-slate-800">{p.visitante?.nombre}</span>
                  <img src={p.visitante?.bandera_url} className="w-6 h-4 object-cover shadow-sm" alt=""/>
                </div>
              </div>
              
              {/* Botón individual */}
              <button onClick={() => guardarPrediccion(p.id)} className="mt-4 w-full bg-slate-100 text-slate-600 font-semibold text-sm py-2 rounded-lg hover:bg-slate-200 transition-colors">
                Guardar este marcador
              </button>
            </div>
          ))}
        </div>

      </div> {/* <-- Esta era la etiqueta de cierre que faltaba */}
      
      {/* Botón flotante para GUARDAR TODOS */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.1)] flex justify-center z-20">
        <button onClick={guardarTodos} className="max-w-2xl w-full bg-green-600 text-white font-bold text-lg py-3.5 rounded-xl hover:bg-green-700 shadow-lg transition transform hover:scale-[1.01]">
          💾 Guardar Toda Mi Quiniela
        </button>
      </div>
    </main>
  );
}