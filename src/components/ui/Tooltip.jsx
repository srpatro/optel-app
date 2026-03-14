// Reusable tooltip for icons and buttons - shows on hover (also uses title for accessibility)
const Tooltip = ({ children, label, position = 'bottom' }) => {
  if (!label) return children

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <span className="relative inline-flex group" title={label}>
      {children}
      <span
        role="tooltip"
        className={`absolute z-[100] px-2.5 py-1.5 text-xs font-medium text-white bg-gray-800 rounded shadow-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 pointer-events-none ${positionClasses[position]}`}
      >
        {label}
      </span>
    </span>
  )
}

export default Tooltip
