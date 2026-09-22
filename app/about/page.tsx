import { AboutPage } from "@/src/page/legal/LegalPages";
import { buildMetadata } from "@/src/seo/metadata";
import tdk from "@/seo/tdk.js";
export const metadata = buildMetadata({ ...tdk.about, path: "/about" });
export default AboutPage;
