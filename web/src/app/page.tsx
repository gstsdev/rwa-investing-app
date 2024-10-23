import AccountInfo from "@/components/AccountInfo";

export default function Home() {
  return (
    <div className="min-h-screen">
      <main className="flex flex-col gap-8 w-full max-w-[800px] items-center mx-auto p-5">
        <AccountInfo />
      </main>
    </div>
  );
}
