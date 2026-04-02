# Proxy Setup Guide (Roman Urdu)

Is guide mein bataya gaya hai ke aap YouTube bypass karne ke liye proxy kaise khareedein aur setup karein.

## Step 1: Proxy Khareedna (Buying)

Aap niche di gayi websites mein se kisi ek se **"Residential Proxies"** khareed sakte hain:
1.  **WebShare.io**: Ye sasti hai (Affordable). "Static Residential" proxies select karein.
2.  **Smartproxy**: Ye kafi professional aur tez (fast) hai.
3.  **Bright Data**: Sabse behtareen magar mehngi.

**Khareedte waqt ye khayal rakhein:**
- Hamesha **"Residential"** proxy hi lein (Data Center proxy YouTube block kar deta hai).
- "Per GB" wala plan shuru mein behtar rehta hai.

---

## Step 2: Proxy URL Banana

Proxy khareedne ke baad aapko dashboard se 4 cheezein milengi:
- **Host / IP**: e.g., `proxy.webshare.io`
- **Port**: e.g., `80`
- **Username**: e.g., `user123`
- **Password**: e.g., `pass123`

Ab aapko in sab ko milakar ek link banana hai (jisay hum URL kehte hain):
`http://username:password@host:port`

**Misaal (Example):**
`http://user123:pass123@proxy.webshare.io:80`

---

## Step 3: Render Dashboard mein Add Karna

Aapko code mein kuch change karne ki zaroorat nahi hai. Bas ye karein:
1.  Apne **Render Dashboard** par jayein.
2.  Apni website (Service) select karein.
3.  **Environment** tab par click karein.
4.  **Add Environment Variable** par click karein.
5.  **Key**: `YOUTUBE_PROXY`
6.  **Value**: Apna banaya hua Proxy URL (Step 2 wala) paste kar dein.
7.  Save kar dein. Render site ko khud hi redeploy kar dega.

---

## Proxy Kitne Time Tak Chalegi?

Ye aapke khareede hue plan par depend karta hai:
- **Per GB Plan**: Jab tak aapka data (e.g., 1GB) khatam nahi hota, ye chalti rahegi.
- **Monthly Plan**: Ye poora mahina chalti hai baghair data limit ke.

**Tip:** Test karne ke liye 1GB ka plan kaafi hai. Jab sites live ho jaye aur log aane lagein, toh bara plan le lena.
