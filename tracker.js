(function () {
    async function trackVisit() {
      const serverUrl = 'https://.com';
  
      try {
        const ipRes = await fetch(`${serverUrl}/get-ip`);
        const ipData = await ipRes.json();
        const ip = ipData.ip;
        const geoRes = await fetch(`${serverUrl}/get-geo/${ip}`);
        const geo = await geoRes.json();
  
        await fetch(`${serverUrl}/save-visit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ip,
            country: geo.country,
            region: geo.regionName,
            city: geo.city,
            userAgent: navigator.userAgent
          })
        });
      } catch (err) {
        console.error('Tracking failed', err);
      }
    }
  
    trackVisit();
  })();
  