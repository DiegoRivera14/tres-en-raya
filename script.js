// =====================================================
// Tres en raya
// Modo 2 jugadores en el mismo equipo o contra la
// máquina. La máquina usa el algoritmo minimax, así que
// no pierde nunca: como mucho se le puede empatar.
// =====================================================

// Las 8 combinaciones ganadoras, como índices del tablero:
//  0 | 1 | 2
//  3 | 4 | 5
//  6 | 7 | 8
const LINEAS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // filas
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columnas
  [0, 4, 8], [2, 4, 6],            // diagonales
];

const JUGADOR = "X";
const MAQUINA = "O";
const RETARDO_MAQUINA = 400; // ms, para que el movimiento no sea instantáneo

const casillas = document.querySelectorAll(".casilla");
const textoEstado = document.getElementById("estado");
const botonesModo = document.querySelectorAll(".opcion-modo");

const puntos = { X: 0, O: 0, empate: 0 };
const textoPuntos = {
  X: document.getElementById("puntos-x"),
  O: document.getElementById("puntos-o"),
  empate: document.getElementById("puntos-empate"),
};

// Estado de la partida
let tablero;          // array de 9 posiciones: "X", "O" o null
let turno;            // "X" u "O"
let terminada;
let modo = "2j";      // "2j" o "ia"
let empiezaX = true;  // se alterna quién empieza en cada partida
let temporizador = null; // movimiento pendiente de la máquina

// ---------- Lógica del juego (funciones puras) ----------

// Devuelve { ganador, linea } si hay ganador, "empate" si el tablero
// está lleno sin ganador, o null si la partida sigue
function comprobarResultado(t) {
  for (const linea of LINEAS) {
    const [a, b, c] = linea;
    if (t[a] && t[a] === t[b] && t[a] === t[c]) {
      return { ganador: t[a], linea };
    }
  }
  return t.every((casilla) => casilla !== null) ? "empate" : null;
}

function casillasLibres(t) {
  return t.reduce((libres, casilla, i) => (casilla === null ? [...libres, i] : libres), []);
}

// Minimax: prueba recursivamente todas las jugadas posibles y puntúa
// cada final de partida desde el punto de vista de la máquina:
//   +10 gana la máquina, -10 gana el jugador, 0 empate.
// Se resta/suma la profundidad para preferir ganar cuanto antes
// y perder cuanto más tarde.
function minimax(t, turnoActual, profundidad) {
  const resultado = comprobarResultado(t);
  if (resultado === "empate") return 0;
  if (resultado) return resultado.ganador === MAQUINA ? 10 - profundidad : profundidad - 10;

  const puntuaciones = casillasLibres(t).map((i) => {
    t[i] = turnoActual;
    const puntuacion = minimax(t, turnoActual === MAQUINA ? JUGADOR : MAQUINA, profundidad + 1);
    t[i] = null; // se deshace la jugada
    return puntuacion;
  });

  // La máquina elige la jugada que más le conviene; el jugador, la que menos
  return turnoActual === MAQUINA ? Math.max(...puntuaciones) : Math.min(...puntuaciones);
}

function mejorJugada(t) {
  let mejorPuntuacion = -Infinity;
  let mejorCasilla = null;

  for (const i of casillasLibres(t)) {
    t[i] = MAQUINA;
    const puntuacion = minimax(t, JUGADOR, 1);
    t[i] = null;

    if (puntuacion > mejorPuntuacion) {
      mejorPuntuacion = puntuacion;
      mejorCasilla = i;
    }
  }
  return mejorCasilla;
}

// ---------- Interfaz ----------

function pintar() {
  casillas.forEach((casilla, i) => {
    casilla.textContent = tablero[i] || "";
    casilla.classList.toggle("x", tablero[i] === "X");
    casilla.classList.toggle("o", tablero[i] === "O");
    // Una casilla ocupada no se puede pulsar, y ninguna mientras piensa la máquina
    casilla.disabled = terminada || tablero[i] !== null || (modo === "ia" && turno === MAQUINA);
  });
}

function pintarMarcador() {
  for (const clave in puntos) textoPuntos[clave].textContent = puntos[clave];
}

function anunciarTurno() {
  if (modo === "ia") {
    textoEstado.textContent = turno === JUGADOR ? "Tu turno (X)" : "La máquina está pensando…";
  } else {
    textoEstado.textContent = `Turno de ${turno}`;
  }
}

function finalizar(resultado) {
  terminada = true;

  if (resultado === "empate") {
    puntos.empate++;
    textoEstado.textContent = "🤝 Empate";
  } else {
    puntos[resultado.ganador]++;
    resultado.linea.forEach((i) => casillas[i].classList.add("ganadora"));

    if (modo === "ia") {
      textoEstado.textContent = resultado.ganador === JUGADOR ? "🎉 ¡Has ganado!" : "🤖 Gana la máquina";
    } else {
      textoEstado.textContent = `🎉 ¡Gana ${resultado.ganador}!`;
    }
  }

  pintarMarcador();
}

// ---------- Flujo de la partida ----------

function jugar(indice) {
  if (terminada || tablero[indice] !== null) return;

  tablero[indice] = turno;
  const resultado = comprobarResultado(tablero);

  if (resultado) {
    finalizar(resultado);
    pintar();
    return;
  }

  turno = turno === "X" ? "O" : "X";
  anunciarTurno();
  pintar();

  if (modo === "ia" && turno === MAQUINA) {
    moverMaquina();
  }
}

// Programa el movimiento de la máquina tras un pequeño retardo
function moverMaquina() {
  temporizador = setTimeout(() => {
    temporizador = null;
    jugar(mejorJugada(tablero));
  }, RETARDO_MAQUINA);
}

function nuevaPartida() {
  // Si la máquina tenía un movimiento pendiente de la partida anterior, se cancela
  clearTimeout(temporizador);
  temporizador = null;

  tablero = Array(9).fill(null);
  turno = empiezaX ? "X" : "O";
  empiezaX = !empiezaX;
  terminada = false;

  casillas.forEach((casilla) => casilla.classList.remove("ganadora"));
  anunciarTurno();
  pintar();

  if (modo === "ia" && turno === MAQUINA) {
    moverMaquina();
  }
}

// ---------- Eventos ----------

document.getElementById("tablero").addEventListener("click", (evento) => {
  const casilla = evento.target.closest(".casilla");
  if (casilla) jugar(Number(casilla.dataset.indice));
});

document.getElementById("reiniciar").addEventListener("click", nuevaPartida);

document.getElementById("resetear-marcador").addEventListener("click", () => {
  puntos.X = puntos.O = puntos.empate = 0;
  pintarMarcador();
});

botonesModo.forEach((boton) => {
  boton.addEventListener("click", () => {
    if (boton.dataset.modo === modo) return;
    modo = boton.dataset.modo;
    botonesModo.forEach((b) => b.classList.toggle("activo", b === boton));

    // Al cambiar de modo se empieza de cero
    puntos.X = puntos.O = puntos.empate = 0;
    empiezaX = true;
    pintarMarcador();
    nuevaPartida();
  });
});

nuevaPartida();
