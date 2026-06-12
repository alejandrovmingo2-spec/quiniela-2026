"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RankingQuiniela() {
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarRanking() {
      // Aquí le decimos a Cursor que traiga los datos de la VISTA que hicimos en Supabase
      // Aquí le decimos a Cursor que traiga los datos de la VISTA que hicimos en Supabase
      const { data, error } = await supabase
        .from('vista_ranking')
        .select('*')
        .order('total_puntos', { ascending: false }) // 1ra regla: Puntos de mayor a menor
        .order('usuario_nombre', { ascending: true }); // 2da regla: En caso de empate, alfabéticamente (A-Z)

      if (error) {
        console.error("Error al cargar ranking:", error);
      } else {
        setRanking(data || []);
      }
      setLoading(false);
    }
    cargarRanking();
  }, []);

  if (loading) return <div className="p-10 text-center">Calculando puntos...</div>;

  return (
    <main className="p-6 bg-gray-50 min-h-screen max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-800">Ranking Oficial</h1>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="p-4 font-semibold text-center w-16">Pos</th>
              <th className="p-4 font-semibold">Jugador</th>
              <th className="p-4 font-semibold text-center w-24">Puntos</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((jugador, index) => (
              <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 text-center font-bold text-gray-500">
                  {index + 1}
                </td>
                <td className="p-4 font-medium text-gray-800">
                  {jugador.usuario_nombre}
                </td>
                <td className="p-4 text-center font-bold text-blue-600 text-lg">
                  {jugador.total_puntos}
                </td>
              </tr>
            ))}
            {ranking.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-500">
                  Aún no hay puntos calculados. ¡Espera a que termine el primer partido!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}