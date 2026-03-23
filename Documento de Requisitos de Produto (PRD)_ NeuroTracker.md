# Documento de Requisitos de Produto (PRD): NeuroTracker

## 1. Introdução

### 1.1. Propósito do Documento
Este Documento de Requisitos de Produto (PRD) detalha as funcionalidades, objetivos e requisitos técnicos do **NeuroTracker**, uma aplicação web projetada para auxiliar indivíduos neurodivergentes no acompanhamento de seu bem-estar diário, identificação de padrões e gerenciamento de desregulações. Ele serve como um guia para o desenvolvimento contínuo do produto, garantindo que todas as partes interessadas tenham uma compreensão clara do que será construído e por quê.

### 1.2. Visão Geral do Produto
O NeuroTracker é uma ferramenta digital que permite aos usuários registrar informações cruciais sobre seu estado físico e mental, como humor, dor, sono, dieta, sintomas e uso de medicamentos. A aplicação se destaca pela sua capacidade de, através de Inteligência Artificial (IA), analisar esses dados e fornecer insights personalizados sobre padrões, gatilhos e estratégias de regulação eficazes. Com a adição recente de funcionalidades de rastreamento de comportamento e desregulação, o NeuroTracker visa capacitar os usuários a compreenderem melhor as causas de suas crises e desregulações, promovendo maior autoconhecimento e bem-estar.

### 1.3. Público-Alvo
O público-alvo principal são **indivíduos neurodivergentes** (como pessoas com TEA, TDAH, dislexia, etc.) que buscam uma ferramenta para:
*   Monitorar seu bem-estar diário de forma estruturada.
*   Identificar gatilhos e padrões que afetam seu estado emocional e físico.
*   Gerenciar o uso de medicamentos e registrar sua eficácia.
*   Obter insights personalizados para melhorar a qualidade de vida.
*   Compartilhar informações relevantes com profissionais de saúde (terapeutas, médicos) para um acompanhamento mais eficaz.

### 1.4. Objetivos do Produto
*   **Capacitar o Autoconhecimento:** Fornecer aos usuários ferramentas para registrar e visualizar dados sobre seu bem-estar, ajudando-os a entender melhor a si mesmos.
*   **Identificar Padrões e Gatilhos:** Utilizar IA para analisar dados e revelar correlações entre fatores diários (sono, dieta, atividades) e eventos de desregulação ou crises.
*   **Promover Estratégias de Regulação:** Sugerir e acompanhar a eficácia de estratégias de coping para gerenciar desregulações.
*   **Facilitar a Comunicação com Profissionais:** Gerar relatórios compreensíveis que podem ser compartilhados com médicos e terapeutas.
*   **Oferecer uma Experiência de Usuário Intuitiva:** Desenvolver uma interface limpa, responsiva e fácil de usar, considerando as necessidades de acessibilidade do público neurodivergente.

## 2. Escopo do Produto

O NeuroTracker abrange as seguintes funcionalidades principais:

### 2.1. Funcionalidades Atuais
*   **Autenticação de Usuário:** Registro e login seguro de usuários.
*   **Dashboard:** Visão geral do dia atual, status do check-in e medicamentos.
*   **Check-in Diário:** Registro de humor, nível de dor, horas e qualidade do sono, notas sobre dieta e sintomas.
*   **Gerenciamento de Medicamentos:** Adicionar, visualizar e remover medicamentos, com registro de tomada diária.
*   **Insights com IA:** Geração de análises e recomendações baseadas nos dados de check-in.
*   **Relatórios:** Visualização gráfica de tendências de bem-estar ao longo do tempo.

### 2.2. Novas Funcionalidades (Rastreamento de Comportamento e Desregulação)
*   **Registro Detalhado de Eventos:** Capacidade de registrar eventos específicos de desregulação, gatilhos ou crises.
*   **Identificação de Gatilhos:** Seleção de gatilhos comuns e adição de gatilhos personalizados.
*   **Avaliação de Intensidade e Duração:** Registro da intensidade do evento e sua duração.
*   **Estratégias de Regulação:** Registro das estratégias utilizadas para lidar com o evento.
*   **Notas Contextuais:** Campo para adicionar detalhes e observações sobre o evento.
*   **Análise de IA Aprimorada:** Integração dos dados de comportamento na geração de insights, permitindo a identificação de padrões mais complexos e correlações entre gatilhos, estratégias e o bem-estar geral.

