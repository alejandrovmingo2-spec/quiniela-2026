"use client";

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MisPronosticos() {
  const [nombre, setNombre] = useState('');
  const [misPredicciones, setMisPredicciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [buscado, setBuscado] = useState(false);

  async function buscarPronosticos() {
    if (!nombre) return alert("Escribe tu nombre");
    setLoading(true);
    setBuscado(true);

    const { data, error } = await supabase
      .from('predicciones')
      .select(`
        *,
        partido:partido_id (
          *,
          local:equipos!partidos_equipo_local_id_fkey(nombre, bandera_url),
          visitante:equipos!partidos_equipo_visitante_id_fkey(nombre, bandera_url)
        )
      `)
      .eq('usuario_nombre', nombre)
      .order('partido_id', { ascending: true });

    if (!error) setMisPredicciones(data || []);
    setLoading(false);
  }

  function evaluarAcierto(p: any, pa: any) {
    if (pa.estado !== 'finalizado') return { color: 'bg-gray-100 border-gray-300 text-gray-500', icono: '⏳', texto: 'Pendiente' };

    const exacto = p.goles_local === pa.goles_local_real && p.goles_visitante === pa.goles_visitante_real;
    const ganoLocal = p.goles_local > p.goles_visitante && pa.goles_local_real > pa.goles_visitante_real;
    const ganoVisita = p.goles_local < p.goles_visitante && pa.goles_local_real < pa.goles_visitante_real;
    const empate = p.goles_local === p.goles_visitante && pa.goles_local_real === pa.goles_visitante_real;

    if (exacto) return { color: 'bg-green-100 border-green-500 text-green-800', icono: '✅', texto: '¡Exacto! (3 pts)' };
    if (ganoLocal || ganoVisita || empate) return { color: 'bg-yellow-100 border-yellow-500 text-yellow-800', icono: '⚠️', texto: 'Parcial (1 pt)' };
    return { color: 'bg-red-100 border-red-400 text-red-800', icono: '❌', texto: 'Fallo (0 pts)' };
  }

  return (
    <main className="p-6 bg-gray-50 min-h-screen max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-900">Mis Pronósticos</h1>
      
      <div className="mb-8 flex gap-2">
        <input type="text" className="w-full p-3 border rounded-lg" placeholder="Tu nombre exacto..." value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <button onClick={buscarPronosticos} className="bg-indigo-600 text-white px-6 rounded-lg font-bold hover:bg-indigo-700">Buscar</button>
      </div>

      {loading && <p className="text-center">Buscando...</p>}

      {!loading && buscado && misPredicciones.length === 0 && (
        <p className="text-center text-gray-500">No se encontraron pronósticos para "{nombre}". Revisa si lo escribiste igual.</p>
      )}

      <div className="grid gap-4">
        {misPredicciones.map((p) => {
          const partido = p.partido;
          const estado = evaluarAcierto(p, partido);

          return (
            <div key={p.id} className={`p-4 rounded-xl shadow-sm border-2 ${estado.color}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">{estado.texto} {estado.icono}</span>
                <span className="text-xs">{partido.fase}</span>
              </div>
              
              <div className="flex items-center justify-between bg-white/60 p-3 rounded-lg">
                <div className="flex items-center gap-2 w-1/3">
                  <img src={partido.local?.bandera_url} className="w-6 h-4 object-cover" alt=""/>
                  <span className="font-medium text-sm">{partido.local?.nombre}</span>
                </div>
                <div className="text-center">
                  <span className="block font-bold text-xl">{p.goles_local} - {p.goles_visitante}</span>
                  {partido.estado === 'finalizado' && (
                    <span className="text-[10px] text-gray-500 uppercase">Real: {partido.goles_local_real}-{partido.goles_visitante_real}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 w-1/3 justify-end">
                  <span className="font-medium text-sm">{partido.visitante?.nombre}</span>
                  <img src={partido.visitante?.bandera_url} className="w-6 h-4 object-cover" alt=""/>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}