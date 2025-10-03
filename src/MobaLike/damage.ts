import { Player } from ".";

/**
* Calcula el daño final aplicando probabilidad crítica y mitigación porcentual.
* Usa un factor de reducción: Defensa / (Defensa + 100).
*/
export function calculateDamage(attacker: Player, target: Player): { finalDamage: number, isCritical: boolean } {
  const RESISTANCE_CONSTANT = 100; // Constante para calibrar la mitigación porcentual (Armadura)
  const MIN_DAMAGE_FLOOR = 1;      // Daño mínimo garantizado

  let isCritical = false;
  let critFactor = 1.0;

  // --- 1. Chequeo de Golpe Crítico ---
  if (Math.random() < attacker.stats.critChance) {
    critFactor = attacker.stats.critMultiplier;
    isCritical = true;
  }

  // --- 2. Cálculo del Daño Bruto Ajustado ---
  // Daño Bruto: BaseDamage + Ataque / 5 (añadimos una pequeña variación aleatoria de 1d6)
  const randomFactor = Math.floor(Math.random() * 6) + 1;
  const grossDamage = attacker.stats.baseDamage + (attacker.stats.attack / 5) + randomFactor;

  // Daño Bruto (con Crítico aplicado)
  const criticalDamage = grossDamage * critFactor;

  // --- 3. Cálculo de la Reducción Porcentual (Modelo 2) ---
  const defense = target.stats.defense;
  const reductionPercentage = defense / (defense + RESISTANCE_CONSTANT);
  const actualReduction = Math.max(0, Math.min(0.99, reductionPercentage)); // Clamp 0% a 99%

  // --- 4. Daño Final (Mitigación) ---
  // Daño Final = Daño Bruto Ajustado * (1 - Reducción Porcentual)
  let finalDamage = criticalDamage * (1 - actualReduction);

  // Aplicar Suelo Mínimo
  finalDamage = Math.max(MIN_DAMAGE_FLOOR, finalDamage);

  return {
    finalDamage: Math.floor(finalDamage),
    isCritical: isCritical
  };
}
