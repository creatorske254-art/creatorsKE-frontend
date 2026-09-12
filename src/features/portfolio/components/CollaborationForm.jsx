import { useFieldArray } from 'react-hook-form';
import EmptyState from '@/components/shared/EmptyState';

const EMPTY_COLLAB = {
  brandName: '',
  campaignDescription: '',
  resultMetric: '',
};

/**
 * CollaborationForm
 * Past brand partnerships. Each entry: brand name, campaign description,
 * optional result metric. No upper limit - brands love a long track record.
 */
export function CollaborationForm({ control, register, errors }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'collaborations',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--grey-500)', marginTop: 'var(--space-2)' }}>
            Brands you've worked with before. Include results where you can; numbers build trust.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => append({ ...EMPTY_COLLAB })}
        >
          <i className="ti ti-plus" style={{ fontSize: 13 }} />
          Add collaboration
        </button>
      </div>

      {fields.length === 0 && (
        <div className="card card-dashed">
          <EmptyState
            size="sm"
            icon={<i className="ti ti-building-store" aria-hidden="true" />}
            title="No collaborations added yet"
            description="These are optional but help brands say yes faster."
          />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
        {fields.map((field, index) => {
          const e = errors?.collaborations?.[index] ?? {};
          return (
            <div
              key={field.id}
              className="card card-p-md"
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}
            >
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--grey-500)',
                  }}
                >
                  Collaboration {index + 1}
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
                <label className="field-label field-required">Brand name</label>
                <input
                  {...register(`collaborations.${index}.brandName`, {
                    required: 'Brand name is required',
                    maxLength: { value: 80, message: 'Keep it under 80 characters' },
                  })}
                  className={`input input-md ${e.brandName ? 'input-error' : ''}`}
                  placeholder="e.g. Safaricom, Naivas, Samsung Kenya…"
                />
                {e.brandName && <span className="field-hint error">{e.brandName.message}</span>}
              </div>

              <div className="field">
                <label className="field-label field-required">Campaign description</label>
                <textarea
                  {...register(`collaborations.${index}.campaignDescription`, {
                    required: 'Describe the campaign',
                    maxLength: { value: 300, message: 'Keep it under 300 characters' },
                  })}
                  className={`input input-md textarea ${e.campaignDescription ? 'input-error' : ''}`}
                  rows={3}
                  placeholder="What did you create? What was the campaign objective?"
                />
                {e.campaignDescription && (
                  <span className="field-hint error">{e.campaignDescription.message}</span>
                )}
              </div>

              <div className="field">
                <label className="field-label">
                  Result metric{' '}
                  <span style={{ color: 'var(--grey-400)', fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  {...register(`collaborations.${index}.resultMetric`, {
                    maxLength: { value: 120, message: 'Keep it under 120 characters' },
                  })}
                  className={`input input-md ${e.resultMetric ? 'input-error' : ''}`}
                  placeholder="e.g. 2.3M impressions, 18% engagement rate, 4× ROAS"
                />
                {e.resultMetric && (
                  <span className="field-hint error">{e.resultMetric.message}</span>
                )}
                <span className="field-hint">A single number or outcome is enough.</span>
              </div>
            </div>
          );
        })}
      </div>

      {fields.length > 0 && (
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ alignSelf: 'flex-start' }}
          onClick={() => append({ ...EMPTY_COLLAB })}
        >
          <i className="ti ti-plus" style={{ fontSize: 13 }} />
          Add another collaboration
        </button>
      )}
    </div>
  );
}