## 3. Funcionalidades Detalhadas

### 3.1. Autenticação e Gerenciamento de Usuários
*   **Login/Registro:** Usuários podem criar uma conta com e-mail e senha, ou fazer login em uma conta existente. O sistema deve garantir a segurança das credenciais.
*   **Proteção de Rotas:** Todas as funcionalidades principais da aplicação são protegidas, exigindo autenticação para acesso. Apenas a página de login/registro é acessível publicamente.
*   **Sessão de Usuário:** Gerenciamento de sessão persistente via JWT (JSON Web Tokens).

### 3.2. Dashboard
*   **Visão Geral:** Exibe um resumo do dia atual, incluindo o status do check-in diário e os medicamentos programados.
*   **Navegação Rápida:** Permite acesso rápido às outras seções da aplicação.

### 3.3. Check-in Diário
*   **Formulário Intuitivo:** Interface para registrar:
    *   **Humor:** Escala de 1 a 5 (Muito Ruim a Muito Bom).
    *   **Nível de Dor:** Escala de 0 a 10.
    *   **Sono:** Horas de sono e qualidade (Escala de 1 a 5).
    *   **Dieta e Gatilhos:** Campo de texto livre para notas sobre alimentação e possíveis gatilhos percebidos.
    *   **Sintomas Específicos:** Campo de texto para listar sintomas separados por vírgula.
    *   **Notas Gerais:** Campo de texto livre para observações adicionais.
*   **Persistência:** Os dados são salvos no banco de dados via Server Actions.

### 3.4. Gerenciamento de Medicamentos
*   **Lista de Medicamentos:** Exibe todos os medicamentos cadastrados pelo usuário.
*   **Adicionar Medicamento:** Formulário para registrar nome, dosagem, frequência e horário de tomada.
*   **Marcar como Tomado:** Opção para registrar a tomada de um medicamento no dia atual.
*   **Remover Medicamento:** Funcionalidade para excluir medicamentos da lista.
*   **Persistência:** Os dados são salvos no banco de dados via Server Actions.

### 3.5. Rastreamento de Comportamento e Desregulação (NOVO)
*   **Tipo de Evento:** Seleção entre "Desregulação", "Gatilho" ou "Crise".
*   **Descrição do Evento:** Campo de texto livre para descrever o que aconteceu, como o usuário se sentiu e o contexto.
*   **Gatilhos Percebidos:**
    *   Lista de gatilhos comuns (ex: Barulho alto, Multidão, Mudança de rotina, Falta de sono, Pressão social, Luz intensa, Cheiros fortes, Fome/Fadiga, Estresse, Sobrecarga sensorial, etc.) para seleção rápida.
    *   Opção para adicionar gatilhos personalizados.
*   **Intensidade:** Escala de 0 a 10 para avaliar a intensidade do evento.
*   **Duração:** Campo numérico para registrar a duração do evento em minutos.
*   **Estratégias de Regulação:**
    *   Lista de estratégias comuns (ex: Respiração profunda, Isolamento temporário, Música, Meditação, Conversa, Mudança de ambiente, etc.) para seleção rápida.
    *   Opção para adicionar estratégias personalizadas.
*   **Notas Adicionais:** Campo de texto livre para qualquer observação extra.
*   **Persistência:** Os dados são salvos no banco de dados via Server Actions.

### 3.6. Insights com IA
*   **Análise Abrangente:** A IA (Google Gemini) analisa os dados dos últimos 14 dias de check-ins e os registros de comportamento para identificar padrões.
*   **Resumo do Bem-Estar:** Fornece um resumo encorajador do estado geral do usuário.
*   **Identificação de Padrões/Gatilhos:** Destaca correlações entre eventos diários (sono, dieta, sintomas) e os eventos de desregulação/crise, como "Barulho alto frequentemente leva a desregulação" ou "Falta de sono correlaciona com maior intensidade de crises".
*   **Estratégias Eficazes:** Identifica quais estratégias de regulação parecem ser mais eficazes para o usuário.
*   **Recomendações Personalizadas:** Oferece recomendações práticas para prevenir ou gerenciar futuras desregulações.
*   **Aviso de Saúde Mental:** Inclui um lembrete de que os insights não substituem o aconselhamento médico profissional.

