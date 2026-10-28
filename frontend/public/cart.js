
(() => {
    "use strict";

    const CART_KEY = "wecoffee_cart";
    const ORDERS_KEY = "wecoffee_orders";

    const money = (value) =>
        Number(value || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

    function readStorage(key) {
        try {
            const value = JSON.parse(localStorage.getItem(key) || "[]");
            return Array.isArray(value) ? value : [];
        } catch {
            return [];
        }
    }

    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        updateButton();
        renderCart();
    }

    function injectStyles() {
        if (document.getElementById("wecoffee-cart-styles")) return;

        const style = document.createElement("style");
        style.id = "wecoffee-cart-styles";

        style.textContent = `
            header {
                display: flex;
                align-items: center;
            }

            header #login-btn {
                margin-left: auto !important;
                flex-shrink: 0;
            }

            header #orders-button {
                order: 999;
                margin-left: 8px !important;
                margin-right: 0 !important;
                flex-shrink: 0;
                padding: 7px 16px;
                border: 0;
                border-radius: 7px;
                background: var(--yellow, #d88b0d);
                color: var(--main-brown, #2a160b);
                font: inherit;
                font-weight: 700;
                cursor: pointer;
                white-space: nowrap;
            }

            header #login-btn {
                order: 998;
            }

            #orders-button:hover {
                filter: brightness(1.06);
            }

            #orders-button .orders-count {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 20px;
                height: 20px;
                margin-left: 5px;
                padding: 0 4px;
                border-radius: 999px;
                background: var(--main-brown, #2a160b);
                color: white;
                font-size: 12px;
            }

            #orders-panel {
                position: fixed;
                inset: 0;
                z-index: 10000;
                display: flex;
                justify-content: flex-end;
                background: transparent;
            }

            #orders-panel[hidden] {
                display: none !important;
            }

            .orders-box {
                position: relative;
                display: flex;
                flex-direction: column;
                box-sizing: border-box;
                width: min(440px, 94vw);
                height: 100vh;
                padding: 26px 22px;
                overflow: hidden;
                background: #fff;
                color: var(--main-brown, #2a160b);
                border-radius: 14px 0 0 14px;
                box-shadow: -8px 0 25px rgba(0, 0, 0, .12);
            }

            .orders-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                padding-bottom: 16px;
                border-bottom: 1px solid #e5d8cc;
            }

            .orders-header h2 {
                margin: 0;
                font-size: 24px;
            }

            #orders-close {
                border: 0;
                background: transparent;
                color: inherit;
                font-size: 28px;
                cursor: pointer;
            }

            .orders-tabs {
                display: flex;
                gap: 8px;
                padding: 14px 0;
            }

            .orders-tab {
                flex: 1;
                padding: 10px;
                border: 1px solid #d7c6b7;
                border-radius: 8px;
                background: #fff;
                color: inherit;
                font: inherit;
                cursor: pointer;
            }

            .orders-tab.active {
                background: var(--yellow, #d88b0d);
                border-color: var(--yellow, #d88b0d);
                font-weight: 700;
            }

            #orders-content {
                flex: 1;
                min-height: 0;
                overflow-y: auto;
                padding: 2px 2px 12px;
            }

            .cart-empty {
                padding: 28px 8px;
                text-align: center;
                color: #76675d;
            }

            .cart-item {
                display: grid;
                grid-template-columns: 68px minmax(0, 1fr);
                gap: 12px;
                padding: 14px 0;
                border-bottom: 1px solid #eee5de;
            }

            .cart-item img {
                width: 68px;
                height: 68px;
                border-radius: 9px;
                object-fit: cover;
                background: #f5eee8;
            }

            .cart-item h3 {
                margin: 0 0 5px;
                font-size: 16px;
                overflow-wrap: anywhere;
            }

            .cart-item p {
                margin: 3px 0;
                font-size: 14px;
            }

            .cart-item-controls {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                gap: 7px;
                margin-top: 8px;
            }

            .cart-item-controls button {
                min-width: 30px;
                padding: 5px 9px;
                border: 1px solid #d7c6b7;
                border-radius: 6px;
                background: #fff;
                color: inherit;
                cursor: pointer;
            }

            .cart-item-controls .cart-remove {
                border-color: #b74436;
                color: #b74436;
            }

            .orders-footer {
                padding-top: 14px;
                border-top: 1px solid #e5d8cc;
            }

            .orders-total {
                display: flex;
                justify-content: space-between;
                gap: 12px;
                margin-bottom: 12px;
                font-size: 18px;
                font-weight: 800;
            }

            .orders-footer button {
                width: 100%;
                padding: 12px;
                border: 0;
                border-radius: 8px;
                background: var(--yellow, #d88b0d);
                color: var(--main-brown, #2a160b);
                font: inherit;
                font-weight: 800;
                cursor: pointer;
            }

            .orders-footer button:disabled {
                opacity: .5;
                cursor: not-allowed;
            }

            #orders-message {
                margin: 10px 0 0;
                font-size: 13px;
                overflow-wrap: anywhere;
            }

            .add-cart-btn.added {
                background: var(--yellow, #d88b0d);
                color: var(--main-brown, #2a160b);
            }

            @media (max-width: 600px) {
                header #orders-button {
                    margin-left: 5px !important;
                    padding: 9px 10px;
                }

                .orders-box {
                    width: 100vw;
                    border-radius: 0;
                    padding: 20px 16px;
                }
            }
        `;

        document.head.appendChild(style);
    }

    function ensurePanel() {
        let panel = document.getElementById("orders-panel");
        if (panel) return panel;

        panel = document.createElement("div");
        panel.id = "orders-panel";
        panel.hidden = true;

        panel.innerHTML = `
            <section class="orders-box" role="dialog"
                aria-modal="true" aria-labelledby="orders-title">
                <div class="orders-header">
                    <h2 id="orders-title">Pedidos</h2>
                    <button type="button" id="orders-close"
                        aria-label="Fechar">×</button>
                </div>

                <div class="orders-tabs">
                    <button type="button" class="orders-tab active"
                        data-tab="cart">Carrinho</button>
                    <button type="button" class="orders-tab"
                        data-tab="orders">Meus pedidos</button>
                </div>

                <div id="orders-content"></div>

                <div class="orders-footer" id="orders-footer">
                    <div class="orders-total">
                        <span>Total</span>
                        <span id="orders-total-value">R$ 0,00</span>
                    </div>
                    <button type="button" id="checkout-button">
                        Finalizar pedido
                    </button>
                    <p id="orders-message" role="status"
                        aria-live="polite"></p>
                </div>
            </section>
        `;

        document.body.appendChild(panel);

        panel.querySelector("#orders-close").addEventListener("click", closePanel);

        panel.addEventListener("click", (event) => {
            if (event.target === panel) closePanel();
        });

        panel.querySelectorAll(".orders-tab").forEach((tab) => {
            tab.addEventListener("click", () => {
                panel.querySelectorAll(".orders-tab").forEach((other) => {
                    other.classList.toggle("active", other === tab);
                });
                renderCart(tab.dataset.tab);
            });
        });

        panel.querySelector("#checkout-button").addEventListener("click", () => {
            const cart = readStorage(CART_KEY);
            if (!cart.length) return;

            const orders = readStorage(ORDERS_KEY);

            orders.unshift({
                id: `PED-${Date.now()}`,
                createdAt: new Date().toISOString(),
                status: "Recebido",
                items: cart,
                total: cart.reduce(
                    (sum, item) => sum + item.price * item.quantity, 0
                )
            });

            localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
            localStorage.setItem(CART_KEY, "[]");

            panel.querySelector("#orders-message").textContent =
                "Pedido de teste salvo neste navegador. Não houve pagamento nem gravação no banco.";

            panel.querySelectorAll(".orders-tab").forEach((tab) => {
                tab.classList.toggle("active", tab.dataset.tab === "orders");
            });

            renderCart("orders");
            updateButton();
        });

        panel.querySelector("#orders-content").addEventListener("click", (event) => {
            const control = event.target.closest("[data-cart-action]");
            if (!control) return;

            const cart = readStorage(CART_KEY);
            const index = cart.findIndex((item) => item.id === control.dataset.id);
            if (index < 0) return;

            if (control.dataset.cartAction === "plus") {
                cart[index].quantity += 1;
            } else if (control.dataset.cartAction === "minus") {
                cart[index].quantity = Math.max(1, cart[index].quantity - 1);
            } else if (control.dataset.cartAction === "remove") {
                cart.splice(index, 1);
            }

            saveCart(cart);
        });

        return panel;
    }

    function openPanel() {
        const panel = ensurePanel();
        panel.hidden = false;
        panel.querySelector("#orders-message").textContent = "";

        panel.querySelectorAll(".orders-tab").forEach((tab) => {
            tab.classList.toggle("active", tab.dataset.tab === "cart");
        });

        renderCart("cart");
    }

    function closePanel() {
        const panel = document.getElementById("orders-panel");
        if (panel) panel.hidden = true;
    }

    function updateButton() {
        const button = document.getElementById("orders-button");
        if (!button) return;

        const count = readStorage(CART_KEY).reduce(
            (sum, item) => sum + item.quantity, 0
        );

        const bubble = button.querySelector(".orders-count");
        if (bubble) bubble.textContent = String(count);
    }

    function renderCart(tab = "cart") {
        const panel = document.getElementById("orders-panel");
        if (!panel) return;

        const content = panel.querySelector("#orders-content");
        const footer = panel.querySelector("#orders-footer");
        const message = panel.querySelector("#orders-message");
        const totalValue = panel.querySelector("#orders-total-value");
        const checkout = panel.querySelector("#checkout-button");

        if (tab === "orders") {
            const orders = readStorage(ORDERS_KEY);
            footer.hidden = true;

            if (!orders.length) {
                content.innerHTML =
                    '<p class="cart-empty">Ainda não há pedidos registrados.</p>';
                return;
            }

            content.innerHTML = orders.map((order) => `
                <article class="cart-item">
                    <div></div>
                    <div>
                        <h3>Pedido ${escapeHtml(order.id)}</h3>
                        <p>${new Date(order.createdAt).toLocaleString("pt-BR")}</p>
                        <p>Status: ${escapeHtml(order.status)}</p>
                        <p>${order.items.reduce((sum, item) => sum + item.quantity, 0)}
                            item(ns) — <strong>${money(order.total)}</strong></p>
                        <p>${order.items.map((item) =>
                            `${escapeHtml(item.name)} × ${item.quantity}`
                        ).join("<br>")}</p>
                    </div>
                </article>
            `).join("");
            return;
        }

        footer.hidden = false;

        const cart = readStorage(CART_KEY);
        const total = cart.reduce(
            (sum, item) => sum + item.price * item.quantity, 0
        );

        totalValue.textContent = money(total);
        checkout.disabled = cart.length === 0;
        message.textContent = "";

        if (!cart.length) {
            content.innerHTML = `
                <p class="cart-empty">
                    Teu carrinho está vazio. Clique em “ADD +” nos produtos
                    para adicioná-los aqui.
                </p>`;
            return;
        }

        content.innerHTML = cart.map((item) => `
            <article class="cart-item">
                <img src="${escapeAttribute(item.image || "../imgs/Ice Coffee.png")}"
                    alt="${escapeAttribute(item.name)}">
                <div>
                    <h3>${escapeHtml(item.name)}</h3>
                    <p>${money(item.price)} cada</p>
                    <p>Subtotal: <strong>${money(item.price * item.quantity)}</strong></p>
                    <div class="cart-item-controls">
                        <button type="button" data-cart-action="minus"
                            data-id="${escapeAttribute(item.id)}">−</button>
                        <span>${item.quantity}</span>
                        <button type="button" data-cart-action="plus"
                            data-id="${escapeAttribute(item.id)}">+</button>
                        <button type="button" class="cart-remove"
                            data-cart-action="remove"
                            data-id="${escapeAttribute(item.id)}">Remover</button>
                    </div>
                </div>
            </article>
        `).join("");
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    function escapeAttribute(value) {
        return escapeHtml(value);
    }

    function addProductFromCard(card) {
        const name = card.querySelector(".item-name")?.textContent.trim();
        if (!name) return;

        const priceText = card.querySelector(".item-price")?.textContent || "0";
        const price = Number(
            priceText.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".")
        ) || 0;

        const image = card.querySelector(".item-img")?.getAttribute("src")
            || "../imgs/Ice Coffee.png";

        const description = card.querySelector(".item-desc")?.textContent.trim() || "";
        const id = `${name.toLowerCase()}|${price.toFixed(2)}`;
        const cart = readStorage(CART_KEY);
        const existing = cart.find((item) => item.id === id);

        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ id, name, description, price, image, quantity: 1 });
        }

        saveCart(cart);

        const button = card.querySelector(".add-cart-btn");
        if (button) {
            const oldText = button.textContent;
            button.textContent = "ADICIONADO ✓";
            button.classList.add("added");

            window.setTimeout(() => {
                if (button.isConnected) {
                    button.textContent = oldText || "ADD +";
                    button.classList.remove("added");
                }
            }, 900);
        }
    }

    function setup() {
        injectStyles();

        const logoutButton = document.getElementById("login-btn");
        if (!logoutButton) return;

        let button = document.getElementById("orders-button");

        if (!button) {
            button = document.createElement("button");
            button.type = "button";
            button.id = "orders-button";
            button.innerHTML = 'Pedidos <span class="orders-count">0</span>';
            logoutButton.insertAdjacentElement("afterend", button);
            button.addEventListener("click", openPanel);
        }

        const grid = document.querySelector(".menu-grid");

        if (grid && !grid.dataset.cartListener) {
            grid.dataset.cartListener = "true";
            grid.addEventListener("click", (event) => {
                const addButton = event.target.closest(".add-cart-btn");
                if (!addButton) return;

                const card = addButton.closest(".card");
                if (card) addProductFromCard(card);
            });
        }

        ensurePanel();
        updateButton();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setup);
    } else {
        setup();
    }
})();
