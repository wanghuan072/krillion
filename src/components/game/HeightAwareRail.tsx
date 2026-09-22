import styles from "@/src/style/site.module.css";

export function HeightAwareRail({ children }: { children: React.ReactNode }) {
  return <aside className={styles.gameRail}>{children}</aside>;
}
