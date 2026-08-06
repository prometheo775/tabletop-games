'use client';

interface Props {
  index: number;
  length: number;
  onIndexChange: (i: number) => void;
}

/** Navigazione carta precedente/successiva di un mazzo (riutilizzabile per sezione). */
export function DeckNav({ index, length, onIndexChange }: Props) {
  return (
    <div className="navrow">
      <button
        className="btn btn-secondary"
        disabled={index <= 0}
        onClick={() => onIndexChange(Math.max(0, index - 1))}
      >
        ◀
      </button>
      <span>{length ? `${index + 1} / ${length}` : '–'}</span>
      <button
        className="btn btn-secondary"
        disabled={index >= length - 1}
        onClick={() => onIndexChange(Math.min(length - 1, index + 1))}
      >
        ▶
      </button>
    </div>
  );
}
