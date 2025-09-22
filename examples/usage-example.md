# Exemplo de Uso do Módulo @phdiniiz/comercialTime

## 1. Instalação

```bash
npm install @phdiniiz/comercialTime
```

## 2. Configuração do Timezone

### Opção A: Arquivo .env (Recomendado)

Crie um arquivo `.env` na raiz do seu projeto:

```env
# .env
TIMEZONE=America/Sao_Paulo
```

### Opção B: Variável de Ambiente

```bash
# Linux/Mac
export TIMEZONE=America/Sao_Paulo

# Windows
set TIMEZONE=America/Sao_Paulo
```

## 3. Uso no Código

```typescript
// index.ts
import { HorarioComercial, getCurrentTimezone } from '@phdiniiz/comercialTime';

// Verificar timezone configurado
console.log('Timezone atual:', getCurrentTimezone());

// Configurar horário comercial
const horario = new HorarioComercial({
  segunda: { abertura: "08:00", fechamento: "18:00" },
  terca: { abertura: "08:00", fechamento: "18:00" },
  quarta: { abertura: "08:00", fechamento: "18:00" },
  quinta: { abertura: "08:00", fechamento: "18:00" },
  sexta: { abertura: "08:00", fechamento: "18:00" },
  sabado: { abertura: "09:00", fechamento: "13:00" },
  domingo: [] // Fechado
}, [
  "2024-01-01", // Ano Novo
  "2024-12-25"  // Natal
]);

// Verificar se está aberto
const aberto = horario.estaAberto();
console.log('Está aberto agora?', aberto);

// Próxima abertura
const proximaAbertura = horario.proximaAbertura();
console.log('Próxima abertura:', proximaAbertura);

// Adicionar 2 horas úteis
const novaData = horario.adicionarMinutosUteis(new Date(), 120);
console.log('Nova data (+2h úteis):', novaData);
```

## 4. Diferentes Cenários de Deploy

### Desenvolvimento Local
```bash
# .env
TIMEZONE=America/Sao_Paulo
npm run dev
```

### Produção (Vercel)
```json
// vercel.json
{
  "env": {
    "TIMEZONE": "America/Sao_Paulo"
  }
}
```

### Produção (Heroku)
```bash
heroku config:set TIMEZONE=America/Sao_Paulo
```

### Docker
```dockerfile
FROM node:18
COPY . .
ENV TIMEZONE=America/Sao_Paulo
RUN npm install
CMD ["npm", "start"]
```

## 5. Fallback Automático

Se não configurar o TIMEZONE, o módulo usa automaticamente:
- `America/Sao_Paulo` como fallback
- Com aviso no console

```typescript
// Sem configuração - usa fallback
import { getCurrentTimezone } from '@phdiniiz/comercialTime';
console.log(getCurrentTimezone()); // "America/Sao_Paulo"
```
