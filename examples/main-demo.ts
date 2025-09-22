/**
 * Exemplo de uso do sistema de inicialização principal
 * 
 * Este exemplo demonstra como usar o arquivo main.ts para inicializar
 * o módulo com diferentes configurações de timezone.
 */

import {
  inicializarComercialTime,
  inicializarComercialTimeComTimezone,
  inicializarParaBrasil,
  inicializarParaEUA,
  inicializarParaPortugal,
  obterInfoTimezone,
  estaInicializado,
} from "../src/index.js";

/**
 * Exemplo 1: Inicialização básica com timezone padrão
 */
async function exemploInicializacaoBasica(): Promise<void> {
  console.log("=== EXEMPLO 1: Inicialização Básica ===\n");
  
  // Inicialização com configurações padrão (pt-BR)
  const resultado = await inicializarComercialTime();
  
  console.log("Resultado da inicialização:");
  console.log(`- Sucesso: ${resultado.sucesso}`);
  console.log(`- Timezone: ${resultado.timezone}`);
  console.log(`- País: ${resultado.pais}`);
  console.log(`- Locale: ${resultado.locale}`);
  console.log(`- Capital: ${resultado.capital}`);
  console.log(`- CRONJOB iniciado: ${resultado.cronJobIniciado}`);
  console.log(`- Mensagem: ${resultado.mensagem}`);
  console.log("");
}

/**
 * Exemplo 2: Inicialização com timezone específico
 */
async function exemploInicializacaoComTimezone(): Promise<void> {
  console.log("=== EXEMPLO 2: Inicialização com Timezone Específico ===\n");
  
  // Inicialização para EUA
  const resultadoEUA = await inicializarComercialTimeComTimezone("America/New_York");
  
  console.log("Resultado para EUA:");
  console.log(`- Timezone: ${resultadoEUA.timezone}`);
  console.log(`- País: ${resultadoEUA.pais}`);
  console.log(`- Locale: ${resultadoEUA.locale}`);
  console.log(`- Capital: ${resultadoEUA.capital}`);
  console.log("");
  
  // Inicialização para Portugal
  const resultadoPT = await inicializarComercialTimeComTimezone("Europe/Lisbon");
  
  console.log("Resultado para Portugal:");
  console.log(`- Timezone: ${resultadoPT.timezone}`);
  console.log(`- País: ${resultadoPT.pais}`);
  console.log(`- Locale: ${resultadoPT.locale}`);
  console.log(`- Capital: ${resultadoPT.capital}`);
  console.log("");
}

/**
 * Exemplo 3: Inicialização com funções específicas por país
 */
async function exemploInicializacaoPorPais(): Promise<void> {
  console.log("=== EXEMPLO 3: Inicialização por País ===\n");
  
  // Inicialização para Brasil
  const resultadoBR = await inicializarParaBrasil({
    intervaloCronJob: 30, // 30 minutos
    timeoutRequisicoes: 15000 // 15 segundos
  });
  
  console.log("Brasil inicializado:");
  console.log(`- Timezone: ${resultadoBR.timezone}`);
  console.log(`- País: ${resultadoBR.pais}`);
  console.log(`- Locale: ${resultadoBR.locale}`);
  console.log("");
  
  // Inicialização para EUA
  const resultadoUS = await inicializarParaEUA({
    inicializarCronJob: false // Sem CRONJOB
  });
  
  console.log("EUA inicializado:");
  console.log(`- Timezone: ${resultadoUS.timezone}`);
  console.log(`- País: ${resultadoUS.pais}`);
  console.log(`- Locale: ${resultadoUS.locale}`);
  console.log(`- CRONJOB iniciado: ${resultadoUS.cronJobIniciado}`);
  console.log("");
  
  // Inicialização para Portugal
  const resultadoPT = await inicializarParaPortugal();
  
  console.log("Portugal inicializado:");
  console.log(`- Timezone: ${resultadoPT.timezone}`);
  console.log(`- País: ${resultadoPT.pais}`);
  console.log(`- Locale: ${resultadoPT.locale}`);
  console.log("");
}

/**
 * Exemplo 4: Verificação de status e informações
 */
function exemploVerificacaoStatus(): void {
  console.log("=== EXEMPLO 4: Verificação de Status ===\n");
  
  // Verificar se está inicializado
  const inicializado = estaInicializado();
  console.log(`Módulo inicializado: ${inicializado}`);
  
  // Obter informações do timezone atual
  const infoTimezone = obterInfoTimezone();
  console.log("Informações do timezone atual:");
  console.log(`- Timezone: ${infoTimezone.timezone}`);
  console.log(`- País: ${infoTimezone.pais}`);
  console.log(`- Locale: ${infoTimezone.locale}`);
  console.log(`- Capital: ${infoTimezone.capital}`);
  console.log("");
}

/**
 * Exemplo 5: Inicialização com configurações personalizadas
 */
async function exemploInicializacaoPersonalizada(): Promise<void> {
  console.log("=== EXEMPLO 5: Inicialização Personalizada ===\n");
  
  // Inicialização com configurações personalizadas
  const resultado = await inicializarComercialTime({
    timezone: "America/Sao_Paulo",
    inicializarCronJob: true,
    intervaloCronJob: 120, // 2 horas
    timeoutRequisicoes: 20000 // 20 segundos
  });
  
  console.log("Inicialização personalizada:");
  console.log(`- Sucesso: ${resultado.sucesso}`);
  console.log(`- Timezone: ${resultado.timezone}`);
  console.log(`- País: ${resultado.pais}`);
  console.log(`- Locale: ${resultado.locale}`);
  console.log(`- Capital: ${resultado.capital}`);
  console.log(`- CRONJOB iniciado: ${resultado.cronJobIniciado}`);
  console.log(`- Mensagem: ${resultado.mensagem}`);
  console.log("");
}

/**
 * Função principal para executar todos os exemplos
 */
async function executarExemplos(): Promise<void> {
  try {
    await exemploInicializacaoBasica();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await exemploInicializacaoComTimezone();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await exemploInicializacaoPorPais();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    exemploVerificacaoStatus();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await exemploInicializacaoPersonalizada();
    
    console.log("=== TODOS OS EXEMPLOS CONCLUÍDOS ===");
    
  } catch (error) {
    console.error("Erro ao executar exemplos:", error);
  }
}

// Executar exemplos se este arquivo for executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  executarExemplos();
}
