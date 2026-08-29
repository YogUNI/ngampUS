"use client";

import { Trash2 } from "lucide-react";

type ServerAction = (formData: FormData) => void | Promise<void>;

export function ConfirmDeleteForm({ action, id, itemName, fields = {} }: { action: ServerAction; id: string; itemName: string; fields?: Record<string, string> }) {
  return <form action={action} onSubmit={(event) => {
    if (!window.confirm(`Hapus ${itemName}? Tindakan ini tidak dapat dibatalkan.`)) event.preventDefault();
  }}>
    <input type="hidden" name="id" value={id}/>
    {Object.entries(fields).map(([name, value]) => <input key={name} type="hidden" name={name} value={value}/>)}
    <button type="submit" title={`Hapus ${itemName}`} className="grid h-9 w-9 place-items-center rounded-lg text-[var(--muted)] transition hover:bg-[#fff0ec] hover:text-[#b93c21]">
      <Trash2 size={16}/>
    </button>
  </form>;
}
