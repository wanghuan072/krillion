import Link from "next/link";
import styles from "@/src/style/site.module.css";
export default function NotFound() { return <main id="main-content" className={`${styles.container} ${styles.readingPage}`}><h1 className={styles.innerH1}>Page not found</h1><p>The game or Guide at this address is not available.</p><Link href="/">Return home</Link></main>; }
