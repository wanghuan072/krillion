import type { DailyDive, DailyQuestion } from "@/src/types/answers";
import { answerPath, formatAnswerDate } from "@/scripts/lib/daily-answers.mjs";
import { getAnswerArchive } from "@/src/lib/data/answer-loader";
import { AnswerAvailability } from "./AnswerAvailability";
import { Breadcrumbs } from "@/src/components/layout/Breadcrumbs";
import { JsonLd } from "@/src/components/seo/JsonLd";
import { absoluteUrl } from "@/src/lib/url-policy";
import { buildBreadcrumbSchema, buildItemList, buildWebPageSchema } from "@/src/seo/structured-data";
import styles from "@/src/style/site.module.css";

const archivePath = "/krillion-answers-today";
const number = (value: number) => value.toLocaleString("en-US");

export function DailyAnswersIndex({ title, description }: { title: string; description: string }) {
  const archive = getAnswerArchive();
  const latest = archive[0];
  const months = [...new Set(archive.map((dive) => dive.date.slice(0, 7)))];

  return <main id="main-content" className={`${styles.container} ${styles.readingPage} ${styles.topicPage}`}>
    <JsonLd data={[
      { ...buildWebPageSchema({ name: title, description, path: archivePath, type: "CollectionPage" }), mainEntity: buildItemList(archive.map((dive) => ({ name: `Krillion answers for ${formatAnswerDate(dive.date)}`, path: answerPath(dive.date) }))) },
      buildBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "Krillion Answers Today", path: archivePath }]),
    ]} />
    <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Krillion Answers Today" }]} />
    <header className={styles.topicHeader}><span className={styles.eyebrow}>Daily questions and answers</span><h1 className={styles.innerH1}>Krillion Answers Today</h1><p className={styles.lede}>Choose a Daily Dive to see its seven questions, answers, rarity tiers, and scores. Every date has its own page, so earlier answers stay easy to find.</p></header>
    {latest ? <section className={styles.answerLatest} aria-labelledby="latest-dive">
      <span className={styles.eyebrow}>Latest available answers</span>
      <h2 id="latest-dive">Krillion answers for <time dateTime={latest.date}>{formatAnswerDate(latest.date)}</time></h2>
      <AnswerAvailability latestDate={latest.date} />
      <p>Daily Dive #{latest.diveNumber} · 7 questions · {latest.coverage === "complete" ? `${number(latest.totalAcceptedAnswers)} answers` : "Selected answers"}</p>
      <a className={styles.answerAction} href={answerPath(latest.date)}>View answers for {formatAnswerDate(latest.date)} <span aria-hidden="true">→</span></a>
    </section> : <p role="status">Daily answers are not available here yet. Please check back later.</p>}
    <div className={styles.answerGuidance}><p>These pages cover the original Daily Dive at Krillion.io. Independent practice games can use different questions and answer lists. Open a date only when you are ready for spoilers.</p></div>
    {months.length > 1 ? <nav className={styles.answerMonthNav} aria-label="Answer archive months">{months.map((month) => <a key={month} href={`#month-${month}`}>{formatAnswerDate(`${month}-01`).replace(/^\w+ \d+,/, (label) => label.split(" ")[0])}</a>)}</nav> : null}
    {months.map((month) => <section key={month} id={`month-${month}`} className={styles.answerArchiveMonth} aria-labelledby={`heading-${month}`}>
      <h2 id={`heading-${month}`}>{new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", year: "numeric" }).format(new Date(`${month}-01T12:00:00Z`))} answers</h2>
      <ol className={styles.answerArchiveList}>{archive.filter((dive) => dive.date.startsWith(month)).map((dive) => <li key={dive.date}><a href={answerPath(dive.date)}>
        <span className={styles.answerArchiveDate}><time dateTime={dive.date}>{formatAnswerDate(dive.date)}</time><small>Daily Dive #{dive.diveNumber}</small></span>
        <span className={styles.answerArchivePreview}>{dive.questions[0].prompt}<small>7 questions · {dive.coverage === "complete" ? `${number(dive.totalAcceptedAnswers)} answers` : "Selected answers"}</small></span>
        <span className={styles.answerArchiveArrow} aria-hidden="true">→</span>
      </a></li>)}</ol>
    </section>)}
    <section className={styles.answersFooter}><h2>Find the right Daily Dive</h2><p>Match the game date and the wording of the question before using an answer. A score belongs to its specific prompt and date; the same answer can receive a different score elsewhere.</p><a href="/guides/krillion-scoring-and-rare-answers">Understand Krillion scoring <span aria-hidden="true">→</span></a></section>
  </main>;
}

function QuestionAnswers({ question, index, complete }: { question: DailyQuestion; index: number; complete: boolean }) {
  const sorted = [...question.answers].sort((a, b) => b.score - a.score);
  const scores = [...new Set(sorted.map((answer) => answer.score))];
  return <section className={styles.answerDetailQuestion} id={`question-${index + 1}`} aria-labelledby={`question-heading-${index + 1}`}>
    <header><span className={styles.eyebrow}>Question {index + 1} of 7</span><h2 id={`question-heading-${index + 1}`}>{question.prompt}</h2><p>{number(question.answerCount)} accepted answers in this dated set{complete ? "" : " · Selected answers shown below"}</p></header>
    {question.hint ? <details className={styles.answerHintDisclosure}><summary>Show a hint</summary><p>{question.hint}</p></details> : null}
    <h3>High-scoring answers</h3>
    <ul className={styles.answerPicks}>{sorted.slice(0, 3).map((answer) => <li key={answer.text}><div><strong>{answer.text}</strong><span>{answer.tier}</span>{answer.note ? <p>{answer.note}</p> : null}</div><b>{answer.score}<small>points</small></b></li>)}</ul>
    <h3>{complete ? "All answers by score" : "More answers and scores"}</h3>
    <div className={styles.answerTierGroups}>{scores.map((score) => {
      const group = sorted.filter((answer) => answer.score === score);
      return <details className={styles.answerTierGroup} key={score}><summary><strong>{group[0].tier} · {score} points</strong><span>{number(group.length)} {group.length === 1 ? "answer" : "answers"}</span></summary><ul>{group.map((answer) => <li key={answer.text}>{answer.text}</li>)}</ul></details>;
    })}</div>
    {question.explanation ? <div className={styles.answerDetailNote}><h3>Answer notes</h3><p>{question.explanation}</p></div> : null}
    {question.watchFor ? <div className={styles.answerWatch}><strong>Watch for</strong><p>{question.watchFor}</p></div> : null}
  </section>;
}

