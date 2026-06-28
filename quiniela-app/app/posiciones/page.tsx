"use client";

export default function Posiciones() {
  return (
    <main className="p-4 sm:p-6 bg-slate-900 min-h-screen max-w-5xl mx-auto text-white">
      <h1 className="text-3xl font-black mb-6 text-center text-blue-500 uppercase tracking-wider">
        Mapa de Eliminatorias
      </h1>
      
      {/* Contenedor de la Imagen del Bracket */}
      <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-2 sm:p-4 mb-10 overflow-hidden flex justify-center">
        {/* Asegúrate de que la imagen se llame llaves.jpg y esté en la carpeta public */}
        <img src="/llaves.jpg" alt="Llaves del Mundial" className="w-full max-w-3xl rounded-xl object-contain" />
      </div>

      <h2 className="text-2xl font-bold mb-6 text-center text-slate-300">
        Los 16 Cruces Confirmados
      </h2>

      {/* Lista de partidos directos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <p className="text-sm text-slate-400 mb-1">28 y 29 de Junio</p>
          <ul className="space-y-2 font-semibold text-sm sm:text-base">
            <li>🇿🇦 Sudáfrica <span className="text-slate-500 font-normal text-xs mx-1">VS</span> Canadá 🇨🇦</li>
            <li>🇩🇪 Alemania <span className="text-slate-500 font-normal text-xs mx-1">VS</span> Paraguay 🇵🇾</li>
            <li>🇳🇱 Países Bajos <span className="text-slate-500 font-normal text-xs mx-1">VS</span> Marruecos 🇲🇦</li>
            <li>🇧🇷 Brasil <span className="text-slate-500 font-normal text-xs mx-1">VS</span> Japón 🇯🇵</li>
          </ul>
        </div>
        
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <p className="text-sm text-slate-400 mb-1">30 de Junio y 1 de Julio</p>
          <ul className="space-y-2 font-semibold text-sm sm:text-base">
            <li>🇫🇷 Francia <span className="text-slate-500 font-normal text-xs mx-1">VS</span> Suecia 🇸🇪</li>
            <li>🇨🇮 Costa de Marfil <span className="text-slate-500 font-normal text-xs mx-1">VS</span> Noruega 🇳🇴</li>
            <li>🇲🇽 México <span className="text-slate-500 font-normal text-xs mx-1">VS</span> Ecuador 🇪🇨</li>
            <li>🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra <span className="text-slate-500 font-normal text-xs mx-1">VS</span> RD Congo 🇨🇩</li>
          </ul>
        </div>

        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <p className="text-sm text-slate-400 mb-1">1 y 2 de Julio</p>
          <ul className="space-y-2 font-semibold text-sm sm:text-base">
            <li>🇺🇸 Estados Unidos <span className="text-slate-500 font-normal text-xs mx-1">VS</span> Bosnia 🇧🇦</li>
            <li>🇧🇪 Bélgica <span className="text-slate-500 font-normal text-xs mx-1">VS</span> Senegal 🇸🇳</li>
            <li>🇵🇹 Portugal <span className="text-slate-500 font-normal text-xs mx-1">VS</span> Croacia 🇭🇷</li>
            <li>🇪🇸 España <span className="text-slate-500 font-normal text-xs mx-1">VS</span> Austria 🇦🇹</li>
          </ul>
        </div>

        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <p className="text-sm text-slate-400 mb-1">2 y 3 de Julio</p>
          <ul className="space-y-2 font-semibold text-sm sm:text-base">
            <li>🇨🇭 Suiza <span className="text-slate-500 font-normal text-xs mx-1">VS</span> Argelia 🇩🇿</li>
            <li>🇦🇷 Argentina <span className="text-slate-500 font-normal text-xs mx-1">VS</span> Cabo Verde 🇨🇻</li>
            <li>🇨🇴 Colombia <span className="text-slate-500 font-normal text-xs mx-1">VS</span> Ghana 🇬🇭</li>
            <li>🇦🇺 Australia <span className="text-slate-500 font-normal text-xs mx-1">VS</span> Egipto 🇪🇬</li>
          </ul>
        </div>
      </div>
    </main>
  );
}