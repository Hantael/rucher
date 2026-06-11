# 🐝 Le Rucher d'Hantael — Documentation Technique

Ce projet a été généré et structuré avec l'assistance d'agents IA (**Gemini/Antigravity** et **Claude/Cursor**). Ce fichier regroupe toutes les informations utiles pour maintenir, modifier et héberger le site web statique du rucher.

> [!IMPORTANT]
> **Flux de travail Multi-Agents (Gemini & Claude) :**
> * Le fichier `AGENT.md` est la source unique de vérité pour la documentation et les consignes de développement.
> * `GEMINI.md` et `CLAUDE.md` sont des **liens physiques (hard links)** pointant vers `AGENT.md`.
> * **Consigne pour les agents IA :** Toujours éditer `AGENT.md` directement. Ne supprimez pas et ne recréez pas les fichiers `GEMINI.md` et `CLAUDE.md` sous forme de fichiers simples afin de préserver le lien physique et l'accès natif de chaque assistant.

---

## 📁 Architecture du Projet

Le site est entièrement statique et fonctionne 100% côté client, garantissant un chargement instantané et une maintenance simplifiée.

```text
rucher_site/
├── AGENT.md                  # Cette documentation (référencée par GEMINI.md et CLAUDE.md)
├── index.html                # Structure de la page, SEO, contenu textuel et formulaires
├── 404.html                  # Page de redirection en cas d'erreur 404 (GitHub Pages)
├── .htaccess                 # Configuration Apache pour redirection 404 (Infomaniak)
├── robots.txt                # Fichier d'instructions pour les moteurs de recherche
├── sitemap.xml               # Plan du site pour l'indexation Google
├── css/
│   └── style.css             # Design System (couleurs HSL, polices, animations, responsive)
├── js/
│   └── app.js                # Gestion du panier, localStorage et envoi de la réservation
└── assets/
    └── images/
        ├── hero-bg.png       # Arrière-plan de la section Hero
        ├── miel-printemps.jpg# Visuel du pot de Miel de Printemps (500g)
        └── miel-ete.jpg      # Visuel du pot de Miel d'Été (500g)
```

---

## 🛠️ Personnalisation & Maintenance

Pour des raisons de confidentialité et de sécurité, toutes les informations de contact personnelles (numéro de téléphone, adresse e-mail, adresse physique) ont été remplacées par des **placeholders** dans le code source (`__RUCHER_*__`). 

Les tarifs et les noms de produits restent quant à eux configurables directement dans le code :

```javascript
const RUCHER_CONFIG = {
    phone: '__RUCHER_PHONE_RAW__', // Remplacé automatiquement
    email: '__RUCHER_EMAIL__', // Remplacé automatiquement
    address: '__RUCHER_STREET__, __RUCHER_ZIP__ __RUCHER_CITY__', // Remplacé automatiquement
    pricing: {
        printemps: { price: 10, weight: 0.5, name: 'Miel de Printemps' },
        ete: { price: 10, weight: 0.5, name: 'Miel d\'Été' }
    }
};
```

### 1. Modifier les informations de contact (Téléphone, E-mail, Adresse)
Pour mettre à jour ces valeurs :
1. Allez sur votre dépôt GitHub dans **Settings > Secrets and variables > Actions > Secrets**.
2. Modifiez la valeur des secrets correspondants (par exemple `RUCHER_EMAIL` ou `RUCHER_PHONE_RAW`).
3. La pipeline GitHub Actions reconstruira et déploiera automatiquement le site mis à jour.

### 2. Modifier le prix ou le poids des miels
Si le tarif d'un miel évolue (par exemple à 11 €), modifiez la valeur `price: 10` à `price: 11` dans `js/app.js`. Pensez également à modifier le texte correspondant dans le catalogue HTML dans [index.html](file:///C:/Users/marin/Documents/rucher_site/index.html) (recherchez la classe `.product-price` et le tag `data-price`).

---

## 🚀 Déploiement

Le site est déployé de manière entièrement automatisée grâce à **GitHub Actions** à chaque mise à jour sur le dépôt.

### 1. Pré-production / Tests (GitHub Pages)
À chaque fois que du code est poussé sur la branche **`develop`**, le workflow remplace les placeholders par vos secrets GitHub et déploie le site sur **GitHub Pages**. (La branche `main` ignore cette étape pour éviter les conflits de permissions GitHub Pages).

### 2. Production (Infomaniak FTP)
Lorsque du code est fusionné ou poussé sur la branche principale **`main`**, le workflow déclenche le déploiement. Il attend votre **validation manuelle** dans l'onglet Actions de GitHub (cliquez sur **Review deployments** puis **Approve and deploy**) avant d'envoyer les fichiers par FTP vers votre hébergement chez Infomaniak.

Pour configurer GitHub Pages pour ce workflow :
1. Allez sur votre dépôt GitHub : [Hantael/rucher](https://github.com/Hantael/rucher).
2. Cliquez sur l'onglet **Settings** (Paramètres).
3. Dans la barre latérale gauche, cliquez sur **Pages**.
4. Dans la section **Build and deployment** :
   - Source : Sélectionnez **GitHub Actions**.
   - Le déploiement s'effectuera automatiquement à chaque push.

---

## 🌟 Fonctionnalités Implémentées

- **SEO Ready** : Meta tags configurés pour les moteurs de recherche et le partage sur les réseaux sociaux (Open Graph).
- **Responsive Web Design** : Optimisé pour mobile, tablette et écrans larges de bureau.
- **Panier d'achat local** : Sauvegarde automatique de la sélection de l'utilisateur dans son navigateur en cas de rafraîchissement.
- **Redirection de Commande** : Génère un récapitulatif formaté complet à envoyer en un clic au rucher.
- **Accessibilité (A11y)** : Utilisation d'éléments sémantiques HTML5 et de contrastes conformes aux recommandations modernes.
