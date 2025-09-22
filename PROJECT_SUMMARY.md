# @phdiniiz/comercialTime - Biblioteca de Horário Comercial em TypeScript

## 📋 Sobre o Projeto

**@phdiniiz/comercialTime** é uma biblioteca completa e robusta para gerenciamento de horários comerciais em português brasileiro, implementada com Clean Architecture, validações de segurança e otimizações de performance.

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

## 🚀 Primeiros Passos

### 1. **Instalação**
```bash
# Usando pnpm (recomendado)
pnpm add @phdiniiz/comercialTime

# Usando npm
npm install @phdiniiz/comercialTime

# Usando yarn
yarn add @phdiniiz/comercialTime
```

### 2. **Configuração Básica**
```typescript
import { HorarioComercial, inicializarRapido } from '@phdiniiz/comercialTime';

// Inicializar o módulo
await inicializarRapido('America/Sao_Paulo');

// Criar instância do horário comercial
const horario = new HorarioComercial({
  segunda: { abertura: '08:00', fechamento: '18:00' },
  terca: { abertura: '08:00', fechamento: '18:00' },
  quarta: { abertura: '08:00', fechamento: '18:00' },
  quinta: { abertura: '08:00', fechamento: '18:00' },
  sexta: { abertura: '08:00', fechamento: '18:00' }
}).setTimezone('America/Sao_Paulo');
```

### 3. **Verificar Status**
```typescript
// Verificar se está aberto agora
console.log('Está aberto agora:', horario.openedNow);

// Próxima abertura
console.log('Próxima abertura:', horario.proximaAbertura());

// Minutos restantes hoje
console.log('Minutos restantes:', horario.minutosRestantesHoje());
```

## 💡 Exemplos Práticos

### 🏢 **Aplicação Empresarial**
```typescript
import { HorarioComercial, incluir } from '@phdiniiz/comercialTime';

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

### 🌐 **API REST com Express**
```typescript
import express from 'express';
import { HorarioComercial } from '@phdiniiz/comercialTime';

const app = express();
const horario = new HorarioComercial({
  segunda: { abertura: '08:00', fechamento: '18:00' },
  terca: { abertura: '08:00', fechamento: '18:00' },
  quarta: { abertura: '08:00', fechamento: '18:00' },
  quinta: { abertura: '08:00', fechamento: '18:00' },
  sexta: { abertura: '08:00', fechamento: '18:00' }
}).setTimezone('America/Sao_Paulo');

