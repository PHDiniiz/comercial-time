/**
 * Serviço de aplicação para gerenciar atualizações de feriados
 *
 * Este serviço implementa a lógica de negócio para atualização
 * automática de feriados nacionais e estaduais via CRONJOB.
 */

import { Feriado } from "../../domain/entities/horario-comercial.entity.js";
import {
  FeriadoUpdateConfig,
  FeriadoUpdateResult,
  FeriadoUpdateService,
} from "../../domain/entities/feriado-update.entity";
import { FeriadoExternalService } from "../../infrastructure/services/feriado-external.service";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";

// Usar diretório de trabalho atual
const currentDir = process.cwd();

/**
 * Implementação do serviço de atualização de feriados
 */
export class FeriadoUpdateServiceImpl implements FeriadoUpdateService {
  private cronJobId: NodeJS.Timeout | null = null;
  private readonly externalService: FeriadoExternalService;
  private readonly config: FeriadoUpdateConfig;

  constructor(config: FeriadoUpdateConfig) {
    this.config = config;
    this.externalService = new FeriadoExternalService();
  }

  /**
   * Atualiza feriados nacionais
   * @returns Promise com o resultado da atualização
   */
  async atualizarNacionais(): Promise<FeriadoUpdateResult> {
    try {
      console.log(
        `[${this.obterCapitalPais()}] Iniciando atualização de feriados nacionais...`
      );

      const feriados = await this.externalService.buscarFeriadosNacionais(
        this.config.pais,
        new Date().getFullYear(),
        this.config.timeoutMs
      );

      const caminhoArquivo = this.obterCaminhoArquivoNacionais();
      this.salvarFeriados(feriados, caminhoArquivo);

      const resultado: FeriadoUpdateResult = {
        sucesso: true,
        nacionaisAtualizados: feriados.length,
        estaduaisAtualizados: 0,
        mensagem: `Feriados nacionais atualizados com sucesso`,
        timestamp: new Date(),
      };

      console.log(
        `[${this.obterCapitalPais()}] Atualizado os feriados nacionais.`
      );
      return resultado;
    } catch (error) {
      const resultado: FeriadoUpdateResult = {
        sucesso: false,
        nacionaisAtualizados: 0,
        estaduaisAtualizados: 0,
        mensagem: `Erro ao atualizar feriados nacionais`,
        timestamp: new Date(),
        erro: error instanceof Error ? error.message : String(error),
      };

      console.error(
        `[${this.obterCapitalPais()}] Erro ao atualizar feriados nacionais:`,
        error
      );
      return resultado;
    }
  }

  /**
   * Atualiza feriados estaduais
   * @returns Promise com o resultado da atualização
   */
  async atualizarEstaduais(): Promise<FeriadoUpdateResult> {
    try {
      console.log(
        `[${this.obterCapitalPais()}] Iniciando atualização de feriados estaduais...`
      );

      const feriadosEstaduais =
        await this.externalService.buscarFeriadosEstaduais(
          this.config.pais,
          new Date().getFullYear(),
          this.config.timeoutMs
        );

      const caminhoArquivo = this.obterCaminhoArquivoEstaduais();
      this.salvarFeriadosEstaduais(feriadosEstaduais, caminhoArquivo);

      const totalEstaduais = Object.values(feriadosEstaduais).reduce(
        (total, feriados) => total + feriados.length,
        0
      );

      const resultado: FeriadoUpdateResult = {
        sucesso: true,
        nacionaisAtualizados: 0,
        estaduaisAtualizados: totalEstaduais,
        mensagem: `Feriados estaduais atualizados com sucesso`,
        timestamp: new Date(),
      };

      console.log(
        `[${this.obterCapitalPais()}] Atualizado os feriados estaduais.`
      );
      return resultado;
    } catch (error) {
      const resultado: FeriadoUpdateResult = {
        sucesso: false,
        nacionaisAtualizados: 0,
        estaduaisAtualizados: 0,
        mensagem: `Erro ao atualizar feriados estaduais`,
        timestamp: new Date(),
        erro: error instanceof Error ? error.message : String(error),
      };

      console.error(
        `[${this.obterCapitalPais()}] Erro ao atualizar feriados estaduais:`,
        error
      );
      return resultado;
    }
  }

