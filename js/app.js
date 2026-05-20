/**
 * Le Rucher d'Hantael - Application Logic
 * Author: Antigravity AI
 * Year: 2026
 */

// Configuration du Rucher
const RUCHER_CONFIG = {
    phone: '__RUCHER_PHONE_RAW__', // Numéro WhatsApp (sans le + ou 00)
    email: '__RUCHER_EMAIL__',
    address: '__RUCHER_STREET__, __RUCHER_ZIP__ __RUCHER_CITY__',
    pricing: {
        printemps: { price: 10, weight: 0.5, name: 'Miel de Printemps' },
        ete: { price: 10, weight: 0.5, name: 'Miel d\'Été' }
    }
};

// State / État global du Panier
let cart = {};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    setupHeaderScroll();
    setupMobileMenu();
    setupProductCardSelectors();
    setupCartDrawerEvents();
    setupFormDateRestrictions();
    setupReservationHandlers();
    setupChatbot();
});

// ==========================================================================
// LOCAL STORAGE & STATE MANAGEMENT
// ==========================================================================

function loadCart() {
    try {
        const storedCart = localStorage.getItem('rucher_hantael_cart');
        if (storedCart) {
            cart = JSON.parse(storedCart);
        }
    } catch (e) {
        console.error('Erreur de lecture du panier local:', e);
        cart = {};
    }
    updateCartUI();
}

function saveCart() {
    try {
        localStorage.setItem('rucher_hantael_cart', JSON.stringify(cart));
    } catch (e) {
        console.error('Erreur d\'enregistrement du panier:', e);
    }
}

// ==========================================================================
// CARTE DES PRODUITS - SELECTEURS DE QUANTITÉ (PAGE PRINCIPALE)
// ==========================================================================

function setupProductCardSelectors() {
    // Boutons de quantité sur les fiches produits
    document.querySelectorAll('.product-card').forEach(card => {
        const decBtn = card.querySelector('.dec-qty');
        const incBtn = card.querySelector('.inc-qty');
        const qtyVal = card.querySelector('.qty-value');
        const addBtn = card.querySelector('.add-to-cart-btn');
        
        if (decBtn && incBtn && qtyVal) {
            decBtn.addEventListener('click', () => {
                let current = parseInt(qtyVal.textContent, 10);
                if (current > 1) {
                    qtyVal.textContent = current - 1;
                }
            });
            
            incBtn.addEventListener('click', () => {
                let current = parseInt(qtyVal.textContent, 10);
                qtyVal.textContent = current + 1;
            });
        }
        
        // Bouton Ajouter au panier
        if (addBtn) {
            addBtn.addEventListener('click', (e) => {
                const id = addBtn.getAttribute('data-id');
                const name = addBtn.getAttribute('data-name');
                const price = parseFloat(addBtn.getAttribute('data-price'));
                const img = addBtn.getAttribute('data-img');
                const quantity = qtyVal ? parseInt(qtyVal.textContent, 10) : 1;
                
                addToCart(id, name, price, img, quantity);
                
                // Reset de la quantité sur la carte
                if (qtyVal) qtyVal.textContent = '1';
                
                // Animation visuelle de feedback sur le bouton
                animateButtonFeedback(addBtn);
            });
        }
    });
}

function animateButtonFeedback(btn) {
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span>Ajouté ! 🍯</span>';
    btn.style.backgroundColor = 'var(--success)';
    btn.style.borderColor = 'var(--success)';
    btn.style.color = 'white';
    
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.backgroundColor = '';
        btn.style.borderColor = '';
        btn.style.color = '';
        openCartDrawer();
    }, 1000);
}

// ==========================================================================
// PANIER LOGIQUE & ACTIONS
// ==========================================================================

function addToCart(id, name, price, img, qty) {
    const weight = RUCHER_CONFIG.pricing[id] ? RUCHER_CONFIG.pricing[id].weight : 0.5;
    
    if (cart[id]) {
        cart[id].qty += qty;
    } else {
        cart[id] = {
            id,
            name,
            price,
            img,
            qty,
            weight
        };
    }
    saveCart();
    updateCartUI();
}

function changeCartItemQty(id, delta) {
    if (!cart[id]) return;
    
    cart[id].qty += delta;
    
    if (cart[id].qty <= 0) {
        delete cart[id];
    }
    
    saveCart();
    updateCartUI();
}

