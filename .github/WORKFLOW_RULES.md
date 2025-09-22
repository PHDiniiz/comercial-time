# Regras de Fluxo de Trabalho

Este documento descreve as regras de fluxo de trabalho implementadas para este repositório, garantindo qualidade, segurança e colaboração eficiente.

## 🔒 Proteção de Branches

### **Branches Protegidas**

- **`main`** (Produção) - Requer aprovação do mantenedor
- **`develop`** (Desenvolvimento) - Requer aprovação do mantenedor

### **Requisitos para Merge**

#### **Branch `main`**
- ✅ Todos os checks devem passar
- ✅ Revisão obrigatória (1 aprovação mínima)
- ✅ Branch deve estar atualizada
- ✅ Sem commits diretos
- ✅ Status checks obrigatórios:
  - Test & Lint
  - Build & Validate
  - Security Scan
  - Code Quality

#### **Branch `develop`**
- ✅ Todos os checks devem passar
- ✅ Revisão obrigatória (1 aprovação mínima)
- ✅ Branch deve estar atualizada
- ✅ Sem commits diretos
- ✅ Status checks obrigatórios:
  - Test & Lint
  - Build & Validate
  - Security Scan

## 🌿 Tipos de Branch Permitidos

### **✅ Branches Permitidas para Contribuidores**

- **`feature/`**: Novas funcionalidades
- **`fix/`**: Correções de bugs
- **`hotfix/`**: Correções críticas para produção
- **`refactor/`**: Refatoração de código
- **`test/`**: Melhorias em testes

### **🔒 Branches Restritas (Apenas Mantenedores)**

- **`release/`**: Preparação de releases
- **`docs/`**: Atualizações de documentação
- **`chore/`**: Tarefas de manutenção
- **`perf/`**: Melhorias de performance
- **`ci/`**: Mudanças em CI/CD
- **`build/`**: Mudanças no sistema de build

### **⚠️ Validação de Tipos de Branch**

O sistema automaticamente valida se o tipo de branch está permitido:
- ✅ Branches permitidas: PR será processado normalmente
- ❌ Branches restritas: PR será rejeitado com mensagem explicativa

## 🚀 Fluxo de Desenvolvimento

### **1. Desenvolvimento de Features**

```bash
# 1. Criar branch a partir de develop
git checkout develop
git pull origin develop
git checkout -b feature/nova-funcionalidade

# 2. Desenvolver e commitar
git add .
git commit -m "feat: adiciona nova funcionalidade"

# 3. Push da branch
git push origin feature/nova-funcionalidade

# 4. Criar Pull Request para develop
```

### **2. Release para Produção**

```bash
# 1. Criar branch de release a partir de develop
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# 2. Preparar release
# - Atualizar CHANGELOG.md
# - Atualizar version no package.json
# - Commitar mudanças

# 3. Push da branch de release
git push origin release/v1.2.0

# 4. Criar Pull Request para main
```

### **3. Hotfixes**

```bash
# 1. Criar branch a partir de main
git checkout main
git pull origin main
git checkout -b hotfix/correcao-critica

# 2. Implementar correção
git add .
git commit -m "fix: corrige problema crítico"

# 3. Push da branch
git push origin hotfix/correcao-critica

# 4. Criar Pull Request para main
```

## 👥 Políticas de Revisão

### **Revisores Obrigatórios**

- **@phdiniiz** - Mantenedor principal
- **Code Owners** - Definidos em `.github/CODEOWNERS`

### **Critérios de Aprovação**

1. **Código**:
   - ✅ Segue os padrões de código definidos
   - ✅ Passa em todos os testes
   - ✅ Não introduz vulnerabilidades de segurança
   - ✅ Documentação atualizada

2. **Funcionalidade**:
   - ✅ Implementa o que foi solicitado
   - ✅ Não quebra funcionalidades existentes
   - ✅ Performance adequada

3. **Qualidade**:
   - ✅ Cobertura de testes adequada
   - ✅ Linting passou
   - ✅ Type checking passou

