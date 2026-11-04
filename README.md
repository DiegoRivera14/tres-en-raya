# ❌⭕ Tres en raya

El clásico tres en raya hecho con **HTML, CSS y JavaScript**, para dos jugadores en el mismo equipo o contra una máquina imbatible.

🔗 **Demo en vivo:** https://diegorivera14.github.io/tres-en-raya/

## Funcionalidades

- Modo 2 jugadores y modo contra la máquina.
- La máquina usa el algoritmo **minimax**: nunca pierde, como mucho empata.
- Se resalta la línea ganadora.
- Marcador de victorias y empates.
- El turno inicial se alterna en cada partida.

## Cómo jugar

Puedes probarlo directamente en la [demo](https://diegorivera14.github.io/tres-en-raya/), o descargar el repositorio y abrir `index.html` en el navegador (no necesita instalación).

```bash
git clone https://github.com/DiegoRivera14/tres-en-raya.git
cd tres-en-raya
# abre index.html en tu navegador
```

## Estructura

```
tres-en-raya/
├── index.html   # Selector de modo, tablero y marcador
├── style.css    # Estilos y animaciones
└── script.js    # Lógica del juego y algoritmo minimax
```

## Cómo funciona

### Tablero y victoria

El tablero es un array de 9 posiciones con `"X"`, `"O"` o `null`:

```
 0 | 1 | 2
 3 | 4 | 5
 6 | 7 | 8
```

Las 8 formas de ganar (3 filas, 3 columnas y 2 diagonales) están en la constante `LINEAS`. `comprobarResultado()` las recorre y devuelve el ganador con su línea, `"empate"` si el tablero está lleno o `null` si la partida sigue.

### Flujo de una jugada

`jugar(indice)` coloca la ficha del turno actual, comprueba el resultado y, si la partida sigue, cambia de turno. En modo máquina, cuando le toca a la `O`, `moverMaquina()` programa su jugada con un retardo de 400 ms. Si se empieza una partida nueva antes de que la máquina mueva, `nuevaPartida()` cancela ese movimiento con `clearTimeout`.

Las casillas son `<button>` y se desactivan (`disabled`) cuando están ocupadas, cuando ha terminado la partida o mientras piensa la máquina.

### Minimax

Para elegir su jugada, la máquina simula **todas las partidas posibles** a partir del tablero actual:

1. `mejorJugada()` prueba cada casilla libre y llama a `minimax()` para puntuarla.
2. `minimax()` es recursiva: va colocando fichas alternando turnos hasta llegar a un final de partida, y lo puntúa:
   - `+10` si gana la máquina, `−10` si gana el jugador, `0` si es empate.
3. Al volver hacia arriba, en los turnos de la máquina se queda con la puntuación **máxima** y en los del jugador con la **mínima**, porque se supone que el jugador también juega lo mejor posible.
4. La profundidad se resta o suma a la puntuación para que la máquina prefiera ganar cuanto antes y, si va a perder, retrasarlo.

Cada jugada simulada se deshace (`t[i] = null`) después de evaluarla, así que se trabaja sobre un único array sin copiarlo. En un tablero de 3×3 hay pocas partidas posibles, así que el cálculo completo es instantáneo.

## Autor

Diego Rivera — [GitHub](https://github.com/DiegoRivera14)
