/* Cookieless aggregate statistics; only published public pages are measured. */
(() => {
  const publicPaths = new Set(["/appraisal-inspections.html", "/damage-inspections.html", "/", "/insurance-surveys.html", "/items-inspected-on-a-marine-survey.html", "/location.html", "/marine-surveys-types.html", "/naval-architecture.html", "/osmosis-surveys.html", "/ownership-cruising.html", "/pre-purchase-surveys.html", "/preparing-for-survey.html", "/privacy-policy.html", "/rates.html", "/terms-and-conditions.html", "/tonnage-measurement-surveys.html", "/useful-information.html", "/yacht-consulting.html", "/yacht-delivery-service.html", "/articles.html", "/understanding-yacht-survey-findings.html", "/termites-of-the-caribbean.html", "/boat-batteries-not-charging.html", "/repower-or-repair-boat-diesel-engine.html", "/index.html"]);
  const allowed = ['globalyachtsurveyor.com', 'www.globalyachtsurveyor.com'].includes(location.hostname)
    && publicPaths.has(location.pathname);
  // Set to the account's public /count URL once Tony supplies the site code.
  const endpoint = 'https://globalyachtsurveyor.goatcounter.com/count';
  const configured = /^https:\/\/[a-z0-9-]+\.goatcounter\.com\/count$/.test(endpoint);
  const pagePath = location.pathname === '/index.html' ? '/' : location.pathname;
  let referrer = '';
  try { referrer = document.referrer ? new URL(document.referrer).origin : ''; } catch (_) {}
  if (allowed && configured) {
    // Explicit values exclude URL queries, fragments and referrer paths.
    window.goatcounter = {no_onload: true, no_events: true, endpoint,
      path: pagePath, title: document.title, referrer};
    const script = document.createElement('script');
    script.src = 'https://gc.zgo.at/count.js';
    script.async = true;
    script.referrerPolicy = 'no-referrer';
    script.onload = () => {
      try {
        // The vendor also includes the current query separately; strip it
        // before any measurement, as well as screen size and bot probes.
        const getData = window.goatcounter.get_data;
        if (typeof getData !== 'function') return;
        window.goatcounter.get_data = vars => {
          const data = getData(vars);
          delete data.q;
          delete data.s;
          delete data.b;
          return data;
        };
        if (typeof window.goatcounter.count === 'function' && !window.goatcounter.filter())
          window.goatcounter.count({path: pagePath, title: document.title, referrer});
      } catch (_) {}
    };
    document.head.appendChild(script);
  }
  const events = new Set(['Enquiry Sent', 'Phone Click', 'Email Click', 'WhatsApp Click']);
  window.gysTrack = name => {
    if (!allowed || !configured || !events.has(name) || !window.goatcounter
        || typeof window.goatcounter.count !== 'function') return;
    // Never let optional measurement affect an enquiry or navigation.
    try {
      if (!window.goatcounter.filter()) window.goatcounter.count({
        path: 'contact/' + name.toLowerCase().replaceAll(' ', '-') + pagePath,
        title: name, event: true, no_session: true, referrer: ''
      });
    } catch (_) {}
  };
  document.addEventListener('click', event => {
    const link = event.target.closest && event.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (href.startsWith('tel:')) window.gysTrack('Phone Click');
    else if (href.startsWith('mailto:')) window.gysTrack('Email Click');
    else if (/^https:\/\/wa\.me\//.test(href)) window.gysTrack('WhatsApp Click');
  });
})();
