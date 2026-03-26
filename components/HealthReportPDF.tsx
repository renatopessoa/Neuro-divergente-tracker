'use client';

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { FullReportData } from '@/app/actions';

// Registrar fontes para suportar caracteres especiais e visual melhor
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.0.4/Helvetica.ttf' },
    { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.0.4/Helvetica-Bold.ttf', fontWeight: 'bold' },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 50, // Margens adequadas
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#333',
  },
  header: {
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: '#4a90e2',
    paddingBottom: 15,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
    textAlign: 'center',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 10,
    color: '#4a5568',
  },
  section: {
    marginTop: 25,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 12,
    borderBottom: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 4,
  },
  // Estilos da Tabela
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
    minHeight: 25,
    alignItems: 'center',
  },
  tableColHeader: {
    backgroundColor: '#f8f9fa',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    fontWeight: 'bold',
  },
  tableCol: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCellHeader: {
    margin: 4,
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableCell: {
    margin: 4,
    fontSize: 8,
    textAlign: 'center',
  },
  tableCellLeft: {
    margin: 4,
    fontSize: 8,
    textAlign: 'left',
  },
  // Estilo para os cards de comportamento/crise
  behaviorCard: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#edf2f7',
    borderLeftWidth: 4,
    borderLeftColor: '#e53e3e',
  },
  // Fim dos estilos da tabela
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: 'center',
    fontSize: 8,
    color: '#a0aec0',
    borderTop: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  }
});

interface HealthReportPDFProps {
  data: FullReportData;
}

