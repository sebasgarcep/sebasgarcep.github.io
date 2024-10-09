import { useRouteError } from "react-router-dom";

export function ErrorPage() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
  const error = useRouteError() as any;

  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  );
}