import { Header } from "@/components/Header";
import { Contact } from "@/components/Contact";
import { SystemGallery } from "@/components/SystemGallery";

export const metadata = { title: "System State Gallery", robots: { index: false } };

export default function SystemPage() {
  return (
    <>
      <Header />
      <main id="main">
        <SystemGallery />
      </main>
      <Contact />
    </>
  );
}