import Link from "next/link";
import { Breadcrumbs } from "@/src/components/layout/Breadcrumbs";
import { JsonLd } from "@/src/components/seo/JsonLd";
import { contactEmail, siteConfig } from "@/src/config/site";
import styles from "@/src/style/site.module.css";
import tdk from "@/seo/tdk.js";
import { buildBreadcrumbSchema, buildWebPageSchema } from "@/src/seo/structured-data";

type LegalPath = "/privacy" | "/terms" | "/copyright" | "/about" | "/contact";
type LegalKey = "privacy" | "terms" | "copyright" | "about" | "contact";

const updatedAt = "2026-09-22";
const legalLinks: { href: LegalPath; label: string }[] = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/copyright", label: "Copyright" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
];

function Shell({ title, path, pageKey, children }: { title: string; path: LegalPath; pageKey: LegalKey; children: React.ReactNode }) {
  const description = tdk[pageKey].description;
  return <main id="main-content" className={`${styles.container} ${styles.readingPage} ${styles.legalPage}`}>
    <JsonLd data={[
      buildWebPageSchema({ name: tdk[pageKey].title, description, path, updatedAt }),
      buildBreadcrumbSchema([{ name: "Home", path: "/" }, { name: title, path }]),
    ]}/>
    <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: title }]}/>
    <header className={styles.legalHeader}>
      <span className={styles.eyebrow}>Site information</span>
      <h1 className={styles.innerH1}>{title}</h1>
      <p className={styles.lede}>{description}</p>
      <p className={styles.legalUpdated}>Last updated <time dateTime={updatedAt}>September 22, 2026</time></p>
    </header>
    <article className={styles.legalContent}>{children}</article>
    <nav className={styles.legalPolicyNav} aria-label="Site policies">
      <h2>Site policies and information</h2>
      <ul>{legalLinks.map((item) => <li key={item.href}>{item.href === path ? <span aria-current="page">{item.label}</span> : <Link href={item.href}>{item.label}</Link>}</li>)}</ul>
    </nav>
  </main>;
}

