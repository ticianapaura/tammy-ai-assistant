import { brand } from '../../../config/brand'
import Banner from '../Banner/Banner'
import styles from './Welcome.module.css'

// Empty state before the first message.
function Welcome() {
  return (
    <div className={styles.welcome}>
      <h2 className={styles.title}>Welcome!</h2>
      <p className={styles.subtitle}>{brand.welcomeSubtitle}</p>
    </div>
  )
}

export function SecurityNotice() {
  return <Banner tone="info">{brand.securityNotice}</Banner>
}

export default Welcome
