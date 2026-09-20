interface ContentTabsProps {
  active: string;
  items: string[];
  onChange?: (value: string) => void;
}

export function ContentTabs({
  active,
  items,
  onChange,
}: ContentTabsProps) {
  return (
    <div className="mb-5 flex gap-6 overflow-x-auto border-b border-slate-200">
      {items.map((item) => (
        <button
          key={item}
          className={`relative whitespace-nowrap border-0 bg-transparent px-1 py-2.5 text-caption ${active === item ? "font-bold text-primary after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:bg-primary" : "text-slate-400"}`}
          onClick={() => onChange?.(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}