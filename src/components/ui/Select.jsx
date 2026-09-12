import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconCheck, IconChevronDown } from '@tabler/icons-react';

/*
   The app's one dropdown. A native <select> can't be styled past its trigger
   - the open list is the OS's, in the OS's font and colours - so this is a
   listbox drawn by us: same look in every browser and in dark mode, with
   hints per option, and the keyboard behaviour people expect from a native
   select (arrows, Enter/Space, Esc, Home/End, type-to-jump).

   The list renders in a portal at a fixed position, so it escapes modal and
   card overflow, and flips above the trigger when there is no room below.

   @param {string}   value
   @param {(value) => void} onChange
   @param {Array<{ value, label, hint?, disabled?, icon? }>} options
   @param {string}   [placeholder]
   @param {'sm'|'md'} [size]       - matches .input-sm / .input-md
   @param {'input'|'pill'} [variant] - pill = filter chip style (directory filters)
   @param {string}   [className]  - extra classes on the trigger (e.g. a page's own input class)
   @param {string}   [id]         - for <label htmlFor>
*/
export default function Select({
  value, onChange, options = [], placeholder = 'Select', size = 'md', variant = 'input',
  className = '', style, id, disabled = false, 'aria-label': ariaLabel, name,
}) {
  const reactId = useId();
  const listId = `${id ?? reactId}-listbox`;
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [pos, setPos] = useState(null);
  const typeahead = useRef({ text: '', at: 0 });

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = options[selectedIndex];
  const enabledIndexes = useMemo(() => options.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0), [options]);

  function place() {
    const r = triggerRef.current?.getBoundingClientRect();
    if (!r) return;
    const listH = Math.min(280, options.length * 36 + 8);
    const below = window.innerHeight - r.bottom;
    const flip = below < listH + 8 && r.top > below;
    setPos({ left: r.left, width: r.width, top: flip ? undefined : r.bottom + 4, bottom: flip ? window.innerHeight - r.top + 4 : undefined });
  }

  function openList(startAt) {
    if (disabled) return;
    place();
    setOpen(true);
    setActive(startAt ?? (selectedIndex >= 0 ? selectedIndex : enabledIndexes[0] ?? -1));
  }
  function close(focusTrigger = true) {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  }
  function commit(i) {
    const o = options[i];
    if (!o || o.disabled) return;
    onChange?.(o.value);
    close();
  }
  function move(delta) {
    if (!enabledIndexes.length) return;
    const cur = enabledIndexes.indexOf(active);
    const next = cur === -1 ? (delta > 0 ? 0 : enabledIndexes.length - 1) : Math.min(enabledIndexes.length - 1, Math.max(0, cur + delta));
    setActive(enabledIndexes[next]);
  }
  function jump(ch) {
    const now = Date.now();
    const t = typeahead.current;
    t.text = now - t.at < 600 ? t.text + ch : ch;
    t.at = now;
    const from = active >= 0 ? active + 1 : 0;
    const order = [...options.keys()].slice(from).concat([...options.keys()].slice(0, from));
    const hit = order.find((i) => !options[i].disabled && String(options[i].label).toLowerCase().startsWith(t.text.toLowerCase()));
    if (hit !== undefined) { setActive(hit); if (!open) onChange?.(options[hit].value); }
  }

  function onTriggerKeyDown(e) {
    if (disabled) return;
    switch (e.key) {
      case 'ArrowDown': case 'ArrowUp': e.preventDefault(); if (open) move(e.key === 'ArrowDown' ? 1 : -1); else openList(); break;
      case 'Enter': case ' ': e.preventDefault(); if (open) commit(active); else openList(); break;
      case 'Escape': if (open) { e.preventDefault(); close(); } break;
      case 'Home': if (open) { e.preventDefault(); setActive(enabledIndexes[0]); } break;
      case 'End': if (open) { e.preventDefault(); setActive(enabledIndexes[enabledIndexes.length - 1]); } break;
      case 'Tab': if (open) close(false); break;
      default: if (e.key.length === 1 && !e.altKey && !e.ctrlKey && !e.metaKey) jump(e.key);
    }
  }

  // Close on outside click / scroll elsewhere / resize; keep the list anchored.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (!triggerRef.current?.contains(e.target) && !listRef.current?.contains(e.target)) close(false); };
    const onScroll = (e) => { if (listRef.current?.contains(e.target)) return; place(); };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', onScroll, true);
    return () => { document.removeEventListener('mousedown', onDown); window.removeEventListener('resize', place); window.removeEventListener('scroll', onScroll, true); };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the active option in view.
  useLayoutEffect(() => {
    if (!open || active < 0) return;
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const cls = ['select-trigger', variant === 'pill' ? 'select-trigger--pill' : `input input-${size}`, className].filter(Boolean).join(' ');

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        name={name}
        className={cls}
        style={style}
        disabled={disabled}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        data-placeholder={!selected || undefined}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onTriggerKeyDown}
      >
        {selected?.icon && <selected.icon className="icon-sm" aria-hidden="true" />}
        <span className="select-trigger__value">{selected ? selected.label : placeholder}</span>
        <IconChevronDown className="icon-sm select-trigger__chevron" aria-hidden="true" />
      </button>

      {open && pos && createPortal(
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          className="select-popover"
          style={{ position: 'fixed', left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom }}
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          tabIndex={-1}
        >
          {options.map((o, i) => (
            <li
              key={String(o.value)}
              id={`${listId}-${i}`}
              data-index={i}
              role="option"
              aria-selected={i === selectedIndex}
              aria-disabled={o.disabled || undefined}
              className={`select-option${i === active ? ' is-active' : ''}${i === selectedIndex ? ' is-selected' : ''}${o.disabled ? ' is-disabled' : ''}`}
              onMouseEnter={() => !o.disabled && setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => commit(i)}
            >
              {o.icon && <o.icon className="icon-sm" aria-hidden="true" />}
              <span className="select-option__body">
                <span className="select-option__label">{o.label}</span>
                {o.hint && <span className="select-option__hint">{o.hint}</span>}
              </span>
              {i === selectedIndex && <IconCheck className="icon-sm select-option__check" aria-hidden="true" />}
            </li>
          ))}
        </ul>,
        document.body,
      )}
    </>
  );
}
