# 🔄 Guia de Migração do Código Legado

Este documento descreve a migração do código legado para a nova arquitetura modular do `@phdiniiz/comercialTime`.

## 📋 Resumo das Mudanças

### ✅ **Migrações Concluídas**

1. **HorarioComercialFactory** - Migrada para usar a nova arquitetura modular
2. **HorarioComercialUseCase** - Migrada para usar serviços modernos
3. **Imports e Dependências** - Atualizados para remover referências legacy
4. **Testes** - Criados para validar a migração
5. **Exemplos** - Criados para demonstrar o uso da nova arquitetura

### 🏗️ **Arquitetura Anterior vs Nova**

#### **Antes (Legado)**
```typescript
// ❌ Código legado (não recomendado)
import { HorarioComercial } from './legacy/horario-comercial.legacy.js';
import { HorarioComercialFactory } from './presentation/factories/horario-comercial.factory.js';

const legado = new HorarioComercial(horarioComercial, feriados);
const factory = HorarioComercialFactory.create(horarioComercial, feriados);
```

#### **Depois (Moderno)**
```typescript
// ✅ Código moderno (recomendado)
import { HorarioComercialFactory } from './presentation/factories/horario-comercial.factory.js';
import { HorarioComercialUseCaseImpl } from './application/use-cases/horario-comercial.use-case.js';

// Factory moderna com configuração completa
const factory = HorarioComercialFactory.createParaBrasil(horarioComercial, ['SP', 'RJ']);

// Caso de uso moderno
const useCase = HorarioComercialUseCaseImpl.create(horarioComercial, {
  location: "pt-br",
  nacionais: true,
  estaduais: ["SP"],
  fallbackToPtBr: true,
});
```

## 🚀 **Novas Funcionalidades**

### **1. HorarioComercialFactory Modernizada**

```typescript
// Configuração completa
const factory = HorarioComercialFactory.create({
  horarioInput: horarioComercial,
  feriadosConfig: {
    location: "pt-br",
    nacionais: true,
    estaduais: ["SP", "RJ"],
    fallbackToPtBr: true,
  },
  feriadoUpdateConfig: {
    pais: "BR",
    intervaloMinutos: 60,
    timeoutMs: 5000,
  },
});

// Métodos utilitários disponíveis
const infoFeriados = factory.obterInfoFeriados();
const estados = factory.obterEstadosDisponiveis();
const estadoDisponivel = factory.estadoDisponivel("SP");
```

### **2. Métodos de Conveniência**

```typescript
// Para Brasil
const brasil = HorarioComercialFactory.createParaBrasil(horarioComercial, ["SP", "RJ"]);

// Para EUA
const eua = HorarioComercialFactory.createParaEUA(horarioComercial, ["CA", "NY"]);

// Para Portugal
const portugal = HorarioComercialFactory.createParaPortugal(horarioComercial, ["LIS", "POR"]);

// Simplificada
const simples = HorarioComercialFactory.createSimple(horarioComercial, {
  location: "pt-br",
  nacionais: true,
});
```

### **3. HorarioComercialUseCase Modernizado**

```typescript
// Criação com configuração
const useCase = new HorarioComercialUseCaseImpl({
  horarioInput: horarioComercial,
  feriadosConfig: {
    location: "pt-br",
    nacionais: true,
    estaduais: ["SP"],
  },
});

// Métodos básicos (mantidos para compatibilidade)
const estaAberto = useCase.verificarSeEstaAberto();
const proximaAbertura = useCase.obterProximaAbertura();
const proximoFechamento = useCase.obterProximoFechamento();

// Novos métodos avançados
const infoFeriados = useCase.obterInfoFeriados();
const estados = useCase.obterEstadosDisponiveis();
const feriadosNacionais = useCase.obterFeriadosNacionais();
const feriadosEstaduais = useCase.obterFeriadosEstaduais("SP");
const localizacao = useCase.obterLocalizacaoUsada();
const usandoPersonalizados = useCase.estaUsandoFeriadosPersonalizados();
const comercialTime = useCase.obterComercialTime();
```

## 🔧 **Como Migrar Seu Código**

### **Passo 1: Identificar Código Legado**

