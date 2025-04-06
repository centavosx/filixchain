import { HealthSection } from './_components/health';
import { BlockSection } from './_components/block';
import { TransactionsSection } from './_components/transactions';

export default async function Home() {
  return (
    <div className="flex flex-col p-6 gap-8">
      <HealthSection />
      <section className="flex flex-1 gap-8 flex-col xl:flex-row">
        <BlockSection />
        <TransactionsSection />
      </section>
    </div>
  );
}