export function PrivacyPage() {
  return <Shell title="Privacy Policy" path="/privacy" pageKey="privacy">
    <section>
      <h2>1. Scope and who operates this site</h2>
      <p>This Privacy Policy explains how {siteConfig.publisherName} handles information when you visit {siteConfig.name}, read a guide, launch an embedded game or video, or submit a player rating. It applies to this website only. A game provider, YouTube, the comment service, your browser, and your network provider operate under their own notices and controls.</p>
      <p>{siteConfig.name} does not provide player accounts, paid subscriptions, purchases, private messaging, or a contact form. You can read the articles without launching a game, playing a video, or posting a review.</p>
    </section>
    <section>
      <h2>2. Information you choose to provide</h2>
      <h3>Player ratings and comments</h3>
      <p>If you post a review, the site sends the following information to its comment service: your star rating, comment text, optional display name, the game identifier and title, and the time associated with the resulting review. The rating, comment, display name or the fallback name “Player,” and review date are then displayed publicly on the relevant game page.</p>
      <p>Do not place an email address, real-world address, account credential, private token, precise location, financial information, medical information, or another person’s private information in a public review. A display name is optional.</p>
      <h3>Email messages</h3>
      <p>If you copy the address from <Link href="/contact">Contact Us</Link> and send an email, your email provider and ours process the address, message, headers, attachments, and ordinary delivery data. We use that message to answer the request, investigate a correction or rights concern, maintain an appropriate record, and protect the site from abuse.</p>
    </section>
    <section>
      <h2>3. Information handled automatically</h2>
      <p>The static hosting service and supporting network providers may receive ordinary request and security information when a page or asset is delivered. This can include an IP address, approximate network location derived from it, browser and device information, requested path, referring page, response status, and timestamps. Those records are commonly used to deliver content, diagnose failures, prevent abuse, and protect service availability.</p>
      <p>The site code does not currently create a first-party advertising profile or operate a separate behavioral advertising tracker. We do not sell player information. If site functionality materially changes, this policy will be revised before or when the new processing begins, as appropriate.</p>
    </section>
    <section>
      <h2>4. Embedded games and YouTube videos</h2>
      <p>An embedded game is not created until you select Play Now. At that point your browser contacts the game provider configured for that page. The provider can receive normal connection information and may use its own cookies, local storage, session storage, device signals, or gameplay records. We do not control a provider’s progress storage, availability, age rating, or independent data practices.</p>
      <p>Gameplay videos use YouTube’s privacy-enhanced <code>youtube-nocookie.com</code> player and do not autoplay. Loading or using that player still connects your browser to Google or YouTube infrastructure, which may process connection, device, playback, and interaction information under its own terms. You may avoid that connection by not loading or interacting with the video page content.</p>
    </section>
    <section>
      <h2>5. Browser storage and cookies</h2>
      <p>The written pages do not require a first-party account cookie. Embedded games may store preferences, progress, consent state, or session information in your browser. Your browser may let you inspect, block, or clear that storage. Blocking third-party content or storage can prevent a game or video from working while leaving the written guide available.</p>
      <p>Private browsing, storage clearing, device changes, and provider updates can remove game progress. We cannot restore data held only by a third-party game or in your local browser.</p>
    </section>
    <section>
      <h2>6. Why information is used</h2>
      <ul>
        <li>To deliver requested pages, games, videos, and player-rating features.</li>
        <li>To publish the review you intentionally submit on the matching game page.</li>
        <li>To answer corrections, accessibility reports, privacy requests, and rights concerns.</li>
        <li>To secure the site, investigate errors, enforce reasonable use, and limit spam or abusive submissions.</li>
        <li>To comply with a valid legal obligation or protect users, the site operator, providers, and the public where necessary.</li>
      </ul>
      <p>Where law requires consent, we rely on the choice you make before using the relevant optional feature. In other circumstances, processing may be necessary to provide a feature you requested, comply with law, or support legitimate interests such as site security and reliable operation, subject to applicable rights.</p>
    </section>
    <section>
      <h2>7. Service providers, disclosure, and international processing</h2>
      <p>Information is disclosed only as needed to operate the relevant feature: hosting and network providers deliver the site; the comment service stores and returns reviews; game providers deliver games after Play Now; YouTube delivers embedded video; and email providers deliver messages. We may also disclose information when reasonably necessary to comply with valid legal process, investigate fraud or security threats, protect rights and safety, or support a transfer of the site subject to appropriate notice and safeguards.</p>
      <p>These providers may process information in countries other than your own. Their own terms, locations, and transfer safeguards govern information they control. We choose narrowly scoped services where practical, but we cannot promise that every provider stores data in one jurisdiction.</p>
    </section>
    <section>
      <h2>8. Retention</h2>
      <p>Public reviews may remain available until they are removed for a valid request, moderation reason, service migration, or operational need. Correspondence is kept only as long as reasonably necessary to resolve the request, document the outcome, protect legal interests, or meet an applicable obligation. Hosting, email, game, video, and comment providers determine retention for records under their control.</p>
      <p>Because retention depends on the type of record and provider, this policy does not promise a single deletion date. We apply data-minimization and purpose-limitation principles to information we control.</p>
    </section>
    <section>
      <h2>9. Your choices and privacy rights</h2>
      <p>You may browse without submitting a review, leave the game player unopened, avoid interacting with videos, use browser privacy controls, clear local storage, or contact us about information under our control. Depending on your location and applicable law, you may have rights to request access, correction, deletion, restriction, portability, or an objection to certain processing.</p>
      <p>Send a request through the plain-text address on <Link href="/contact">Contact Us</Link>. Identify the relevant page, review display name, approximate submission date, and the action requested. We may ask for limited additional information to verify that the request concerns you. We will not ask for a password or payment to make a privacy request. You may also have the right to complain to the privacy or data-protection authority responsible for your location.</p>
    </section>
    <section>
      <h2>10. Children’s privacy</h2>
      <p>This independent guide site is intended for a general gaming audience and is not designed to collect personal information from young children. Children should not submit a public review or email personal information without the involvement of a parent or guardian where required. If you believe a child supplied personal information through a feature we control, contact us with enough detail to locate it.</p>
      <p>Third-party games and videos may have their own content ratings, age requirements, and parental controls. A parent or guardian should review those terms before allowing a child to use an embedded service.</p>
    </section>
    <section>
      <h2>11. Security, policy changes, and contact</h2>
      <p>We use reasonable technical and organizational measures appropriate to the site, including restricted framing rules and limited form destinations. No internet transmission or storage system is guaranteed to be completely secure. Do not send secrets or sensitive personal information through a public review or ordinary email.</p>
      <p>We may update this policy when features, providers, or legal obligations materially change. The revised date appears at the top. Material changes will be described clearly on the policy or relevant feature where appropriate. Privacy questions and requests can be sent using the information on <Link href="/contact">Contact Us</Link>.</p>
    </section>
  </Shell>;
}

