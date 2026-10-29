// White-label settings. Every component reads the assistant's name, links and
// copy from here, so a new merchant only changes this file and tokens.css.

const assistantName = 'Tammy'

export const brand = {
  assistantName,
  supportHubUrl: '#support-hub', // TODO: the merchant's Support Hub URL
  maxMessageLength: 200,
  placeholders: {
    welcome: `What would you like to ask to ${assistantName}?`,
    conversation: 'Type...',
    waitingForAgent: 'Share more details about your issue...',
    feedback: 'Share your thoughts...',
  },
  welcomeSubtitle: `I’m ${assistantName}, your AI assistant, how can I help you today?`,
  securityNotice: `For your security, avoid sharing sensitive information. ${assistantName} can’t access account details. For support requests, visit the Support Hub.`,
}