```typescript
// ❌ Identifique estes padrões em seu código:
import { HorarioComercial } from './legacy/horario-comercial.legacy.js';
const legado = new HorarioComercial(horarioInput, feriados);
```

### **Passo 2: Substituir por Factory Moderna**

```typescript
// ✅ Substitua por:
import { HorarioComercialFactory } from './presentation/factories/horario-comercial.factory.js';

// Para Brasil
const moderno = HorarioComercialFactory.createParaBrasil(horarioInput, ['SP']);

// Para outros países
const moderno = HorarioComercialFactory.createParaEUA(horarioInput, ['CA']);
const moderno = HorarioComercialFactory.createParaPortugal(horarioInput, ['LIS']);
```

### **Passo 3: Usar Casos de Uso para Lógica Complexa**

```typescript
// ✅ Para lógica mais complexa:
import { HorarioComercialUseCaseImpl } from './application/use-cases/horario-comercial.use-case.js';

const useCase = HorarioComercialUseCaseImpl.create(horarioInput, {
  location: "pt-br",
  nacionais: true,
  estaduais: ["SP", "RJ"],
});

// Acessar informações avançadas
const info = useCase.obterInfoFeriados();
console.log(`Total de feriados: ${info.total}`);
console.log(`Nacionais: ${info.nacionais}`);
console.log(`Estaduais: ${info.estaduais}`);
```

## 🧪 **Testes e Validação**

### **Executar Testes de Migração**

```bash
# Teste simples de validação
node examples/simple-migration-test.cjs

# Teste completo (quando disponível)
pnpm test tests/unit/legacy-migration.test.ts
```

### **Exemplo de Teste**

```typescript
import { HorarioComercialFactory } from '../src/index.js';

describe('Migração', () => {
  it('deve criar instância moderna', () => {
    const factory = HorarioComercialFactory.createParaBrasil(horarioComercial);
    
    expect(factory).toBeDefined();
    expect(factory.horarioComercial).toBeDefined();
    expect(factory.comercialTime).toBeDefined();
    expect(factory.useCase).toBeDefined();
  });
});
```

## 📊 **Benefícios da Nova Arquitetura**

### **1. Modularidade**
- Sistema de importação seletiva de feriados
- Suporte a múltiplos países e localizações
- Configuração flexível por país/estado

### **2. Manutenibilidade**
- Separação clara de responsabilidades
- Factory pattern para criação de instâncias
- Casos de uso bem definidos

### **3. Extensibilidade**
- Fácil adição de novos países
- Suporte a feriados personalizados
- Sistema de plugins para funcionalidades extras

### **4. Performance**
- Carregamento otimizado de feriados
- Cache inteligente de dados
- Lazy loading de funcionalidades

### **5. Tipagem**
- TypeScript mais robusto
- Interfaces bem definidas
- Melhor IntelliSense e autocomplete

## 🔄 **Compatibilidade**

### **Código Legado Mantido**
- A classe `HorarioComercial` legado ainda funciona
- Imports antigos continuam funcionando
- Migração gradual é possível

### **Deprecation Warnings**
- Avisos de depreciação em código legado
- Documentação clara sobre alternativas modernas
- Timeline de remoção futura

## 📚 **Recursos Adicionais**

### **Exemplos**
- `examples/legacy-migration-demo.ts` - Demonstração completa
- `examples/simple-migration-test.cjs` - Teste de validação
- `tests/unit/legacy-migration.test.ts` - Testes unitários

### **Documentação**
- `docs/legacy-migration-guide.md` - Este guia
- `README.md` - Documentação principal
- `docs/compatibility-analysis.md` - Análise de compatibilidade

## 🎯 **Próximos Passos**

1. **Migrar código existente** usando este guia
2. **Executar testes** para validar a migração
3. **Atualizar documentação** do projeto
4. **Treinar equipe** na nova arquitetura
5. **Monitorar performance** após migração

## ❓ **Suporte**

Para dúvidas sobre a migração:
- Consulte os exemplos em `examples/`
- Execute os testes em `tests/unit/`
- Verifique a documentação em `docs/`
- Abra uma issue no repositório

---

**🎉 Parabéns! Sua migração para a nova arquitetura está completa!**