export function TermsPage() {
  return <Shell title="Terms of Service" path="/terms" pageKey="terms">
    <section>
      <h2>1. Acceptance and scope</h2>
      <p>These Terms govern access to {siteConfig.name}, its guides, game launchers, embedded videos, and player-rating features. By using the site, you agree to these Terms and the <Link href="/privacy">Privacy Policy</Link>. If you do not agree, do not use the affected feature.</p>
      <p>The site is an independent player resource operated by {siteConfig.publisherName}. It is not the official publisher, developer, or support service for Krillion, YouTube, or the additional games shown here.</p>
    </section>
    <section>
      <h2>2. Informational guides and game access</h2>
      <p>Guides describe our tested play experience and are provided for general informational and entertainment purposes. A live game can change its prompts, accepted answers, scoring, interface, availability, or storage behavior without notice. We work to correct material errors, but we do not guarantee that every answer, strategy, screenshot, or instruction will remain current for every version, region, device, or browser.</p>
      <p>Play Now opens the game assigned to that page through an embedded provider. We do not sell the game, promise uninterrupted access, guarantee saved progress, or guarantee a score, ranking, achievement, or particular outcome.</p>
    </section>
    <section>
      <h2>3. Eligibility and responsible play</h2>
      <p>You are responsible for deciding whether a game and its third-party terms are appropriate for you. If you are not legally able to agree to these Terms, a parent or guardian must review the site and any third-party service with you. Use reasonable breaks, device settings, sound levels, and accessibility tools suitable for your circumstances.</p>
    </section>
    <section>
      <h2>4. Player ratings and public comments</h2>
      <p>A review must reflect a genuine play experience and remain relevant to the game page. By submitting a review, you confirm that you have the right to provide it and grant {siteConfig.publisherName} a non-exclusive, worldwide, royalty-free license to host, reproduce, format, display, and moderate that contribution for operating and promoting the player-rating feature. You retain ownership of your original contribution.</p>
      <p>Do not submit:</p>
      <ul>
        <li>Harassment, hate, threats, sexual exploitation, or encouragement of violence or self-harm.</li>
        <li>Spam, deceptive promotion, impersonation, fabricated play claims, or coordinated rating manipulation.</li>
        <li>Passwords, private tokens, financial data, precise addresses, or another person’s private information.</li>
        <li>Malware, scripts, attempts to bypass controls, or instructions intended to damage a service or user.</li>
        <li>Material that is unlawful, defamatory, fraudulent, or infringes copyright, trademark, privacy, publicity, or another right.</li>
      </ul>
      <p>We may reject, hide, remove, limit, or preserve a contribution when reasonably necessary to enforce these Terms, respond to a rights request, protect users, investigate abuse, or maintain the feature. We are not required to publish every submission or to provide advance notice before moderation.</p>
    </section>
    <section>
      <h2>5. Acceptable use</h2>
      <p>You may use public pages for personal, lawful play and reference. You must not:</p>
      <ul>
        <li>Interfere with the site, comment service, embeds, security controls, rate limits, or another user’s access.</li>
        <li>Probe for vulnerabilities, inject code, distribute malware, or attempt unauthorized access to systems or data.</li>
        <li>Automate abusive requests, scrape private information, overload services, or evade a restriction.</li>
        <li>Manipulate ratings, falsely present the site as an official game service, or use the brand to mislead players.</li>
        <li>Republish substantial guide content or media in a way that substitutes for the original page or violates third-party rights.</li>
      </ul>
    </section>
    <section>
      <h2>6. Third-party services</h2>
      <p>Games, YouTube videos, the comment service, and external infrastructure are operated by third parties. Their terms, privacy practices, content rules, availability, and technical decisions apply independently. An embed does not make us responsible for the provider’s service, advertising, data practices, purchases, user accounts, or content outside this site.</p>
      <p>We may change, replace, or remove an embed when it becomes unsafe, unavailable, inaccurate, or inconsistent with the site’s player-first purpose.</p>
    </section>
    <section>
      <h2>7. Intellectual property</h2>
      <p>Original guides, site copy, layout, branding, and original editorial assets are protected by applicable intellectual-property law. Game names, game code, characters, screenshots, videos, trademarks, and third-party assets remain owned by their respective rights holders. Limited quotation, linking, and other lawful uses remain subject to the <Link href="/copyright">Copyright page</Link> and applicable law.</p>
    </section>
    <section>
      <h2>8. Disclaimers</h2>
      <p>To the fullest extent permitted by law, the site and its content are provided “as is” and “as available.” We disclaim implied warranties of merchantability, fitness for a particular purpose, non-infringement, uninterrupted availability, and error-free operation where those disclaimers are legally permitted. Nothing in these Terms excludes a warranty or consumer right that cannot lawfully be excluded.</p>
      <p>Gameplay decisions, browser changes, storage clearing, and use of third-party services are your responsibility. Back up information where appropriate and do not rely on an embedded game as the sole place to preserve valuable data.</p>
    </section>
    <section>
      <h2>9. Limitation of liability</h2>
      <p>To the fullest extent permitted by applicable law, {siteConfig.publisherName} will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages; loss of progress, data, opportunity, goodwill, or expected score; or harm arising from a third-party game, video, comment service, network, or device. Any limitation applies only to the extent legally enforceable and does not limit liability that cannot be excluded by law.</p>
    </section>
    <section>
      <h2>10. Suspension, changes, and severability</h2>
      <p>We may limit access to a feature or remove content when needed for security, maintenance, rights protection, legal compliance, or enforcement. We may revise these Terms when the site or applicable requirements materially change. Continued use after revised Terms take effect indicates acceptance where permitted by law.</p>
      <p>If one provision is found unenforceable, it will be limited or removed only to the extent necessary, and the remaining provisions will continue. A delay in enforcing a provision is not a permanent waiver. These Terms are interpreted under applicable law without reducing mandatory consumer protections.</p>
    </section>
    <section>
      <h2>11. Contact</h2>
      <p>Questions, moderation requests, and legal notices should identify the affected page and be sent through the information on <Link href="/contact">Contact Us</Link>.</p>
    </section>
  </Shell>;
}

