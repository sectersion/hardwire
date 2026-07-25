export function Logo({
  variant,
  className = "",
}: {
  variant: "darkmode" | "lightmode";
  className?: string;
}) {
  return (
    <img
      src={`/logo/hardwire-${variant}.svg`}
      alt="hardwire"
      className={className}
    />
  );
}