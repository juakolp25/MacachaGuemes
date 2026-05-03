import { useState, useEffect, useRef } from "react";

// ─── Caesar cipher ───────────────────────────────────────────────
function caesarEncrypt(text, shift) {
  return text.split("").map((c) => {
    if (c >= "a" && c <= "z") return String.fromCharCode(((c.charCodeAt(0) - 97 + shift) % 26) + 97);
    if (c >= "A" && c <= "Z") return String.fromCharCode(((c.charCodeAt(0) - 65 + shift) % 26) + 65);
    return c;
  }).join("");
}
function caesarDecrypt(text, shift) { return caesarEncrypt(text, 26 - (shift % 26)); }

// ─── Missions ────────────────────────────────────────────────────
const MISSIONS = [
  {
    id: 1,
    title: "MISIÓN 01 — Transmisión Interceptada",
    intro: "Hemos capturado una transmisión enemiga cifrada con César. La clave es un año histórico.",
    cipherShift: 13,
    plain: "Marcharemos al amanecer desde Humahuaca con doscientos hombres. La caballeria cruzara el rio Bermejo hacia el sur. Atacaremos las posiciones de Salta por el flanco oeste al alba del quince. Que nadie se interponga en nombre del Rey.",
    hint: "¿Cuándo comenzó la Revolución de Mayo? (1800–1830)",
    answerType: "year",
    correctAnswers: [1810, 1821],
    validate: (val) => [1810, 1821].includes(parseInt(val)),
    inputLabel: "Ingresa el año clave",
    inputRange: [1800, 1830],
    successMsg: "¡Correcto! La red gaucha confirma el mensaje. El ataque es al amanecer.",
  },
  {
    id: 2,
    title: "MISIÓN 02 — El Código del Mensajero",
    intro: "Un mensajero capturado llevaba un número secreto. Era la cantidad de hombres en la guarnición realista de Jujuy, expresada como suma de dos batallones.",
    cipherShift: 0,
    plain: "La guarnición consta de trescientos hombres: dos batallones de ciento cincuenta cada uno. El comandante realista espera refuerzos en tres días.",
    hint: "Un batallón tiene 150 hombres. ¿Cuántos son en total los dos batallones?",
    answerType: "number",
    correctAnswers: [300],
    validate: (val) => parseInt(val) === 300,
    inputLabel: "Ingresa el número de hombres",
    inputRange: [1, 9999],
    successMsg: "¡Exacto! Trescientos efectivos. La información llega a Güemes a tiempo.",
  },
  {
    id: 3,
    title: "MISIÓN 03 — La Red de Provisiones",
    intro: "Macacha organizó una red de provisiones encubierta. Para activarla, hay que identificar el punto de encuentro: la décima letra del alfabeto.",
    cipherShift: 0,
    plain: "El punto de reunión es la posada de la letra J, en el camino real hacia Salta. Llegarán al anochecer con mulas cargadas de pólvora y víveres.",
    hint: "Cuenta las letras del abecedario: A=1, B=2... ¿Cuál es la décima?",
    answerType: "letter",
    correctAnswers: ["J", "j"],
    validate: (val) => ["j", "J"].includes(val.trim()),
    inputLabel: "Ingresa la letra (una sola letra)",
    inputRange: null,
    successMsg: "¡La letra J! La posada en el camino real. Las mulas salen esta noche.",
  },
  {
    id: 4,
    title: "MISIÓN 04 — Cifrado de Vigenère Básico",
    intro: "Este mensaje usa una clave de una sola letra repetida. La clave es la letra que representa el mes de Mayo en número romano (V).",
    cipherShift: 22, // V = posición 22 en 0-indexado... usaremos César con shift 21 (V es la 22° letra = índice 21)
    plain: "Los refuerzos vienen del sur. Llegarán antes del jueves con caballería ligera y cañones de campaña. Esperad en la quebrada.",
    hint: "La letra V es la clave. En César, V ocupa la posición 22 del abecedario.",
    answerType: "number",
    correctAnswers: [22],
    validate: (val) => parseInt(val) === 22,
    inputLabel: "Ingresa la posición de la letra V (número)",
    inputRange: [1, 26],
    successMsg: "¡Posición 22! El mensaje está descifrado. La caballería llega el jueves.",
  },
  {
    id: 5,
    title: "MISIÓN 05 — El Año de la Independencia",
    intro: "Un documento sellado con cera roja llegó desde Buenos Aires. La clave para abrirlo es el año en que las Provincias Unidas declararon su independencia.",
    cipherShift: 6,
    plain: "El Congreso de Tucumán ha declarado la independencia. Todas las fuerzas patriotas deben movilizarse. La causa es ahora oficial. Viva la Patria.",
    hint: "¿En qué año se declaró la independencia argentina? (1810–1820)",
    answerType: "year",
    correctAnswers: [1816],
    validate: (val) => parseInt(val) === 1816,
    inputLabel: "Ingresa el año de independencia",
    inputRange: [1810, 1820],
    successMsg: "¡1816! El Congreso de Tucumán. La independencia está declarada.",
  },
  {
    id: 6,
    title: "MISIÓN 06 — Los Espías de Salta",
    intro: "Macacha identificó a tres espías realistas infiltrados. Sus nombres en clave son números primos menores a 10. ¿Cuántos espías hay?",
    cipherShift: 0,
    plain: "Los tres agentes infiltrados son conocidos como Dos, Tres y Siete. Operan desde la plaza principal y envían informes cada lunes al cuartel realista.",
    hint: "¿Cuántos números primos hay menores que 10? (2, 3, 5, 7...)",
    answerType: "number",
    correctAnswers: [4],
    validate: (val) => parseInt(val) === 4,
    inputLabel: "¿Cuántos números primos hay menores que 10?",
    inputRange: [1, 20],
    successMsg: "¡Cuatro! (2, 3, 5 y 7). Los cuatro agentes han sido identificados.",
  },
  {
    id: 7,
    title: "MISIÓN 07 — La Frecuencia Secreta",
    intro: "Las comunicaciones realistas usan una frecuencia numérica: el resultado de multiplicar los dígitos del año 1810.",
    cipherShift: 8,
    plain: "Cambiad la frecuencia al producto de vuestros dígitos de referencia. Solo así podrán comunicarse sin ser detectados por los gauchos.",
    hint: "Multiplica: 1 × 8 × 1 × 0 = ?",
    answerType: "number",
    correctAnswers: [0],
    validate: (val) => parseInt(val) === 0,
    inputLabel: "Ingresa el resultado de 1×8×1×0",
    inputRange: [0, 100],
    successMsg: "¡Cero! Cualquier número multiplicado por 0 da 0. La frecuencia está comprometida.",
  },
  {
    id: 8,
    title: "MISIÓN 08 — El Mensaje de Güemes",
    intro: "Güemes envió un mensaje cifrado a sus comandantes. El desplazamiento César es igual a la cantidad de provincias que firmaron el Acta de Independencia de 1816.",
    cipherShift: 14,
    plain: "Mantened las posiciones en la quebrada. No avancéis sin mi señal. La victoria depende de la resistencia gaucha. Macacha os proveerá de todo lo necesario.",
    hint: "En 1816, firmaron el Acta representantes de 14 provincias.",
    answerType: "number",
    correctAnswers: [14],
    validate: (val) => parseInt(val) === 14,
    inputLabel: "¿Cuántas provincias firmaron el Acta en 1816?",
    inputRange: [1, 30],
    successMsg: "¡14 provincias! El desplazamiento es correcto. Las órdenes llegan a los comandantes.",
  },
  {
    id: 9,
    title: "MISIÓN 09 — El Nombre en Clave",
    intro: "Macacha operaba bajo un nombre en clave de una sola palabra: el animal que representa la valentía gaucha en los Andes.",
    cipherShift: 0,
    plain: "El agente conocido como CÓNDOR ha logrado infiltrar el cuartel general realista. Traerá los planos del fuerte de Cobos antes del amanecer.",
    hint: "Es un ave majestuosa de los Andes, símbolo de libertad y valentía.",
    answerType: "word",
    correctAnswers: ["condor", "cóndor", "CONDOR", "CÓNDOR"],
    validate: (val) => ["condor", "cóndor", "condor", "CONDOR", "CÓNDOR"].includes(val.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")),
    inputLabel: "Ingresa el nombre en clave (una palabra)",
    inputRange: null,
    successMsg: "¡CÓNDOR! El agente ha entregado los planos. El fuerte de Cobos es vulnerable.",
  },
  {
    id: 10,
    title: "MISIÓN 10 — OPERACIÓN FINAL: La Clave Maestra",
    intro: "La misión culminante. Combina todo lo aprendido: la clave es el año en que Martín Miguel de Güemes fue herido de muerte en la batalla de Salta.",
    cipherShift: 21,
    plain: "La red de Macacha Güemes ha completado su misión. La resistencia gaucha del norte argentino ha salvado la independencia. Sin Macacha, no hay Güemes. Sin Güemes, no hay patria libre. La causa triunfa desde las sombras.",
    hint: "Güemes fue herido mortalmente en junio de 1821, año que también marcó el fin de la guerra gaucha.",
    answerType: "year",
    correctAnswers: [1821],
    validate: (val) => parseInt(val) === 1821,
    inputLabel: "¿En qué año murió Güemes?",
    inputRange: [1815, 1830],
    successMsg: "¡1821! Güemes cayó pero su causa perduró. La red de Macacha sobrevivió para contar la historia.",
  },
];

const MAX_ATTEMPTS = 7;

const BOOT_LINES = [
  { text: "INICIANDO PROTOCOLO SALTA_REBELDE v2.0...", cls: "bright" },
  { text: ">> Estableciendo canal seguro con la red gaucha...", cls: "" },
  { text: ">> Verificando identidad patriota...", cls: "" },
  { text: ">> Cargando 10 misiones de inteligencia encubierta...", cls: "" },
  { text: ">> Estado: CONEXIÓN ESTABLECIDA [norte.arg/nodo-3]", cls: "bright" },
  { text: "---", cls: "dim" },
  { text: "ALERTA: Red patriota bajo amenaza realista.", cls: "warn" },
  { text: "Se requiere agente para completar todas las misiones.", cls: "warn" },
  { text: "¿Eres digna/o de la causa? Demuéstralo.", cls: "bright" },
];

const ASCII_MAP = `
  NORTE ARGENTINO — MAPA TÁCTICO FINAL
  ════════════════════════════════════════════════════════
   BOLIVIA (ALTO PERÚ)
        │
        │  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        │  ~   ☁ Quebrada de Humahuaca  ☁           ~
        │  ~          ✖ [Realistas: DERROTADOS]      ~
        ├──~──────────────────────────────────────────
        │  ~   ↓  Camino Real Liberado  ↓            ~
        │  ~                                         ~
  JUJUY ~  ~  ★ [San Salvador de Jujuy — LIBRE]     ~
        │  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        │               │
        │    ≈≈≈≈≈≈≈≈≈≈≈≈≈≈  (Río Reyes)
        │               │
  ──────┼───────────────────────────────────────────────
        │
  SALTA │  ┌──────────────────────────────────────┐
        │  │   ◈  SALTA CAPITAL — LIBERADA        │
        │  │   ★  Batallón Gaucho — VICTORIOSO    │
        │  │   ◈  Red de Macacha Güemes — ACTIVA  │
        │  └──────────────────────────────────────┘
        │
  ════════════════════════════════════════════════════════
  ★ POSICIÓN GAUCHA   ✖ FUERZA REALISTA   ◈ MACACHA
  TODAS LAS MISIONES COMPLETADAS — LA PATRIA ES LIBRE
`;

// ─── Hooks ───────────────────────────────────────────────────────
function useTypewriter(text, speed = 18, enabled = true) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!enabled || !text) { setDisplayed(""); setDone(false); return; }
    setDisplayed(""); setDone(false);
    let i = 0;
    const t = setInterval(() => {
      setDisplayed(text.slice(0, ++i));
      if (i >= text.length) { clearInterval(t); setDone(true); }
    }, speed);
    return () => clearInterval(t);
  }, [text, speed, enabled]);
  return { displayed, done };
}

