import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { SkipLink } from "@/components/SkipLink";
import { useSeo } from "@/lib/seo";

const NotFound = () => {
  const location = useLocation();
  useSeo({
    title: "Page not found",
    description: "The page you're looking for doesn't exist on EventSpark.",
    noindex: true,
  });

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.warn("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <SkipLink />
      <main id="main" tabIndex={-1} className="flex min-h-screen items-center justify-center bg-muted focus:outline-none">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">404</h1>
          <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
          <Link to="/" className="text-primary underline hover:text-primary/90">
            Return to Home
          </Link>
        </div>
      </main>
    </>
  );
};

export default NotFound;
