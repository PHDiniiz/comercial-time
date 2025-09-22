# Regras de Tipos de Branch

Este documento descreve as regras específicas para tipos de branch permitidos e restritos neste repositório.

## ✅ Tipos de Branch Permitidos para Contribuidores

Os seguintes tipos de branch são **permitidos** para todos os contribuidores:

### **`feature/`** - Novas Funcionalidades
- **Uso**: Para implementar novas funcionalidades
- **Exemplo**: `feature/suporte-timezone`, `feature/cache-feriados`
- **Target**: `develop`
- **Commit Pattern**: `feat: adiciona nova funcionalidade`

### **`fix/`** - Correções de Bugs
- **Uso**: Para corrigir bugs e problemas
- **Exemplo**: `fix/validacao-horario`, `fix/memory-leak`
- **Target**: `develop`
- **Commit Pattern**: `fix: corrige problema específico`

### **`hotfix/`** - Correções Críticas
- **Uso**: Para correções críticas que precisam ir direto para produção
- **Exemplo**: `hotfix/vulnerabilidade-seguranca`, `hotfix/crash-critico`
- **Target**: `main`
- **Commit Pattern**: `fix: corrige problema crítico`

### **`refactor/`** - Refatoração
- **Uso**: Para refatorar código sem mudar funcionalidade
- **Exemplo**: `refactor/clean-architecture`, `refactor/performance`
- **Target**: `develop`
- **Commit Pattern**: `refactor: melhora estrutura do código`

### **`test/`** - Melhorias em Testes
- **Uso**: Para adicionar ou melhorar testes
- **Exemplo**: `test/cobertura-completa`, `test/integration-tests`
- **Target**: `develop`
- **Commit Pattern**: `test: adiciona testes para funcionalidade`

## 🔒 Tipos de Branch Restritos (Apenas Mantenedores)

Os seguintes tipos de branch são **restritos** apenas para mantenedores:

### **`release/`** - Preparação de Releases
- **Uso**: Para preparar releases e versões
- **Exemplo**: `release/v1.2.0`, `release/stable`
- **Target**: `main`
- **Restrição**: Apenas @phdiniiz

### **`docs/`** - Documentação
- **Uso**: Para atualizações de documentação
- **Exemplo**: `docs/api-reference`, `docs/installation-guide`
- **Target**: `develop`
- **Restrição**: Apenas @phdiniiz

### **`chore/`** - Manutenção
- **Uso**: Para tarefas de manutenção e configuração
- **Exemplo**: `chore/update-dependencies`, `chore/cleanup`
- **Target**: `develop`
- **Restrição**: Apenas @phdiniiz

### **`perf/`** - Performance
- **Uso**: Para melhorias de performance
- **Exemplo**: `perf/optimize-cache`, `perf/reduce-memory`
- **Target**: `develop`
- **Restrição**: Apenas @phdiniiz

### **`ci/`** - CI/CD
- **Uso**: Para mudanças em CI/CD e workflows
- **Exemplo**: `ci/github-actions`, `ci/deployment`
- **Target**: `develop`
- **Restrição**: Apenas @phdiniiz

### **`build/`** - Build
- **Uso**: Para mudanças no sistema de build
- **Exemplo**: `build/webpack-config`, `build/typescript`
- **Target**: `develop`
- **Restrição**: Apenas @phdiniiz

## 🚫 Tipos de Branch Inválidos

Qualquer tipo de branch que não esteja na lista acima será considerado **inválido** e rejeitado automaticamente.

### Exemplos de Tipos Inválidos:
- `update/` - Use `feature/` ou `fix/`
- `improve/` - Use `feature/` ou `refactor/`
- `add/` - Use `feature/`
- `remove/` - Use `refactor/`
- `change/` - Use `feature/` ou `fix/`

## 🔄 Validação Automática

O sistema GitHub Actions valida automaticamente os tipos de branch:

### **Validação de Contribuidores**
```yaml
# Tipos permitidos para contribuidores
ALLOWED_BRANCH_TYPES=("feature" "fix" "hotfix" "refactor" "test")
```

### **Validação de Mantenedores**
```yaml
# Tipos restritos (apenas mantenedores)
RESTRICTED_BRANCH_TYPES=("release" "docs" "chore" "perf" "ci" "build")
```

### **Verificação de Autor**
```yaml
# Verificar se o autor é mantenedor
AUTHOR="${{ github.event.pull_request.user.login }}"
MAINTAINER="phdiniiz"
```

## 📋 Fluxo de Validação

