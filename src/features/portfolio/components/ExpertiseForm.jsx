import { useFieldArray } from 'react-hook-form';
import EmptyState from '@/components/shared/EmptyState';

const MAX_EXPERTISE = 4;

/**
 * ExpertiseForm
 * Up to 4 expertise areas with an optional short description each.
 * Requires at least 1 filled entry (validated via the parent schema).
 */
export function ExpertiseForm({ control, register, errors }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'expertise',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--grey-500)', marginTop: 2 }}>
            What do you do best? Up to {MAX_EXPERTISE} areas.
          </p>
        </div>
        {fields.length < MAX_EXPERTISE && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => append({ area: '', description: '' })}
          >
            <i className="ti ti-plus" style={{ fontSize: 13 }} />
            Add expertise
          </button>
        )}
      </div>

      {fields.length === 0 && (
        <div className="card card-dashed">
          <EmptyState
            size="sm"
            icon={<i className="ti ti-award" aria-hidden="true" />}
            title="No expertise added yet"
            description="Add at least one expertise area to complete your portfolio."
          />
        </div>
      )}

      {/* Root-level array error (e.g. "at least one required") */}
      {errors?.expertise?.root && (
        <p className="field-hint error">{errors.expertise.root.message}</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {fields.map((field, index) => {
          const e = errors?.expertise?.[index] ?? {};
          return (
            <div
              key={field.id}
              className="card card-p-md"
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              {/* Counter badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--purple-500)',
                  }}
                >
                  Expertise {index + 1}
                </span>
                <button
                  type="button"
                  className="btn btn-square-sm btn-icon-style"
                  onClick={() => remove(index)}
                  style={{ color: 'var(--status-error-text)', background: 'var(--status-error-bg)', borderColor: 'rgba(255,75,75,0.3)' }}
                >
                  <i className="ti ti-x" style={{ fontSize: 13 }} />
                </button>
              </div>

              <div className="field">
                <label className="field-label field-required">Area</label>
                <input
                  {...register(`expertise.${index}.area`, {
                    required: 'Please name this expertise',
                    maxLength: { value: 60, message: 'Keep it under 60 characters' },
                  })}
                  className={`input input-md ${e.area ? 'input-error' : ''}`}
                  placeholder="e.g. Beauty & Skincare, Tech Reviews, Food Photography…"
                />
                {e.area && <span className="field-hint error">{e.area.message}</span>}
              </div>

              <div className="field">
                <label className="field-label">Short description <span style={{ color: 'var(--grey-400)', fontWeight: 400 }}>(optional)</span></label>
                <input
                  {...register(`expertise.${index}.description`, {
                    maxLength: { value: 140, message: 'Keep it under 140 characters' },
                  })}
                  className={`input input-md ${e.description ? 'input-error' : ''}`}
                  placeholder="One sentence about what you bring to this niche"
                />
                {e.description && <span className="field-hint error">{e.description.message}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {fields.length > 0 && fields.length < MAX_EXPERTISE && (
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ alignSelf: 'flex-start' }}
          onClick={() => append({ area: '', description: '' })}
        >
          <i className="ti ti-plus" style={{ fontSize: 13 }} />
          Add another
        </button>
      )}

      {fields.length === MAX_EXPERTISE && (
        <p style={{ fontSize: 12, color: 'var(--grey-400)', textAlign: 'center' }}>
          Maximum {MAX_EXPERTISE} expertise areas reached.
        </p>
      )}
    </div>
  );
}