function removeCartItem(id) {
    if (cart[id]) {
        delete cart[id];
        saveCart();
        updateCartUI();
    }
}

function clearCart() {
    cart = {};
    saveCart();
    updateCartUI();
}

// ==========================================================================
// RENDU DE L'INTERFACE PANIER (DRAWER)
// ==========================================================================

function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const itemsList = document.getElementById('cart-items-list');
    const emptyMsg = document.getElementById('cart-empty-message');
    const itemsContainer = document.getElementById('cart-items-container');
    const cartFooter = document.getElementById('cart-footer');
    
    const totalWeightEl = document.getElementById('cart-total-weight');
    const totalPotsEl = document.getElementById('cart-total-pots');
    const totalPriceEl = document.getElementById('cart-total-price');
    const checkoutTotalEl = document.getElementById('checkout-total-price');
    
    // Calculs
    let totalItems = 0;
    let totalPrice = 0;
    let totalWeight = 0;
    
    Object.keys(cart).forEach(key => {
        totalItems += cart[key].qty;
        totalPrice += cart[key].price * cart[key].qty;
        totalWeight += cart[key].weight * cart[key].qty;
    });
    
    // Badge de navigation
    if (cartCount) {
        cartCount.textContent = totalItems;
        if (totalItems > 0) {
            cartCount.style.transform = 'scale(1.2)';
            setTimeout(() => cartCount.style.transform = 'scale(1)', 200);
        }
    }
    
    // Rendu de la liste
    if (itemsList) {
        itemsList.innerHTML = '';
        
        if (totalItems === 0) {
            if (emptyMsg) emptyMsg.style.display = 'block';
            if (itemsContainer) itemsContainer.style.display = 'none';
            if (cartFooter) cartFooter.style.display = 'none';
        } else {
            if (emptyMsg) emptyMsg.style.display = 'none';
            if (itemsContainer) itemsContainer.style.display = 'block';
            if (cartFooter) cartFooter.style.display = 'block';
            
            Object.keys(cart).forEach(key => {
                const item = cart[key];
                const itemHtml = `
                    <div class="cart-item" data-id="${item.id}">
                        <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                        <div class="cart-item-info">
                            <div class="cart-item-name">${item.name}</div>
                            <div class="cart-item-meta">${item.weight * 1000}g — 10,00 € l'unité</div>
                            <div class="cart-item-price-block">
                                <div class="quantity-selector" style="padding: 2px;">
                                    <button class="qty-btn" onclick="changeCartItemQty('${item.id}', -1)" aria-label="Moins">-</button>
                                    <span class="qty-value">${item.qty}</span>
                                    <button class="qty-btn" onclick="changeCartItemQty('${item.id}', 1)" aria-label="Plus">+</button>
                                </div>
                                <div class="cart-item-price">${(item.price * item.qty).toFixed(2)} €</div>
                            </div>
                            <button class="cart-item-remove" onclick="removeCartItem('${item.id}')">Supprimer</button>
                        </div>
                    </div>
                `;
                itemsList.insertAdjacentHTML('beforeend', itemHtml);
            });
        }
    }
    
    // Totaux
    if (totalWeightEl) totalWeightEl.textContent = `${totalWeight.toFixed(1)} kg`;
    if (totalPotsEl) totalPotsEl.textContent = totalItems;
    if (totalPriceEl) totalPriceEl.textContent = `${totalPrice.toFixed(2)} €`;
    if (checkoutTotalEl) checkoutTotalEl.textContent = `${totalPrice.toFixed(2)} €`;
}

// Global scope bindings for inline onclicks
window.changeCartItemQty = changeCartItemQty;
window.removeCartItem = removeCartItem;

// ==========================================================================
// CART DRAWER NAV & INTERACTIVE TRIGGERS
// ==========================================================================

function openCartDrawer() {
    document.getElementById('cart-overlay').classList.add('open');
    document.getElementById('cart-modal').classList.add('open');
    document.body.style.overflow = 'hidden'; // Bloquer le scroll
}

function closeCartDrawer() {
    document.getElementById('cart-overlay').classList.remove('open');
    document.getElementById('cart-modal').classList.remove('open');
    document.body.style.overflow = ''; // Restaurer le scroll
    
    // Reset steps
    setTimeout(() => {
        showCartStepList();
    }, 450);
}