export function CopyrightPage() {
  return <Shell title="Copyright" path="/copyright" pageKey="copyright">
    <section>
      <h2>1. Original site content</h2>
      <p>Unless a page says otherwise, original editorial writing, information architecture, guide organization, site interface, and original brand materials created for {siteConfig.name} are owned by or licensed to {siteConfig.publisherName} and protected by applicable copyright and related laws.</p>
    </section>
    <section>
      <h2>2. Third-party games, names, and media</h2>
      <p>Game names, trademarks, code, characters, artwork, embedded builds, and videos remain the property of their respective developers, publishers, creators, or other rights holders. Gameplay captures are used editorially to identify the exact experience and explain play. YouTube videos are embedded from the uploader’s public player and are not downloaded or rehosted by this site.</p>
      <p>Reference to a game or provider does not transfer ownership and does not imply sponsorship, endorsement, partnership, or official status. All third-party rights are reserved by their owners.</p>
    </section>
    <section>
      <h2>3. Permitted use of our guides</h2>
      <p>You may link to a public page, use the site for personal play help, and quote a short passage when the quotation is reasonably necessary, attributed to {siteConfig.publisherName}, and accompanied by the page title or address. Legal rights such as fair use, fair dealing, quotation, criticism, review, and accessibility exceptions remain available where applicable.</p>
      <p>Without permission, you may not reproduce a complete guide, mirror substantial portions of the site, remove attribution, sell copied material, train a competing content feed from systematic extraction, or present the layout, writing, or brand as your own. Permission from us cannot authorize use of material owned by a third party.</p>
    </section>
    <section>
      <h2>4. Copyright or trademark concern</h2>
      <p>If you are a rights holder or an authorized representative and believe material on this site infringes a right, send a clear notice containing:</p>
      <ol>
        <li>Your full name, role, and reliable contact information.</li>
        <li>Identification of the protected work, mark, or other right.</li>
        <li>The exact {siteConfig.name} page and enough detail to locate the material.</li>
        <li>An explanation of why the use is unauthorized or misleading.</li>
        <li>A statement that you have a good-faith belief the disputed use is not authorized by the owner, its agent, or law.</li>
        <li>A statement that the notice is accurate and that you are the owner or authorized to act for the owner.</li>
        <li>Your physical or electronic signature.</li>
      </ol>
      <p>Send the notice to the plain-text address on <Link href="/contact">Contact Us</Link>. A complete notice lets us identify the exact material and respond efficiently. We may forward the notice to the affected contributor, service provider, or host when necessary to evaluate or process it.</p>
    </section>
    <section>
      <h2>5. Review and response process</h2>
      <p>We review sufficiently detailed notices in good faith and may remove, disable, replace, or retain material depending on the facts and applicable law. We may request clarification when ownership, location, authorization, or the claimed right is unclear. Knowingly making a material misrepresentation in a rights notice can create legal consequences.</p>
      <p>If your original material was removed because of a mistake or misidentification, contact us with the affected page, the removed material, an explanation of your rights or authorization, and the information needed to evaluate the request. This general process does not replace any formal statutory notice or counter-notice procedure that applies to a specific provider or jurisdiction.</p>
    </section>
    <section>
      <h2>6. Player comments</h2>
      <p>Players retain ownership of original review text they submit, subject to the display and moderation license in the <Link href="/terms">Terms of Service</Link>. Do not post copied walkthroughs, leaked material, or media you do not have the right to share. Rights holders may report a public review through the same contact process.</p>
    </section>
    <section>
      <h2>7. Corrections and attribution</h2>
      <p>A factual correction is different from a copyright complaint. For a correction, identify the sentence, screenshot, or gameplay claim and provide a concise explanation of the issue. For attribution questions, identify the creator, work, and preferred correction. We value precise reports and will update material when the evidence supports a change.</p>
    </section>
  </Shell>;
}

