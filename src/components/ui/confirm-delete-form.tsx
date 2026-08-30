"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";

type ServerAction = (formData: FormData) => void | Promise<void>;

export function ConfirmDeleteForm({ action, id, itemName, fields = {} }: { action: ServerAction; id: string; itemName: string; fields?: Record<string, string> }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!window.confirm(`Hapus ${itemName}? Tindakan ini tidak dapat dibatalkan.`)) return;

    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await action(formData);
      showToast(`${itemName} berhasil dihapus!`, "delete");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Gagal menghapus data.";
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  }

  return <form onSubmit={handleSubmit}>
    <input type="hidden" name="id" value={id}/>
    {Object.entries(fields).map(([name, value]) => <input key={name} type="hidden" name={name} value={value}/>)}
    <button disabled={loading} type="submit" title={`Hapus ${itemName}`} className="grid h-9 w-9 place-items-center rounded-lg text-[var(--muted)] transition hover:bg-[#fff0ec] hover:text-[#b93c21] disabled:opacity-50">
      <Trash2 size={16}/>
    </button>
  </form>;
}
