#!/bin/bash

# Script para configurar proteção de branches no GitHub
# Execute este script para configurar as regras de proteção automaticamente

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Verificar se GitHub CLI está instalado
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI não está instalado!"
        print_message "Instale o GitHub CLI: https://cli.github.com/"
        exit 1
    fi
    
    # Verificar se está autenticado
    if ! gh auth status &> /dev/null; then
        print_error "GitHub CLI não está autenticado!"
        print_message "Execute: gh auth login"
        exit 1
    fi
    
    print_message "GitHub CLI está instalado e autenticado ✅"
}

# Obter informações do repositório
get_repo_info() {
    REPO_OWNER=$(gh repo view --json owner -q .owner.login)
    REPO_NAME=$(gh repo view --json name -q .name)
    
    print_message "Repositório: $REPO_OWNER/$REPO_NAME"
}

# Configurar proteção da branch main
setup_main_protection() {
    print_header "Configurando proteção da branch MAIN"
    
    gh api repos/$REPO_OWNER/$REPO_NAME/branches/main/protection \
        --method PUT \
        --field required_status_checks='{"strict":true,"contexts":["Test & Lint","Build & Validate","Security Scan","Code Quality"]}' \
        --field enforce_admins=true \
        --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":true}' \
        --field restrictions='{"users":[],"teams":[]}' \
        --field allow_force_pushes=false \
        --field allow_deletions=false
    
    print_message "Proteção da branch main configurada ✅"
}

# Configurar proteção da branch develop
setup_develop_protection() {
    print_header "Configurando proteção da branch DEVELOP"
    
    gh api repos/$REPO_OWNER/$REPO_NAME/branches/develop/protection \
        --method PUT \
        --field required_status_checks='{"strict":true,"contexts":["Test & Lint","Build & Validate","Security Scan"]}' \
        --field enforce_admins=true \
        --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
        --field restrictions='{"users":[],"teams":[]}' \
        --field allow_force_pushes=false \
        --field allow_deletions=false
    
    print_message "Proteção da branch develop configurada ✅"
}

# Criar branch develop se não existir
create_develop_branch() {
    print_header "Verificando branch DEVELOP"
    
    if ! git show-ref --verify --quiet refs/remotes/origin/develop; then
        print_warning "Branch develop não existe, criando..."
        
        # Criar branch develop a partir de main
        git checkout main
        git pull origin main
        git checkout -b develop
        git push origin develop
        
        print_message "Branch develop criada ✅"
    else
        print_message "Branch develop já existe ✅"
    fi
}

# Configurar labels
setup_labels() {
    print_header "Configurando Labels"
    
    # Labels de tipo (permitidas para contribuidores)
    gh label create "bug" --description "Algo não está funcionando" --color "d73a4a" --force
    gh label create "enhancement" --description "Nova feature ou melhoria" --color "a2eeef" --force
    gh label create "feature" --description "Nova funcionalidade" --color "7057ff" --force
    gh label create "hotfix" --description "Correção crítica" --color "ff6b6b" --force
    gh label create "refactor" --description "Refatoração de código" --color "ff9500" --force
    gh label create "test" --description "Melhorias em testes" --color "28a745" --force
    
    # Labels de tipo (restritas para mantenedores)
    gh label create "release" --description "Preparação de release" --color "28a745" --force
    gh label create "docs" --description "Documentação" --color "0075ca" --force
    gh label create "chore" --description "Manutenção" --color "c5def5" --force
    gh label create "perf" --description "Performance" --color "7057ff" --force
    gh label create "ci" --description "CI/CD" --color "f9d0c4" --force
    gh label create "build" --description "Build" --color "f9d0c4" --force
    
    # Labels de prioridade
    gh label create "low" --description "Prioridade baixa" --color "c5def5" --force
    gh label create "medium" --description "Prioridade média" --color "fef2c0" --force
    gh label create "high" --description "Prioridade alta" --color "ffd93d" --force
    gh label create "critical" --description "Prioridade crítica" --color "b60205" --force
    
    # Labels de status
    gh label create "needs-review" --description "Precisa de revisão" --color "fbca04" --force
    gh label create "approved" --description "Aprovado para merge" --color "0e8a16" --force
    gh label create "blocked" --description "Bloqueado" --color "d93f0b" --force
    gh label create "auto-merge" --description "Pode ser mergeado automaticamente" --color "0e8a16" --force
    
    # Labels de área
    gh label create "core" --description "Funcionalidade principal" --color "0052cc" --force
    gh label create "security" --description "Segurança" --color "b60205" --force
    gh label create "performance" --description "Performance" --color "7057ff" --force
    gh label create "docs" --description "Documentação" --color "0075ca" --force
    gh label create "tests" --description "Testes" --color "28a745" --force
    
    # Labels de complexidade
    gh label create "simple" --description "Mudanças simples" --color "c5def5" --force
    gh label create "moderate" --description "Mudanças moderadas" --color "fef2c0" --force
    gh label create "complex" --description "Mudanças complexas" --color "ff6b6b" --force
    
    # Labels de breaking changes
    gh label create "breaking-change" --description "Quebra compatibilidade" --color "b60205" --force
    gh label create "backward-compatible" --description "Compatível com versões anteriores" --color "0e8a16" --force
    
    print_message "Labels configuradas ✅"
}

# Configurar webhooks (opcional)
setup_webhooks() {
    print_header "Configurando Webhooks (Opcional)"
    
    print_warning "Webhooks não são configurados automaticamente"
    print_message "Configure manualmente se necessário:"
    print_message "- Slack notifications"
    print_message "- Discord notifications"
    print_message "- Email notifications"
}

# Verificar configuração
verify_setup() {
    print_header "Verificando Configuração"
    
    # Verificar proteção da branch main
    if gh api repos/$REPO_OWNER/$REPO_NAME/branches/main/protection &> /dev/null; then
        print_message "Proteção da branch main: ✅"
    else
        print_error "Proteção da branch main: ❌"
    fi
    
    # Verificar proteção da branch develop
    if gh api repos/$REPO_OWNER/$REPO_NAME/branches/develop/protection &> /dev/null; then
        print_message "Proteção da branch develop: ✅"
    else
        print_error "Proteção da branch develop: ❌"
    fi
    
    # Verificar labels
    LABEL_COUNT=$(gh label list --json name -q '. | length')
    print_message "Labels configuradas: $LABEL_COUNT"
    
    # Verificar workflows
    WORKFLOW_COUNT=$(gh workflow list --json name -q '. | length')
    print_message "Workflows configurados: $WORKFLOW_COUNT"
}

# Função principal
main() {
    print_header "Configuração de Proteção de Branches"
    print_message "Iniciando configuração..."
    
    check_gh_cli
    get_repo_info
    create_develop_branch
    setup_main_protection
    setup_develop_protection
    setup_labels
    setup_webhooks
    verify_setup
    
    print_header "Configuração Concluída!"
    print_message "✅ Branch protection configurada"
    print_message "✅ Labels configuradas"
    print_message "✅ Workflows configurados"
    print_message ""
    print_message "Próximos passos:"
    print_message "1. Verifique as configurações no GitHub"
    print_message "2. Teste criando um PR"
    print_message "3. Configure notificações se necessário"
    print_message ""
    print_message "Para mais informações, consulte:"
    print_message "- .github/BRANCH_PROTECTION.md"
    print_message "- CONTRIBUTING.md"
}

# Executar função principal
main "$@"
