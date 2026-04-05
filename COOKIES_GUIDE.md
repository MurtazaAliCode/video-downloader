# 🍪 YouTube/TikTok Cookies Refresh Guide

If you are seeing the **"Download blocked by YOUTUBE (Access Denied)"** error, it means the session cookies in your server's `cookies.txt` file have expired or have been invalidated by YouTube.

Follow these steps to refresh them and get your downloader working again.

---

### **Step 1: Install a Cookie Exporter Extension**
You need a browser extension that can export cookies in the **Netscape** format.
- **Chrome/Edge**: Install [Get cookies.txt LOCALLY](https://chrome.google.com/webstore/detail/get-cookiestxt-locally/ccmgnabingobgeaoebmgoaikienlhgnp) or similar.
- **Firefox**: Install [Export Cookies](https://addons.mozilla.org/en-US/firefox/addon/export-cookies-txt/) or similar.

### **Step 2: Log into YouTube**
1. Open a new tab in your browser.
2. Go to [YouTube.com](https://www.youtube.com).
3. Make sure you are **logged in** to your account. 
4. Play any video for a few seconds to ensure your session is active.

### **Step 3: Export the Cookies**
1. Click on the **Cookie Exporter extension** icon in your browser toolbar.
2. Select **"youtube.com"** (or export all cookies if prompted).
3. Click the **Export** or **Download** button.
4. It will save a file named `youtube.com_cookies.txt` or `cookies.txt` to your computer.

### **Step 4: Update the Project**
1. Open the exported file in a text editor (Notepad, VS Code, etc.).
2. **Copy the entire content**.
3. Open the `cookies.txt` file in your **VidDonloaderWebsite** project folder.
4. **Replace** everything in that file with the content you just copied.
5. Save the file.

### **Step 5: Deploy**
1. Commit and push the updated `cookies.txt` to GitHub.
2. Render will automatically redeploy the app.
3. Refresh your website and try the download again!

---

## **(Urdu) Cookies Refresh Karne Ka Tarika**

Agar aapko **"Access Denied"** ka error aa raha hai, to iska matlab hai ke YouTube ne purane cookies block kar diye hain. In steps ko follow karen:

1.  **Extension Install Karen**: Chrome mein "Get cookies.txt LOCALLY" extension install karen.
2.  **YouTube Login Karen**: Browser mein YouTube.com kholen aur apne account se login karen. Ek do videos thori dair chalaen.
3.  **Cookies Export Karen**: Extension par click karen aur `youtube.com` ki cookies text file download karlen.
4.  **File Update Karen**: Download ki hui file ka sara text copy karen aur apne project ki `cookies.txt` file mein paste kar den (purana sara text delete kar ke).
5.  **Push Karen**: Changes ko GitHub par push kar den. Render khud hi naya system update kar dega.

---

> [!TIP]
> **Pro Tip**: Agar aap ka server (Render) baar baar block ho raha hai, to koshish karen ke cookies export karne ke liye wahi account use karen jo aap regular use karte hain.