function showCartStepList() {
    document.getElementById('cart-title').textContent = 'Votre Panier 🍯';
    document.getElementById('cart-step-list').classList.add('active');
    document.getElementById('cart-step-list').style.display = 'block';
    
    document.getElementById('cart-step-form').classList.remove('active');
    document.getElementById('cart-step-form').style.display = 'none';
    
    document.getElementById('footer-actions-step-list').style.display = 'block';
    document.getElementById('footer-actions-step-form').style.display = 'none';
}

function showCartStepCheckout() {
    document.getElementById('cart-title').textContent = 'Finaliser 🐝';
    document.getElementById('cart-step-list').classList.remove('active');
    document.getElementById('cart-step-list').style.display = 'none';
    
    document.getElementById('cart-step-form').classList.add('active');
    document.getElementById('cart-step-form').style.display = 'block';
    
    document.getElementById('footer-actions-step-list').style.display = 'none';
    document.getElementById('footer-actions-step-form').style.display = 'block';
}

function setupCartDrawerEvents() {
    const toggleBtn = document.getElementById('cart-toggle-btn');
    const overlay = document.getElementById('cart-overlay');
    const closeBtn = document.getElementById('cart-close-btn');
    const checkoutBtn = document.getElementById('btn-go-to-checkout');
    const backBtn = document.getElementById('btn-back-to-list');
    const continueShoppingBtn = document.getElementById('btn-continue-shopping');
    
    if (toggleBtn) toggleBtn.addEventListener('click', openCartDrawer);
    if (overlay) overlay.addEventListener('click', closeCartDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeCartDrawer);
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const totalItems = Object.keys(cart).reduce((acc, key) => acc + cart[key].qty, 0);
            if (totalItems > 0) {
                showCartStepCheckout();
            }
        });
    }
    
    if (backBtn) backBtn.addEventListener('click', showCartStepList);
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', () => {
            closeCartDrawer();
            window.location.hash = '#miels';
        });
    }
}

// Pre-fill date picker configurations
function setupFormDateRestrictions() {
    const dateInput = document.getElementById('pickup-date');
    if (dateInput) {
        // Bloquer les dates passées
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const yyyy = tomorrow.getFullYear();
        const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const dd = String(tomorrow.getDate()).padStart(2, '0');
        
        const minDate = `${yyyy}-${mm}-${dd}`;
        dateInput.setAttribute('min', minDate);
        dateInput.value = minDate;
    }
    
    // Set default pickup time to 14:00
    const timeInput = document.getElementById('pickup-time');
    if (timeInput) {
        timeInput.value = '14:00';
    }
}

// ==========================================================================
// RESERVATION SUBMISSION (WHATSAPP & EMAIL INTEGRATIONS)
// ==========================================================================

function setupReservationHandlers() {
    const form = document.getElementById('reservation-form');
    const whatsappBtn = document.getElementById('btn-submit-whatsapp');
    const emailBtn = document.getElementById('btn-submit-email');
    
    let submissionType = ''; // 'whatsapp' ou 'email'
    
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            submissionType = 'whatsapp';
        });
    }
    
    if (emailBtn) {
        emailBtn.addEventListener('click', () => {
            submissionType = 'email';
        });
    }
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // Empêcher le rechargement
            
            // Collecte des données
            const client = {
                lastname: document.getElementById('client-lastname').value.trim(),
                firstname: document.getElementById('client-firstname').value.trim(),
                phone: document.getElementById('client-phone').value.trim(),
                email: document.getElementById('client-email').value.trim(),
                date: document.getElementById('pickup-date').value,
                time: document.getElementById('pickup-time').value,
                notes: document.getElementById('client-notes').value.trim()
            };
            
            if (!client.lastname || !client.firstname || !client.phone || !client.email || !client.date || !client.time) {
                alert('Veuillez remplir tous les champs obligatoires.');
                return;
            }
            
            // Format de la date pour le message
            const formattedDate = formatDateFR(client.date);
            
            // Génération du contenu de commande
            let orderSummary = '';
            let total = 0;
            let totalPots = 0;
            
            Object.keys(cart).forEach(key => {
                const item = cart[key];
                orderSummary += `• ${item.qty}x ${item.name} (${item.weight * 1000}g) - ${(item.price * item.qty)}€\n`;
                total += item.price * item.qty;
                totalPots += item.qty;
            });
            
            const messageTitle = `🐝 Réservation de Miel - Le Rucher d'Hantael`;
            const messageBody = `Bonjour Le Rucher d'Hantael,

Je souhaite réserver du miel pour un retrait sur place.

📦 Détail de la réservation :
${orderSummary}
👉 Total : ${total.toFixed(2)}€ (${totalPots} pots)

👤 Coordonnées du client :
- Nom : ${client.lastname.toUpperCase()} ${client.firstname}
- Téléphone : ${client.phone}
- E-mail : ${client.email}

📅 Retrait souhaité :
- Le : ${formattedDate}
- Vers : ${client.time}
${client.notes ? `\n💬 Note complémentaire :\n"${client.notes}"` : ''}

Merci et à bientôt !`;
            
            if (submissionType === 'whatsapp') {
                sendViaWhatsApp(messageBody);
            } else {
                sendViaEmail(messageTitle, messageBody);
            }
            
            // Afficher la modale de succès
            showSuccessModal(client, total);
            
            // Vider le panier
            clearCart();
        });
    }
    
    // Fermeture de la modale de succès
    const closeSuccessBtn = document.getElementById('btn-close-success');
    if (closeSuccessBtn) {
        closeSuccessBtn.addEventListener('click', () => {
            document.getElementById('success-overlay').classList.remove('open');
            closeCartDrawer();
        });
    }
}