### 3.7. Relatórios
*   **Visualização Gráfica:** Exibe gráficos de linha para tendências de dor vs. humor e gráficos de barra para duração do sono nos últimos 14 dias (utilizando Recharts).
*   **Estatísticas Resumidas:** Apresenta médias de dor, sono e contagem de registros.
*   **Sintoma Mais Comum:** (A ser implementado dinamicamente) Identifica o sintoma mais frequente com base nos registros.
*   **Exportação de PDF:** (A ser implementado) Funcionalidade para exportar os relatórios para PDF.

## 4. Requisitos Técnicos

### 4.1. Stack Tecnológica
*   **Frontend:** Next.js 15 (App Router), React 19, TypeScript.
*   **Estilização:** Tailwind CSS 4, PostCSS, `tailwind-merge`, `clsx`.
*   **Gerenciamento de Estado/Dados:** Server Actions do Next.js, `useSession` (NextAuth.js).
*   **Animações:** Motion (Framer Motion).
*   **Ícones:** Lucide React.
*   **Gerenciamento de Datas:** `date-fns`.
*   **Gráficos:** Recharts.
*   **Inteligência Artificial:** SDK do Google GenAI (`@google/genai`) para integração com o modelo Gemini (atualmente `gemini-1.5-flash`).

### 4.2. Arquitetura
*   **Full-stack Framework:** Next.js, utilizando Server Components e Client Components conforme apropriado.
*   **Backend:** Server Actions para lógica de negócio e interação com o banco de dados.
*   **Autenticação:** NextAuth.js com `CredentialsProvider` para login/registro.
*   **Middleware:** Proteção de rotas via `middleware.ts`.

### 4.3. Banco de Dados
*   **Provedor:** PostgreSQL.
*   **ORM:** Prisma (v7.5.0) com `@prisma/adapter-pg`.
*   **Modelos de Dados:**
    *   `User`: `id`, `name`, `email` (único), `passwordHash`, `role` (ADMIN por padrão), `createdAt`, `updatedAt`.
    *   `CheckIn`: `id`, `date`, `mood`, `painLevel`, `sleepHours`, `sleepQuality`, `dietNotes`, `symptoms` (array), `generalNotes`, `createdAt`, `userId` (FK para User).
    *   `Medication`: `id`, `name`, `dosage`, `frequency`, `time`, `createdAt`, `userId` (FK para User).
    *   `MedLog`: `id`, `date`, `taken`, `medId` (FK para Medication).
    *   `BehaviorLog` (NOVO): `id`, `userId` (FK para User), `timestamp`, `eventType`, `description`, `perceivedTriggers` (array), `intensity`, `durationMinutes`, `copingStrategies` (array), `notes`, `createdAt`.

### 4.4. Segurança
*   **Autenticação Segura:** Uso de `bcrypt` para hash de senhas.
*   **Proteção de Chaves de API:** A chave de API do Google Gemini (`NEXT_PUBLIC_GEMINI_API_KEY`) **DEVE** ser movida para o backend (Server Actions ou Route Handlers) e tratada como uma variável de ambiente de servidor (`NEXT_GEMINI_API_KEY`) para evitar exposição no cliente.

## 5. Casos de Uso / User Stories

### 5.1. Autenticação
*   **US-1.1 (Registro):** Como um novo usuário, quero me registrar com e-mail e senha para acessar a aplicação.
*   **US-1.2 (Login):** Como um usuário existente, quero fazer login com minhas credenciais para acessar meus dados.
*   **US-1.3 (Proteção de Acesso):** Como um usuário não autenticado, não consigo acessar as páginas internas da aplicação.

### 5.2. Check-in Diário
*   **US-2.1 (Registrar Check-in):** Como usuário, quero registrar meu humor, dor, sono, dieta e sintomas diariamente para acompanhar meu bem-estar.
*   **US-2.2 (Visualizar Check-in):** Como usuário, quero ver o status do meu check-in diário no dashboard.

