/**
 * Domain Layer - Value Objects
 * 
 * Value Objects são objetos imutáveis que representam conceitos do domínio.
 * Este value object representa um intervalo de horário com validações.
 */

import type { HoraString } from "../entities/horario-comercial.entity.js";

/**
 * Value Object que representa um intervalo de horário comercial.
 * Garante a imutabilidade e validação dos dados de horário.
 */
export class IntervaloValueObject {
  private readonly _abertura: HoraString;
  private readonly _fechamento: HoraString;

  /**
   * Constrói um novo intervalo de horário com validação.
   * @param abertura - Horário de abertura no formato HH:mm
   * @param fechamento - Horário de fechamento no formato HH:mm
   * @throws Error se os horários forem inválidos
   */
  constructor(abertura: HoraString, fechamento: HoraString) {
    this.validateHorario(abertura);
    this.validateHorario(fechamento);
    
    this._abertura = abertura;
    this._fechamento = fechamento;
  }

  /**
   * Obtém o horário de abertura do intervalo.
   * @returns Horário de abertura no formato HH:mm
   */
  get abertura(): HoraString {
    return this._abertura;
  }

  /**
   * Obtém o horário de fechamento do intervalo.
   * @returns Horário de fechamento no formato HH:mm
   */
  get fechamento(): HoraString {
    return this._fechamento;
  }

  /**
   * Valida se um horário está no formato correto (HH:mm).
   * @param horario - String do horário a ser validado
   * @throws Error se o formato for inválido
   */
  private validateHorario(horario: string): void {
    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!regex.test(horario)) {
      throw new Error(`Formato de horário inválido: ${horario}. Use HH:mm`);
    }
  }

  /**
   * Compara este intervalo com outro para verificar igualdade.
   * @param other - Outro intervalo para comparação
   * @returns true se os intervalos forem iguais, false caso contrário
   */
  equals(other: IntervaloValueObject): boolean {
    return this._abertura === other._abertura && this._fechamento === other._fechamento;
  }

  /**
   * Retorna uma representação em string do intervalo.
   * @returns String no formato "HH:mm - HH:mm"
   */
  toString(): string {
    return `${this._abertura} - ${this._fechamento}`;
  }
}
