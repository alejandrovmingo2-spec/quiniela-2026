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

  // REPLICA VISUAL DE TUS REGLAS PARA MOSTRAR LOS PUNTOS EN PANTALLA
  function evaluarAcierto(p: any, pa: any) {
    if (pa.estado !== 'finalizado') return { color: 'bg-slate-100 border-slate-300 text-slate-500', icono: '⏳', texto: 'Pendiente' };

    const isGrupos = pa.fase.includes('Jornada');
    let pts = 0;
    let texto = '';
    let color = '';
    let icono = '';

    if (isGrupos) {
      const exacto = p.goles_local === pa.goles_local_real && p.goles_visitante === pa.goles_visitante_real;
      const ganoLocal = p.goles_local > p.goles_visitante && pa.goles_local_real > pa.goles_visitante_real;
      const ganoVisita = p.goles_local < p.goles_visitante && pa.goles_local_real < pa.goles_visitante_real;
      const empate = p.goles_local === p.goles_visitante && pa.goles_local_real === pa.goles_visitante_real;

      if (exacto) { pts = 3; texto = '¡Exacto!'; color = 'bg-green-100 border-green-500 text-green-800'; icono = '✅'; }
      else if (ganoLocal || ganoVisita || empate) { pts = 1; texto = 'Parcial'; color = 'bg-yellow-100 border-yellow-500 text-yellow-800'; icono = '⚠️'; }
      else { pts = 0; texto = 'Fallo'; color = 'bg-red-100 border-red-400 text-red-800'; icono = '❌'; }
    } else {
      const empateReal = pa.goles_local_real === pa.goles_visitante_real;
      const empatePred = p.goles_local === p.goles_visitante;
      const exacto = p.goles_local === pa.goles_local_real && p.goles_visitante === pa.goles_visitante_real;
      const ganoLocal = p.goles_local > p.goles_visitante && pa.goles_local_real > pa.goles_visitante_real;
      const ganoVisita = p.goles_local < p.goles_visitante && pa.goles_local_real < pa.goles_visitante_real;
      const atinoGanador = p.equipo_ganador === pa.ganador_real;

      if (empatePred && !empateReal) {
          pts = 0; texto = 'Fallo'; color = 'bg-red-100 border-red-400 text-red-800'; icono = '❌';
      } else if (!empatePred && !empateReal) {
          if (exacto) { pts = 6; texto = '¡Exacto!'; color = 'bg-green-100 border-green-500 text-green-800'; icono = '✅'; }
          else if (ganoLocal || ganoVisita) { pts = 3; texto = 'Parcial'; color = 'bg-yellow-100 border-yellow-500 text-yellow-800'; icono = '⚠️'; }
          else { pts = 0; texto = 'Fallo'; color = 'bg-red-100 border-red-400 text-red-800'; icono = '❌'; }
      } else if (empatePred && empateReal) {
          if (p.metodo_desempate === 'penales' && pa.metodo_desempate_real === 'penales') {
              if (exacto && atinoGanador) pts = 10;
              else if (exacto && !atinoGanador) pts = 8;
              else if (!exacto && atinoGanador) pts = 6;
              else pts = 4;
          } else if (p.metodo_desempate === 'tiempo_extra' && pa.metodo_desempate_real === 'tiempo_extra') {
              if (exacto && atinoGanador) pts = 9;
              else if (exacto && !atinoGanador) pts = 7;
              else if (!exacto && atinoGanador) pts = 5;
              else pts = 3;
          } else {
              if (exacto && atinoGanador) pts = 3;
              else if (exacto && !atinoGanador) pts = 2;
              else if (!exacto && atinoGanador) pts = 2;
              else pts = 1;
          }
          
          if (pts >= 8) { color = 'bg-green-100 border-green-500 text-green-800'; icono = '🏆'; texto = '¡Épico!'; }
          else if (pts >= 5) { color = 'bg-blue-100 border-blue-500 text-blue-800'; icono = '✅'; texto = 'Gran Acierto'; }
          else { color = 'bg-yellow-100 border-yellow-500 text-yellow-800'; icono = '⚠️'; texto = 'Consolación'; }
      } else {
          pts = 0; texto = 'Fallo'; color = 'bg-red-100 border-red-400 text-red-800'; icono = '❌';
      }
    }

    return { color, icono, texto: `${texto} (${pts} pts)` };
  }

  return (
    <main className="p-6 bg-slate-50 min-h-screen max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-900">Mis Pronósticos</h1>
      
      <div className="mb-8 flex gap-2">
      <input type="text" className="w-full p-3 border rounded-lg text-black dark:text-black dark:bg-white focus:ring-2 focus:ring-indigo-600 outline-none" placeholder="Tu nombre exacto..." value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <button onClick={buscarPronosticos} className="bg-indigo-600 text-white px-6 rounded-lg font-bold hover:bg-indigo-700">Buscar</button>
      </div>

      {loading && <p className="text-center font-semibold text-slate-500">Buscando...</p>}

      {!loading && buscado && misPredicciones.length === 0 && (
        <p className="text-center text-gray-500">No se encontraron pronósticos para "{nombre}". Revisa si lo escribiste igual.</p>
      )}

      <div className="grid gap-4">
        {misPredicciones.map((p) => {
          const partido = p.partido;
          const estado = evaluarAcierto(p, partido);

          return (
            <div key={p.id} className={`p-4 rounded-xl shadow-sm border-2 ${estado.color}`}>
              <div className="flex justify-between items-center mb-3 border-b pb-2 border-white/50">
                <span className="text-xs font-bold uppercase tracking-wider">{estado.texto} {estado.icono}</span>
                <span className="text-xs font-semibold bg-white/50 px-2 py-1 rounded">{partido.fase}</span>
              </div>
              
              <div className="flex items-center justify-between bg-white/70 p-3 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 w-1/3">
                  <img src={partido.local?.bandera_url} className="w-6 h-4 object-cover rounded-sm" alt=""/>
                  <span className="font-medium text-sm text-slate-800">{partido.local?.nombre}</span>
                </div>
                <div className="text-center">
                  <span className="block font-black text-xl text-slate-900">{p.goles_local} - {p.goles_visitante}</span>
                  {partido.estado === 'finalizado' && (
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mt-1">Real: {partido.goles_local_real}-{partido.goles_visitante_real}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 w-1/3 justify-end">
                  <span className="font-medium text-sm text-slate-800">{partido.visitante?.nombre}</span>
                  <img src={partido.visitante?.bandera_url} className="w-6 h-4 object-cover rounded-sm" alt=""/>
                </div>
              </div>

              {/* Muestra la elección de desempate */}
              {p.metodo_desempate && (
                <div className="mt-2 text-center text-[11px] font-bold text-slate-700 bg-white/60 py-1.5 rounded-lg flex justify-center gap-4">
                  <span>🛠️ {p.metodo_desempate === 'tiempo_extra' ? 'Tiempos Extra' : 'Penales'}</span>
                  <span>🏆 Avanza: <span className="text-indigo-700">{p.equipo_ganador}</span></span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}