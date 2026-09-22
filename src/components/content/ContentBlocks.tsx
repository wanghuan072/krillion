import Image from "next/image";
import type { ContentBlock } from "@/src/types/game";
import styles from "@/src/style/site.module.css";

export function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return <>{blocks.map((block, index) => {
    const key = `${block.type}-${index}`;
    if (block.type === "paragraph") return <p key={key}>{block.text}</p>;
    if (block.type === "image") return <figure key={key} className={styles.figure}><Image src={block.src} alt={block.alt} width={block.width ?? 1280} height={block.height ?? 720} loading="lazy"/>{block.caption && <figcaption>{block.caption}</figcaption>}</figure>;
    if (block.type === "list") { const Tag = block.style === "ordered" ? "ol" : "ul"; return <Tag key={key}>{block.items.map((item) => <li key={item}>{item}</li>)}</Tag>; }
    if (block.type === "steps") return <ol key={key} className={styles.steps}>{block.items.map((item) => <li key={item.title}><strong>{item.title}</strong><p>{item.body}</p></li>)}</ol>;
    if (block.type === "callout") return <aside key={key} className={styles.callout} data-tone={block.tone}><strong>{block.label ?? (block.tone === "warning" ? "Watch for this" : "Player tip")}</strong><p>{block.body}</p></aside>;
    if (block.type === "table") return <div key={key} className={styles.tableWrap}><table><thead><tr>{block.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{block.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>)}</tr>)}</tbody></table></div>;
    if (block.type === "faq") return <div key={key} className={styles.faq}>{block.items.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>;
    if (block.type === "video") return null;
    const unreachable: never = block; throw new Error(`Unknown block: ${JSON.stringify(unreachable)}`);
  })}</>;
}
