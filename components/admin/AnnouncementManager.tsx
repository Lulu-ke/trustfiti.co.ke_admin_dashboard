import React, { useState } from "react";
import Card, { CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import StatusBadge from "@/components/ui/StatusBadge";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import toast from "react-hot-toast";
import useSWR, { mutate } from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AnnouncementManager() {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "INFO",
    targetAudience: "ALL",
    isPublished: false,
    expiresAt: "",
  });
  const [loading, setLoading] = useState(false);

  const { data } = useSWR("/api/admin/announcements", fetcher);
  const announcements = data?.data || [];

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", content: "", type: "INFO", targetAudience: "ALL", isPublished: false, expiresAt: "" });
    setShowModal(true);
  };

  const openEdit = (ann: any) => {
    setEditing(ann);
    setForm({
      title: ann.title,
      content: ann.content,
      type: ann.type,
      targetAudience: ann.targetAudience,
      isPublished: ann.isPublished,
      expiresAt: ann.expiresAt ? new Date(ann.expiresAt).toISOString().slice(0, 16) : "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) { toast.error("Title and content are required"); return; }
    setLoading(true);
    try {
      if (editing) {
        await fetch("/api/admin/announcements", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, ...form }),
        });
        toast.success("Announcement updated");
      } else {
        await fetch("/api/admin/announcements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        toast.success("Announcement created");
      }
      mutate("/api/admin/announcements");
      setShowModal(false);
    } catch {
      toast.error("Failed to save announcement");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await fetch("/api/admin/announcements", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      toast.success("Announcement deleted");
      mutate("/api/admin/announcements");
    } catch {
      toast.error("Failed to delete announcement");
    }
  };

  const togglePublish = async (ann: any) => {
    try {
      await fetch("/api/admin/announcements", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ann.id, ...ann, isPublished: !ann.isPublished }),
      });
      toast.success(ann.isPublished ? "Unpublished" : "Published");
      mutate("/api/admin/announcements");
    } catch {
      toast.error("Failed to toggle publish");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          New Announcement
        </Button>
      </div>

      {announcements.length === 0 ? (
        <EmptyState title="No announcements" description="Create your first announcement" />
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
          {announcements.map((ann: any) => (
            <div key={ann.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-gray-900">{ann.title}</p>
                    <StatusBadge status={ann.type} />
                    <Badge variant={ann.targetAudience === "ALL" ? "neutral" : ann.targetAudience === "REVIEWERS" ? "info" : "purple"}>
                      {ann.targetAudience}
                    </Badge>
                    <Badge variant={ann.isPublished ? "success" : "neutral"} dot>
                      {ann.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ann.content}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>{timeAgo(ann.createdAt)}</span>
                    {ann.expiresAt && <span>Expires: {new Date(ann.expiresAt).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <button onClick={() => togglePublish(ann)} className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors" title={ann.isPublished ? "Unpublish" : "Publish"}>
                    {ann.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button onClick={() => openEdit(ann)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(ann.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Edit Announcement" : "New Announcement"}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} loading={loading}>{editing ? "Update" : "Create"}</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Announcement title" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Content</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={5}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Announcement content..."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={[{ value: "INFO", label: "Info" }, { value: "WARNING", label: "Warning" }, { value: "MAINTENANCE", label: "Maintenance" }, { value: "UPDATE", label: "Update" }]} />
            <Select label="Audience" value={form.targetAudience} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })} options={[{ value: "ALL", label: "Everyone" }, { value: "REVIEWERS", label: "Reviewers" }, { value: "COMPANIES", label: "Companies" }]} />
            <Input label="Expires At" type="datetime-local" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
