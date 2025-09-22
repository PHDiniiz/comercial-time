/**
 * Exemplo de uso de feriados personalizados via URL
 *
 * Este exemplo demonstra como usar a variável de ambiente
 * PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON com uma URL para carregar feriados.
 */

import {
  carregarFeriadosPersonalizados,
  carregarFeriadosPersonalizadosDeUrl,
  feriadosPersonalizadosDisponiveis,
  obterInfoFeriadosPersonalizados,
} from "../src/index.js";

// Exemplo 1: Configurar variável de ambiente com URL
console.log("=== DEMONSTRAÇÃO DE FERIADOS PERSONALIZADOS VIA URL ===\n");

// Simular uma URL de feriados (em produção, seria uma URL real)
const urlExemplo = "https://api.exemplo.com/feriados.json";

// Configurar variável de ambiente com URL
process.env.PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON = urlExemplo;

console.log("1. Verificando se há feriados personalizados disponíveis:");
const disponivel = feriadosPersonalizadosDisponiveis();
console.log(
  `   Feriados personalizados disponíveis: ${
    disponivel ? "✅ Sim (URL válida)" : "❌ Não (valor inválido ou vazio)"
  }`
);

console.log("\n2. Obtendo informações sobre feriados personalizados:");
const info = obterInfoFeriadosPersonalizados();
console.log("   Informações:", JSON.stringify(info, null, 2));

console.log("\n3. Tentando carregar feriados personalizados (assíncrono):");
try {
  const feriados = await carregarFeriadosPersonalizados();
  if (feriados) {
    console.log("   ✅ Feriados carregados com sucesso!");
    console.log(`   - Nacionais: ${feriados.nacionais.length}`);
    console.log(
      `   - Estaduais: ${Object.keys(feriados.estaduais).length} estados`
    );
  } else {
    console.log("   ❌ Não foi possível carregar feriados");
  }
} catch (error) {
  console.log("   ❌ Erro ao carregar feriados:", error.message);
}

console.log("\n4. Exemplo de URL válida vs inválida:");

// URLs válidas
const urlsValidas = [
  "https://api.exemplo.com/feriados.json",
  "http://localhost:3000/feriados",
  "https://raw.githubusercontent.com/user/repo/main/feriados.json",
  "https://api.github.com/repos/user/repo/contents/feriados.json",
];

console.log("   URLs válidas:");
urlsValidas.forEach((url, index) => {
  console.log(`   ${index + 1}. ${url}`);
});

// URLs inválidas
const urlsInvalidas = [
  "not-a-url",
  "ftp://invalid-protocol.com/feriados.json",
  "https://",
  "just-text",
];

console.log("\n   URLs inválidas:");
urlsInvalidas.forEach((url, index) => {
  console.log(`   ${index + 1}. ${url}`);
});

console.log(
  "\n5. Exemplo de uso direto da função carregarFeriadosPersonalizadosDeUrl:"
);

// Simular carregamento de URL (em produção, seria uma URL real)
try {
  // Nota: Esta URL não existe, então vai falhar, mas demonstra o uso
  const feriadosDeUrl = await carregarFeriadosPersonalizadosDeUrl(
    "https://api.exemplo.com/feriados.json"
  );
  if (feriadosDeUrl) {
    console.log("   ✅ Feriados carregados da URL!");
    console.log(`   - Nacionais: ${feriadosDeUrl.nacionais.length}`);
    console.log(
      `   - Estaduais: ${Object.keys(feriadosDeUrl.estaduais).length} estados`
    );
  } else {
    console.log("   ❌ Não foi possível carregar feriados da URL");
  }
} catch (error) {
  console.log("   ❌ Erro ao carregar feriados da URL:", error.message);
}

console.log("\n6. Exemplo de configuração em diferentes ambientes:");

console.log("\n   📁 .env file:");
console.log(
  `   PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON="https://api.exemplo.com/feriados.json"`
);

console.log("\n   🐳 Docker:");
console.log(
  `   ENV PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON="https://api.exemplo.com/feriados.json"`
);

console.log("\n   🚀 Scripts package.json:");
console.log(
  `   "start": "PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON='https://api.exemplo.com/feriados.json' node index.js"`
);

console.log("\n   ☁️  Variáveis de ambiente (produção):");
console.log(
  `   export PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON="https://api.exemplo.com/feriados.json"`
);

console.log("\n7. Formato esperado do JSON na URL:");

const formatoExemplo = {
  nacionais: [
    {
      nome: "Dia da Empresa",
      data: "2025-03-15",
      observacoes: "Aniversário da nossa empresa - feriado corporativo.",
    },
    {
      nome: "Dia do Desenvolvedor",
      data: "2025-09-13",
      observacoes: "Celebração do dia do programador - feriado técnico.",
    },
  ],
  estaduais: {
    SP: [
      {
        nome: "Dia da Revolução Constitucionalista Personalizada",
        data: "2025-07-09",
        observacoes: "Nossa versão personalizada do feriado de SP.",
      },
    ],
    RJ: [
      {
        nome: "Dia de São Sebastião Personalizado",
        data: "2025-01-20",
        observacoes: "Nossa versão personalizada do feriado do RJ.",
      },
    ],
  },
};

console.log("   Formato esperado:");
console.log(JSON.stringify(formatoExemplo, null, 2));

console.log("\n8. Vantagens de usar URLs:");

const vantagens = [
  "✅ Feriados centralizados em um local",
  "✅ Atualizações automáticas sem redeploy",
  "✅ Compartilhamento entre múltiplas aplicações",
  "✅ Versionamento e histórico de mudanças",
  "✅ Backup e recuperação facilitados",
  "✅ Controle de acesso via autenticação",
  "✅ Cache e CDN para performance",
  "✅ Monitoramento e logs centralizados",
];

vantagens.forEach((vantagem, index) => {
  console.log(`   ${vantagem}`);
});

console.log("\n9. Considerações de segurança:");

const consideracoes = [
  "🔒 Use HTTPS para URLs em produção",
  "🔒 Valide certificados SSL",
  "🔒 Implemente timeout para requisições",
  "🔒 Use autenticação quando necessário",
  "🔒 Valide o conteúdo JSON recebido",
  "🔒 Implemente fallback para falhas de rede",
  "🔒 Cache local para reduzir dependência de rede",
  "🔒 Monitoramento de disponibilidade da URL",
];

consideracoes.forEach((consideracao, index) => {
  console.log(`   ${consideracao}`);
});

console.log("\n=== FIM DA DEMONSTRAÇÃO ===");
