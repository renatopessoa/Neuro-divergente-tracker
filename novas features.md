Prompt 1: Adicionar as Novas Actions
"No arquivo app/actions.ts, importe MoodEntry do @prisma/client na linha de importações do Prisma. Em seguida, vá até o final do arquivo e crie duas novas funções exportadas: saveQuickMood e getMoodEntries.
A função saveQuickMood deve receber um objeto { moodLevel: number, energyLevel: number, note?: string }, validar a sessão do usuário com getUserId(), salvar os dados na tabela MoodEntry do Prisma garantindo que os níveis sejam convertidos para Number, e chamar revalidatePath('/'). Retorne { success: true, id: result.id } ou { error: string } em caso de falha.
A função getMoodEntries deve validar o userId e retornar todos os registros de MoodEntry desse usuário, ordenados por createdAt em ordem decrescente."

Prompt 2: Atualizar a Geração de Relatórios
"No arquivo app/actions.ts, localize a interface FullReportData e adicione a propriedade moodEntries: MoodEntry[];.
Em seguida, localize a função getFullReportData. Atualize o Promise.all para incluir uma quarta query: buscar no prisma.moodEntry.findMany todos os registros onde o userId corresponda à sessão e o createdAt seja maior ou igual a thirtyDaysAgo, ordenados por createdAt decrescente. Adicione essa nova resposta da promise à desestruturação (const [checkIns, medications, behaviorLogs, moodEntries]) e retorne moodEntries no objeto final da função."

Prompt 3: Atualizar o Contexto da IA (Insights) e Corrigir Sintaxe
"No arquivo app/actions.ts, localize a função generateHealthInsights. Faça as seguintes alterações:

Logo após buscar behaviorLogs, chame const moodEntries = await getMoodEntries();.

Crie uma constante moodString que pegue os 20 primeiros moodEntries, faça um .map e formate cada um como: 'Hora: [data formatada com dd/MM HH:mm], Humor: [moodLevel]/5, Energia: [energyLevel]/10, Nota: [note]'. Junte tudo com .join('\n').

Corrija o erro de sintaxe na declaração da constante prompt (existem aspas e variáveis soltas causando erro de compilação).

Dentro da string do prompt que será enviada para a OpenAI, adicione uma nova seção chamada 'DADOS DE OSCILAÇÃO INTRA-DIA (Micro-Check-ins):' e injete a variável ${moodString || 'Sem registros.'}.

Adicione uma instrução na seção 'SUA TAREFA' do prompt para que a IA analise especificamente se quedas no nível de 'Energia' coincidem ou precedem as crises descritas no BehaviorLog."

Criar o Componente Visual (QuickMoodTracker.tsx)
"Crie um novo componente de cliente ('use client') em src/components/QuickMoodTracker.tsx (ou na sua pasta de componentes).

Requisitos Visuais e Funcionais:

Importe useState do React e importe a action saveQuickMood do arquivo app/actions.ts.

Importe o motion e AnimatePresence do framer-motion (ou motion/react) e ícones da lucide-react (como BatteryMedium, Zap, Smile, Frown, X).

O estado inicial deve ser apenas um botão flutuante ou um card minimalista escrito 'Como está sua bateria agora?'.

Ao clicar, ele deve expandir (usando animações suaves do Framer Motion) para revelar o mini-formulário.

O Mini-formulário deve conter:

Humor (1 a 5): 5 botões horizontais com emojis ou ícones (ex: muito ruim, ruim, neutro, bom, muito bom). O selecionado deve ficar em destaque com a cor primária do Tailwind (bg-primary-500 e text-white).

Bateria/Energia (1 a 10): Um input do tipo range (slider) estilizado, indo de 1 (Esgotado) a 10 (Totalmente Carregado). Exiba o número atual ao lado ou acima do slider.

Nota (opcional): Um campo de texto pequeno (textarea de 2 linhas) com o placeholder 'O que está consumindo ou recarregando sua bateria? (opcional)'.

Botão de Salvar: Um botão que chama a action saveQuickMood({ moodLevel, energyLevel, note }). Ele deve ter um estado de loading (exibindo um spinner ou mudando o texto para 'Salvando...') enquanto aguarda a resposta do servidor.

Após o sucesso, feche o formulário, mostre um toast ou mensagem de sucesso rápida e resete os estados."

Prompt 2: Integrar o Componente no Dashboard
"No seu arquivo principal do Dashboard (provavelmente app/page.tsx ou o componente que renderiza a aba 'Início'), importe o componente QuickMoodTracker.
Posicione ele em um local estratégico. Sugestão: adicione ele logo abaixo do card de 'Resumo dos Últimos 7 Dias' ou transforme-o em um botão flutuante (fixed bottom-right) para que o usuário possa registrar uma queda de energia de qualquer aba do aplicativo. Certifique-se de que ele não sobreponha a navegação inferior."

Dica de UX para esse componente:
Como o objetivo é registrar a variação de energia ao longo do dia, garanta que o botão seja muito fácil de alcançar no celular (próximo à área do polegar). O uso do slider para a "bateria" é ótimo porque exige apenas um movimento de deslizar, o que é muito mais fácil do que digitar quando se está entrando em sobrecarga.

Após testar o componente na tela, você vai começar a popular a tabela MoodEntry. O próximo passo lógico seria plotar isso em um gráfico de dispersão (Scatter Plot) na aba de Relatórios.