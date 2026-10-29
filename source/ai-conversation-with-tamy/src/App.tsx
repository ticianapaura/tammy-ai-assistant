import ChatScreen from './chat/ChatScreen'
import FlowIndex from './flows/FlowIndex'
import { flows } from './flows/flows'
import { useHash } from './flows/useHash'
import TokensPreview from './TokensPreview'

// #tokens shows the tokens, #<flow id> opens that flow, anything else lists the flows.
function App() {
  const hash = useHash()

  if (hash === 'tokens') return <TokensPreview />

  const flow = flows.find((candidate) => candidate.id === hash)
  if (!flow) return <FlowIndex title="AI conversation with Tammy" flows={flows} />

  // A new key restarts the conversation when switching flows.
  return <ChatScreen key={flow.id} flow={flow} />
}

export default App