// ─── Boot Sequence ────────────────────────────────────────────────
function BootSequence({ onDone }) {
  const [visibleLines, setVisibleLines] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const timeouts = useRef([]);

  useEffect(() => {
    function typeLine(idx) {
      if (idx >= BOOT_LINES.length) {
        const t = setTimeout(onDone, 400);
        timeouts.current.push(t);
        return;
      }
      const line = BOOT_LINES[idx];
      if (line.text === "---") {
        setVisibleLines((prev) => [...prev, line]);
        const t = setTimeout(() => typeLine(idx + 1), 80);
        timeouts.current.push(t);
        return;
      }
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setCurrentText(line.text.slice(0, i));
        if (i >= line.text.length) {
          clearInterval(interval);
          setVisibleLines((prev) => [...prev, { ...line }]);
          setCurrentText("");
          const t = setTimeout(() => typeLine(idx + 1), 120);
          timeouts.current.push(t);
        }
      }, 18);
    }
    const t = setTimeout(() => typeLine(0), 500);
    timeouts.current.push(t);
    return () => timeouts.current.forEach(clearTimeout);
  }, []);

  const clsMap = { bright: "text-green-300", warn: "text-orange-400", dim: "text-green-900", "": "text-green-500" };
  return (
    <div className="font-mono text-sm leading-relaxed">
      {visibleLines.map((line, i) =>
        line.text === "---" ? (
          <hr key={i} className="border-amber-900/40 my-2" />
        ) : (
          <div key={i} className={clsMap[line.cls] || "text-green-500"}>{line.text}</div>
        )
      )}
      {currentIdx < BOOT_LINES.length && currentText && (
        <div className={clsMap[BOOT_LINES[currentIdx]?.cls] || "text-green-500"}>
          {currentText}<span className="animate-pulse">█</span>
        </div>
      )}
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────
function MissionProgress({ current, total }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs text-green-700 mb-1">
        <span>PROGRESO DE LA MISIÓN</span>
        <span>{current}/{total} completadas</span>
      </div>
      <div className="h-1 bg-green-900/30 rounded">
        <div
          className="h-full bg-amber-700 transition-all duration-700 rounded"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
      <div className="flex gap-1 mt-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-0.5 ${i < current ? "bg-green-500" : "bg-green-900/40"}`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Mission Panel ────────────────────────────────────────────────
function MissionPanel({ mission, onSolved, missionIndex }) {
  const [input, setInput] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [log, setLog] = useState("");
  const [solved, setSolved] = useState(false);
  const [locked, setLocked] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  const cipherText = mission.cipherShift > 0
    ? caesarEncrypt(mission.plain, mission.cipherShift)
    : null;

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
    setInput(""); setAttempts(0); setLog(""); setSolved(false); setLocked(false); setShake(false);
  }, [mission.id]);

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  }

  function attempt() {
    if (solved || locked) return;
    const val = input.trim();
    if (!val) { setLog("error:Ingresa una respuesta válida."); triggerShake(); return; }

    const next = attempts + 1;
    setAttempts(next);

    if (mission.validate(val)) {
      setSolved(true);
      setLocked(true);
      setLog("ok:" + mission.successMsg);
      setTimeout(() => onSolved(), 2200);
    } else {
      const remaining = MAX_ATTEMPTS - next;
      if (next >= MAX_ATTEMPTS) {
        setLog("error:INTENTOS AGOTADOS. La misión ha fallado. Recargá para intentarlo de nuevo.");
        setLocked(true);
      } else {
        setLog(`warn:✖ Respuesta incorrecta. Restantes: ${remaining}`);
        triggerShake();
      }
    }
    setInput("");
  }

  const progress = Math.min((attempts / MAX_ATTEMPTS) * 100, 100);
  const logColor = log.startsWith("ok:") ? "text-green-300" : log.startsWith("error:") ? "text-red-400" : "text-orange-400";
  const logText = log.replace(/^(ok:|error:|warn:)/, "");

  return (
    <div className="font-terminal">
      <div className="border border-amber-700/60 bg-amber-900/5 p-3 mb-3 relative">
        <span className="absolute -top-2.5 left-3 bg-[#0a0a0a] px-2 text-[10px] tracking-[0.2em] text-amber-700">
          ◈ {mission.title} ◈
        </span>
        <p className="text-green-400 text-xs leading-relaxed mt-1">{mission.intro}</p>
      </div>

      {cipherText && (
        <div className="border border-amber-700/30 bg-amber-900/5 p-3 mb-3 relative">
          <span className="absolute -top-2.5 left-3 bg-[#0a0a0a] px-2 text-[10px] text-amber-700">
            MENSAJE CIFRADO
          </span>
          <p className="text-amber-700/70 text-xs leading-relaxed tracking-widest italic break-all">
            {cipherText}
          </p>
        </div>
      )}

      <p className="text-green-900/80 text-xs mb-3 italic">// Pista: {mission.hint}</p>

      <div className="h-0.5 bg-green-900/30 mb-3">
        <div className="h-full bg-amber-700 transition-all duration-300" style={{ width: progress + "%" }} />
      </div>

      {!locked && (
        <div className={`flex items-center gap-2 border border-green-500/30 bg-green-500/5 px-3 py-2 ${shake ? "shake" : ""}`}>
          <span className="text-amber-700 text-sm shrink-0">$</span>
          <input
            ref={inputRef}
            type={mission.answerType === "number" || mission.answerType === "year" ? "number" : "text"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && attempt()}
            placeholder={mission.inputLabel}
            min={mission.inputRange?.[0]}
            max={mission.inputRange?.[1]}
            className="bg-transparent border-none outline-none text-green-400 text-sm flex-1 font-terminal placeholder-green-900"
          />
          <button
            onClick={attempt}
            className="border border-amber-700/60 bg-amber-900/20 text-amber-700 text-xs px-3 py-1 hover:bg-amber-900/40 transition-all tracking-wider"
          >
            [ ENVIAR ]
          </button>
        </div>
      )}

      {log && <p className={`text-xs mt-2 ${logColor}`}>{logText}</p>}

      {solved && (
        <p className="text-green-300 text-sm text-center tracking-widest mt-3 glow-success">
          ▓▓▓ MISIÓN {mission.id} COMPLETADA ▓▓▓
        </p>
      )}
    </div>
  );
}

