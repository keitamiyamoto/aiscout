import Script from "next/script";
import { ANALYTICS } from "@/lib/analytics";

/** 社内の管理画面 (/admin) のアクセスは計測しない */
const SKIP_ADMIN = "if(location.pathname.indexOf('/admin')===0)return;";

/**
 * 計測タグの読み込み。環境変数にIDが入っているタグだけを読み込む。
 * GA4 と Google 広告は同じ gtag.js を共有する。
 */
export function Analytics() {
  const { gaId, adsId, metaPixelId } = ANALYTICS;
  const gtagIds = [gaId, adsId].filter(Boolean);

  return (
    <>
      {gtagIds.length > 0 && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gtagIds[0]}`} strategy="afterInteractive" />
          <Script id="gtag-init" strategy="afterInteractive">
            {`(function(){${SKIP_ADMIN}window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());${gtagIds
              .map((id) => `gtag('config',${JSON.stringify(id)});`)
              .join("")}})();`}
          </Script>
        </>
      )}
      {metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`(function(){${SKIP_ADMIN}!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(metaPixelId)});fbq('track','PageView');})();`}
        </Script>
      )}
    </>
  );
}