  /**
   * Atualiza ambos (nacionais e estaduais)
   * @returns Promise com o resultado da atualização
   */
  async atualizarTodos(): Promise<FeriadoUpdateResult> {
    try {
      console.log(
        `[${this.obterCapitalPais()}] Iniciando atualização completa de feriados...`
      );

      const [resultadoNacionais, resultadoEstaduais] = await Promise.allSettled(
        [this.atualizarNacionais(), this.atualizarEstaduais()]
      );

      const nacionaisSucesso =
        resultadoNacionais.status === "fulfilled" &&
        resultadoNacionais.value.sucesso;
      const estaduaisSucesso =
        resultadoEstaduais.status === "fulfilled" &&
        resultadoEstaduais.value.sucesso;

      const nacionaisAtualizados = nacionaisSucesso
        ? resultadoNacionais.value.nacionaisAtualizados
        : 0;
      const estaduaisAtualizados = estaduaisSucesso
        ? resultadoEstaduais.value.estaduaisAtualizados
        : 0;

      let mensagem = "";
      if (nacionaisSucesso && estaduaisSucesso) {
        mensagem = "Feriados nacionais e estaduais atualizados com sucesso";
        console.log(
          `[${this.obterCapitalPais()}] Atualizado os feriados nacionais e estaduais.`
        );
      } else if (nacionaisSucesso) {
        mensagem =
          "Feriados nacionais atualizados com sucesso, estaduais falharam";
        console.log(
          `[${this.obterCapitalPais()}] Atualizado os feriados nacionais.`
        );
      } else if (estaduaisSucesso) {
        mensagem =
          "Feriados estaduais atualizados com sucesso, nacionais falharam";
        console.log(
          `[${this.obterCapitalPais()}] Atualizado os feriados estaduais.`
        );
      } else {
        mensagem = "Falha na atualização de feriados nacionais e estaduais";
      }

      const resultado: FeriadoUpdateResult = {
        sucesso: nacionaisSucesso || estaduaisSucesso,
        nacionaisAtualizados,
        estaduaisAtualizados,
        mensagem,
        timestamp: new Date(),
      };

      return resultado;
    } catch (error) {
      const resultado: FeriadoUpdateResult = {
        sucesso: false,
        nacionaisAtualizados: 0,
        estaduaisAtualizados: 0,
        mensagem: `Erro ao atualizar feriados`,
        timestamp: new Date(),
        erro: error instanceof Error ? error.message : String(error),
      };

      console.error(
        `[${this.obterCapitalPais()}] Erro ao atualizar feriados:`,
        error
      );
      return resultado;
    }
  }

  /**
   * Inicia o CRONJOB de atualização de forma assíncrona e não-bloqueante
   */
  iniciarCronJob(): void {
    if (this.cronJobId) {
      // Log removido para otimização
      return;
    }

    console.log(
      `[${this.obterCapitalPais()}] Iniciando CRONJOB de atualização de feriados (intervalo: ${
        this.config.intervaloMinutos
      } minutos)`
    );

    // Executa de forma assíncrona e não-bloqueante após um pequeno delay
    setTimeout(async () => {
      console.log(
        `[${this.obterCapitalPais()}] Iniciando atualização completa de feriados...`
      );
      await this.atualizarTodos();
    }, 100); // 100ms de delay para não bloquear a inicialização

    // Configura o CRONJOB para execução periódica
    this.cronJobId = setInterval(async () => {
      await this.atualizarTodos();
    }, this.config.intervaloMinutos * 60 * 1000);
  }