export function DailyAnswersDetail({ dive }: { dive: DailyDive }) {
  const archive = getAnswerArchive();
  const position = archive.findIndex((record) => record.date === dive.date);
  const previous = archive[position + 1];
  const next = archive[position - 1];
  const dateLabel = formatAnswerDate(dive.date);
  const path = answerPath(dive.date);
  const counts = dive.questions.map((question) => question.answerCount);
  const updatedLabel = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", timeZoneName: "short" }).format(new Date(dive.updatedAt));
  return <main id="main-content" className={`${styles.container} ${styles.readingPage} ${styles.topicPage}`}>
    <JsonLd data={[
      { ...buildWebPageSchema({ name: dive.seo.title, description: dive.seo.description, path, publishedAt: dive.publishedAt, updatedAt: dive.updatedAt }), mainEntity: { "@type": "Article", headline: `Krillion Answers for ${dateLabel} — Dive #${dive.diveNumber}`, datePublished: dive.publishedAt, dateModified: dive.updatedAt, mainEntityOfPage: absoluteUrl(path) } },
      buildBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "Krillion Answers Today", path: archivePath }, { name: dateLabel, path }]),
    ]} />
    <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Krillion Answers Today", href: archivePath }, { label: dateLabel }]} />
    <header className={styles.topicHeader}><span className={styles.eyebrow}>Daily Dive #{dive.diveNumber}</span><h1 className={styles.innerH1}>Krillion Answers for {dateLabel} — Dive #{dive.diveNumber}</h1><p className={styles.lede}>Find the seven Daily Dive questions for {dateLabel}, with {dive.coverage === "complete" ? "the complete answer lists" : "selected answers"}, rarity tiers, and scores. Check the question wording before choosing your answer.</p><p className={styles.answerUpdated}>Updated <time dateTime={dive.updatedAt}>{updatedLabel}</time></p></header>
    <div className={styles.answerStatus}><div><span>Game date</span><strong><time dateTime={dive.date}>{dateLabel}</time></strong></div><div><span>Daily Dive</span><strong>#{dive.diveNumber}</strong></div><div><span>Questions</span><strong>{dive.questions.length}</strong></div><div><span>Answer pool</span><strong>{number(dive.totalAcceptedAnswers)}</strong></div></div>
    <div className={styles.answerGuidance}><strong>Spoilers below</strong><p>Answers apply to this dated Krillion.io Daily Dive. Independent practice games may differ. {dive.coverage === "complete" ? "Expand a score tier to see every answer in that group." : "This page contains selected answers, rather than every accepted answer."}</p></div>
    <nav className={styles.answerJump} aria-label="Daily Dive questions"><span>Jump to a question</span><ol>{dive.questions.map((question, index) => <li key={question.id}><a href={`#question-${index + 1}`}><small>{String(index + 1).padStart(2, "0")}</small><strong>Question {index + 1}</strong><span>{question.prompt}</span></a></li>)}</ol></nav>
    <section className={styles.answerOverview} aria-labelledby="dive-overview"><div><span className={styles.eyebrow}>{dateLabel}</span><h2 id="dive-overview">Daily Dive #{dive.diveNumber} at a glance</h2><p>Read the exact condition in each question. Accepted answers can score differently, and the highest tier is not simply a measure of how many players chose a name.</p></div><dl><div><dt>Questions</dt><dd>{dive.questions.length}</dd></div><div><dt>Answer pool</dt><dd>{number(dive.totalAcceptedAnswers)}</dd></div><div><dt>Smallest pool</dt><dd>{number(Math.min(...counts))}</dd></div><div><dt>Largest pool</dt><dd>{number(Math.max(...counts))}</dd></div></dl></section>
    <article aria-label={`Krillion questions and answers for ${dateLabel}`}>{dive.questions.map((question, index) => <QuestionAnswers key={question.id} question={question} index={index} complete={dive.coverage === "complete"} />)}</article>
    <nav className={styles.answerDayNavigation} aria-label="Daily answer navigation">
      {previous ? <a rel="prev" href={answerPath(previous.date)}>← {formatAnswerDate(previous.date)}</a> : <span>No earlier answers</span>}
      <a href={archivePath}>All daily answers</a>
      {next ? <a rel="next" href={answerPath(next.date)}>{formatAnswerDate(next.date)} →</a> : <span>No later answers</span>}
    </nav>
    <section className={styles.answersFooter}><h2>Use this answer list</h2><p>Choose an answer you can recognize and spell. A familiar accepted answer can be a safer choice than an unfamiliar high-scoring name. These scores belong to this date and prompt, and do not predict a future result.</p><a href="/guides/krillion-scoring-and-rare-answers">Read the scoring guide <span aria-hidden="true">→</span></a></section>
  </main>;
}
