import { useFieldArray } from 'react-hook-form';
import EmptyState from '@/components/shared/EmptyState';

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'twitter', label: 'X (Twitter)' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'blog', label: 'Blog / Newsletter' },
  { value: 'other', label: 'Other' },
];

const EMPTY_STAT = {
  platform: '',
  handle: '',
  followers: '',
  avgViews: '',
  engagementRate: '',
};

/**
 * SocialStatsForm
 * Controlled by react-hook-form from the parent builder.
 * Pass the `control` and `register` props from useForm().
 */
export function SocialStatsForm({ control, register, errors }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'socialStats',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--grey-500)', marginTop: 2 }}>
            Add the platforms you're active on. Brands use these numbers to evaluate fit.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => append({ ...EMPTY_STAT })}
          disabled={fields.length >= 8}
        >
          <i className="ti ti-plus" style={{ fontSize: 13 }} />
          Add platform
        </button>
      </div>

      {fields.length === 0 && (
        <div className="card card-dashed">
          <EmptyState
            size="sm"
            icon={<i className="ti ti-device-mobile" aria-hidden="true" />}
            title="No platforms added yet"
            description="Click 'Add platform' to get started."
          />
        </div>
      )}

      {fields.map((field, index) => {
        const e = errors?.socialStats?.[index] ?? {};
        return (
          <div
            key={field.id}
            className="card card-p-md"
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            {/* Row 1: platform + handle */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'end' }}>
              <div className="field">
                <label className="field-label field-required">Platform</label>
                <div className="select-wrapper">
                  <select
                    {...register(`socialStats.${index}.platform`, { required: 'Select a platform' })}
                    className={`input input-md ${e.platform ? 'input-error' : ''}`}
                  >
                    <option value="">Select platform</option>
                    {PLATFORMS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                {e.platform && <span className="field-hint error">{e.platform.message}</span>}
              </div>

              <div className="field">
                <label className="field-label">Handle / URL</label>
                <input
                  {...register(`socialStats.${index}.handle`)}
                  className="input input-md"
                  placeholder="@yourhandle"
                />
              </div>
            </div>

            {/* Row 2: stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div className="field">
                <label className="field-label field-required">Followers</label>
                <input
                  {...register(`socialStats.${index}.followers`, {
                    required: 'Required',
                    min: { value: 0, message: 'Must be ≥ 0' },
                  })}
                  type="number"
                  className={`input input-md ${e.followers ? 'input-error' : ''}`}
                  placeholder="12000"
                />
                {e.followers && <span className="field-hint error">{e.followers.message}</span>}
              </div>

              <div className="field">
                <label className="field-label">Avg. views / reach</label>
                <input
                  {...register(`socialStats.${index}.avgViews`, {
                    min: { value: 0, message: 'Must be ≥ 0' },
                  })}
                  type="number"
                  className={`input input-md ${e.avgViews ? 'input-error' : ''}`}
                  placeholder="3500"
                />
                {e.avgViews && <span className="field-hint error">{e.avgViews.message}</span>}
              </div>

              <div className="field">
                <label className="field-label">Engagement rate (%)</label>
                <div className="input-wrapper">
                  <input
                    {...register(`socialStats.${index}.engagementRate`, {
                      min: { value: 0, message: 'Must be ≥ 0' },
                      max: { value: 100, message: 'Must be ≤ 100' },
                    })}
                    type="number"
                    step="0.1"
                    className={`input input-md input-icon-right ${e.engagementRate ? 'input-error' : ''}`}
                    placeholder="4.2"
                  />
                  <i className="ti ti-percentage input-icon right" />
                </div>
                {e.engagementRate && <span className="field-hint error">{e.engagementRate.message}</span>}
              </div>
            </div>

            {/* Remove */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-danger btn-xs"
                onClick={() => remove(index)}
              >
                <i className="ti ti-trash" style={{ fontSize: 12 }} />
                Remove
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}