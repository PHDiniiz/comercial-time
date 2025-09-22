import { HorarioComercial } from "../src/index";

const horario = {
  segunda: [{ abertura: "08:00", fechamento: "18:00" }],
  terca: [{ abertura: "08:00", fechamento: "18:00" }],
  sabado: [{ abertura: "10:00", fechamento: "02:00" }]
};

describe("HorarioComercial - básico", () => {
  it("deve estar aberto em segunda 10:00", () => {
    const hc = new HorarioComercial(horario);
    const d = new Date("2025-09-22T10:00:00"); // 22/09/2025 é segunda
    expect(hc.estaAberto(d)).toBe(true);
  });

  it("deve respeitar feriado", () => {
    const hc = new HorarioComercial(horario, ["2025-09-22"]);
    const d = new Date("2025-09-22T10:00:00");
    expect(hc.estaAberto(d)).toBe(false);
  });

  it("deve somar minutos úteis pulando fechamento", () => {
    const hc = new HorarioComercial(horario);
    const d = new Date("2025-09-22T17:30:00"); // segunda 17:30, fechamento 18:00 -> 30 min available
    const result = hc.adicionarMinutosUteis(d, 90); // 90 min -> 30 min hoje + 60 min next opening (terça 08:00 -> 09:00)
    expect(result.getFullYear()).toBe(2025);
    // expected to be 2025-09-23T09:00:00 or similar depending timezone; we check hours and minutes
    expect(result.getHours()).toBe(9);
    expect(result.getMinutes()).toBe(0);
  });
});