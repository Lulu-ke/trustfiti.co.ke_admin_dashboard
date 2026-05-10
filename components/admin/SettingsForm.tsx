import React, { useState } from "react";
import Card, { CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";

interface SettingGroup {
  label: string;
  settings: { key: string; label: string; type: "text" | "number" | "boolean"; description?: string }[];
}

interface SettingsFormProps {
  settings: Record<string, string>;
  groups: SettingGroup[];
  onSave: (settings: Record<string, string>) => Promise<void>;
}

export default function SettingsForm({ settings, groups, onSave }: SettingsFormProps) {
  const [values, setValues] = useState<Record<string, string>>(settings);
  const [loading, setLoading] = useState(false);
  const [changed, setChanged] = useState(false);

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setChanged(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(values);
      toast.success("Settings saved successfully");
      setChanged(false);
    } catch {
      toast.error("Failed to save settings");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <Card key={group.label}>
          <CardTitle className="mb-4">{group.label}</CardTitle>
          <div className="space-y-4">
            {group.settings.map((setting) => (
              <div key={setting.key} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{setting.label}</label>
                  {setting.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{setting.description}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  {setting.type === "boolean" ? (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={values[setting.key] === "true"}
                        onChange={(e) => handleChange(setting.key, String(e.target.checked))}
                        className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm text-gray-700">
                        {values[setting.key] === "true" ? "Enabled" : "Disabled"}
                      </span>
                    </label>
                  ) : (
                    <Input
                      type={setting.type}
                      value={values[setting.key] || ""}
                      onChange={(e) => handleChange(setting.key, e.target.value)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button variant="primary" onClick={handleSave} loading={loading} disabled={!changed}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
