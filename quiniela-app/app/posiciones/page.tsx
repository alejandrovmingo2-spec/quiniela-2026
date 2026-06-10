"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Posiciones() {
  const [equipos, setEquipos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarPosiciones() {
      const { data, error } = await supabase
        .from('vista_posiciones')
        .select('*');
        
      if (!error && data) setEquipos(data);
      setLoading(false);
    }
    cargarPosiciones();
  }, []);

  // Agrupar los equipos por la letra de su grupo (A, B, C, etc.)
  const grupos = equipos.reduce((acc, equipo) => {
    if (!acc[equipo.grupo]) acc[equipo.grupo] = [];
    acc[equipo.grupo].push(equipo);
    return acc;
  }, {} as Record<string, any[]>);

  if (loading) return <div className="p-10 text-center">Cargando Tablas de Grupos...</div>;

  return (
    <main className="p-6 bg-gray-50 min-h-screen max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-800">Fase de Grupos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {Object.keys(grupos).sort().map(letra => (
          <div key={letra} className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            <h2 className="bg-blue-600 text-white font-bold p-3 text-center">Grupo {letra}</h2>
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 border-b">
                <tr>
                  <th className="p-3">Equipo</th>
                  <th className="p-3 text-center" title="Partidos Jugados">PJ</th>
                  <th className="p-3 text-center" title="Goles (Favor:Contra)">Goles</th>
                  <th className="p-3 text-center" title="Diferencia de Goles">DIF</th>
                  <th className="p-3 text-center font-bold text-blue-800">PTS</th>
                </tr>
              </thead>
              <tbody>
                {grupos[letra].map((eq: any, idx: number) => (
                  <tr key={eq.nombre} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-3 font-medium flex items-center gap-3">
                      <span className={`w-5 text-center font-bold ${idx < 2 ? 'text-green-500' : 'text-gray-400'}`}>
                        {idx + 1}
                      </span>
                      <img src={eq.bandera_url || ''} alt={eq.nombre} className="w-6 h-4 object-cover shadow-sm border border-gray-200" />
                      {eq.nombre}
                    </td>
                    <td className="p-3 text-center">{eq.jugados}</td>
                    <td className="p-3 text-center text-gray-500">{eq.goles_favor}:{eq.goles_contra}</td>
                    <td className="p-3 text-center">{eq.diferencia > 0 ? `+${eq.diferencia}` : eq.diferencia}</td>
                    <td className="p-3 text-center font-bold text-blue-600 text-lg">{eq.puntos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </main>
  );
}