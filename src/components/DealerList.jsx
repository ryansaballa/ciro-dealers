// src/components/DealerList.jsx
// Presentational only — receives dealers from App, owns no fetching.

export default function DealerList({ dealers, selected, onSelect }) {
  if (!dealers.length) {
    return (
      <p className="p-4 text-sm text-slate-500">
        No dealers match your filters.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-slate-200">
      {dealers.map((dealer, i) => {
        const isSelected = selected?.name === dealer.name

        return (
          <li
            key={dealer.name ?? i}
            onClick={() => onSelect?.(dealer)}
            className={`cursor-pointer p-4 transition hover:bg-slate-50 ${
              isSelected ? "border-l-4 border-blue-600 bg-blue-50" : ""
            }`}
          >
            <h3 className="font-semibold text-slate-900">{dealer.name}</h3>

            {dealer.category && (
              <span className="mt-1 inline-block rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                {dealer.category}
              </span>
            )}

            {dealer.province && (
              <p className="dealer-province">
                Province: {dealer.province}
              </p>
            )}

            {dealer.phone && (
              <p className="mt-2 text-sm">
                <a
                  href={`tel:${dealer.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-600 hover:underline"
                >
                  {dealer.phone}
                </a>
              </p>
            )}

            {dealer.website && (
              <p className="mt-1 text-sm">
                <a
                  href={dealer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-600 hover:underline"
                >
                  Visit website
                </a>
              </p>
            )}
          </li>
        )
      })}
    </ul>
  )
}