function sendViaWhatsApp(text) {
    const encodedText = encodeURIComponent(text);
    const url = `https://wa.me/${RUCHER_CONFIG.phone}?text=${encodedText}`;
    window.open(url, '_blank');
}

function sendViaEmail(subject, body) {
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    const url = `mailto:${RUCHER_CONFIG.email}?subject=${encodedSubject}&body=${encodedBody}`;
    window.location.href = url;
}

function showSuccessModal(client, total) {
    // Remplir les informations
    document.getElementById('success-date').textContent = formatDateFR(client.date);
    document.getElementById('success-time').textContent = client.time;
    document.getElementById('success-price').textContent = `${total.toFixed(2)} €`;
    
    // Ouvrir la modale
    document.getElementById('success-overlay').classList.add('open');
}

// Utilitaire de formatage de date AAAA-MM-JJ -> JJ/MM/AAAA
function formatDateFR(dateString) {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// ==========================================================================
// SCROLL EFFECTS & GENERAL INTERFACE UI
// ==========================================================================

function setupHeaderScroll() {
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        updateActiveLink();
    });
}

function updateActiveLink() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentId = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        // Décalage de 120px pour le déclenchement visuel
        if (window.scrollY >= (sectionTop - 120)) {
            currentId = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === '#' && !currentId) {
            link.classList.add('active');
        } else if (href === `#${currentId}`) {
            link.classList.add('active');
        }
    });
}

function setupMobileMenu() {
    const burger = document.getElementById('menu-burger');
    const nav = document.getElementById('nav');
    
    if (burger && nav) {
        burger.addEventListener('click', () => {
            nav.classList.toggle('open');
            // Toggle hamburger icon between list & X
            if (nav.classList.contains('open')) {
                burger.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
            } else {
                burger.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>`;
            }
        });
        
        // Fermer le menu lors du clic sur un lien mobile
        nav.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('open');
                burger.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>`;
            });
        });
    }
}

// ==========================================================================
// ASSISTANT CONVERSATIONNEL (CHATBOT HYBRIDE)
// ==========================================================================

