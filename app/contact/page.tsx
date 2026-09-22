import { ContactPage } from "@/src/page/legal/LegalPages";
import { buildMetadata } from "@/src/seo/metadata";
import tdk from "@/seo/tdk.js";
export const metadata = buildMetadata({ ...tdk.contact, path: "/contact" });
export default ContactPage;
