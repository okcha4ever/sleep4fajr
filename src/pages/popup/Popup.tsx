import { Button } from "@src/components/ui/button";

export default function Popup() {
  return (
    <main className="absolute top-0 left-0 right-0 bottom-0 text-center h-full p-3 bg-gray-800">
      <div className="flex flex-col items-center text-2xl justify-center text-red-500">
        <Button variant={"secondary"}>Hello world</Button>
      </div>
    </main>
  );
}
