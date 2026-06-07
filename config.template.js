/**
 * config.template.js — CPI/UFRN Solicitação de Demandas
 *
 * INSTRUÇÕES:
 *   1. Copie este arquivo e renomeie a cópia para "config.js"
 *   2. Preencha os valores marcados com <SUBSTITUIR>
 *   3. Nunca versione o config.js com valores reais
 *
 * Variáveis de ambiente esperadas:
 *   TRELLO_KEY   → sua API Key do Trello  (https://trello.com/app-key)
 *   TRELLO_TOKEN → seu Token do Trello    (gerado na mesma página)
 */

window.CONFIG = {
  formspree: {
    // Endpoint público do Formspree — pode ser mantido aqui
    endpoint: 'https://formspree.io/f/mvznkark',
  },
  trello: {
    trelloKey:   '<TRELLO_KEY>',    // Substitua pela sua API Key do Trello
    trelloToken: '<TRELLO_TOKEN>',  // Substitua pelo seu Token do Trello
    boardId:     '3PuiRvo5',
    listName:    '📥 Recebidas',
  },
  app: {
    draftExpiryDays: 30,
    maxWidth: '680px',
  },
};
