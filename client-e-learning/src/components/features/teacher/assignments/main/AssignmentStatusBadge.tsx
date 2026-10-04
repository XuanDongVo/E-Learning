type Props = {
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

export function AssignmentStatusBadge({
  status,
}: Props) {
  const config = {
    DRAFT: {
      label: "Draft",
      className: "bg-sky-100 text-sky-700",
    },
    PUBLISHED: {
      label: "Active",
      className: "bg-green-100 text-green-700",
    },
    ARCHIVED: {
      label: "Archived",
      className: "bg-orange-100 text-orange-700",
    },
  };

  const item = config[status];

  return (
    <span
      className={`ml-1 inline-flex rounded-full px-2 py-0.5 align-middle text-[0.625rem] font-bold ${item.className}`}
    >
      {item.label}
    </span>
  );
}