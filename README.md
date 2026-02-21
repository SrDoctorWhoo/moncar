# Momcar MVP - Documentação de Execução Local

Momcar é um MVP (Minimum Viable Product) focado na conexão de mães que compartilham rotas escolares (Mãetoristas e Passageiras) para facilitar a carona segura.
Esta versão adota uma arquitetura **Full-Stack Next.js (App Router)** unificada.

## 🛠 Pré-requisitos
- Node.js (v18+)
- Docker e Docker-Compose (Para rodar o PostgreSQL)
- NPM ou Yarn

## 🚀 Como Rodar o Projeto

Toda a aplicação agora roda em um único repositório (`frontend`). Banco de dados e Front-end convivem no mesmo ecossistema via Next.js e Prisma.

### 1. Iniciar o Banco de Dados
Na raiz do projeto (`frontend`):
```bash
docker-compose up -d
```
> Isso iniciará um container PostgreSQL na porta `5432`.

### 2. Instalar Dependências
Ainda na pasta `frontend`:
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
O projeto já conta com um arquivo `.env` para rodar localmente. Ele contém a connection string do DB e as URLs do NextAuth.
*(Opcional: Se desejar testar o polígono geográfico do Mapbox, adicione `MAPBOX_ACCESS_TOKEN` no `.env`).*

### 4. Gerar e Popular o Banco de Dados (Seed)
Nós automatizamos as tabelas e usuários de teste. Execute:
```bash
npx prisma generate
npx dotenv-cli -e .env -- prisma db push
npm run prisma:seed
```

### 5. Iniciar Servidor de Desenvolvimento
```bash
npm run dev -- -p 3001
```
Acesse a aplicação no navegador em: **`http://localhost:3001`**

---

## �‍💻 Perfis de Teste Criados no Seed

O banco já roda populado com 3 usuários-chave para você testar a esteira do MVP:

1. **Admin (Dashboard de Aprovação e Gestão)**
   * Email: `admin@momcar.com`
   * Senha: `123456`

2. **Passageira (Busca Ativamente as Corridas)**
   * Email: `maria.passageira@email.com`
   * Senha: `123456`
   * *Status:* Verificada. Tem rotas precadastradas para teste de Match.

3. **Mãetorista (Oferece a Carona)**
   * Email: `joana.motorista@email.com`
   * Senha: `123456`
   * *Status:* Verificada. Tem rota cadastrada para dar Match com a Maria.

### 🧪 Fluxo Recomendado de Validação do MVP

1. **Fluxo Admin e Documentos:** Logue em uma conta nova que você criar em `Registrar-se`. Faça o envio de arquivo no sistema de Documentos. O Admin poderá logar, verificar a CNH, digitar uma justificativa e Aprovar/Recusar, mudando a flag da usuária.
2. **Rotas e Mapbox:** Logue com a Passageira (Maria), vá até Minhas Rotas e simule criar uma origem (sua casa) e destino (escola).
3. **Cálculo Haversine (Match Automático):** Ainda na Maria Passageira, vá no menu `Encontrar Caronas`. O sistema exibirá resultados filtrando Motoristas pela *Fórmula Haversine* (Raio menor que 5Km e intervalo de tempo de +/- 30 minutos na ida/volta).

*Feito por Antigravity* �
