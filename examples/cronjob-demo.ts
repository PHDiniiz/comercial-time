/**
 * Exemplo de uso do CRONJOB de atualização de feriados
 *
 * Este exemplo demonstra como configurar e usar o sistema
 * de atualização automática de feriados nacionais e estaduais.
 */

import {
  inicializarCronJobFeriados,
  inicializarCronJobFeriadosPorPais,
  executarAtualizacaoManual,
  FeriadoUpdateFactory,
} from "../src/index.js";

/**
 * Exemplo 1: Inicialização automática baseada no timezone
 */
function exemploInicializacaoAutomatica(): void {
  console.log("=== EXEMPLO 1: Inicialização Automática ===\n");

  // Configurar timezone (será detectado automaticamente)
  process.env.TIMEZONE = "America/Sao_Paulo"; // Brasil
  // process.env.TIMEZONE = "America/New_York"; // EUA
  // process.env.TIMEZONE = "Europe/Lisbon"; // Portugal

  // Configurar intervalo de atualização (opcional)
  process.env.FERIADO_UPDATE_INTERVAL_MINUTES = "60"; // 1 hora
  process.env.FERIADO_UPDATE_TIMEOUT_MS = "10000"; // 10 segundos

  // Inicializar CRONJOB automaticamente
  inicializarCronJobFeriados();

  console.log("CRONJOB iniciado automaticamente baseado no timezone");
  console.log("Intervalo de atualização: 60 minutos");
  console.log("Timeout das requisições: 10 segundos");
}

/**
 * Exemplo 2: Inicialização para país específico
 */
function exemploInicializacaoPorPais(): void {
  console.log("\n=== EXEMPLO 2: Inicialização por País ===\n");

  // Inicializar CRONJOB para Brasil
  inicializarCronJobFeriadosPorPais("BR");

  // Ou para outros países
  // inicializarCronJobFeriadosPorPais("US");
  // inicializarCronJobFeriadosPorPais("PT");

  console.log("CRONJOB iniciado para país específico");
}

/**
 * Exemplo 3: Atualização manual
 */
async function exemploAtualizacaoManual(): Promise<void> {
  console.log("\n=== EXEMPLO 3: Atualização Manual ===\n");

  // Atualização manual baseada no timezone
  await executarAtualizacaoManual();

  // Ou para país específico
  // await executarAtualizacaoManual("BR");
  // await executarAtualizacaoManual("US");
  // await executarAtualizacaoManual("PT");

  console.log("Atualização manual concluída");
}

/**
 * Exemplo 4: Uso avançado com factory
 */
async function exemploUsoAvancado(): Promise<void> {
  console.log("\n=== EXEMPLO 4: Uso Avançado ===\n");

  // Criar controlador com configuração personalizada
  const controller = FeriadoUpdateFactory.create({
    pais: "BR",
    fonteNacionais: "API Brasil Personalizada",
    fonteEstaduais: "API Brasil Personalizada",
    intervaloMinutos: 30, // 30 minutos
    timeoutMs: 15000, // 15 segundos
  });

  // Executar atualização manual
  const resultado = await controller.atualizarTodos();

  console.log("Resultado da atualização:");
  console.log(`- Sucesso: ${resultado.sucesso}`);
  console.log(`- Nacionais: ${resultado.nacionaisAtualizados}`);
  console.log(`- Estaduais: ${resultado.estaduaisAtualizados}`);
  console.log(`- Mensagem: ${resultado.mensagem}`);

  // Iniciar CRONJOB personalizado
  controller.iniciarCronJob();

  // Verificar status
  const status = controller.obterStatusCronJob();
  console.log(`- CRONJOB ativo: ${status.ativo}`);
  console.log(`- Intervalo: ${status.intervaloMinutos} minutos`);
}

/**
 * Exemplo 5: Configuração via variáveis de ambiente
 */
function exemploConfiguracaoAmbiente(): void {
  console.log("\n=== EXEMPLO 5: Configuração via Ambiente ===\n");

  // Configurar via variáveis de ambiente
  process.env.TIMEZONE = "America/Sao_Paulo";
  process.env.FERIADO_UPDATE_INTERVAL_MINUTES = "120"; // 2 horas
  process.env.FERIADO_UPDATE_TIMEOUT_MS = "20000"; // 20 segundos

  // Criar controlador com configuração padrão
  const controller = FeriadoUpdateFactory.createDefault();

  // Iniciar CRONJOB
  controller.iniciarCronJob();

  console.log("Configuração via variáveis de ambiente:");
  console.log(`- Timezone: ${process.env.TIMEZONE}`);
  console.log(
    `- Intervalo: ${process.env.FERIADO_UPDATE_INTERVAL_MINUTES} minutos`
  );
  console.log(`- Timeout: ${process.env.FERIADO_UPDATE_TIMEOUT_MS} ms`);
}

/**
 * Função principal para executar todos os exemplos
 */
async function executarExemplos(): Promise<void> {
  try {
    exemploInicializacaoAutomatica();

    // Aguardar um pouco para demonstrar
    await new Promise((resolve) => setTimeout(resolve, 2000));

    exemploInicializacaoPorPais();

    await new Promise((resolve) => setTimeout(resolve, 2000));

    await exemploAtualizacaoManual();

    await new Promise((resolve) => setTimeout(resolve, 2000));

    await exemploUsoAvancado();

    await new Promise((resolve) => setTimeout(resolve, 2000));

    exemploConfiguracaoAmbiente();

    console.log("\n=== TODOS OS EXEMPLOS CONCLUÍDOS ===");
    console.log("O CRONJOB continuará rodando em background...");
    console.log("Pressione Ctrl+C para parar");
  } catch (error) {
    console.error("Erro ao executar exemplos:", error);
  }
}

// Executar exemplos se este arquivo for executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  executarExemplos();
}
