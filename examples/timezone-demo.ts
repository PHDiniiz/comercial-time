/**
 * Exemplo de uso do módulo @phdiniiz/comercialTime com timezone obrigatório
 *
 * Este exemplo demonstra como inicializar o módulo com diferentes timezones
 * e como o sistema funciona com o novo parâmetro obrigatório.
 */

import {
  inicializar,
  inicializarComercialTimeComTimezone,
} from "../src/main.js";

async function demonstrarUsoTimezone() {
  console.log("🌍 Demonstração de uso com timezone obrigatório\n");

  try {
    // Exemplo 1: Inicializar com timezone do Brasil (pt-BR)
    console.log("1️⃣ Inicializando para Brasil (pt-BR):");
    const resultadoBrasil = await inicializar("America/Sao_Paulo");
    console.log("Resultado:", resultadoBrasil);
    console.log("");

    // Exemplo 2: Inicializar com timezone dos EUA
    console.log("2️⃣ Inicializando para EUA (en-US):");
    const resultadoEUA = await inicializarComercialTimeComTimezone(
      "America/New_York"
    );
    console.log("Resultado:", resultadoEUA);
    console.log("");

    // Exemplo 3: Inicializar com timezone de Portugal
    console.log("3️⃣ Inicializando para Portugal (pt-PT):");
    const resultadoPortugal = await inicializarComercialTimeComTimezone(
      "Europe/Lisbon"
    );
    console.log("Resultado:", resultadoPortugal);
    console.log("");

    // Exemplo 4: Inicializar com timezone do Japão
    console.log("4️⃣ Inicializando para Japão (ja-JP):");
    const resultadoJapao = await inicializarComercialTimeComTimezone(
      "Asia/Tokyo"
    );
    console.log("Resultado:", resultadoJapao);
    console.log("");

    // Exemplo 5: Tentar inicializar sem timezone (deve dar erro)
    console.log("5️⃣ Tentando inicializar sem timezone (deve dar erro):");
    try {
      // @ts-ignore - Intencionalmente passando configuração inválida
      await inicializarComercialTimeComTimezone("", {});
    } catch (error) {
      console.log("❌ Erro esperado:", (error as Error).message);
    }
    console.log("");

    console.log("✅ Demonstração concluída com sucesso!");
    console.log(
      "📝 Lembre-se: O timezone é OBRIGATÓRIO para inicializar o módulo"
    );
    console.log("🇧🇷 Padrão pt-BR: America/Sao_Paulo");
  } catch (error) {
    console.error("❌ Erro na demonstração:", error);
  }
}

// Executar demonstração se este arquivo for executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrarUsoTimezone();
}

export { demonstrarUsoTimezone };