const CHATBOT_FAQ = {
    welcome: "Bonjour ! 🐝 Je suis l'assistant virtuel du Rucher d'Hantael. Comment puis-je vous aider aujourd'hui ?",
    menu: [
        { text: "🍯 Miels et Tarifs", action: "miels" },
        { text: "📍 Retrait et Horaires", action: "retrait" },
        { text: "💳 Moyens de paiement", action: "paiements" },
        { text: "📞 Contact et Direct", action: "contact" },
        { text: "🐝 Histoire et Pratiques", action: "histoire" }
    ],
    responses: {
        miels: {
            text: "🍯 **Nos Miels récoltés à Orphin (78) :**\n\n• **Miel de Printemps (Disponible) :** Très doux et floral, de couleur jaune pâle. Il cristallise rapidement dans les jours suivant l'extraction. Tarif : **10 € le pot de 500g** (20 €/kg).\n\n• **Miel d'Été (Épuisé) :** Un miel ambré, riche et complexe avec des notes de tilleul et de tournesol. Tarif : **10 € le pot de 500g**.",
            menu: ["retrait", "paiements", "contact"]
        },
        retrait: {
            text: "📍 **Retrait de commande :**\n\nLe retrait se fait **exclusivement sur rendez-vous** à l'adresse suivante :\n**__RUCHER_STREET__, __RUCHER_ZIP__ __RUCHER_CITY__** (Yvelines).\n\n**⏰ Horaires possibles :**\n• Lundi au Vendredi : 18h à 19h\n• Samedi et Dimanche : 10h à 20h",
            menu: ["miels", "paiements", "contact"]
        },
        paiements: {
            text: "💳 **Moyens de paiement acceptés :**\n\nPour simplifier votre retrait (nous n'avons pas de terminal de paiement pour carte bancaire) :\n\n• **Espèces**\n• **Chèque** (à l'ordre de Marine Morard)\n• **Wero / Paylib** (virement instantané par mobile sur le numéro de Marine : **__RUCHER_PHONE_FORMATTED__**)",
            menu: ["miels", "retrait", "contact"]
        },
        contact: {
            text: "📞 **Contacter Marine Morard :**\n\n• **Téléphone :** __RUCHER_PHONE_FORMATTED__ (Appel, SMS ou WhatsApp)\n• **E-mail :** __RUCHER_EMAIL__\n\nN'hésitez pas à nous envoyer un message via le formulaire de contact en bas de la page !",
            menu: ["miels", "retrait", "histoire"]
        },
        histoire: {
            text: "🐝 **Le Rucher d'Hantael :**\n\nGéré par Marine Morard à Orphin, notre rucher compte actuellement **14 ruches** de format Dadant, avec une transition progressive vers le matériel **Nicoplast**.\n\nNous ne travaillons pas avec l'abeille noire. Notre miel est extrait et mis en pot à froid localement à Orphin, garantissant un produit 100% naturel et artisanal 💛.",
            menu: ["miels", "retrait", "contact"]
        }
    },
    fallback: {
        text: "Je ne connais pas la réponse exacte à cette question. 🍯 Mais vous pouvez la poser directement à Marine Morard :\n\n• Par téléphone/WhatsApp au **__RUCHER_PHONE_FORMATTED__**\n• Par e-mail à **__RUCHER_EMAIL__**\n\nQue souhaitez-vous savoir d'autre ?",
        menu: ["miels", "retrait", "paiements", "contact", "histoire"]
    }
};

function formatBotMessage(text) {
    let html = text;
    // Remplacer les gras **texte** par <strong>texte</strong>
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Remplacer les retours à la ligne \n par <br>
    html = html.replace(/\n/g, '<br>');
    return html;
}

