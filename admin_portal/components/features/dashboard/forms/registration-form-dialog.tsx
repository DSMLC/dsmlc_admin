"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type React from "react";

import {
  createRegistration,
  updateRegistration,
} from "@/lib/actions/registrations";
import type { ActionState } from "@/lib/actions/types";
import type { RegistrationRow } from "@/lib/queries/registrations";
import { FormDialogShell } from "@/components/features/dashboard/forms/form-dialog-shell";
import { Button, SubmitButton } from "@/components/ui/button";
import { TextField, SelectField } from "@/components/ui/form-field";

interface RegistrationFormDialogProps {
  mode: "create" | "edit";
  eventId: string;
  registration?: RegistrationRow;
  trigger: React.ReactNode;
  triggerClassName?: string;
}

const initialState: ActionState = {};

const STATUS_OPTIONS = [
  { value: "registered", label: "Registered" },
  { value: "attended", label: "Attended" },
  { value: "at-door", label: "At-door (walk-in)" },
];

const SOURCE_OPTIONS = [
  { value: "Mailman", label: "Mailman" },
  { value: "Instagram", label: "Instagram" },
  { value: "LinkedIn", label: "LinkedIn" },
  { value: "Website", label: "Website" },
  { value: "Word-of-Mouth", label: "Word-of-Mouth" },
];

export function RegistrationFormDialog({
  mode,
  eventId,
  registration,
  trigger,
}: RegistrationFormDialogProps) {
  const [open, setOpen] = useState(false);
  const action = mode === "edit" ? updateRegistration : createRegistration;
  const [state, formAction] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      setOpen(false);
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <FormDialogShell
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title={mode === "edit" ? "Edit registration" : "Add registration"}
    >
      <form ref={formRef} action={formAction} className="space-y-4">
        <input type="hidden" name="event_id" value={eventId} />
        {mode === "edit" && registration && (
          <input
            type="hidden"
            name="registration_id"
            value={registration.registration_id}
          />
        )}

        {mode === "create" ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <TextField label="First name *" name="first_name" required />
              <TextField label="Last name *" name="last_name" required />
            </div>

            <TextField label="Email *" name="email" type="email" required />

            <div className="grid grid-cols-2 gap-3">
              <TextField label="Student ID *" name="student_id" />
              <TextField label="Major" name="major" />
            </div>
          </>
        ) : (
          registration && (
            <div>
              <p className="mb-1.5 text-xs font-light text-white/60">Person</p>
              <p className="text-sm text-white">
                {registration.first_name} {registration.last_name} (
                {registration.email})
              </p>
            </div>
          )
        )}

        <SelectField
          label="Status *"
          name="status"
          defaultValue={registration?.status ?? "registered"}
          options={STATUS_OPTIONS}
        />

        <TextField
          label="Course credit"
          name="course_name"
          defaultValue={registration?.course_name ?? ""}
          placeholder="e.g. STAT 301"
        />

        <SelectField
          label="Sign-up Source"
          name="coming_from"
          defaultValue={registration?.coming_from ?? ""}
          placeholder="none"
          options={SOURCE_OPTIONS}
        />

        {state.error && (
          <p className="text-sm font-light text-red-400">{state.error}</p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <SubmitButton pendingLabel="Saving…">
            {mode === "edit" ? "Save changes" : "Add registration"}
          </SubmitButton>
        </div>
      </form>
    </FormDialogShell>
  );
}
