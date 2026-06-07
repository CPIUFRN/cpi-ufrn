/**
 * config.js — CPI/UFRN Solicitação de Demandas
 *
 * ✅ Este arquivo é versionado com valores seguros.
 *    O TRELLO_TOKEN é o único campo sensível — preencha-o localmente
 *    ou via painel do Vercel (Environment Variables) antes do deploy.
 *
 *    Como gerar o token: https://trello.com/app-key → "Generate a Token"
 */

window.CONFIG = {
  formspree: {
    // Endpoint público — seguro para versionar
    endpoint: 'https://formspree.io/f/mvznkark',
  },
  trello: {
    // API Key pública do Trello (não é segredo — é como um "app ID")
    trelloKey: 'e38e6349ba550e64519c52d514d9c05d',
    // ⚠️  Substitua pelo token real antes de usar (não versionar com valor real)
    trelloToken: 'SEU_TOKEN_TRELLO_AQUI',
    boardId: '3PuiRvo5',
    listName: '📥 Recebidas',
  },
  app: {
    draftExpiryDays: 30,
    maxWidth: '680px',
  },
};
