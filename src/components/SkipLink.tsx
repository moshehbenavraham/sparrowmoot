/**
 * Accessibility primitive: keyboard users hit Tab and land on a hidden anchor
 * that lets them jump straight to the main content. Visible only when focused.
 *
 * Pair with a `<main id="main">` (or any element matching `targetId`) inside
 * the same route.
 */
interface SkipLinkProps {
  targetId?: string;
  label?: string;
}

export function SkipLink({
  targetId = "main",
  label = "Skip to main content",
}: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-background focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      {label}
    </a>
  );
}
