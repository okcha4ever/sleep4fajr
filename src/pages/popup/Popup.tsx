import ExtensionUI from "@src/components/ui/extension-ui";
import Footer from "@src/components/ui/footer";

export default function Popup() {
  return (
    <main className="flex flex-col w-fit">
      <div className="w-[400px] bg-background text-foreground relative overflow-hidden">
        <ExtensionUI />
        <Footer />
      </div>
    </main>
  );
}
