/* Cookieless aggregate statistics; only published public pages are measured. */
(() => {
  const publicPaths = new Set(["/appraisal-inspections.html", "/damage-inspections.html", "/", "/insurance-surveys.html", "/items-inspected-on-a-marine-survey.html", "/location.html", "/marine-surveys-types.html", "/naval-architecture.html", "/osmosis-surveys.html", "/ownership-cruising.html", "/pre-purchase-surveys.html", "/preparing-for-survey.html", "/privacy-policy.html", "/rates.html", "/terms-and-conditions.html", "/tonnage-measurement-surveys.html", "/useful-information.html", "/yacht-consulting.html", "/yacht-delivery-service.html", "/articles.html", "/understanding-yacht-survey-findings.html", "/termites-of-the-caribbean.html", "/boat-batteries-not-charging.html", "/repower-or-repair-boat-diesel-engine.html", "/index.html", "/marshall-islands-yacht-tonnage-measurement.html", "/cayman-islands-yacht-tonnage-measurement.html", "/new-build-owner-representation.html", "/gibraltar-yacht-tonnage-measurement.html", "/guernsey-yacht-tonnage-measurement.html", "/bermuda-yacht-tonnage-measurement.html", "/bahamas-yacht-tonnage-measurement.html", "/isle-of-man-yacht-tonnage-measurement.html", "/british-virgin-islands-yacht-tonnage-measurement.html", "/jersey-yacht-tonnage-measurement.html", "/united-kingdom-yacht-tonnage-measurement.html"]);
  const allowed = ['globalyachtsurveyor.com', 'www.globalyachtsurveyor.com'].includes(location.hostname)
    && publicPaths.has(location.pathname);
  // Set to the account's public /count URL once Tony supplies the site code.
  const endpoint = 'https://globalyachtsurveyor.goatcounter.com/count';
  const configured = /^https:\/\/[a-z0-9-]+\.goatcounter\.com\/count$/.test(endpoint);
  const pagePath = location.pathname === '/index.html' ? '/' : location.pathname;
  let referrer = '';
  try { referrer = document.referrer ? new URL(document.referrer).origin : ''; } catch (_) {}
  const events = new Set(['Enquiry Sent', 'Phone Click', 'Email Click', 'WhatsApp Click']);
  const pending = [];
  const maxPending = 50;
  let ready = false;
  let stopped = false;
  let initialized = false;
  const stop = () => { stopped = true; pending.length = 0; };
  const send = name => {
    // Remove an event before calling the vendor; never retry an ambiguous send.
    try {
      if (window.goatcounter.filter()) { stop(); return; }
      window.goatcounter.count({
        path: 'contact/' + name.toLowerCase().replaceAll(' ', '-') + pagePath,
        title: name, event: true, no_session: true, referrer: ''
      });
    } catch (_) { /* Optional analytics must never affect the caller. */ }
  };
  window.gysTrack = name => {
    try {
      if (!allowed || !configured || stopped || !events.has(name)) return;
      if (ready) send(name);
      else {
        // Memory only. Keep the newest events if the script is slow or blocked.
        if (pending.length === maxPending) pending.shift();
        pending.push(name);
      }
    } catch (_) {}
  };
  if (allowed && configured) {
    try {
      // Explicit values exclude URL queries, fragments and referrer paths.
      window.goatcounter = {no_onload: true, no_events: true, endpoint,
        path: pagePath, title: document.title, referrer};
      const script = document.createElement('script');
      script.src = 'https://gc.zgo.at/count.js';
      script.async = true;
      script.referrerPolicy = 'no-referrer';
      script.onerror = stop;
      script.onload = () => {
        if (initialized || stopped) return;
        initialized = true;
        try {
          const counter = window.goatcounter;
          const getData = counter.get_data;
          if (typeof getData !== 'function' || typeof counter.count !== 'function'
              || typeof counter.filter !== 'function') { stop(); return; }
          // Install privacy filtering BEFORE either pageview or queued events.
          counter.get_data = vars => {
            const data = getData.call(counter, vars);
            delete data.q;
            delete data.s;
            delete data.b;
            return data;
          };
          if (counter.filter()) { stop(); return; }
          ready = true;
          try { counter.count({path: pagePath, title: document.title, referrer}); } catch (_) {}
          while (pending.length && !stopped) send(pending.shift());
        } catch (_) { stop(); }
      };
      document.head.appendChild(script);
    } catch (_) { stop(); }
  }
  document.addEventListener('click', event => {
    try {
      const link = event.target.closest && event.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href') || '';
      if (href.startsWith('tel:')) window.gysTrack('Phone Click');
      else if (href.startsWith('mailto:')) window.gysTrack('Email Click');
      else if (/^https:\/\/wa\.me\//.test(href)) window.gysTrack('WhatsApp Click');
    } catch (_) {}
  });
})();