### **1. Criação de PR**
1. Sistema verifica o tipo da branch
2. Sistema verifica se o autor é mantenedor
3. Sistema aplica regras apropriadas

### **2. Tipos Permitidos**
- ✅ PR é processado normalmente
- ✅ Checks de qualidade são executados
- ✅ Revisão é solicitada

### **3. Tipos Restritos (Contribuidor)**
- ❌ PR é rejeitado com comentário explicativo
- ❌ Instruções de correção são fornecidas
- ❌ Sugestões de tipos alternativos

### **4. Tipos Restritos (Mantenedor)**
- ✅ PR é processado normalmente
- ✅ Checks de qualidade são executados
- ✅ Revisão é solicitada

### **5. Tipos Inválidos**
- ❌ PR é rejeitado com comentário explicativo
- ❌ Lista de tipos válidos é fornecida
- ❌ Instruções de correção são fornecidas

## 🔧 Como Corrigir Branch Inválida

### **Opção 1: Renomear Branch**
```bash
# Renomear branch existente
git branch -m branch-invalida feature/nova-funcionalidade
git push origin feature/nova-funcionalidade
git push origin --delete branch-invalida
```

### **Opção 2: Criar Nova Branch**
```bash
# Criar nova branch com tipo válido
git checkout develop
git pull origin develop
git checkout -b feature/nova-funcionalidade
git cherry-pick <commit-hash>
```

### **Opção 3: Usar GitHub CLI**
```bash
# Renomear branch via GitHub CLI
gh api repos/:owner/:repo/branches/branch-invalida/rename \
  --method POST \
  --field new_name=feature/nova-funcionalidade
```

## 📊 Estatísticas de Validação

### **Métricas Importantes**
- **Taxa de rejeição**: < 5%
- **Tempo médio de correção**: < 2 horas
- **Taxa de sucesso após correção**: > 95%

### **Alertas**
- **Branches inválidas frequentes**: Notificar contribuidor
- **Tentativas de bypass**: Notificar mantenedor
- **Padrões inconsistentes**: Revisar documentação

## 🎯 Exemplos Práticos

### **✅ Exemplos Válidos**
```bash
# Feature
git checkout -b feature/suporte-timezone
git checkout -b feature/cache-inteligente

# Fix
git checkout -b fix/validacao-horario
git checkout -b fix/memory-leak

# Hotfix
git checkout -b hotfix/vulnerabilidade-seguranca
git checkout -b hotfix/crash-critico

# Refactor
git checkout -b refactor/clean-architecture
git checkout -b refactor/performance

# Test
git checkout -b test/cobertura-completa
git checkout -b test/integration-tests
```

### **❌ Exemplos Inválidos**
```bash
# Tipos não reconhecidos
git checkout -b update/dependencies
git checkout -b improve/performance
git checkout -b add/new-feature
git checkout -b remove/old-code
git checkout -b change/config
```

### **🔒 Exemplos Restritos (Apenas Mantenedores)**
```bash
# Release
git checkout -b release/v1.2.0
git checkout -b release/stable

# Docs
git checkout -b docs/api-reference
git checkout -b docs/installation-guide

# Chore
git checkout -b chore/update-dependencies
git checkout -b chore/cleanup

# Perf
git checkout -b perf/optimize-cache
git checkout -b perf/reduce-memory

# CI
git checkout -b ci/github-actions
git checkout -b ci/deployment

# Build
git checkout -b build/webpack-config
git checkout -b build/typescript
```

## 🚨 Políticas de Emergência

### **Bypass Temporário**
Em casos de emergência crítica, o mantenedor pode:

1. **Aplicar label `emergency`**
2. **Bypass temporário das validações**
3. **Processar PR normalmente**
4. **Documentar o motivo**

### **Exceções**
- **Segurança crítica**: Bypass automático
- **Produção down**: Bypass automático
- **Vulnerabilidade**: Bypass automático

## 📚 Recursos Adicionais

### **Documentação Relacionada**
- [Regras de Fluxo de Trabalho](WORKFLOW_RULES.md)
- [Guia de Contribuição](../CONTRIBUTING.md)
- [Proteção de Branches](BRANCH_PROTECTION.md)

### **Ferramentas**
- [GitHub CLI](https://cli.github.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)

---

**📋 Resumo**: Este repositório implementa um sistema rigoroso de validação de tipos de branch que garante organização, segurança e controle de qualidade, permitindo apenas tipos específicos para contribuidores e mantendo controle total para o mantenedor.
