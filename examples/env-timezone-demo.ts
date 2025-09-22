/**
 * Demonstração - Carregamento de Timezone do .env
 *
 * Este exemplo demonstra como o sistema carrega automaticamente
 * o timezone do arquivo .env com fallback para America/Sao_Paulo.
 */

import {
  HorarioComercial,
  setTimezone,
  getCurrentTimezone,
} from "../dist/index.js";

async function demonstrateEnvTimezone() {
  console.log("🌍 Demonstração do Carregamento de Timezone do .env\n");

  // 1. Verificar timezone atual (carregado do .env)
  console.log("📋 1. Timezone Atual (do .env)");
  console.log(`   Timezone configurado: ${getCurrentTimezone()}`);
  console.log(
    `   Variável TIMEZONE no .env: ${process.env.TIMEZONE || "Não definida"}\n`
  );

  // 2. Method chaining com timezone do .env
  console.log("🔗 2. Method Chaining com Timezone do .env");
  const horario = new HorarioComercial({
    segunda: { abertura: "08:00", fechamento: "18:00" },
    terca: { abertura: "08:00", fechamento: "18:00" },
    quarta: { abertura: "08:00", fechamento: "18:00" },
    quinta: { abertura: "08:00", fechamento: "18:00" },
    sexta: { abertura: "08:00", fechamento: "18:00" },
  }).setTimezone(); // ✨ NOVO: Sem parâmetro, usa o .env

  console.log(`   Timezone da instância: ${horario.getTimezone()}`);
  console.log(
    `   Status atual: ${horario.openedNow ? "🟢 ABERTO" : "🔴 FECHADO"}\n`
  );

  // 3. Sobrescrever timezone explicitamente
  console.log("🔄 3. Sobrescrever Timezone Explicitamente");
  const horarioExplicito = new HorarioComercial({
    segunda: { abertura: "09:00", fechamento: "17:00" },
    terca: { abertura: "09:00", fechamento: "17:00" },
    quarta: { abertura: "09:00", fechamento: "17:00" },
    quinta: { abertura: "09:00", fechamento: "17:00" },
    sexta: { abertura: "09:00", fechamento: "17:00" },
  }).setTimezone("America/New_York"); // Timezone explícito sobrescreve o .env

  console.log(`   Timezone explícito: ${horarioExplicito.getTimezone()}`);
  console.log(
    `   Status atual: ${
      horarioExplicito.openedNow ? "🟢 ABERTO" : "🔴 FECHADO"
    }\n`
  );

  // 4. Configuração global sem parâmetro
  console.log("🌐 4. Configuração Global sem Parâmetro");
  console.log(`   Timezone global antes: ${getCurrentTimezone()}`);

  setTimezone(); // Usa o timezone do .env

  console.log(
    `   Timezone global após setTimezone(): ${getCurrentTimezone()}\n`
  );

  // 5. Vantagens da integração com .env
  console.log("💡 5. Vantagens da Integração com .env");
  console.log("   ✅ Configuração centralizada no arquivo .env");
  console.log("   ✅ Fallback automático para America/Sao_Paulo");
  console.log("   ✅ Validação automática de timezones inválidos");
  console.log("   ✅ Compatível com method chaining");
  console.log("   ✅ Sobrescreve com timezone explícito quando necessário");
  console.log("   ✅ Ideal para diferentes ambientes (dev, staging, prod)");

  // 6. Exemplo de uso em aplicação real
  console.log("\n🏢 6. Exemplo de Uso em Aplicação Real");

  // Simulação de diferentes configurações por ambiente
  const ambientes = [
    { nome: "Desenvolvimento", timezone: "America/Sao_Paulo" },
    { nome: "Staging", timezone: "America/New_York" },
    { nome: "Produção", timezone: "Europe/London" },
  ];

  for (const ambiente of ambientes) {
    // Simular mudança de ambiente
    process.env.TIMEZONE = ambiente.timezone;

    const horarioAmbiente = new HorarioComercial({
      segunda: { abertura: "08:00", fechamento: "18:00" },
      terca: { abertura: "08:00", fechamento: "18:00" },
      quarta: { abertura: "08:00", fechamento: "18:00" },
      quinta: { abertura: "08:00", fechamento: "18:00" },
      sexta: { abertura: "08:00", fechamento: "18:00" },
    }).setTimezone(); // Usa o timezone do .env

    console.log(
      `   ${ambiente.nome}: ${horarioAmbiente.getTimezone()} - ${
        horarioAmbiente.openedNow ? "🟢 ABERTO" : "🔴 FECHADO"
      }`
    );
  }

  console.log(
    "\n🎉 Demonstração do Carregamento de Timezone do .env concluída!"
  );
  console.log("\n📝 Para usar esta funcionalidade:");
  console.log("   1. Crie um arquivo .env na raiz do projeto");
  console.log("   2. Adicione: TIMEZONE=America/Sao_Paulo");
  console.log("   3. Use .setTimezone() sem parâmetros para usar o .env");
  console.log("   4. Ou use .setTimezone('outro/timezone') para sobrescrever");
}

// Executa a demonstração
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateEnvTimezone().catch(console.error);
}

export { demonstrateEnvTimezone };
