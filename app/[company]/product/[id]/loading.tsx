import { Navbar } from "@/components/site/navbar";

export default function LoadingCompanyProductPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pb-20">
        <section className="mx-auto mt-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-stretch gap-8 rounded-3xl border border-border/60 bg-card p-5 shadow-sm sm:p-8 md:grid-cols-2">
            <div className="order-2 flex flex-col gap-4 md:order-1">
              <div className="h-6 w-24 animate-pulse rounded-md bg-muted" />
              <div className="h-10 w-3/4 animate-pulse rounded-md bg-muted" />
              <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-4 w-5/6 animate-pulse rounded-md bg-muted" />
              <div className="mt-4 h-8 w-32 animate-pulse rounded-md bg-muted" />
              <div className="mt-6 flex gap-2">
                <div className="h-10 w-12 animate-pulse rounded-md bg-muted" />
                <div className="h-10 w-12 animate-pulse rounded-md bg-muted" />
                <div className="h-10 w-12 animate-pulse rounded-md bg-muted" />
                <div className="h-10 w-12 animate-pulse rounded-md bg-muted" />
              </div>
              <div className="mt-6 flex gap-3">
                <div className="h-11 w-40 animate-pulse rounded-md bg-muted" />
                <div className="h-11 w-36 animate-pulse rounded-md bg-muted" />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="aspect-[4/5] animate-pulse rounded-2xl border border-border/60 bg-muted/70" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
