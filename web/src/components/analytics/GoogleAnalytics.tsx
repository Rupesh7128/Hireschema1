import Script from "next/script";

/** GA4 property for hireschema.com. Override with NEXT_PUBLIC_GA_MEASUREMENT_ID. */
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "G-BX7MT5EE6E";

export function GoogleAnalytics() {
  const id = GA_MEASUREMENT_ID;
  if (!id || id === "off") return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="google-gtag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');
        `}
      </Script>
    </>
  );
}
