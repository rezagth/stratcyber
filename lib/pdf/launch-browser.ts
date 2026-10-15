/**
 * Lance un navigateur headless pour générer un PDF côté serveur : Chromium embarqué
 * (@sparticuz/chromium) sur Vercel, Chrome déjà installé en développement local si trouvé,
 * sinon le même Chromium embarqué en repli — même logique que le générateur existant
 * (app/api/audit/[id]/export/comprehensive-pdf), extraite ici pour être réutilisée sans
 * dupliquer sa journalisation de debug.
 */
// Ni --single-process ni --no-zygote : les deux font planter un vrai binaire Chrome.app
// au lancement sur macOS (vérifié localement) — ils ne conviennent qu'aux builds Chromium
// "headless-shell" type @sparticuz/chromium, pas à un Chrome complet.
const ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-accelerated-2d-canvas',
  '--no-first-run',
  '--disable-gpu',
];

const LOCAL_CHROME_PATHS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
];

export async function launchPdfBrowser() {
  const puppeteer = (await import('puppeteer-core')).default;
  const chromium = (await import('@sparticuz/chromium')).default;

  if (process.env.VERCEL) {
    return puppeteer.launch({
      headless: true,
      executablePath: await chromium.executablePath(),
      args: [...chromium.args, ...ARGS],
    });
  }

  const fs = await import('fs');
  const os = await import('os');
  const path = await import('path');
  // --user-data-dir dédié : sans lui, lancer le Chrome local déjà installé échoue
  // (conflit de profil/crashpad) dès que l'utilisateur a sa propre fenêtre Chrome ouverte.
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stratcyber-pdf-'));
  const localPath = LOCAL_CHROME_PATHS.find((p) => fs.existsSync(p));
  const executablePath = localPath ?? (await chromium.executablePath());
  return puppeteer.launch({ headless: true, executablePath, args: [...ARGS, `--user-data-dir=${userDataDir}`] });
}
