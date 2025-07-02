import Image from "next/image";
import PoslaneckaSnemovna from "./_components/poslaneckaSnemovna/PoslaneckaSnemovna";

export default async function Home() {
  return (
    <>
      <div className="w-full min-h-screen bg-zinc-900 p-10">
        <PoslaneckaSnemovna />
      </div>
    </>
  );
}
