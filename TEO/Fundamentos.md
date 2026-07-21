# Fundamentos Teóricos del Modelo Sistémico de Rendimiento Deportivo ($R_S$)

## 1. Declaración de Principios y Axiomas

El presente marco conceptual formaliza el rendimiento de los deportes de equipo mediante la **Teoría General de Sistemas** y la **Teoría de Grafos**. Se parte de la premisa de que un equipo no es un agregado lineal de talentos individuales, sino una red viva y compleja.

### Axioma 1: Emergencia No Aditiva

El valor colectivo $V_{\text{equipo}}$ difiere de la suma simple de los atributos individuales de sus integrantes:


$$V_{\text{equipo}} \neq \sum_{i=1}^{n} C_i$$

### Axioma 2: Mediación por Conectividad

La capacidad individual efectiva $C_i$ de cualquier jugador está condicionada por la calidad del acople con sus nodos contiguos (compañeros de interacción directa).

### Axioma 3: Sensibilidad a la Fricción (El Eslabón Más Débil)

La actitud, entrega o estado psicofísico de un jugador influye multiplicativamente en la red. Una falla localizada degrada la eficiencia global del sistema.

### Axioma 4: Asimetría Táctica Relativa

La efectividad de un esquema táctico no es absoluta; depende del enfrentamiento dinámico contra el sistema rival.

---

## 2. Definición del Equipo como Grafo Ponderado

Un equipo se define formalmente como un grafo dirigido y ponderado $G = (V, E)$, donde:

* 
$V = \{N_1, N_2, \dots, N_n\}$ es el conjunto de **Nodos** (Jugadores).


* 
$E = \{e_{ij}\}$ es el conjunto de **Aristas** (Enlaces tácticos/interacciones).



### Atributos de los Nodos ($N_i$)

1. 
**Capacidad Base ($C_i \in \mathbb{R}^+$):** Potencial de talento técnico/físico puro.


2. 
**Afinidad de Rol ($A_i \in [0, 1]$):** Grado de adaptación a la función táctica asignada. Un jugador fuera de posición reduce su $A_i$.


3. 
**Entrega / Estado Psicofísico ($E_i \in [0, 1]$):** Nivel dinámico de energía, concentración y compromiso en tiempo real.



### Atributos de las Aristas ($w_{ij} \in [0, 1]$)

Representa la **fuerza del enlace** entre el nodo $i$ y el nodo $j$.

$$w_{ij}(t) = f(Q_{ij}, H_{ij}, \text{Entrenamiento})$$

* 
$Q_{ij}$: Química o complementariedad natural de perfiles.


* 
$H_{ij}$: Histórico de partidos jugados juntos.


* **Entrenamiento ($\Delta \tau$):** El proceso de entrenamiento actúa como un acumulador que **refuerza y estabiliza progresivamente los pesos $w_{ij}$**, reduciendo la variabilidad y aumentando el techo de entendimiento táctico entre dos o más nodos.

---

## 3. Formulación Matemática del Modelo

### 3.1. Factor de Sinergia Global ($\sigma$)

Mide el grado de integración y acople funcional de la red:

$$\sigma = \frac{1}{\vert{}E\vert{}} \sum_{i=1}^{n} \sum_{j \in \text{Vecinos}(i)} w_{ij} \cdot (A_i \cdot A_j)$$

* 
$\vert{}E\vert{}$: Número total de enlaces activos definidos por el sistema táctico.


* 
$(A_i \cdot A_j)$: Condiciona la sinergia al acople de roles de los jugadores conectados.



### 3.2. Capacidad Colectiva Emergente ($C_{\text{net}}$)

Sustituye la suma bruta de talentos. Filtra la capacidad de un jugador a través de la actitud y conectividad de sus compañeros inmediatos:

$$C_{\text{net}} = \sum_{i=1}^{n} \left[ C_i \cdot A_i \cdot \left( \frac{1}{k_i} \sum_{j \in \text{Vecinos}(i)} w_{ij} \cdot E_j \right) \right]$$

* 
$k_i$: Cantidad de enlaces activos directos del nodo $i$.


* 
$E_j$: Entrega del compañero $j$. Si los compañeros desatienden el juego ($E_j \to 0$), la capacidad del jugador $i$ se ve desacoplada del sistema.



### 3.3. Eficiencia Sistémica ($\mathcal{E}_{\text{equipo}}$)

Modela el impacto penalizador de la desconexión o falta de entrega individual en el colectivo mediante un producto ponderado:

$$\mathcal{E}_{\text{equipo}} = \prod_{i=1}^{n} (E_i)^{\lambda_i}$$

* 
$\lambda_i \ge 0$: Ponderación jerárquica de la posición $i$ dentro del sistema (ej. el organizador de juego o el líbero defensivo tienen un $\lambda_i$ más alto).



### 3.4. Rendimiento Sistémico Integral ($R_S$)

El rendimiento final del equipo en una fase o evento del juego se expresa como:

$$R_S = \left[ C_{\text{net}} \cdot (1 + \ln(1 + \sigma)) \right] \cdot \mathcal{E}_{\text{equipo}} \cdot M_{\text{Táb}}(T_A, T_B) + \xi_{\text{azar}}$$

* 
**$\ln(1 + \sigma)$:** Exponencialización logarítmica para representar rendimientos marginales decrecientes de la sinergia.


* 
**$M_{\text{Táb}}(T_A, T_B)$:** Coeficiente derivado de la matriz de enfrentamiento estratégico entre la táctica propia ($T_A$) y la rival ($T_B$).


* 
**$\xi_{\text{azar}}$:** Variable aleatoria con distribución $N(0, \gamma)$ que introduce la incertidumbre e imponderables propios del deporte.
