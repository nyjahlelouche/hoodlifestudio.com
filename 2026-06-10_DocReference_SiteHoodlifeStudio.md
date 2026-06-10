# HOODLIFE STUDIO — DOC DE RÉFÉRENCE DU SITE
Généré le 10 juin 2026 à partir du code réel, après les 7 lots de corrections (audit juin 2026).
Remplace les anciens _brief-phase*.html (obsolètes, jamais déployés).

---

## Vue d'ensemble

Site B2B vitrine de Hoodlife Studio (hoodlifestudio.com). HTML/CSS/JS vanilla, aucun build.
Objectif : prospection clients musique / mode / événementiel. Site en anglais.

**Hébergement :** o2switch (cPanel), upload FTP / File Manager. Serveur sensible à la casse.
**Serveur local :** `npx serve -l 3000 .` depuis la racine du site.
**Git :** repo local, un commit par lot de corrections.

## Pages

| Page | Fichier | Particularités |
|---|---|---|
| Home | index.html | Hero vidéo plein écran + Selected Work roulette + footer fade |
| Work | work.html | Slider Swiper vertical + vue liste, filtres service/industrie |
| Services | services.html | Loader CRT dédié (srv-loader), process scrub |
| About | about.html | Statement, chiffres, équipe, 9 logos clients |
| Contact | contact.html | Email, adresse, Instagram |
| Legal | mentions-legales.html | Mentions légales complètes, noindex |

Les case studies `work/*.html` existent en fichiers mais sont **vides / non produites** :
tous les liens vers elles sont désactivés (`data-href` au lieu de `href`, curseur "Soon").
Pour les réactiver : remettre `href` depuis `data-href` (index.html + work.html) et rebrancher
la navigation slides si souhaité (champ `link` conservé dans PROJECTS, js/filters.js).

## DA (non négociable)

- Fond `#0A0B0C`, texte `#EDEDED`, secondaire `#888`, tertiaire `#555`
- Pas de couleur d'accent, pas de border-radius, pas de rouge
- Images : `filter: saturate(0.85) contrast(1.2)`
- Grain sur les médias via classe `has-grain`
- Pas de prix affiché

## Typographies (self-hosted, zéro requête tierce)

Déclarées dans `css/global.css`, fichiers dans `assets/fonts/` :

| Variable CSS | Famille | Usage |
|---|---|---|
| `--font-heading` | PP Monument Extended (Black 900) | Titres display massifs, uppercase |
| `--font-label` | PP Monument (Bold 700) | Labels structurels, nav, CTA, footer |
| `--font-ui` | PP Monument (Regular 400) | Body, descriptions |
| `--font-display` | PP Editorial New (+ Italic) | Logo nav, noms de projets, statements |
| `--font-mono` | Space Mono (400/700, woff2) | Horloge, timestamps, numéros, copyright |

Google Fonts retiré de toutes les pages (RGPD ok — "no tracking, no cookies" affiché dans Legal).
Les fichiers ABC Monument Grotesk Trial ne sont plus référencés (non licenciés, à ne pas réutiliser).

## JS — 3 fichiers, pas de framework

### js/main.js (toutes pages)
- Preloader "TV turn-on" — clip-path animé sur `<main>` (jamais sur body)
- Horloge Paris (premier tick aligné minute pleine)
- Typographie mixte (d-first/d-rest) + scramble wave au hover
- Menu fullscreen GSAP — fermeture Escape + focus trap basique
- Reveals au scroll (data-reveal / data-reveal-stagger)
- Selected Work (home) : roulette au wheel quand la section est 100% visible
  (test géométrique getBoundingClientRect), footer en fade sur le dernier projet,
  cleanup uniquement à la sortie réelle de section (IntersectionObserver)
- Curseur custom : délégation mouseover/mouseout sur document (`closest('a, button, [data-cursor]')`)
- `prefers-reduced-motion` : scramble off, scrub off, roulette off (scroll natif), fades courts

### js/filters.js (work.html uniquement)
- Données projets dans PROJECTS (slug, titres, media, poster, thumb, link de réactivation)
- Slider Swiper vertical, effet fade neutralisé par GSAP
- **Une seule balise `<video>` par slide** (dans le viewer 16:9). Le fond plein écran est
  un poster blurré (`.ws-bg__poster`, frames extraites dans `assets/images/posters/`)
- Transitions porte d'ascenseur **en transform GPU** : volets plein écran `.ws-shutter`
  (work.html), volets viewer `.ws-door` (générés par buildSlides). Aucun clip-path animé
  sur grande surface — uniquement les masques de titres (overflow hidden + yPercent)
- preload="metadata" sur les slides adjacentes seulement, pause + currentTime=0 à la sortie
- fitTitle auto-fit des titres au load + resize (debounce 200ms)
- Filtres service/industrie + toggle slider/liste

### js/form.js (contact)

## Assets

- `assets/images/` (~2 Go) et `assets/videos/` (~240 Mo) sont **gitignorés** — déploiement FTP direct
- Nommage : minuscules + tirets partout (o2switch case-sensitive)
- Vidéos : H.264, bitrates ≤ 2,3 Mbps (cible 3-5). hero.mp4 = 42 Mo car 3min20 — pas un problème
  de bitrate ; preload="none" partout, poster sur les heroes
- `assets/images/posters/` : frames extraites (ffmpeg) servant de posters vidéo et fonds de slides
- `assets/og-image.jpg` : 1200×630, partage social, sur les 6 pages (suivi par git)

## SEO / A11y

- Favicon SVG + OG complet (title/description/type/url/image) sur les 6 pages
- robots.txt + sitemap.xml + .htaccess (HTTPS, GZIP, cache, security headers)
- mentions-legales.html en noindex
- `loading="lazy"` + width/height sur les images hors viewport initial
- Menu accessible clavier (Escape + trap), reduced-motion respecté

## Données légales (mentions-legales.html)

Hoodlife Studio SAS — SIRET 937 849 180 00016 — RCS Melun — TVA FR84937849180
Siège : 229 rue Saint-Honoré, 75001 Paris. Hébergeur : o2switch, Clermont-Ferrand.
Adresse footer (bureaux) : 48 rue de Ponthieu, 75008 Paris — indépendante du siège, ne pas toucher.

## Liens sociaux

Instagram : **https://instagram.com/hoodlife.fr** (compte média 182K) — partout, jamais le compte studio.

## En attente de décision Nyjah

1. Logos About : retirer ou garder **Truth Records** (presta facturée ?) et **Les Ardentes**
   (couverture média, pas client studio)
2. Mentions légales : nom du directeur de la publication (actuellement "The President of
   Hoodlife Studio SAS")
3. Production des 10 case studies → réactivation des liens
4. Test manuel obligatoire avant déploiement : trackpad ET molette, Chrome + Safari,
   DevTools Performance sur 5 transitions du slider Work (cible 60fps)

## Ne jamais déployer

- `_brief-phase*.html` (anciens briefs)
- `2026-06-10_DocReference_SiteHoodlifeStudio.md` (ce doc)
- `.git/`, `.gitignore`
