type FlagIconProps = {
  className?: string;
  countryName: string;
  flagIconCode: string;
};

export function FlagIcon({
  className = '',
  countryName,
  flagIconCode,
}: FlagIconProps) {
  const accessibleLabel = `Bandeira de ${countryName}`;
  const normalizedFlagIconCode = flagIconCode.trim().toLowerCase();

  if (!normalizedFlagIconCode) {
    return (
      <span
        aria-label={accessibleLabel}
        className={['inline-flex text-xs font-semibold uppercase', className]
          .filter(Boolean)
          .join(' ')}
        role="img"
      >
        {countryName.slice(0, 2)}
      </span>
    );
  }

  return (
    <span
      aria-label={accessibleLabel}
      className={['fi', `fi-${normalizedFlagIconCode}`, className]
        .filter(Boolean)
        .join(' ')}
      role="img"
    />
  );
}