## 🔄 Auto-Merge

### **Condições para Auto-Merge**

1. **Label `auto-merge`** aplicada
2. **Todos os checks passaram**
3. **Revisão aprovada**
4. **Branch atualizada**

### **Como Usar Auto-Merge**

```bash
# 1. Criar PR normalmente
# 2. Aguardar aprovação
# 3. Aplicar label "auto-merge"
# 4. O PR será mergeado automaticamente quando todos os checks passarem
```

## 🏷️ Labels e Categorização

### **Labels Obrigatórias**

- **Tipo**: `bug`, `enhancement`, `feature`, `hotfix`, `release`
- **Prioridade**: `low`, `medium`, `high`, `critical`
- **Status**: `needs-review`, `approved`, `blocked`, `auto-merge`

### **Labels de Categorização**

- **Área**: `core`, `security`, `performance`, `docs`, `tests`
- **Complexidade**: `simple`, `moderate`, `complex`
- **Breaking**: `breaking-change`, `backward-compatible`

## 🚨 Políticas de Emergência

### **Bypass de Proteções**

Em casos de emergência crítica, o mantenedor pode:

1. **Aplicar label `emergency`**
2. **Bypass temporário das proteções**
3. **Merge direto após correção**
4. **Documentar o motivo no PR**

### **Rollback**

```bash
# 1. Identificar commit problemático
git log --oneline

# 2. Criar branch de rollback
git checkout main
git checkout -b hotfix/rollback-v1.2.0

# 3. Reverter commit
git revert <commit-hash>

# 4. Push e criar PR
git push origin hotfix/rollback-v1.2.0
```

## 📊 Monitoramento

### **Métricas Importantes**

- **Tempo médio de merge**: < 24 horas
- **Taxa de aprovação**: > 95%
- **Taxa de falha em produção**: < 1%
- **Cobertura de testes**: > 80%

### **Alertas**

- **PRs abertos há mais de 48 horas**
- **Falhas em checks críticos**
- **Vulnerabilidades de segurança**
- **Quebras de build**

## 🛠️ Configuração

### **Configuração Automática**

Execute o script de configuração:

```bash
# Configurar proteção de branches automaticamente
./.github/setup-branch-protection.sh
```

### **Configuração Manual**

```bash
# Configurar proteção da branch main
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["Test & Lint","Build & Validate","Security Scan","Code Quality"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":true}' \
  --field restrictions='{"users":[],"teams":[]}' \
  --field allow_force_pushes=false \
  --field allow_deletions=false
```

## 📋 Resumo das Regras

### **✅ Permitido**

- Criar branches a partir de `develop`
- Criar Pull Requests para `develop`
- Criar Pull Requests para `main` (apenas releases)
- Usar auto-merge com label apropriada
- Bypass em emergências (com documentação)

### **❌ Proibido**

- Commits diretos em `main` ou `develop`
- Merge sem aprovação
- Merge sem checks passando
- Merge de branches desatualizadas
- Force push em branches protegidas

### **⚠️ Requer Aprovação**

- Qualquer merge em `main` ou `develop`
- Mudanças em arquivos críticos
- Breaking changes
- Mudanças de segurança

## 🔍 Verificação de Conformidade

### **Checklist para PRs**

- [ ] Branch criada a partir da branch correta
- [ ] Commits seguem padrão conventional
- [ ] Testes passam
- [ ] Linting passou
- [ ] Build passou
- [ ] Documentação atualizada
- [ ] Labels aplicadas
- [ ] Revisão solicitada

### **Checklist para Merge**

- [ ] Todos os checks passaram
- [ ] Revisão aprovada
- [ ] Branch atualizada
- [ ] Sem conflitos
- [ ] Documentação atualizada
- [ ] Changelog atualizado (se aplicável)

---

**📋 Resumo**: Este repositório implementa um sistema robusto de proteção de branches que garante qualidade, segurança e estabilidade do código, permitindo apenas merges aprovados pelo mantenedor principal.
