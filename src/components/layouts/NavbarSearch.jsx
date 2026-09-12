import { useEffect, useRef, useState } from 'react';
import { IconSearch, IconX } from '@tabler/icons-react';

/*
   The dashboard navbar's search, shared by all three layouts.

   Desktop: an inline search field centred in the navbar.
   Under 600px: the field would crowd the logo, bell and avatar, so it
   collapses to an icon button; tapping it drops a full-width search sheet
   under the navbar (autofocused, Escape or the X closes it). Submitting
   navigates via `onSubmit(query)` and closes the sheet.
*/
export default function NavbarSearch({ placeholder = 'Search…', ariaLabel = 'Search', onSubmit }) {
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    inputRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  function submit(e) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    onSubmit?.(q);
    setOpen(false);
  }

  const field = (
    <div className="input-wrapper navbar-search__field">
      <IconSearch className="icon-sm input-icon left" aria-hidden="true" />
      <input
        ref={inputRef}
        className="search-input"
        type="search"
        placeholder={placeholder}
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        enterKeyHint="search"
      />
    </div>
  );

  return (
    <>
      <form className="navbar-search" role="search" onSubmit={submit}>{field}</form>

      <button
        type="button"
        className="btn btn-square btn-icon-style navbar-search__toggle"
        aria-label={open ? 'Close search' : ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <IconX className="icon-md" aria-hidden="true" /> : <IconSearch className="icon-md" aria-hidden="true" />}
      </button>

      {open && (
        <form className="navbar-search__sheet" role="search" onSubmit={submit}>
          {field}
          <button type="submit" className="btn btn-purple btn-sm">Search</button>
        </form>
      )}
    </>
  );
}
