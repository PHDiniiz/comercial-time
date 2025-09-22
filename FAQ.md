# FAQ - Perguntas Frequentes

## 🤔 Perguntas Gerais

### **O que é @phdiniiz/comercialTime?**
@phdiniiz/comercialTime é uma biblioteca TypeScript completa para gerenciamento de horários comerciais em português brasileiro. Ela inclui sistema de feriados, validações de segurança e performance otimizada.

### **Por que usar esta biblioteca?**
- **API em português** - Interface totalmente em português brasileiro
- **Feriados atualizados** - Sistema automático de feriados nacionais e estaduais
- **Segurança robusta** - Proteção contra ataques XSS, SQL Injection e DoS
- **Performance otimizada** - Cache inteligente e operações eficientes
- **Zero dependências** - Máxima compatibilidade e segurança

### **Qual é a diferença entre esta biblioteca e outras?**
- **Foco no português brasileiro** - Interface e documentação em português
- **Feriados brasileiros** - Sistema completo de feriados nacionais e estaduais
- **Clean Architecture** - Código organizado e manutenível
- **Segurança avançada** - Proteções contra ataques comuns
- **Performance otimizada** - Cache e operações eficientes

## 🚀 Instalação e Configuração

### **Como instalar a biblioteca?**
```bash
# Usando pnpm (recomendado)
pnpm add @phdiniiz/comercialTime

# Usando npm
npm install @phdiniiz/comercialTime

# Usando yarn
yarn add @phdiniiz/comercialTime
```

### **Quais são os requisitos mínimos?**
- **Node.js**: >= 22.0.0
- **TypeScript**: >= 5.7.2
- **Suporte a ESM**: Obrigatório

### **Como configurar o timezone?**
```typescript
import { inicializarRapido } from '@phdiniiz/comercialTime';

// Inicializar com timezone
await inicializarRapido('America/Sao_Paulo');
```

### **Posso usar em projetos CommonJS?**
Não, a biblioteca é ESM-only. Você precisa usar ESM ou converter seu projeto para ESM.

## 💡 Uso e Funcionalidades

### **Como criar um horário comercial básico?**
```typescript
import { HorarioComercial } from '@phdiniiz/comercialTime';

const horario = new HorarioComercial({
  segunda: { abertura: '08:00', fechamento: '18:00' },
  terca: { abertura: '08:00', fechamento: '18:00' },
  quarta: { abertura: '08:00', fechamento: '18:00' },
  quinta: { abertura: '08:00', fechamento: '18:00' },
  sexta: { abertura: '08:00', fechamento: '18:00' }
}).setTimezone('America/Sao_Paulo');
```

### **Como verificar se está aberto agora?**
```typescript
// Verificar se está aberto agora
console.log('Está aberto:', horario.openedNow);

// Ou usando método
console.log('Está aberto:', horario.estaAberto());
```

### **Como obter a próxima abertura?**
```typescript
const proximaAbertura = horario.proximaAbertura();
console.log('Próxima abertura:', proximaAbertura);
```

### **Como calcular minutos úteis?**
```typescript
const dataInicial = new Date('2024-01-08T14:00:00');
const dataFinal = horario.adicionarMinutosUteis(dataInicial, 120); // +2 horas
console.log('Data final:', dataFinal);
```

## 🌍 Feriados

### **Como incluir feriados nacionais?**
```typescript
import { incluir } from '@phdiniiz/comercialTime';

const horarioCompleto = incluir({ 
  nacionais: true 
});

const horario = horarioCompleto.criarHorarioComercial({
  segunda: { abertura: '08:00', fechamento: '18:00' },
  // ... outros dias
});
```

### **Como incluir feriados estaduais?**
```typescript
const horarioCompleto = incluir({ 
  nacionais: true,
  estaduais: ["SP", "RJ", "MG"] 
});
```

### **Quais estados são suportados?**
Atualmente suportamos todos os estados brasileiros. Consulte a documentação para a lista completa.

### **Como adicionar feriados personalizados?**
```env
# .env
PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON='{"nacionais":[{"nome":"Dia da Empresa","data":"2025-03-15","observacoes":"Aniversário da nossa empresa."}]}'
```

