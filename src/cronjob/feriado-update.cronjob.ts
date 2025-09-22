/**
 * CRONJOB para atualização automática de feriados
 *
 * Este arquivo é executado no start do projeto para iniciar
 * a atualização automática de feriados nacionais e estaduais.
 */

import { FeriadoUpdateFactory } from "../presentation/factories/feriado-update.factory";

/**
 * Inicializa o CRONJOB de atualização de feriados
 *
 * Este função deve ser chamada no start do projeto para iniciar
 * a atualização automática de feriados.
 */
export function inicializarCronJobFeriados(): void {
  try {
    console.log("🚀 Iniciando CRONJOB de atualização de feriados...");

    // Criar instância do controlador
    const controller = FeriadoUpdateFactory.createDefault();

    // Iniciar o CRONJOB
    controller.iniciarCronJob();

    // Log removido para otimização

    // Configurar graceful shutdown
    process.on("SIGINT", () => {
      console.log("🛑 Parando CRONJOB de atualização de feriados...");
      controller.pararCronJob();
      process.exit(0);
    });

    process.on("SIGTERM", () => {
      console.log("🛑 Parando CRONJOB de atualização de feriados...");
      controller.pararCronJob();
      process.exit(0);
    });
  } catch (error) {
    console.error(
      "❌ Erro ao inicializar CRONJOB de atualização de feriados:",
      error
    );
  }
}

/**
 * Inicializa o CRONJOB para um país específico
 * @param pais - Código do país (BR, US, PT)
 */
export function inicializarCronJobFeriadosPorPais(pais: string): void {
  try {
    console.log(
      `🚀 Iniciando CRONJOB de atualização de feriados para ${pais}...`
    );

    // Criar instância do controlador para o país específico
    const controller = FeriadoUpdateFactory.createForCountry(pais);

    // Iniciar o CRONJOB
    controller.iniciarCronJob();

    console.log(
      `✅ CRONJOB de atualização de feriados para ${pais} iniciado com sucesso`
    );

    // Configurar graceful shutdown
    process.on("SIGINT", () => {
      console.log(
        `🛑 Parando CRONJOB de atualização de feriados para ${pais}...`
      );
      controller.pararCronJob();
      process.exit(0);
    });

    process.on("SIGTERM", () => {
      console.log(
        `🛑 Parando CRONJOB de atualização de feriados para ${pais}...`
      );
      controller.pararCronJob();
      process.exit(0);
    });
  } catch (error) {
    console.error(
      `❌ Erro ao inicializar CRONJOB de atualização de feriados para ${pais}:`,
      error
    );
  }
}

/**
 * Executa atualização manual de feriados
 * @param pais - Código do país (opcional)
 */
export async function executarAtualizacaoManual(pais?: string): Promise<void> {
  try {
    console.log("🔄 Executando atualização manual de feriados...");

    const controller = pais
      ? FeriadoUpdateFactory.createForCountry(pais)
      : FeriadoUpdateFactory.createDefault();

    const resultado = await controller.atualizarTodos();

    if (resultado.sucesso) {
      // Log removido para otimização
      console.log(
        `📊 Nacionais: ${resultado.nacionaisAtualizados}, Estaduais: ${resultado.estaduaisAtualizados}`
      );
    } else {
      // Log removido para otimização
    }
  } catch (error) {
    // Log removido para otimização
  }
}

// Se este arquivo for executado diretamente, inicializa o CRONJOB
if (process.argv[1] && process.argv[1].includes("feriado-update.cronjob")) {
  const pais = process.argv[2]; // Primeiro argumento opcional

  if (pais) {
    inicializarCronJobFeriadosPorPais(pais);
  } else {
    inicializarCronJobFeriados();
  }
}