// ─── Decrypted final message ──────────────────────────────────────
function DecryptedMessage({ show }) {
  const text = "La red de Macacha Güemes ha completado todas sus misiones. La resistencia gaucha del norte argentino ha salvado la independencia. Sin Macacha, no hay Güemes. Sin Güemes, no hay patria libre.";
  const { displayed, done } = useTypewriter(text, 20, show);
  return (
    <div className="border border-green-500/30 bg-green-500/5 p-3 mt-3 relative">
      <span className="absolute -top-2.5 left-3 bg-black px-2 text-xs tracking-widest text-amber-700">
        ✦ MISIÓN CUMPLIDA ✦
      </span>
      <p className="text-green-300 text-sm leading-relaxed font-serif italic">
        {displayed}{!done && <span className="animate-pulse">█</span>}
      </p>
    </div>
  );
}

function AsciiMap({ show }) {
  const { displayed } = useTypewriter(show ? ASCII_MAP : "", 6, show);
  return (
    <pre className="bg-green-500/5 border border-green-500/25 p-3 text-xs text-green-400 leading-snug overflow-x-auto whitespace-pre font-mono mt-2">
      {displayed}
      {show && displayed.length < ASCII_MAP.length && <span className="animate-pulse">█</span>}
    </pre>
  );
}

