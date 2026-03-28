

 *ajuste Dashboard
 No arquivo app/page.tsx (seu Dashboard), localize a função principal (Server Component) e adicione a chamada const moodEntries = await getMoodEntries();. Certifique-se de importar getMoodEntries de @/app/actions. Passe esse array moodEntries como prop para o componente de estatísticas ou crie um novo componente chamado MoodHistoryList para listar os últimos registros de humor e energia logo abaixo do resumo diário

 *Ajuste no Relatório Consolidado
 Ajuste no Relatório Consolidado (getFullReportData)Verifique se você realmente atualizou o retorno desta função no actions.ts. Se ela não retornar os dados, o PDF e a View de Relatórios ficarão vazios.Confira se o seu getFullReportData no actions.ts está exatamente assim:TypeScriptexport async function getFullReportData(): Promise<FullReportData> {
  // ... (verificação de sessão)
  const [checkIns, medications, behaviorLogs, moodEntries] = await Promise.all([
    prisma.checkIn.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
    prisma.medication.findMany({ where: { userId }, include: { logs: true } }),
    prisma.behaviorLog.findMany({ where: { userId }, orderBy: { timestamp: 'desc' } }),
    // ESSA LINHA É ESSENCIAL:
    prisma.moodEntry.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 })
  ]);

  return {
    user: { name: session.user.name },
    checkIns,
    medications,
    behaviorLogs,
    moodEntries // CERTIFIQUE-SE DE QUE ESTÁ RETORNANDO AQUI
  };
}
3. Ajuste no Componente de Relatório (ReportPDF.tsx)Se o dado está chegando mas não aparece no PDF, é porque falta o bloco de renderização.Prompt para o assistente de IA:"No arquivo ReportPDF.tsx, adicione uma nova seção chamada 'Histórico de Micro-Ciclos (Humor e Energia)'. Use o dado data.moodEntries para criar uma tabela ou lista cronológica. Cada linha deve exibir: a data/hora, o nível de humor (1-5), o nível de energia (1-10) e a nota rápida. Se a energia for $\leq 2$, renderize o texto em vermelho para destacar o risco de crise para o médico."4. Sincronização de Interface (QuickMoodTracker.tsx)Para que o Dashboard atualize assim que você salva, garanta que a action use o revalidatePath.Prompt de verificação:"No app/actions.ts, verifique a função saveQuickMood. Ela DEVE conter a linha revalidatePath('/'); logo antes do return. Isso força o Next.js a baixar os dados novos para o Dashboard e para o Relatório assim que o registro é fechado."