### 5.3. Gerenciamento de Medicamentos
*   **US-3.1 (Adicionar Medicamento):** Como usuário, quero adicionar novos medicamentos com detalhes de dosagem, frequência e horário.
*   **US-3.2 (Marcar Tomado):** Como usuário, quero marcar um medicamento como tomado para o dia atual.
*   **US-3.3 (Remover Medicamento):** Como usuário, quero remover um medicamento que não utilizo mais.

### 5.4. Rastreamento de Comportamento e Desregulação (NOVO)
*   **US-4.1 (Registrar Evento):** Como usuário, quero registrar um evento de desregulação, gatilho ou crise, incluindo sua descrição, intensidade e duração.
*   **US-4.2 (Identificar Gatilhos):** Como usuário, quero selecionar gatilhos comuns ou adicionar gatilhos personalizados associados a um evento.
*   **US-4.3 (Registrar Estratégias):** Como usuário, quero registrar as estratégias de regulação que utilizei durante ou após um evento.
*   **US-4.4 (Notas Adicionais):** Como usuário, quero adicionar notas livres para contextualizar melhor o evento.

### 5.5. Insights com IA
*   **US-5.1 (Gerar Insights):** Como usuário, quero que a IA analise meus check-ins e registros de comportamento para identificar padrões e gatilhos.
*   **US-5.2 (Receber Recomendações):** Como usuário, quero receber recomendações personalizadas da IA para gerenciar meu bem-estar.

### 5.6. Relatórios
*   **US-6.1 (Visualizar Tendências):** Como usuário, quero ver gráficos de tendências de humor, dor e sono ao longo do tempo.
*   **US-6.2 (Ver Resumo):** Como usuário, quero ver um resumo estatístico dos meus dados de bem-estar.
*   **US-6.3 (Exportar Relatório - FUTURO):** Como usuário, quero exportar meus relatórios para PDF para compartilhar com profissionais de saúde.

## 6. Próximos Passos e Recomendações

Para aprimorar ainda mais o NeuroTracker, as seguintes ações são recomendadas:

1.  **Prioridade Máxima: Mover a Chave de API do Gemini para o Backend:** É crucial que a chamada à API do Google Gemini seja feita a partir de uma Server Action ou Route Handler, e que a `NEXT_PUBLIC_GEMINI_API_KEY` seja convertida para uma variável de ambiente de servidor (`NEXT_GEMINI_API_KEY`) para proteger a chave e evitar exposição no cliente.
2.  **Otimizar Atualizações de Estado:** Substituir o uso de `window.location.reload()` por atualizações de estado mais reativas no frontend. Isso pode ser alcançado com o uso de `revalidatePath` de forma mais granular, `useSWR`, `React Query` ou gerenciamento de estado local para atualizar a UI sem recarregar a página inteira, melhorando a experiência do usuário.
3.  **Implementar Análise Dinâmica de Sintomas:** Na `ReportsView.tsx`, o "Sintoma Mais Comum" deve ser calculado dinamicamente a partir dos `symptoms` registrados nos `CheckIn`s, em vez de ser um valor hardcoded.
4.  **Implementar Exportação de PDF:** Desenvolver a funcionalidade de exportação de relatórios para PDF, permitindo que os usuários gerem documentos para compartilhar com profissionais de saúde. Isso pode envolver bibliotecas de geração de PDF no servidor.
5.  **Reavaliar Modelos de Dados (Multi-paciente):** Confirmar se a intenção é que o aplicativo seja um rastreador pessoal ou um sistema que permita a um usuário (ex: terapeuta) acompanhar múltiplos pacientes. Se for o segundo caso, os modelos `Patient`, `SensoryProfile`, `Session` e `BehaviorLog` da análise inicial precisam ser reintroduzidos e integrados à interface e lógica de negócio.
6.  **Testes Abrangentes:** Implementar testes unitários e de integração para as Server Actions, componentes críticos e lógica de IA para garantir a robustez e confiabilidade da aplicação.
7.  **Acessibilidade:** Continuar aprimorando a acessibilidade da interface, considerando as diversas necessidades do público neurodivergente (ex: modos de contraste, fontes amigáveis para dislexia, controle de animações).

Este PRD servirá como base para o desenvolvimento contínuo do NeuroTracker, garantindo que o produto evolua de forma estratégica e atenda às necessidades de seus usuários. 