// Endpoint de status
app.get('/status', (req, res) => {
  res.json({
    estaAberto: horario.estaAberto(),
    proximaAbertura: horario.proximaAbertura(),
    minutosRestantes: horario.minutosRestantesHoje()
  });
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
```

### ⚛️ **React Hook Personalizado**
```typescript
import { useState, useEffect } from 'react';
import { HorarioComercial } from '@phdiniiz/comercialTime';

export function useHorarioComercial() {
  const [horario] = useState(() => new HorarioComercial({
    segunda: { abertura: '08:00', fechamento: '18:00' },
    terca: { abertura: '08:00', fechamento: '18:00' },
    quarta: { abertura: '08:00', fechamento: '18:00' },
    quinta: { abertura: '08:00', fechamento: '18:00' },
    sexta: { abertura: '08:00', fechamento: '18:00' }
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

// Uso no componente
function App() {
  const { status } = useHorarioComercial();

  return (
    <div>
      <h1>Status do Horário Comercial</h1>
      <p>Está aberto: {status.estaAberto ? 'Sim' : 'Não'}</p>
      <p>Próxima abertura: {status.proximaAbertura?.toLocaleString()}</p>
      <p>Minutos restantes: {status.minutosRestantes}</p>
    </div>
  );
}
```

### 🌍 **Sistema de Feriados Multi-País**
```typescript
import { incluir } from '@phdiniiz/comercialTime';

// Brasil com feriados nacionais e estaduais
const horarioBrasil = incluir({ 
  nacionais: true, 
  estaduais: ["SP", "RJ", "MG"] 
});

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

// Criar horários comerciais
const horarioSP = horarioBrasil.criarHorarioComercial({
  segunda: { abertura: '09:00', fechamento: '18:00' },
  terca: { abertura: '09:00', fechamento: '18:00' },
  quarta: { abertura: '09:00', fechamento: '18:00' },
  quinta: { abertura: '09:00', fechamento: '18:00' },
  sexta: { abertura: '09:00', fechamento: '18:00' }
});

// Verificar se está aberto (considerando feriados)
console.log('Está aberto em SP:', horarioSP.estaAberto());
```

### 🔒 **Validações de Segurança**
```typescript
import { InputValidator, AdvancedRateLimiter } from '@phdiniiz/comercialTime';

// Validação de entrada
const isValid = InputValidator.validateHorarioInput('14:30'); // ✅ true
const isInvalid = InputValidator.validateHorarioInput('25:00'); // ❌ false
const isXSS = InputValidator.validateHorarioInput('08:00<script>'); // ❌ XSS bloqueado

// Rate Limiting
const limiter = new AdvancedRateLimiter({
  maxRequests: 1000,        // 1000 requests por minuto
  debounceMs: 100,          // 100ms de debounce
  circuitBreakerThreshold: 5 // 5 falhas para abrir circuit breaker
});

// Usar o rate limiter
const canProceed = await limiter.checkLimit('user123');
if (canProceed) {
  // Processar requisição
  console.log('Requisição processada');
} else {
  console.log('Rate limit excedido');
}
```

### ⚡ **Performance Otimizada**
```typescript
import { OptimizedHorarioComercialService } from '@phdiniiz/comercialTime';

// Cache com TTL de 5 minutos
const service = new OptimizedHorarioComercialService({
  ttl: 300000,    // 5 minutos
  maxSize: 1000   // 1000 entradas
});

// Primeira chamada: calcula
const result1 = service.estaAberto('2024-01-08 14:30');

// Segunda chamada: retorna do cache (muito mais rápido)
const result2 = service.estaAberto('2024-01-08 14:30');

console.log('Resultado:', result1, result2);
```

### 🎯 **Feriados Personalizados**
```typescript
// Configurar feriados personalizados via variável de ambiente
// .env
PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON='{"nacionais":[{"nome":"Dia da Empresa","data":"2025-03-15","observacoes":"Aniversário da nossa empresa."}]}'

// Ou via URL
PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON='https://api.minhaempresa.com/feriados.json'

// Usar na aplicação
import { carregarFeriadosPersonalizados } from '@phdiniiz/comercialTime';

const feriadosPersonalizados = await carregarFeriadosPersonalizados();
console.log('Feriados personalizados:', feriadosPersonalizados);
```

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

## ⚡ Performance

### 🚀 **Otimizações**
- **Cache Inteligente** - TTL configurável e limpeza automática
- **Lazy Loading** - Carregamento sob demanda de módulos
- **Tree Shaking** - Eliminação de código não utilizado
- **ESM Nativo** - Melhor performance em bundlers modernos

## 🌍 Compatibilidade

### 🖥️ **Sistemas Operacionais**
- ✅ Windows 10/11
- ✅ macOS 10.15+
- ✅ Linux (Ubuntu 18.04+)

### 🚀 **Ambientes**
- ✅ Node.js (ESM)
- ✅ Deno
- ✅ Bun
- ✅ Browsers modernos

### 🛠️ **Frameworks**
- ✅ Next.js 15+
- ✅ NestJS
- ✅ Express.js
- ✅ Fastify

## 📋 Requisitos

- **Node.js**: >= 22.0.0
- **TypeScript**: >= 5.7.2
- **Suporte a ESM**: Obrigatório

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

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**Pedro Henrique Diniz**

- 🌐 **GitHub**: [@PHDiniiz](https://github.com/PHDiniiz)
- 📦 **NPM**: [@phdiniiz/comercialTime](https://www.npmjs.com/package/@phdiniiz/comercialTime)

## 🙏 Agradecimentos

- Comunidade TypeScript
- Equipe do Node.js
- Contribuidores do projeto
- Todos que testaram e reportaram bugs

## 📞 Suporte

- 📖 **Documentação**: [README Completo](README_LEGADO.md)
- 🐛 **Issues**: [GitHub Issues](https://github.com/phdiniiz/comercialHours/issues)
- 💬 **Discussões**: [GitHub Discussions](https://github.com/phdiniiz/comercialHours/discussions)

---

<div align="center">

**⭐ Se este projeto foi útil para você, considere dar uma estrela!**

[![GitHub stars](https://img.shields.io/github/stars/phdiniiz/comercialHours?style=social)](https://github.com/phdiniiz/comercialHours)

</div>
