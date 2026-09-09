// Runtime failures — a dropped connection mid-response, a truncated or
// empty response body — throw browser-native SyntaxError ("Unexpected end
// of JSON input" from a bad res.json() call) or TypeError ("Failed to
// fetch") instances. Their .message leaks implementation detail that means
// nothing to someone using the app. An error we threw ourselves, built
// from a message the backend actually sent back, stays a plain Error and
// is safe — and useful — to show as-is.
export function friendlyErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  if (err?.name === "SyntaxError") {
    return "Something went wrong loading this. Please try again.";
  }
  if (err?.name === "TypeError") {
    return "Couldn't reach the server. Check your connection and try again.";
  }
  return err?.message || fallback;
}
