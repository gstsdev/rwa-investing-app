import AccountInfo from "@/components/AccountInfo";
import Actions from "@/components/Actions";

export default function Home() {
  return (
    <div className="min-h-screen">
      <main className="flex flex-col gap-8 w-full max-w-[800px] items-center mx-auto p-5">
        <AccountInfo />

        <Actions className="mt-2" />

        {/* <TransactionHistory /> */}
      </main>
    </div>
  );
}
