export function ProductStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${isActive ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-600"}`}>
      {isActive ? "Activo" : "Inactivo"}
    </span>
  );
}
