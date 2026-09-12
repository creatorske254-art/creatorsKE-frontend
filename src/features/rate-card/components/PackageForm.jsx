import { useFieldArray } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { IconAlertCircle, IconPlus, IconTrash, IconX } from '@tabler/icons-react';

/**
 * PackageForm
 *
 * Renders the fields for a single package inside the rate card builder.
 * Expects to be rendered inside a parent <FormProvider> or to receive
 * { register, control, formState } via props from the parent useForm() call.
 *
 * Props:
 *   index        - position of this package in the packages[] field array
 *   register     - from react-hook-form
 *   control      - from react-hook-form (needed for useFieldArray deliverables)
 *   errors       - formState.errors.packages?.[index]
 *   onRemove     - () => void - called when the creator removes this package
 */
export default function PackageForm({ index, register, control, errors, onRemove }) {
  const { fields: deliverables, append, remove } = useFieldArray({
    control,
    name: `packages.${index}.deliverables`,
  });

  return (
    <div className="package-form">
      {/* ── Header row ──────────────────────────────────────────────────── */}
      <div className="package-form__header">
        <span className="package-form__counter">Package {index + 1}</span>
        {onRemove && (
          <button
            type="button"
            className="package-form__remove"
            onClick={onRemove}
            aria-label="Remove package"
          >
            <IconTrash className="icon-sm" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* ── Name ────────────────────────────────────────────────────────── */}
      <div className="field">
        <label className="field-label field-required">Package name</label>
        <input
          className={cn('input input-md', errors?.name && 'input-error')}
          placeholder="e.g. Instagram Story"
          {...register(`packages.${index}.name`, {
            required: 'Package name is required',
          })}
        />
        {errors?.name && (
          <span className="field-hint error">
            <IconAlertCircle className="icon-sm" aria-hidden="true" /> {errors.name.message}
          </span>
        )}
      </div>

      {/* ── Price ───────────────────────────────────────────────────────── */}
      <div className="field">
        <label className="field-label field-required">Price (KES)</label>
        <div className="input-wrapper">
          <input
            className={cn('input input-md input-icon-left', errors?.price && 'input-error')}
            type="number"
            min="0"
            placeholder="0"
            {...register(`packages.${index}.price`, {
              required: 'Price is required',
              min: { value: 1, message: 'Price must be greater than 0' },
              valueAsNumber: true,
            })}
          />
          <span className="input-icon left" style={{ fontWeight: 600, fontSize: 13, color: 'var(--grey-500)' }}>
            KES
          </span>
        </div>
        {errors?.price && (
          <span className="field-hint error">
            <IconAlertCircle className="icon-sm" aria-hidden="true" /> {errors.price.message}
          </span>
        )}
      </div>

      {/* ── Description ─────────────────────────────────────────────────── */}
      <div className="field">
        <label className="field-label">Description</label>
        <textarea
          className="input input-md textarea"
          rows={3}
          placeholder="What does this package include? What's the turnaround?"
          {...register(`packages.${index}.description`)}
        />
        <span className="field-hint">Shown to brands on your public rate card</span>
      </div>

      {/* ── Deliverables ────────────────────────────────────────────────── */}
      <div className="field">
        <label className="field-label">Deliverables</label>
        <div className="package-form__deliverables">
          {deliverables.map((item, di) => (
            <div key={item.id} className="package-form__deliverable-row">
              <input
                className="input input-sm"
                placeholder={`e.g. 1 × 30-second reel`}
                {...register(`packages.${index}.deliverables.${di}.text`)}
              />
              <button
                type="button"
                className="btn btn-square-sm btn-icon-style"
                onClick={() => remove(di)}
                aria-label="Remove deliverable"
              >
                <IconX className="icon-xs" aria-hidden="true" />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="package-form__add-deliverable"
            onClick={() => append({ text: '' })}
          >
            <IconPlus className="icon-sm" aria-hidden="true" />
            Add deliverable
          </button>
        </div>
      </div>

      {/* ── Revision policy ─────────────────────────────────────────────── */}
      <div className="field">
        <label className="field-label">Revisions included</label>
        <div className="select-wrapper">
          <select
            className="input input-md"
            {...register(`packages.${index}.revisions`)}
          >
            <option value="0">No revisions</option>
            <option value="1">1 revision</option>
            <option value="2">2 revisions</option>
            <option value="3">3 revisions</option>
            <option value="unlimited">Unlimited</option>
          </select>
        </div>
      </div>

      <style>{`
        .package-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-16);
          padding: var(--space-20);
          background: var(--white);
          border: 0.5px solid var(--grey-100);
          border-radius: var(--radius-lg);
        }
        .package-form__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-4);
        }
        .package-form__counter {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--purple-500);
        }
        .package-form__remove {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--grey-400);
          font-size: 15px;
          padding: var(--space-4);
          border-radius: var(--radius-sm);
          transition: color 0.15s, background 0.15s;
        }
        .package-form__remove:hover {
          color: var(--status-error-text);
          background: var(--status-error-bg);
        }
        .package-form__deliverables {
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
        }
        .package-form__deliverable-row {
          display: flex;
          align-items: center;
          gap: var(--space-8);
        }
        .package-form__deliverable-row .input {
          flex: 1;
        }
        .package-form__add-deliverable {
          display: inline-flex;
          align-items: center;
          gap: var(--space-8);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--purple-500);
          font-size: 12px;
          font-weight: 500;
          font-family: var(--font-body);
          padding: var(--space-4) 0;
          margin-top: var(--space-2);
          transition: color 0.15s;
        }
        .package-form__add-deliverable:hover {
          color: var(--purple-600);
        }
      `}</style>
    </div>
  );
}