  /**
   * Para o CRONJOB de atualização
   */
  pararCronJob(): void {
    if (this.cronJobId) {
      clearInterval(this.cronJobId);
      this.cronJobId = null;
      console.log(
        `[${this.obterCapitalPais()}] CRONJOB de atualização de feriados parado`
      );
    }
  }

  /**
   * Obtém a capital do país baseada na configuração
   * @returns Capital do país
   */
  private obterCapitalPais(): string {
    const timezone = process.env.TIMEZONE || "America/Sao_Paulo";

    // Mapeamento direto dos timezones principais
    if (timezone === "America/Sao_Paulo") {
      return "BRASILIA"; // pt-BR
    } else if (timezone === "America/New_York") {
      return "WASHINGTON"; // en-US
    } else if (timezone === "Europe/Lisbon") {
      return "LISBOA"; // pt-PT
    }

    // Fallback para timezones similares
    if (
      timezone.includes("America/Sao_Paulo") ||
      timezone.includes("America/Recife") ||
      timezone.includes("America/Manaus")
    ) {
      return "BRASILIA";
    } else if (
      timezone.includes("America/New_York") ||
      timezone.includes("America/Los_Angeles") ||
      timezone.includes("America/Chicago")
    ) {
      return "WASHINGTON";
    } else if (
      timezone.includes("Europe/Lisbon") ||
      timezone.includes("Europe/Azores") ||
      timezone.includes("Europe/Madeira")
    ) {
      return "LISBOA";
    }

    return this.config.pais.toUpperCase();
  }

  /**
   * Obtém o caminho do arquivo de feriados nacionais
   * @returns Caminho do arquivo
   */
  private obterCaminhoArquivoNacionais(): string {
    const locale = this.obterLocalePais();
    return join(__dirname, `../../locale/${locale}/feriados-nacionais.json`);
  }

  /**
   * Obtém o caminho do arquivo de feriados estaduais
   * @returns Caminho do arquivo
   */
  private obterCaminhoArquivoEstaduais(): string {
    const locale = this.obterLocalePais();
    return join(__dirname, `../../locale/${locale}/feriados-estaduais.json`);
  }

  /**
   * Obtém o locale baseado no país
   * @returns Locale do país
   */
  private obterLocalePais(): string {
    switch (this.config.pais.toUpperCase()) {
      case "BR":
        return "pt-br";
      case "US":
        return "en-US";
      case "PT":
        return "pt-PT";
      default:
        return "pt-br";
    }
  }

  /**
   * Salva feriados nacionais em arquivo JSON
   * @param feriados - Array de feriados
   * @param caminhoArquivo - Caminho do arquivo
   */
  private salvarFeriados(feriados: Feriado[], caminhoArquivo: string): void {
    this.criarDiretorioSeNecessario(caminhoArquivo);

    const conteudo = JSON.stringify(feriados, null, 2);
    writeFileSync(caminhoArquivo, conteudo, "utf-8");
  }

  /**
   * Salva feriados estaduais em arquivo JSON
   * @param feriadosEstaduais - Objeto com feriados por estado
   * @param caminhoArquivo - Caminho do arquivo
   */
  private salvarFeriadosEstaduais(
    feriadosEstaduais: Record<string, Feriado[]>,
    caminhoArquivo: string
  ): void {
    this.criarDiretorioSeNecessario(caminhoArquivo);

    const conteudo = JSON.stringify(feriadosEstaduais, null, 2);
    writeFileSync(caminhoArquivo, conteudo, "utf-8");
  }

  /**
   * Cria diretório se não existir
   * @param caminhoArquivo - Caminho do arquivo
   */
  private criarDiretorioSeNecessario(caminhoArquivo: string): void {
    const diretorio = dirname(caminhoArquivo);
    if (!existsSync(diretorio)) {
      mkdirSync(diretorio, { recursive: true });
    }
  }
}