### **Os feriados são atualizados automaticamente?**
Sim, a biblioteca inclui um sistema de atualização automática de feriados.

## 🔒 Segurança

### **Quais proteções de segurança estão implementadas?**
- **Rate Limiting** - Controle de volume de requisições
- **Input Validation** - Validação e sanitização de entrada
- **XSS Protection** - Proteção contra ataques XSS
- **DoS Protection** - Proteção contra ataques de negação de serviço

### **Como configurar rate limiting?**
```typescript
import { AdvancedRateLimiter } from '@phdiniiz/comercialTime';

const limiter = new AdvancedRateLimiter({
  maxRequests: 1000,        // 1000 requests por minuto
  debounceMs: 100,          // 100ms de debounce
  circuitBreakerThreshold: 5 // 5 falhas para abrir circuit breaker
});
```

### **Como validar entrada de dados?**
```typescript
import { InputValidator } from '@phdiniiz/comercialTime';

const isValid = InputValidator.validateHorarioInput('14:30'); // ✅ true
const isInvalid = InputValidator.validateHorarioInput('25:00'); // ❌ false
```

## ⚡ Performance

### **Como funciona o cache?**
A biblioteca inclui um sistema de cache inteligente com TTL configurável e limpeza automática.

### **Como configurar o cache?**
```typescript
import { OptimizedHorarioComercialService } from '@phdiniiz/comercialTime';

const service = new OptimizedHorarioComercialService({
  ttl: 300000,    // 5 minutos
  maxSize: 1000   // 1000 entradas
});
```

### **A biblioteca é otimizada para performance?**
Sim, a biblioteca é otimizada para performance com:
- Cache inteligente
- Lazy loading
- Tree shaking
- ESM nativo

## 🌍 Compatibilidade

### **Quais frameworks são suportados?**
- Next.js 15+
- NestJS
- Express.js
- Fastify
- React
- Vue.js

### **Funciona em browsers?**
Sim, a biblioteca funciona em browsers modernos que suportam ESM.

### **Funciona no Deno?**
Sim, a biblioteca é compatível com Deno.

### **Funciona no Bun?**
Sim, a biblioteca é compatível com Bun.

## 🧪 Testes

### **Como executar os testes?**
```bash
# Executar todos os testes
pnpm test

# Executar com cobertura
pnpm test -- --coverage

# Executar testes em modo watch
pnpm test -- --watch
```

### **Qual é a cobertura de testes?**
A biblioteca tem cobertura de testes de 80%+ em:
- Branches
- Functions
- Lines
- Statements

## 🤝 Contribuição

### **Como contribuir com o projeto?**
1. Fork o repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

### **Como reportar bugs?**
1. Verifique se o bug já foi reportado
2. Crie uma issue com detalhes do problema
3. Inclua informações do ambiente

### **Como sugerir novas funcionalidades?**
1. Abra uma issue com a label "enhancement"
2. Descreva a funcionalidade desejada
3. Explique o caso de uso

## 📞 Suporte

### **Onde posso obter ajuda?**
- **Documentação**: [GitHub](https://github.com/phdiniiz/comercialHours)
- **Issues**: [GitHub Issues](https://github.com/phdiniiz/comercialHours/issues)
- **Discussões**: [GitHub Discussions](https://github.com/phdiniiz/comercialHours/discussions)

### **Como entrar em contato com o autor?**
- **GitHub**: [@PHDiniiz](https://github.com/PHDiniiz)
- **NPM**: [@phdiniiz/comercialTime](https://www.npmjs.com/package/@phdiniiz/comercialTime)

### **Existe suporte comercial?**
Atualmente não oferecemos suporte comercial, mas estamos abertos a discussões sobre parcerias e suporte empresarial.

## 📄 Licenciamento

### **Qual é a licença?**
O projeto está licenciado sob a Licença MIT.

### **Posso usar em projetos comerciais?**
Sim, a licença MIT permite uso comercial.

### **Preciso dar créditos?**
Não é obrigatório, mas é apreciado se você incluir um link para o projeto.

---

**Não encontrou sua pergunta?** Abra uma [issue](https://github.com/phdiniiz/comercialHours/issues) ou participe das [discussões](https://github.com/phdiniiz/comercialHours/discussions)!
