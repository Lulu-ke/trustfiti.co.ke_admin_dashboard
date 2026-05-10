import React, { useState } from "react";
import Card, { CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { Tag, Plus, Edit2, Trash2, GripVertical } from "lucide-react";
import toast from "react-hot-toast";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CategoryManager() {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", description: "", icon: "", sortOrder: 0 });
  const [loading, setLoading] = useState(false);

  const { data } = useSWR("/api/admin/categories", fetcher);

  const categories = data?.data || [];

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", icon: "", sortOrder: 0 });
    setShowModal(true);
  };

  const openEdit = (cat: any) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description || "", icon: cat.icon || "", sortOrder: cat.sortOrder });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setLoading(true);
    try {
      if (editing) {
        await fetch("/api/admin/categories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, ...form }),
        });
        toast.success("Category updated");
      } else {
        await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        toast.success("Category created");
      }
      mutate("/api/admin/categories");
      setShowModal(false);
    } catch {
      toast.error("Failed to save category");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await fetch("/api/admin/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      toast.success("Category deleted");
      mutate("/api/admin/categories");
    } catch {
      toast.error("Failed to delete category");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState title="No categories" description="Create your first industry category" />
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
          {categories.map((cat: any) => (
            <div key={cat.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                {cat.icon && <span className="text-lg">{cat.icon}</span>}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                    {cat.description && (
                      <span className="text-xs text-gray-500">— {cat.description}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {cat._count?.companies || 0} companies · Order: {cat.sortOrder}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Edit Category" : "New Category"}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} loading={loading}>{editing ? "Update" : "Create"}</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Technology" />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description" />
          <Input label="Icon (emoji)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="e.g., 💻" />
          <Input label="Sort Order" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} />
        </div>
      </Modal>
    </div>
  );
}
