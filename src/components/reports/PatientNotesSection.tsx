export interface PatientNoteValues {
  whatChangedRecently: string;
  whatWorriesMeMost: string;
  whatIWantToAskMyDoctor: string;
}

interface PatientNotesSectionProps {
  value: PatientNoteValues;
  onChange?: (value: PatientNoteValues) => void;
  readOnly?: boolean;
  title?: string;
}

function NoteField({
  label,
  value,
  onChange,
  placeholder,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder: string;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-tertiary)] print:text-gray-500">
        {label}
      </label>
      {readOnly ? (
        <div className="min-h-[88px] rounded-[20px] border border-[rgba(197,168,255,0.14)] bg-white/[0.035] px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)] print:border-gray-200 print:bg-gray-50 print:text-gray-700">
          {value.trim().length > 0 ? value : 'No note added.'}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          rows={4}
          className="input-base min-h-[112px] w-full resize-none print:border-gray-300 print:bg-white print:text-gray-900"
        />
      )}
    </div>
  );
}

export default function PatientNotesSection({
  value,
  onChange,
  readOnly = false,
  title = 'Patient Notes for Appointment',
}: PatientNotesSectionProps) {
  const setField = (key: keyof PatientNoteValues, nextValue: string) => {
    if (!onChange) return;
    onChange({
      ...value,
      [key]: nextValue,
    });
  };

  return (
    <section className="mb-5 rounded-[34px] border border-[rgba(197,168,255,0.16)] bg-[rgba(10,13,31,0.64)] p-5 shadow-[0_18px_54px_rgba(5,8,22,0.18)] print:border-gray-300 print:bg-white print:p-6">
      <div className="mb-5 border-b border-[rgba(197,168,255,0.12)] pb-4 print:border-gray-200">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gw-intelligence-300)] print:text-gray-500">
          Patient Perspective
        </p>
        <h3 className="text-lg font-semibold tracking-[-0.03em] text-[var(--color-text-primary)] print:text-gray-900">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)] print:text-gray-600">
          Capture the context, priorities, and questions you want in front of your clinician.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <NoteField
          label="What changed recently"
          value={value.whatChangedRecently}
          onChange={(next) => setField('whatChangedRecently', next)}
          placeholder="Examples: symptoms became more frequent, medication changed, travel, stress, diet shift"
          readOnly={readOnly}
        />

        <NoteField
          label="What worries me most"
          value={value.whatWorriesMeMost}
          onChange={(next) => setField('whatWorriesMeMost', next)}
          placeholder="What feels most important, disruptive, or concerning right now?"
          readOnly={readOnly}
        />

        <NoteField
          label="What I want to ask my doctor"
          value={value.whatIWantToAskMyDoctor}
          onChange={(next) => setField('whatIWantToAskMyDoctor', next)}
          placeholder="List the questions you want to cover during the appointment."
          readOnly={readOnly}
        />
      </div>
    </section>
  );
}