export function AboutPage() {
  return <Shell title="About Checkpoint Nomad" path="/about" pageKey="about">
    <section>
      <h2>Who I am</h2>
      <p>I write as Checkpoint Nomad, the name I use for the game notes and guides collected on this site. I’m a longtime player who enjoys the kind of games that make us stop, rethink a route, and try again. Difficult puzzles, tactical survival games, story-driven indies, daily trivia, and compact browser games are the ones I return to most. I like understanding the rule beneath the result: why an answer failed, where a hidden branch begins, or which small decision turns an ordinary run into a strong one.</p>
      <p>I started publishing these guides in early 2026 after repeatedly finding walkthroughs that stopped at surface-level instructions or repeated claims that did not match the game in front of me. This site grew from the notes I already kept while playing—tested routes, missed conditions, useful screenshots, scoring comparisons, and fixes worth remembering the next time a problem appeared.</p>
    </section>
    <section>
      <h2>Why this Krillion site exists</h2>
      <p>{siteConfig.name} is my focused home for the seven-prompt Daily Dive and a deliberately limited group of related word, trivia, spelling, deduction, and browser games. The homepage contains the sole Krillion player. <Link href="/guides">Guides</Link> separate first-run help, scoring strategy, and technical recovery into clear tasks. <Link href="/games">More Games</Link> gives each additional title its own matching player, imagery, controls, and tested notes.</p>
      <p>I keep the collection small enough to revisit and maintain. A game page should identify the correct build, use real play imagery, explain effective input, and remain useful after the novelty of the first launch.</p>
    </section>
    <section>
      <h2>How I approach a guide</h2>
      <h3>Experience-driven work</h3>
      <p>I write from repeated play, prompt-by-prompt observation, and comparison of visible game states. Instructions stay tied to the game shown on the page. When I cannot confirm a claim, I qualify it instead of turning a guess into a rule.</p>
      <h3>Structured delivery without shortcuts</h3>
      <p>I avoid empty word-count padding and interchangeable walkthrough prose. A useful guide should help a player find the immediate answer, understand the underlying system, follow a route check, and recognize the failure state. Tables, step sequences, screenshots, and examples belong only where they make a decision clearer.</p>
      <h3>A player-first technical mindset</h3>
      <p>I pay attention to small interface details, category boundaries, input timing, map or route structure, dynamic branches, browser focus, and the point where an external player fails. The goal is clean, precise help without misleading download buttons, autoplaying media, or unrelated public links.</p>
    </section>
    <section>
      <h2>How a guide is produced</h2>
      <ol>
        <li><strong>Identify the exact game and version context.</strong> I confirm the title, player source, visible interface, and controls before drafting.</li>
        <li><strong>Play and record meaningful states.</strong> I capture the opening, active play, feedback, failure, and result states needed to explain the experience.</li>
        <li><strong>Separate observation from inference.</strong> Visible rules are stated directly; uncertain mechanics are labeled carefully or omitted.</li>
        <li><strong>Build a player route.</strong> I organize the guide around the real order of decisions rather than a generic article template.</li>
        <li><strong>Verify the finished page.</strong> I test links, input, media, mobile layout, metadata, and production output before considering the page complete.</li>
        <li><strong>Correct and maintain.</strong> I review credible player reports and update pages when the live experience materially changes.</li>
      </ol>
    </section>
    <section>
      <h2>Independence and corrections</h2>
      <p>I work independently and am not affiliated with, sponsored by, or endorsed by the developers, publishers, video creators, or platforms referenced on this site unless a page explicitly says otherwise. The recommendations and conclusions here are not purchased rankings.</p>
      <p>Accuracy improves when players report a reproducible difference. If a prompt, score, control, screenshot, or browser instruction no longer matches the live experience, send the page address, observed behavior, device context, and any non-sensitive evidence through <Link href="/contact">Contact Us</Link>.</p>
    </section>
  </Shell>;
}

