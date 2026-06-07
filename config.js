/**
 * config.js — CPI/UFRN Solicitação de Demandas
 *
 * ⚠️  ATENÇÃO: Não versione credenciais reais neste arquivo.
 *    Preencha os valores abaixo localmente antes de usar a aplicação.
 *    O token do Trello fica apenas na sua cópia local (não sobe ao GitHub).
 */

const CONFIG = {
  formspree: {
    // Endpoint gerado em formspree.io — pode ser versionado (é público por design)
    endpoint: 'https://formspree.io/f/mvznkark',
  },
  trello: {
    apiKey: 'e38e6349ba550e64519c52d514d9c05d',  // API Key (pública, liberada pelo Trello)
    // ⚠️  Substitua pelo seu token gerado em https://trello.com/app-key
    token: 'SEU_TOKEN_TRELLO_AQUI',
    boardId: '3PuiRvo5',
    listName: '📥 Recebidas',
  },
  app: {
    draftExpiryDays: 30,
    maxWidth: '680px',
  },
};