// ─── Main ─────────────────────────────────────────────────────────
export default function MacachaGuemes() {
  const [bootDone, setBootDone] = useState(false);
  const [missionIdx, setMissionIdx] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [allDone, setAllDone] = useState(false);
  const [showMap, setShowMap] = useState(false);

  function handleMissionSolved() {
    const next = missionIdx + 1;
    setCompletedCount(next);
    if (next >= MISSIONS.length) {
      setAllDone(true);
      setTimeout(() => setShowMap(true), 3000);
    } else {
      setMissionIdx(next);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-green-500 font-mono px-4 py-8 relative overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=UnifrakturMaguntia&family=IM+Fell+English:ital@0;1&display=swap');
        .font-terminal { font-family: 'Share Tech Mono', monospace; }
        .font-gothic { font-family: 'UnifrakturMaguntia', cursive; }
        .font-serif-old { font-family: 'IM Fell English', serif; }
        body { background: #0a0a0a; }
        .scanline {
          position: fixed; top: 0; left: 0; width: 100%; height: 3px;
          background: rgba(46,204,113,0.07);
          animation: scanAnim 6s linear infinite;
          pointer-events: none; z-index: 50;
        }
        @keyframes scanAnim { from { top: -3px; } to { top: 100%; } }
        .shake { animation: shakeAnim 0.4s ease; }
        @keyframes shakeAnim {
          0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)}
          40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)}
        }
        .glow-success { animation: glowPulse 2s ease-in-out infinite alternate; }
        @keyframes glowPulse {
          from { text-shadow: 0 0 5px rgba(85,255,136,0.3); }
          to { text-shadow: 0 0 18px rgba(85,255,136,0.7); }
        }
        .crt-lines {
          position: fixed; inset: 0;
          background: repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(46,204,113,0.012) 2px,rgba(46,204,113,0.012) 4px);
          pointer-events: none; z-index: 0;
        }
        .vignette {
          position: fixed; inset: 0;
          background: radial-gradient(ellipse at center, transparent 55%, #0a0a0a 100%);
          pointer-events: none; z-index: 0;
        }
      `}</style>

      <div className="scanline" />
      <div className="crt-lines" />
      <div className="vignette" />

      <div className="relative z-10 max-w-2xl mx-auto">
        <h1 className="font-gothic text-4xl text-amber-700 text-center leading-tight mb-1"
          style={{ textShadow: "0 0 24px rgba(160,82,45,0.5)" }}>
          ✦ Hackerspace Macacha Güemes ✦
        </h1>
        <p className="text-center text-xs text-green-900 tracking-[0.3em] uppercase mb-6 font-terminal">
          nodo rebelde :: salta, 1810 :: red encubierta patriota
        </p>

        <hr className="border-amber-900/40 mb-4" />

        {!bootDone && <BootSequence onDone={() => setBootDone(true)} />}

        {bootDone && !allDone && (
          <div className="mt-4">
            <MissionProgress current={completedCount} total={MISSIONS.length} />
            <hr className="border-amber-900/40 my-3" />
            <MissionPanel
              key={missionIdx}
              mission={MISSIONS[missionIdx]}
              missionIndex={missionIdx}
              onSolved={handleMissionSolved}
            />
          </div>
        )}

        {allDone && (
          <div className="mt-4 font-terminal">
            <MissionProgress current={MISSIONS.length} total={MISSIONS.length} />
            <hr className="border-amber-900/40 my-3" />
            <p className="text-green-300 text-sm text-center tracking-widest glow-success mb-4">
              ▓▓▓ TODAS LAS MISIONES COMPLETADAS — LA PATRIA ES LIBRE ▓▓▓
            </p>
            <DecryptedMessage show={allDone} />
            <p className="text-green-500/60 text-xs mt-3 mb-1">
              // Cargando mapa táctico final del Norte Argentino...
            </p>
            <AsciiMap show={showMap} />
            <div className="flex flex-wrap gap-4 mt-3">
              {[
                { color: "bg-green-500", label: "Posición patriota (★)" },
                { color: "bg-red-500", label: "Fuerza realista (✖)" },
                { color: "bg-amber-700", label: "Puesto de Macacha (◈)" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-2 text-xs text-green-700">
                  <div className={`w-2 h-2 rounded-full ${l.color}`} />
                  {l.label}
                </div>
              ))}
            </div>
            <p className="text-green-900 text-xs mt-4 leading-relaxed">
              // Macacha Güemes proveyó inteligencia, recursos y redes encubiertas que hicieron posible la victoria gaucha.<br />
              // "No es menos heroica la labor de quien sostiene desde las sombras."
            </p>
          </div>
        )}

        <hr className="border-amber-900/20 mt-8 mb-3" />
        <p className="text-center text-[10px] text-amber-900/50 tracking-widest">
          PROTOCOLO SALTA_REBELDE v2.0 :: {MISSIONS.length} MISIONES :: © CAUSA PATRIOTA
        </p>
      </div>
    </div>
  );
}