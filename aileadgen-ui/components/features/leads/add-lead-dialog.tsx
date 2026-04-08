"use client";

import { useState } from "react";

import { useCreateLead } from "@/hooks/use-leads";
import { FieldErrorText, InlineError } from "@/components/shared/inline-error";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";
import { parseApiError } from "@/lib/api/error";

export function AddLeadDialog({ children }: { children: React.ReactNode }) {
  const createLead = useCreateLead();
  const [open, setOpen] = useState(false);
  const [leadForm, setLeadForm] = useState({
    company_name: "",
    contact_first_name: "",
    contact_last_name: "",
    contact_email: "",
    notes: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const onCreateLead = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});
    try {
      await createLead.mutateAsync({
        ...leadForm,
        contact_email: leadForm.contact_email || undefined,
        notes: leadForm.notes || undefined,
      });
      setOpen(false);
      setLeadForm({
        company_name: "",
        contact_first_name: "",
        contact_last_name: "",
        contact_email: "",
        notes: "",
      });
    } catch (error) {
      const parsed = parseApiError(error);
      setFormError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl p-0" showCloseButton={false}>
        <DialogHeader className="border-b border-outline-variant/30 px-6 py-4">
          <DialogTitle className="text-lg font-bold">Add Lead</DialogTitle>
          <DialogDescription>Create a lead manually. Header stays fixed while content scrolls.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onCreateLead}>
          <div className="max-h-[60vh] space-y-4 overflow-y-auto px-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="add_lead_company_name">Company Name</Label>
              <Input
                id="add_lead_company_name"
                value={leadForm.company_name}
                onChange={(e) => setLeadForm((prev) => ({ ...prev, company_name: e.target.value }))}
                required
              />
              <FieldErrorText message={fieldErrors.company_name} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="add_lead_contact_first_name">Contact First Name</Label>
                <Input
                  id="add_lead_contact_first_name"
                  value={leadForm.contact_first_name}
                  onChange={(e) => setLeadForm((prev) => ({ ...prev, contact_first_name: e.target.value }))}
                  required
                />
                <FieldErrorText message={fieldErrors.contact_first_name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add_lead_contact_last_name">Contact Last Name</Label>
                <Input
                  id="add_lead_contact_last_name"
                  value={leadForm.contact_last_name}
                  onChange={(e) => setLeadForm((prev) => ({ ...prev, contact_last_name: e.target.value }))}
                  required
                />
                <FieldErrorText message={fieldErrors.contact_last_name} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add_lead_contact_email">Contact Email</Label>
              <Input
                id="add_lead_contact_email"
                type="email"
                value={leadForm.contact_email}
                onChange={(e) => setLeadForm((prev) => ({ ...prev, contact_email: e.target.value }))}
              />
              <FieldErrorText message={fieldErrors.contact_email} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add_lead_notes">Notes</Label>
              <Input
                id="add_lead_notes"
                value={leadForm.notes}
                onChange={(e) => setLeadForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
              <FieldErrorText message={fieldErrors.notes} />
            </div>
            <InlineError message={formError ?? undefined} />
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-outline-variant/30 bg-surface-container-low px-6 py-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <LoadingButton type="submit" loading={createLead.isPending}>
              Create Lead
            </LoadingButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
