"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateSetAction, removeSetAction } from "../actions";

interface SetRowProps {
  setId: string;
  setNumber: number;
  initialReps: number | null;
  initialWeight: string | null;
  initialWeightUnit: 'lbs' | 'kg';
}

export function SetRow({ setId, setNumber, initialReps, initialWeight, initialWeightUnit }: SetRowProps) {
  const [reps, setReps] = useState(initialReps?.toString() ?? "");
  const [weight, setWeight] = useState(initialWeight ?? "");
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>(initialWeightUnit);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await updateSetAction(
      setId,
      reps ? parseInt(reps, 10) : null,
      weight || null,
      weightUnit
    );
    setSaving(false);
  }

  async function handleRemove() {
    setRemoving(true);
    await removeSetAction(setId);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="w-6 text-sm text-muted-foreground">{setNumber}</span>
      <Input
        type="number"
        placeholder="Reps"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        className="w-20"
      />
      <Input
        type="number"
        placeholder="Weight"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        className="w-24"
      />
      <Select value={weightUnit} onValueChange={(v) => setWeightUnit(v as 'lbs' | 'kg')}>
        <SelectTrigger className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="lbs">lbs</SelectItem>
          <SelectItem value="kg">kg</SelectItem>
        </SelectContent>
      </Select>
      <Button size="sm" variant="outline" onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save"}
      </Button>
      <Button size="sm" variant="ghost" onClick={handleRemove} disabled={removing}>
        Remove
      </Button>
    </div>
  );
}