export const HealthReportPDF: React.FC<HealthReportPDFProps> = ({ data }) => {
  const { user, checkIns, medications, behaviorLogs } = data;
  const generationDate = format(new Date(), "dd/MM/yyyy", { locale: ptBR });
  
  // Período do relatório (últimos 30 dias ou baseado nos dados)
  const period = "Últimos 30 dias";

  return (
    <Document title={`Relatório - ${user.name}`}>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho Requisitado */}
        <View style={styles.header}>
          <Text style={styles.mainTitle}>Relatório de Acompanhamento Terapêutico</Text>
          <View style={styles.headerInfo}>
            <View>
              <Text><Text style={{ fontWeight: 'bold' }}>Paciente:</Text> {user.name}</Text>
              <Text><Text style={{ fontWeight: 'bold' }}>Período:</Text> {period}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text><Text style={{ fontWeight: 'bold' }}>Data de Emissão:</Text> {generationDate}</Text>
            </View>
          </View>
        </View>

        {/* Seção de Check-ins em Tabela */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico de Check-ins Diários</Text>
          {checkIns.length > 0 ? (
            <View style={styles.table}>
              {/* Header da Tabela */}
              <View style={styles.tableRow}>
                <View style={[styles.tableColHeader, { width: '15%' }]}>
                  <Text style={styles.tableCellHeader}>Data</Text>
                </View>
                <View style={[styles.tableColHeader, { width: '10%' }]}>
                  <Text style={styles.tableCellHeader}>Humor</Text>
                </View>
                <View style={[styles.tableColHeader, { width: '15%' }]}>
                  <Text style={styles.tableCellHeader}>Sono (h)</Text>
                </View>
                <View style={[styles.tableColHeader, { width: '60%' }]}>
                  <Text style={styles.tableCellHeader}>Sintomas e Observações</Text>
                </View>
              </View>

              {/* Linhas da Tabela */}
              {checkIns.map((check) => (
                <View key={check.id} style={styles.tableRow}>
                  <View style={[styles.tableCol, { width: '15%' }]}>
                    <Text style={styles.tableCell}>
                      {format(new Date(check.date), "dd/MM/yy")}
                    </Text>
                  </View>
                  <View style={[styles.tableCol, { width: '10%' }]}>
                    <Text style={styles.tableCell}>{check.mood}/5</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '15%' }]}>
                    <Text style={styles.tableCell}>{check.sleepHours}h</Text>
                  </View>
                  <View style={[styles.tableCol, { width: '60%' }]}>
                    <Text style={styles.tableCellLeft}>
                      {check.symptoms.join(', ')} 
                      {check.generalNotes ? ` | Obs: ${check.generalNotes}` : ''}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={{ color: '#666', fontStyle: 'italic' }}>Nenhum check-in registrado no período.</Text>
          )}
        </View>

        {/* Seção de Medicamentos Atualizada */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acompanhamento de Medicamentos</Text>
          {medications.length > 0 ? (
            <View style={styles.table}>
              {/* Header da Tabela de Medicamentos */}
              <View style={styles.tableRow}>
                <View style={[styles.tableColHeader, { width: '40%' }]}>
                  <Text style={styles.tableCellHeader}>Medicamento / Dosagem</Text>
                </View>
                <View style={[styles.tableColHeader, { width: '30%' }]}>
                  <Text style={styles.tableCellHeader}>Frequência / Horário</Text>
                </View>
                <View style={[styles.tableColHeader, { width: '30%' }]}>
                  <Text style={styles.tableCellHeader}>Doses Tomadas (30d)</Text>
                </View>
              </View>

              {/* Linhas de Medicamentos */}
              {medications.map((med) => {
                // Calcular doses tomadas nos últimos 30 dias
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                
                const dosesCount = med.logs.filter(log => 
                  new Date(log.date) >= thirtyDaysAgo
                ).length;

                return (
                  <View key={med.id} style={styles.tableRow}>
                    <View style={[styles.tableCol, { width: '40%' }]}>
                      <Text style={[styles.tableCellLeft, { fontWeight: 'bold' }]}>
                        {med.name} ({med.dosage})
                      </Text>
                    </View>
                    <View style={[styles.tableCol, { width: '30%' }]}>
                      <Text style={styles.tableCell}>
                        {med.frequency} às {med.time}
                      </Text>
                    </View>
                    <View style={[styles.tableCol, { width: '30%' }]}>
                      <Text style={[styles.tableCell, { fontWeight: 'bold', color: dosesCount > 0 ? '#2f855a' : '#c53030' }]}>
                        {dosesCount} doses
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={{ color: '#666', fontStyle: 'italic' }}>Nenhum medicamento cadastrado no plano atual.</Text>
          )}
        </View>

        {/* Seção de Eventos (Crises) Atualizada */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seção de Eventos (Crises)</Text>
          {behaviorLogs.length > 0 ? (
            behaviorLogs.map((log) => (
              <View key={log.id} style={styles.behaviorCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5, borderBottom: 1, borderBottomColor: '#edf2f7', paddingBottom: 3 }}>
                  <Text style={{ fontWeight: 'bold', color: '#c53030', fontSize: 10 }}>{log.eventType}</Text>
                  <Text style={{ fontSize: 8, color: '#4a5568' }}>{format(new Date(log.timestamp), "dd/MM/yyyy HH:mm")}</Text>
                </View>

                <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                   <View style={{ width: '50%' }}>
                      <Text style={{ fontSize: 8 }}><Text style={{ fontWeight: 'bold' }}>Intensidade:</Text> {log.intensity}/10</Text>
                   </View>
                   <View style={{ width: '50%' }}>
                      <Text style={{ fontSize: 8 }}><Text style={{ fontWeight: 'bold' }}>Duração estimada:</Text> {log.durationMinutes ? `${log.durationMinutes} min` : 'N/I'}</Text>
                   </View>
                </View>

                {log.description && (
                  <View style={{ marginBottom: 6 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 8, marginBottom: 2, color: '#2d3748' }}>Descrição do Comportamento:</Text>
                    <Text style={{ fontSize: 8, lineHeight: 1.4 }}>{log.description}</Text>
                  </View>
                )}

                <View style={{ flexDirection: 'row' }}>
                  {log.perceivedTriggers.length > 0 && (
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 8, color: '#c53030', marginBottom: 2 }}>Gatilhos Percebidos:</Text>
                      <Text style={{ fontSize: 8 }}>{log.perceivedTriggers.join(', ')}</Text>
                    </View>
                  )}
                  
                  {log.copingStrategies.length > 0 && (
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 8, color: '#2b6cb0', marginBottom: 2 }}>Estratégias de Manejo:</Text>
                      <Text style={{ fontSize: 8 }}>{log.copingStrategies.join(', ')}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          ) : (
            <Text style={{ color: '#666', fontStyle: 'italic' }}>Nenhum evento comportamental ou crise registrado no período.</Text>
          )}
        </View>

        <View style={styles.footer}>
          <Text>Relatório gerado via NeuroTracker - Documento para fins de acompanhamento terapêutico.</Text>
        </View>
      </Page>
    </Document>
  );
};
