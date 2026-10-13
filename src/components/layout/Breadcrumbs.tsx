import styles from "@/src/style/site.module.css";

type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
    <ol>
      {items.map((item, index) => <li key={`${item.label}-${index}`}>
        {item.href ? <a href={item.href}>{item.label}</a> : <span aria-current="page">{item.label}</span>}
      </li>)}
    </ol>
  </nav>;
}
