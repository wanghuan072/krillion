import styles from "@/src/style/site.module.css";

export function HeightAwareRail({ children, sticky = true }: { children: React.ReactNode; sticky?: boolean }) {
  return <aside className={sticky ? styles.gameRail : `${styles.gameRail} ${styles.gameRailStatic}`}>{children}</aside>;
}