export function ContactPage() {
  return <Shell title="Contact Us" path="/contact" pageKey="contact">
    <section>
      <h2>What you can contact us about</h2>
      <ul>
        <li>A factual correction to a Krillion guide or additional game page.</li>
        <li>An accessibility barrier, keyboard problem, broken layout, or reproducible technical issue on this site.</li>
        <li>A privacy request concerning a review, message, or other information under our control.</li>
        <li>A copyright, trademark, attribution, or other rights concern.</li>
        <li>A broken game or video embed, incorrect media, or material change to the live game experience.</li>
        <li>A focused suggestion that would make an existing guide clearer for players.</li>
      </ul>
    </section>
    <section>
      <h2>What to include</h2>
      <p>A useful report includes the exact page address, the heading or feature involved, what you expected, what happened, and the date you observed it. For a technical issue, include the device type, operating system, browser, viewport or orientation, and the steps that reproduce the problem. Screenshots are useful when they do not expose private information.</p>
      <p>For a guide correction, identify the exact statement and explain the verified behavior. For a rights notice, follow the information list on the <Link href="/copyright">Copyright page</Link>. For a privacy request, identify the review display name, relevant game page, approximate date, and requested action.</p>
    </section>
    <section>
      <h2>Do not send sensitive information</h2>
      <p>Do not send passwords, authentication codes, API keys, private tokens, payment-card data, government identifiers, medical records, precise home addresses, or unrelated personal files. We will never ask you to pay to report an error or submit a privacy request.</p>
    </section>
    <section>
      <h2>Email</h2>
      <p className={styles.plainEmail}>{contactEmail}</p>
      <p>The address is deliberately displayed as plain text. Copy it into your preferred email service if you want to write to Checkpoint Nomad. There is no contact form and no <code>mailto:</code> link on this page.</p>
    </section>
    <section>
      <h2>How requests are handled</h2>
      <p>We prioritize security, privacy, accessibility, and substantiated rights reports, followed by reproducible corrections and technical problems. We may ask for clarification or limited verification before changing public content or acting on personal information. Complex reports and third-party provider issues can take longer because they require reproduction or coordination.</p>
      <p>Sending a message does not create a professional-client, confidential, fiduciary, or legal-advisory relationship. Do not use this address for emergencies. If a problem concerns a third-party game account, purchase, or platform decision, the relevant provider may be the only party able to resolve it.</p>
    </section>
  </Shell>;
}
