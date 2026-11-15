export function SetupNotice({ message }: { message: string }) {
  return (
    <div className="border-b border-[#f0c7c2] bg-[#fff4f2]">
      <div className="mx-auto max-w-6xl px-4 py-3 text-sm">
        <p className="font-semibold">Firebase not connected</p>
        <p className="mt-1 text-muted">{message}</p>
      </div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, lede }: { eyebrow?: string; title: string; lede?: string }) {
  return (
    <div>
      <div className="mx-auto max-w-6xl px-4 pb-2 pt-10">
        {eyebrow ? <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">{eyebrow}</p> : null}
        <h1 className="mt-2 font-display text-4xl tracking-tight md:text-5xl">{title}</h1>
        {lede ? <p className="mt-3 max-w-2xl text-muted">{lede}</p> : null}
      </div>
    </div>
  );
}
