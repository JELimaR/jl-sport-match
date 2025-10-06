// AmericanFootballLike2 - Simulación completa de fútbol americano
// Sistema integrado con PlayCalculator, Actions y Teams

import { testAttributeImpact } from "./example/AttributeImpactTest";
import { CompleteGameExample } from "./example/CompleteGameExample";

/**
 * Función principal de demostración del nuevo sistema
 */
export function runAmericanFootballSimulation(): void {
    console.log("🏈 SIMULADOR DE FÚTBOL AMERICANO - NUEVO SISTEMA");
    console.log("=".repeat(60));

    // Opción 3: Simular partido completo (comentado para no hacer muy largo)
    // console.log("\n\n3️⃣ SIMULANDO PARTIDO COMPLETO:");
    CompleteGameExample.simulateCompleteGame();

    testAttributeImpact()
}
