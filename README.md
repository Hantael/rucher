# 🍯 Le Rucher d'Hantael

> Site web statique de présentation et de réservation de miels artisanaux pour le Rucher d'Hantael à Orphin (Yvelines).

Ce site moderne, rapide et entièrement responsive permet aux clients de découvrir l'histoire du rucher, de parcourir la récolte de miels du moment (Miel de Printemps & Miel d'Été) et de faire une réservation de pots en quelques clics via un panier d'achat interactif.

---

## 🌟 Fonctionnalités clés

- **Panier d'Achat Interactif** : Les clients sélectionnent leurs pots de miel (500g) et ajustent les quantités. La sélection est automatiquement sauvegardée dans le navigateur (`localStorage`).
- **Réservation sans serveur** : Pour un maximum de simplicité et de gratuité d'hébergement, le site génère un récapitulatif formaté complet et redirige le client pour envoyer sa commande en un clic :
  - Soit par **WhatsApp 💬** (message pré-rédigé vers le téléphone du rucher).
  - Soit par **E-mail ✉️** (mailto pré-rempli).
- **Design System Premium** : Palette chaleureuse (or ambré, blanc crème, ardoise sombre), polices soignées (*Outfit* et *Playfair Display*) et micro-animations.
- **Responsive** : Parfaitement adapté pour smartphone, tablette et ordinateur de bureau.
- **SEO & Performance** : Optimisé pour les moteurs de recherche avec des meta-tags complets et un temps de chargement instantané (100% côté client).

---

## 📁 Structure des fichiers

```text
rucher_site/
├── README.md                 # Cette présentation
├── GEMINI.md                 # Guide de maintenance technique (contacts, prix, déploiement)
├── index.html                # Structure de la page, SEO (JSON-LD), contenu textuel et formulaires
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
        ├── miel-printemps.png# Visuel du pot de Miel de Printemps (500g)
        └── miel-ete.png      # Visuel du pot de Miel d'Été (500g)
```

---

## 🚀 Lancement local

Comme il s'agit d'un site web statique, aucun serveur d'application n'est requis :
1. Téléchargez ou clonez ce dépôt.
2. Double-cliquez sur `index.html` pour l'ouvrir dans votre navigateur web préféré.

---

## 🛠️ Maintenance & Personnalisation

Toutes les configurations principales (numéro de téléphone WhatsApp, adresse e-mail, tarifs et contenance des miels) sont centralisées dans le fichier `js/app.js`.

Pour plus de détails techniques sur la personnalisation et le déploiement sur les serveurs, veuillez vous référer à la documentation technique : [GEMINI.md](./GEMINI.md).
