# @phdiniiz/comercialTime

**Biblioteca completa para gerenciamento de horários comerciais em português brasileiro**

Uma solução robusta e performática para controle de horários comerciais, feriados nacionais/estaduais e validações de segurança, implementada com Clean Architecture e TypeScript.

## 🎯 O que faz?

- **Gerenciamento de horários comerciais** com suporte completo ao português brasileiro
- **Sistema de feriados** nacionais e estaduais do Brasil, Portugal e Estados Unidos
- **Cálculos automáticos** de horários úteis, próximas aberturas e fechamentos
- **Validações de segurança** contra ataques XSS, SQL Injection e DoS
- **Performance otimizada** com cache inteligente e operações eficientes

## 🚀 Primeiros Passos

### Instalação
```bash
pnpm add @phdiniiz/comercialTime
# ou
npm install @phdiniiz/comercialTime
```

### Uso Básico
```typescript
import { HorarioComercial, inicializarRapido } from '@phdiniiz/comercialTime';

// Inicializar
await inicializarRapido('America/Sao_Paulo');

// Criar horário comercial
const horario = new HorarioComercial({
  segunda: { abertura: '08:00', fechamento: '18:00' },
  terca: { abertura: '08:00', fechamento: '18:00' },
  quarta: { abertura: '08:00', fechamento: '18:00' },
  quinta: { abertura: '08:00', fechamento: '18:00' },
  sexta: { abertura: '08:00', fechamento: '18:00' }
}).setTimezone('America/Sao_Paulo');

// Verificar status
console.log('Está aberto agora:', horario.openedNow);
console.log('Próxima abertura:', horario.proximaAbertura());
console.log('Minutos restantes:', horario.minutosRestantesHoje());
```

## 💡 Exemplos

### Com Feriados
```typescript
import { incluir } from '@phdiniiz/comercialTime';

// Brasil com feriados nacionais e estaduais
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

console.log('Está aberto:', horario.estaAberto());
console.log('Feriados:', horario.obterFeriados().length);
```

### API REST
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

app.get('/status', (req, res) => {
  res.json({
    estaAberto: horario.estaAberto(),
    proximaAbertura: horario.proximaAbertura(),
    minutosRestantes: horario.minutosRestantesHoje()
  });
});
```

### React Hook
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
    const interval = setInterval(atualizarStatus, 60000);

    return () => clearInterval(interval);
  }, [horario]);

  return { horario, status };
}
```

## 🔒 Segurança

- **Rate Limiting** - Controle de volume de requisições
- **Input Validation** - Validação e sanitização de entrada
- **XSS Protection** - Proteção contra ataques XSS
- **DoS Protection** - Proteção contra ataques de negação de serviço

## ⚡ Performance

- **Cache Inteligente** - TTL configurável e limpeza automática
- **ESM Nativo** - Melhor performance em bundlers modernos
- **Zero Dependencies** - Máxima compatibilidade
- **Tree Shaking** - Eliminação de código não utilizado

## 🌍 Compatibilidade

- **Node.js**: >= 22.0.0
- **TypeScript**: >= 5.7.2
- **Frameworks**: Next.js, NestJS, Express.js, Fastify
- **Ambientes**: Node.js, Deno, Bun, Browsers modernos

## 📄 Licença

MIT

## 👨‍💻 Autor

**Pedro Henrique Diniz** - [@PHDiniiz](https://github.com/PHDiniiz)

## 📞 Suporte

- 📖 **Documentação**: [GitHub](https://github.com/phdiniiz/comercialHours)
- 🐛 **Issues**: [GitHub Issues](https://github.com/phdiniiz/comercialHours/issues)
- 💬 **Discussões**: [GitHub Discussions](https://github.com/phdiniiz/comercialHours/discussions)
