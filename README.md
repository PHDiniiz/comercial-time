# @phdiniiz/comercial-time

<div align="center">

[![npm version](https://img.shields.io/npm/v/@phdiniiz/comercial-time.svg)](https://www.npmjs.com/package/@phdiniiz/comercial-time)
[![npm downloads](https://img.shields.io/npm/dm/@phdiniiz/comercial-time.svg)](https://www.npmjs.com/package/@phdiniiz/comercial-time)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue.svg)](https://www.typescriptlang.org/)
[![Build Status](https://img.shields.io/github/actions/workflow/status/PHDiniiz/comercial-time/ci.yml?branch=prod)](https://github.com/PHDiniiz/comercial-time/actions)

**Biblioteca completa para gerenciamento de horários comerciais em português brasileiro**

Uma solução robusta e performática para controle de horários comerciais, feriados nacionais/estaduais e validações de segurança, implementada com Clean Architecture e TypeScript.

[📖 Documentação Completa](PROJECT_SUMMARY.md) • [🚀 Instalação](#-instalação) • [💡 Exemplos](#-exemplos) • [🤝 Contribuir](#-contribuir)

</div>

## 📋 Sobre o Projeto

**@phdiniiz/comercial-time** é uma biblioteca completa para gerenciamento de horários comerciais em português brasileiro, desenvolvida com foco em performance, segurança e facilidade de uso.

### 🎯 **O que realiza?**
- **Gerenciamento de horários comerciais** com suporte completo ao português brasileiro
- **Sistema de feriados** nacionais e estaduais do Brasil, Portugal e Estados Unidos
- **Cálculos automáticos** de horários úteis, próximas aberturas e fechamentos
- **Validações de segurança** contra ataques XSS, SQL Injection e DoS
- **Performance otimizada** com cache inteligente e operações eficientes

### 🔧 **Como realiza?**
- **Clean Architecture** com separação clara de responsabilidades
- **TypeScript First** com tipagem forte e IntelliSense completo
- **ESM Nativo** para melhor performance em bundlers modernos
- **Zero Dependencies** para máxima compatibilidade
- **Testes automatizados** com cobertura completa

### 🎯 **Por que realiza?**
- **Falta de bibliotecas** específicas para horário comercial em português brasileiro
- **Necessidade de feriados** nacionais e estaduais atualizados automaticamente
- **Demanda por performance** em aplicações de alta escala
- **Requisitos de segurança** em ambientes corporativos

### 🚀 **Para que realiza?**
- **Aplicações empresariais** que precisam de controle de horário comercial
- **Sistemas de atendimento** com horários específicos
- **APIs REST** que precisam validar horários de funcionamento
- **Aplicações React/Next.js** com componentes de horário comercial
- **Sistemas de agendamento** e calendários corporativos

## ✨ Características

<table>
<tr>
<td width="50%">

### 🎯 **Funcionalidades Principais**
- ✅ **API em Português (pt-BR)** - Interface totalmente em português brasileiro
- ✅ **Clean Architecture** - Código organizado em camadas bem definidas
- ✅ **TypeScript First** - Tipagem forte e IntelliSense completo
- ✅ **ESM Nativo** - Suporte completo a módulos ES2024
- ✅ **Zero Dependencies** - Sem dependências externas

</td>
<td width="50%">

### 🔒 **Segurança & Performance**
- ✅ **Validações de Segurança** - Proteção contra XSS, SQL Injection, DoS
- ✅ **Rate Limiting Avançado** - Debounce, Throttle, Circuit Breaker
- ✅ **Performance Otimizada** - Cache inteligente e operações eficientes
- ✅ **Testes Automatizados** - Cobertura completa com Jest

</td>
</tr>
</table>

## 🚀 Instalação

```bash
# Usando pnpm (recomendado)
pnpm add @phdiniiz/comercial-time

# Usando npm
npm install @phdiniiz/comercial-time

# Usando yarn
yarn add @phdiniiz/comercial-time
```

## ⚡ Quick Start

```typescript
import { HorarioComercial, inicializarRapido } from '@phdiniiz/comercial-time';

// 1. Inicializar o módulo
await inicializarRapido('America/Sao_Paulo');

// 2. Criar instância do horário comercial
const horario = new HorarioComercial({
  segunda: { abertura: '08:00', fechamento: '18:00' },
  terca: { abertura: '08:00', fechamento: '18:00' },
  quarta: { abertura: '08:00', fechamento: '18:00' },
  quinta: { abertura: '08:00', fechamento: '18:00' },
  sexta: { abertura: '08:00', fechamento: '18:00' }
})
.setTimezone('America/Sao_Paulo');

// 3. Verificar status
console.log('Está aberto agora:', horario.openedNow);
console.log('Próxima abertura:', horario.proximaAbertura());
console.log('Minutos restantes:', horario.minutosRestantesHoje());
```

## 🌍 Sistema Modular de Feriados

### 🇧🇷 **Brasil (pt-BR)**
```typescript
import { incluir } from "@phdiniiz/comercial-time";

// Feriados nacionais + estaduais de SP
const horarioBrasil = incluir({ 
  nacionais: true, 
  estaduais: "SP" 
});

// Múltiplos estados
const horarioMultiEstados = incluir({ 
  nacionais: true, 
  estaduais: ["SP", "RJ", "MG"] 
});
```

### 🌍 **Múltiplas Localizações**
```typescript
// Portugal
const horarioPortugal = incluir({ 
  nacionais: true, 
  estaduais: "LIS", 
  location: "pt-PT" 
});

// Estados Unidos
const horarioEUA = incluir({ 
  nacionais: true, 
  estaduais: "CA", 
  location: "en-US" 
});
```

### 🎯 **Feriados Personalizados**
```env
# .env
PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON='{"nacionais":[{"nome":"Dia da Empresa","data":"2025-03-15","observacoes":"Aniversário da nossa empresa."}]}'
```

## 📚 Documentação

### 📖 **Guias Principais**
- [📋 README Completo](README_LEGADO.md) - Documentação completa e detalhada
- [🔄 Guia de Migração](docs/legacy-migration-guide.md) - Migração do código legado
- [🌍 Análise de Compatibilidade](docs/compatibility-analysis.md) - ESM vs CommonJS
- [🔒 Explicações de Segurança](docs/security-explanations.md) - Rate Limiting e DoS Protection
- [⚡ Rate Limiting](docs/rate-limiting-explanation.md) - Sistema de proteção avançado

### 🎯 **Exemplos Práticos**
- [🚀 Quick Start](examples/quick-start-demo.js) - Início rápido
- [🌍 Timezone Demo](examples/timezone-demo.ts) - Configuração de timezone
- [⏰ CRONJOB Demo](examples/cronjob-demo.ts) - Atualização automática de feriados
- [🔒 Security Demo](examples/security-demo.ts) - Validações de segurança
- [🔄 Migration Demo](examples/legacy-migration-demo.ts) - Migração do código legado

## 🏗️ Arquitetura

```
src/
├── domain/           # Entidades e regras de negócio
├── infrastructure/   # Implementações técnicas
├── application/      # Casos de uso e serviços
├── presentation/     # Controllers e interfaces
├── security/         # Validações e proteções
├── performance/      # Otimizações e cache
├── locale/           # Dados localizados (pt-BR, pt-PT, en-US)
├── cronjob/          # Sistema de atualização automática
└── index.ts          # Arquivo principal unificado
```

## 🔒 Segurança

### 🛡️ **Proteção Multi-Camada**
- **Rate Limiting** - Controle de volume de requisições
- **Debounce** - Prevenção de requisições muito frequentes
- **Throttle** - Suavização de picos de tráfego
- **Circuit Breaker** - Proteção contra falhas em cascata
- **Input Validation** - Validação e sanitização de entrada

### 🚨 **Proteções Implementadas**
```typescript
// Validação de entrada
InputValidator.validateHorarioInput('14:30'); // ✅ true
InputValidator.validateHorarioInput('25:00'); // ❌ false
InputValidator.validateHorarioInput('08:00<script>'); // ❌ XSS bloqueado

// Rate Limiting
const limiter = new AdvancedRateLimiter({
  maxRequests: 1000,        // 1000 requests por minuto
  debounceMs: 100,          // 100ms de debounce
  circuitBreakerThreshold: 5 // 5 falhas para abrir circuit breaker
});
```

## ⚡ Performance

### 🚀 **Otimizações**
- **Cache Inteligente** - TTL configurável e limpeza automática
- **Lazy Loading** - Carregamento sob demanda de módulos
- **Tree Shaking** - Eliminação de código não utilizado
- **ESM Nativo** - Melhor performance em bundlers modernos

### 📊 **Benchmarks**
```typescript
// Cache com TTL de 5 minutos
const service = new OptimizedHorarioComercialService({
  ttl: 300000,    // 5 minutos
  maxSize: 1000   // 1000 entradas
});

// Primeira chamada: calcula
const result1 = service.estaAberto('2024-01-08 14:30');

// Segunda chamada: retorna do cache (muito mais rápido)
const result2 = service.estaAberto('2024-01-08 14:30');
```

## 🧪 Testes

```bash
# Executar todos os testes
pnpm test

# Executar com cobertura
pnpm test -- --coverage

# Executar testes em modo watch
pnpm test -- --watch
```

### 📊 **Cobertura de Testes**
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## 🌍 Compatibilidade

<table>
<tr>
<td width="33%">

### 🖥️ **Sistemas Operacionais**
- ✅ Windows 10/11
- ✅ macOS 10.15+
- ✅ Linux (Ubuntu 18.04+)

</td>
<td width="33%">

### 🚀 **Ambientes**
- ✅ Node.js (ESM)
- ✅ Deno
- ✅ Bun
- ✅ Browsers modernos

</td>
<td width="33%">

### 🛠️ **Frameworks**
- ✅ Next.js 15+
- ✅ NestJS
- ✅ Express.js
- ✅ Fastify

</td>
</tr>
</table>

## 📋 Requisitos

- **Node.js**: >= 22.0.0
- **TypeScript**: >= 5.7.2
- **Suporte a ESM**: Obrigatório

## 💡 Exemplos

### 🏢 **Aplicação Empresarial**
```typescript
import { HorarioComercial, incluir } from '@phdiniiz/comercial-time';

// Configurar horário comercial com feriados
const horarioCompleto = incluir({ 
  nacionais: true, 
  estaduais: ["SP", "RJ"] 
});

const horario = horarioCompleto.criarHorarioComercial({
  segunda: { abertura: '08:00', fechamento: '18:00' },
  terca: { abertura: '08:00', fechamento: '18:00' },
  quarta: { abertura: '08:00', fechamento: '18:00' },
  quinta: { abertura: '08:00', fechamento: '18:00' },
  sexta: { abertura: '08:00', fechamento: '18:00' }
});

// Verificar status
console.log('Está aberto:', horario.estaAberto());
console.log('Próxima abertura:', horario.proximaAbertura());
console.log('Feriados:', horario.obterFeriados().length);
```

### 🌐 **API REST**
```typescript
import express from 'express';
import { HorarioComercial } from '@phdiniiz/comercial-time';

const app = express();
const horario = new HorarioComercial({
  segunda: { abertura: '08:00', fechamento: '18:00' },
  // ... outros dias
}).setTimezone('America/Sao_Paulo');

// Endpoint de status
app.get('/status', (req, res) => {
  res.json({
    estaAberto: horario.estaAberto(),
    proximaAbertura: horario.proximaAbertura(),
    minutosRestantes: horario.minutosRestantesHoje()
  });
});
```

### ⚛️ **React Hook**
```typescript
import { useState, useEffect } from 'react';
import { HorarioComercial } from '@phdiniiz/comercial-time';

export function useHorarioComercial() {
  const [horario] = useState(() => new HorarioComercial({
    segunda: { abertura: '08:00', fechamento: '18:00' },
    // ... outros dias
  }).setTimezone('America/Sao_Paulo'));

  const [status, setStatus] = useState({
    estaAberto: false,
    proximaAbertura: null,
    minutosRestantes: 0
  });

  useEffect(() => {
    const atualizarStatus = () => {
      setStatus({
        estaAberto: horario.estaAberto(),
        proximaAbertura: horario.proximaAbertura(),
        minutosRestantes: horario.minutosRestantesHoje()
      });
    };

    atualizarStatus();
    const interval = setInterval(atualizarStatus, 60000); // 1 minuto

    return () => clearInterval(interval);
  }, [horario]);

  return { horario, status };
}
```

## 🤝 Contribuir

Contribuições são sempre bem-vindas! Veja como você pode ajudar:

### 🐛 **Reportar Bugs**
1. Verifique se o bug já foi reportado
2. Crie uma issue com detalhes do problema
3. Inclua informações do ambiente (Node.js, OS, etc.)

### ✨ **Sugerir Features**
1. Abra uma issue com a label "enhancement"
2. Descreva a funcionalidade desejada
3. Explique o caso de uso

### 🔧 **Contribuir com Código**
1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### 📋 **Padrões de Código**
- **Clean Code**: Código limpo e legível
- **Clean Architecture**: Separação de responsabilidades
- **TDD**: Testes antes da implementação
- **TypeScript**: Tipagem forte
- **ESLint**: Linting automático
- **Prettier**: Formatação consistente

## 📊 Estatísticas do Projeto

<div align="center">

### 📈 **Métricas**
![GitHub stars](https://img.shields.io/github/stars/PHDiniiz/comercial-time?style=social)
![GitHub forks](https://img.shields.io/github/forks/PHDiniiz/comercial-time?style=social)
![GitHub issues](https://img.shields.io/github/issues/PHDiniiz/comercial-time)
![GitHub pull requests](https://img.shields.io/github/issues-pr/PHDiniiz/comercial-time)

### 🏆 **Badges**
[![npm version](https://img.shields.io/npm/v/@phdiniiz/comercial-time.svg)](https://www.npmjs.com/package/@phdiniiz/comercial-time)
[![npm downloads](https://img.shields.io/npm/dm/@phdiniiz/comercial-time.svg)](https://www.npmjs.com/package/@phdiniiz/comercial-time)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue.svg)](https://www.typescriptlang.org/)
[![Build Status](https://img.shields.io/github/actions/workflow/status/PHDiniiz/comercial-time/ci.yml?branch=prod)](https://github.com/PHDiniiz/comercial-time/actions)

</div>

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**Pedro Henrique Diniz**

- 🌐 **GitHub**: [@PHDiniiz](https://github.com/PHDiniiz)
- 📦 **NPM**: [@phdiniiz/comercial-time](https://www.npmjs.com/package/@phdiniiz/comercial-time)

## 🙏 Agradecimentos

- Comunidade TypeScript
- Equipe do Node.js
- Contribuidores do projeto
- Todos que testaram e reportaram bugs

## 📞 Suporte

- 📖 **Documentação**: [README Completo](README_LEGADO.md)
- 🐛 **Issues**: [GitHub Issues](https://github.com/PHDiniiz/comercial-time/issues)
- 💬 **Discussões**: [GitHub Discussions](https://github.com/PHDiniiz/comercial-time/discussions)

---

<div align="center">

**⭐ Se este projeto foi útil para você, considere dar uma estrela!**

[![GitHub stars](https://img.shields.io/github/stars/PHDiniiz/comercial-time?style=social)](https://github.com/PHDiniiz/comercial-time)

</div>