function setupChatbot() {
    const trigger = document.getElementById('chatbot-trigger');
    const windowEl = document.getElementById('chatbot-window');
    const closeBtn = document.getElementById('chatbot-close');
    const input = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send');
    const messagesContainer = document.getElementById('chatbot-messages');

    if (!trigger || !windowEl || !closeBtn || !input || !sendBtn || !messagesContainer) return;

    // Toggle window
    trigger.addEventListener('click', () => {
        windowEl.classList.toggle('open');
        if (windowEl.classList.contains('open')) {
            // S'il n'y a pas encore de messages, charger l'accueil
            if (messagesContainer.children.length === 0) {
                showInitialGreeting();
            }
            input.focus();
        }
    });

    closeBtn.addEventListener('click', () => {
        windowEl.classList.remove('open');
    });

    // Fermer sur Echap
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && windowEl.classList.contains('open')) {
            windowEl.classList.remove('open');
        }
    });

    // Envoyer le message lors du clic ou d'Entrée
    sendBtn.addEventListener('click', handleUserSendMessage);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleUserSendMessage();
        }
    });

    function showInitialGreeting() {
        appendBotMessage(CHATBOT_FAQ.welcome);
        appendChips(CHATBOT_FAQ.menu);
    }

    function handleUserSendMessage() {
        const text = input.value.trim();
        if (!text) return;

        // Afficher le message utilisateur
        appendUserMessage(text);
        input.value = '';

        // Masquer les puces précédentes
        removeOldChips();

        // Afficher l'animation d'écriture
        const typingEl = appendTypingIndicator();
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Simuler un délai de réponse naturel
        setTimeout(() => {
            typingEl.remove();
            processUserQuery(text);
        }, 600);
    }

    function processUserQuery(query) {
        const normalized = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        let matchedKey = null;

        if (matchingKeywords(normalized, ['tarif', 'prix', 'coute', 'combien', 'miel', 'printemps', 'ete', 'achat', 'acheter'])) {
            matchedKey = 'miels';
        } else if (matchingKeywords(normalized, ['adresse', 'ou', 'situ', 'situe', 'aller', 'chemin', 'carte', 'localis', 'physique', 'yvelines', 'orphin'])) {
            matchedKey = 'retrait';
        } else if (matchingKeywords(normalized, ['horair', 'quand', 'heure', 'ouvrir', 'ouvert', 'rdv', 'rendez', 'jour', 'date'])) {
            matchedKey = 'retrait';
        } else if (matchingKeywords(normalized, ['paiement', 'payer', 'carte', 'cheque', 'espece', 'wero', 'paylib', 'tpe', 'moyen'])) {
            matchedKey = 'paiements';
        } else if (matchingKeywords(normalized, ['contact', 'telephone', 'mail', 'tel', 'ecrire', 'whatsapp', 'marine', 'morard', 'joindre'])) {
            matchedKey = 'contact';
        } else if (matchingKeywords(normalized, ['ruche', 'histoire', 'qui', 'origine', 'abeille', 'materiel', 'nicoplast', 'dadant', 'production'])) {
            matchedKey = 'histoire';
        }

        if (matchedKey && CHATBOT_FAQ.responses[matchedKey]) {
            const response = CHATBOT_FAQ.responses[matchedKey];
            appendBotMessage(response.text);
            
            const menuChips = CHATBOT_FAQ.menu.filter(item => response.menu.includes(item.action));
            menuChips.push({ text: "🏠 Menu Principal", action: "main_menu" });
            appendChips(menuChips);
        } else {
            appendBotMessage(CHATBOT_FAQ.fallback.text);
            appendChips(CHATBOT_FAQ.menu);
        }
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function matchingKeywords(text, keywords) {
        return keywords.some(keyword => text.includes(keyword));
    }

    function appendUserMessage(text) {
        const msg = document.createElement('div');
        msg.className = 'chat-msg user';
        msg.textContent = text;
        messagesContainer.appendChild(msg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function appendBotMessage(text) {
        const msg = document.createElement('div');
        msg.className = 'chat-msg bot';
        msg.innerHTML = formatBotMessage(text);
        messagesContainer.appendChild(msg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function appendTypingIndicator() {
        const msg = document.createElement('div');
        msg.className = 'chat-msg bot';
        msg.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
        messagesContainer.appendChild(msg);
        return msg;
    }

    function appendChips(chipsList) {
        const chipsContainer = document.createElement('div');
        chipsContainer.className = 'chatbot-chips';
        
        chipsList.forEach(chip => {
            const btn = document.createElement('button');
            btn.className = 'chip';
            btn.textContent = chip.text;
            btn.addEventListener('click', () => {
                handleChipClick(chip);
            });
            chipsContainer.appendChild(btn);
        });
        
        messagesContainer.appendChild(chipsContainer);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function removeOldChips() {
        const oldChips = messagesContainer.querySelectorAll('.chatbot-chips');
        oldChips.forEach(c => c.remove());
    }

    function handleChipClick(chip) {
        appendUserMessage(chip.text);
        removeOldChips();

        const typingEl = appendTypingIndicator();
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        setTimeout(() => {
            typingEl.remove();
            
            if (chip.action === 'main_menu') {
                showInitialGreeting();
            } else if (CHATBOT_FAQ.responses[chip.action]) {
                const response = CHATBOT_FAQ.responses[chip.action];
                appendBotMessage(response.text);
                
                const menuChips = CHATBOT_FAQ.menu.filter(item => response.menu.includes(item.action));
                menuChips.push({ text: "🏠 Menu Principal", action: "main_menu" });
                appendChips(menuChips);
            } else {
                showInitialGreeting();
            }
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 500);
    }
}
