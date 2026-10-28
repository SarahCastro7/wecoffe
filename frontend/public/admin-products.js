(() => {
    "use strict";

    const API = "http://localhost:3000";
    const STYLE_ID = "wecoffee-admin-edit-styles";
    const MODAL_ID = "wecoffee-edit-product-modal";

    function getUser() {
        try {
            return JSON.parse(localStorage.getItem("user"));
        } catch {
            return null;
        }
    }

    function isAdmin() {
        return getUser()?.funcao_usuario === "admin";
    }

    function authHeaders() {
        return {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
        };
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    function readImage(file, max = 600) {
        return new Promise((resolve, reject) => {
            if (!file) {
                resolve(null);
                return;
            }

            if (!file.type.startsWith("image/")) {
                reject(new Error("Selecione um arquivo de imagem."));
                return;
            }

            const reader = new FileReader();

            reader.onerror = () => reject(
                new Error("Não foi possível ler a imagem.")
            );

            reader.onload = () => {
                const image = new Image();

                image.onerror = () => reject(
                    new Error("O arquivo selecionado não é uma imagem válida.")
                );

                image.onload = () => {
                    const scale = Math.min(
                        1,
                        max / Math.max(image.width, image.height)
                    );

                    const canvas = document.createElement("canvas");
                    canvas.width = Math.max(1, Math.round(image.width * scale));
                    canvas.height = Math.max(1, Math.round(image.height * scale));

                    const context = canvas.getContext("2d");

                    context.fillStyle = "#ffffff";
                    context.fillRect(0, 0, canvas.width, canvas.height);
                    context.drawImage(
                        image,
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    );

                    resolve(canvas.toDataURL("image/jpeg", 0.8));
                };

                image.src = reader.result;
            };

            reader.readAsDataURL(file);
        });
    }

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement("style");
        style.id = STYLE_ID;

        style.textContent = `
            .admin-edit-product {
                display: block;
                width: calc(100% - 20px);
                margin: 8px 10px 12px;
                padding: 10px 14px;
                border: 0;
                border-radius: 8px;
                background: var(--yellow, #d88b0d);
                color: var(--main-brown, #2a160b);
                font: inherit;
                font-weight: 700;
                cursor: pointer;
            }

            .admin-edit-product:hover {
                filter: brightness(.95);
            }

            #${MODAL_ID} {
                position: fixed;
                inset: 0;
                z-index: 11000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 16px;
                background: rgba(0, 0, 0, .35);
            }

            #${MODAL_ID}[hidden] {
                display: none !important;
            }

            .wecoffee-edit-box {
                position: relative;
                box-sizing: border-box;
                width: min(100%, 500px);
                max-height: 90vh;
                overflow-y: auto;
                padding: 26px;
                border-radius: 15px;
                background: #fff;
                color: var(--main-brown, #2a160b);
                box-shadow: 0 8px 28px rgba(0, 0, 0, .15);
            }

            .wecoffee-edit-box h2 {
                margin: 0 38px 20px 0;
            }

            .wecoffee-edit-close {
                position: absolute;
                top: 12px;
                right: 15px;
                border: 0;
                background: transparent;
                color: inherit;
                font-size: 28px;
                cursor: pointer;
            }

            .wecoffee-edit-box label {
                display: block;
                margin: 13px 0 6px;
                font-weight: 600;
            }

            .wecoffee-edit-box input,
            .wecoffee-edit-box textarea,
            .wecoffee-edit-box select {
                box-sizing: border-box;
                display: block;
                width: 100%;
                padding: 10px 11px;
                border: 1px solid #c9b8a8;
                border-radius: 7px;
                background: #fff;
                color: #2a160b;
                font: inherit;
            }

            .wecoffee-edit-box textarea {
                min-height: 85px;
                resize: vertical;
            }

            .wecoffee-edit-preview {
                display: block;
                width: 120px;
                height: 120px;
                margin-top: 10px;
                border-radius: 10px;
                object-fit: cover;
                background: #f5eee8;
            }

            .wecoffee-edit-actions {
                display: flex;
                gap: 10px;
                margin-top: 20px;
            }

            .wecoffee-edit-actions button {
                flex: 1;
                padding: 12px;
                border: 0;
                border-radius: 8px;
                font: inherit;
                font-weight: 700;
                cursor: pointer;
            }

            .wecoffee-edit-save {
                background: var(--yellow, #d88b0d);
                color: var(--main-brown, #2a160b);
            }

            .wecoffee-edit-cancel {
                background: #eee6df;
                color: var(--main-brown, #2a160b);
            }

            #wecoffee-edit-message {
                overflow-wrap: anywhere;
                font-size: 14px;
            }

            @media (max-width: 480px) {
                .wecoffee-edit-box {
                    padding: 20px 16px;
                }
            }
        `;

        document.head.appendChild(style);
    }

    function createModal() {
        let modal = document.getElementById(MODAL_ID);
        if (modal) return modal;

        modal = document.createElement("div");
        modal.id = MODAL_ID;
        modal.hidden = true;

        modal.innerHTML = `
            <section class="wecoffee-edit-box"
                role="dialog"
                aria-modal="true"
                aria-labelledby="wecoffee-edit-title">

                <button type="button" class="wecoffee-edit-close"
                    aria-label="Fechar">×</button>

                <h2 id="wecoffee-edit-title">Editar produto</h2>

                <form id="wecoffee-edit-form">
                    <label for="wecoffee-edit-name">Nome do produto</label>
                    <input id="wecoffee-edit-name" type="text"
                        maxlength="80" required>

                    <label for="wecoffee-edit-description">Descrição</label>
                    <textarea id="wecoffee-edit-description"></textarea>

                    <label for="wecoffee-edit-type">Categoria</label>
                    <select id="wecoffee-edit-type" required>
                        <option value="cafe">Café</option>
                        <option value="comida">Comida</option>
                        <option value="bebida">Bebida</option>
                    </select>

                    <label for="wecoffee-edit-price">Preço (R$)</label>
                    <input id="wecoffee-edit-price" type="number"
                        min="0" step="0.01" required>

                    <label for="wecoffee-edit-quantity">Quantidade</label>
                    <input id="wecoffee-edit-quantity" type="number"
                        min="1" step="1" required>

                    <label for="wecoffee-edit-photo">Foto do produto</label>
                    <input id="wecoffee-edit-photo" type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif">

                    <img id="wecoffee-edit-preview"
                        class="wecoffee-edit-preview"
                        alt="Prévia da foto do produto" hidden>

                    <p id="wecoffee-edit-message" role="status"
                        aria-live="polite"></p>

                    <div class="wecoffee-edit-actions">
                        <button type="button"
                            class="wecoffee-edit-cancel">Cancelar</button>
                        <button type="submit"
                            class="wecoffee-edit-save">Salvar alterações</button>
                    </div>
                </form>
            </section>
        `;

        document.body.appendChild(modal);

        const close = () => {
            modal.hidden = true;
        };

        modal.querySelector(".wecoffee-edit-close")
            .addEventListener("click", close);

        modal.querySelector(".wecoffee-edit-cancel")
            .addEventListener("click", close);

        modal.addEventListener("click", (event) => {
            if (event.target === modal) close();
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && !modal.hidden) close();
        });

        modal.querySelector("#wecoffee-edit-photo")
            .addEventListener("change", async (event) => {
                const preview = modal.querySelector("#wecoffee-edit-preview");
                const file = event.target.files?.[0];

                if (!file) return;

                try {
                    const image = await readImage(file);

                    preview.src = image;
                    preview.hidden = false;
                    preview.dataset.newImage = image;
                    modal.querySelector("#wecoffee-edit-message").textContent = "";
                } catch (error) {
                    modal.querySelector("#wecoffee-edit-message").textContent =
                        error.message;
                }
            });

        modal.querySelector("#wecoffee-edit-form")
            .addEventListener("submit", async (event) => {
                event.preventDefault();

                const message = modal.querySelector("#wecoffee-edit-message");
                const saveButton = modal.querySelector(".wecoffee-edit-save");

                message.textContent = "";

                if (!isAdmin()) {
                    message.textContent =
                        "Somente administradores podem editar produtos.";
                    return;
                }

                const id = modal.dataset.productId;

                const nome = modal.querySelector("#wecoffee-edit-name")
                    .value.trim();

                const descricao = modal.querySelector("#wecoffee-edit-description")
                    .value.trim();

                const tipo = modal.querySelector("#wecoffee-edit-type").value;
                const preco = modal.querySelector("#wecoffee-edit-price").value;
                const quantidade = modal.querySelector("#wecoffee-edit-quantity").value;

                if (!nome || !tipo || preco === "" || quantidade === "") {
                    message.textContent = "Preencha todos os campos obrigatórios.";
                    return;
                }

                const payload = {
                    nome,
                    descricao,
                    tipo,
                    preco,
                    quantidade
                };

                const preview = modal.querySelector("#wecoffee-edit-preview");

                if (preview.dataset.newImage) {
                    payload.foto = preview.dataset.newImage;
                }

                saveButton.disabled = true;
                saveButton.textContent = "Salvando...";

                try {
                    const response = await fetch(`${API}/products/${id}`, {
                        method: "PUT",
                        headers: authHeaders(),
                        body: JSON.stringify(payload)
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(
                            data.erro || "Não foi possível atualizar o produto."
                        );
                    }

                    message.textContent = "Produto atualizado com sucesso!";

                    // Recarrega o cardápio para refletir as alterações salvas.
                    window.location.reload();
                } catch (error) {
                    message.textContent = error.message;
                } finally {
                    saveButton.disabled = false;
                    saveButton.textContent = "Salvar alterações";
                }
            });

        return modal;
    }

    async function openEditor(product) {
        if (!isAdmin()) {
            alert("Somente administradores podem editar produtos.");
            return;
        }

        const modal = createModal();
        const preview = modal.querySelector("#wecoffee-edit-preview");

        modal.dataset.productId = product.id_produto;

        modal.querySelector("#wecoffee-edit-name").value =
            product.nome_produto || "";

        modal.querySelector("#wecoffee-edit-description").value =
            product.descricao_produto || "";

        modal.querySelector("#wecoffee-edit-type").value =
            product.tipo_produto || "cafe";

        modal.querySelector("#wecoffee-edit-price").value =
            Number(product.preco_produto || 0).toFixed(2);

        modal.querySelector("#wecoffee-edit-quantity").value =
            Math.max(1, Number(product.quantidade_produto || 1));

        modal.querySelector("#wecoffee-edit-photo").value = "";

        preview.removeAttribute("data-new-image");

        if (product.foto_produto) {
            preview.src = product.foto_produto;
            preview.hidden = false;
        } else {
            preview.removeAttribute("src");
            preview.hidden = true;
        }

        modal.querySelector("#wecoffee-edit-message").textContent = "";
        modal.hidden = false;

        modal.querySelector("#wecoffee-edit-name").focus();
    }

    function normalizePrice(text) {
        return Number(
            String(text || "")
                .replace(/[^\d,.-]/g, "")
                .replace(/\./g, "")
                .replace(",", ".")
        ) || 0;
    }

    function productMatchesCard(product, card) {
        const name = card.querySelector(".item-name")?.textContent.trim() || "";
        const description =
            card.querySelector(".item-desc")?.textContent.trim() || "";
        const price = normalizePrice(
            card.querySelector(".item-price")?.textContent
        );

        return product.nome_produto === name &&
            (product.descricao_produto || "") === description &&
            Math.abs(Number(product.preco_produto) - price) < 0.005;
    }

    async function refreshEditButtons() {
        const grid = document.querySelector(".menu-grid");
        if (!grid || !isAdmin()) return;

        let products;

        try {
            const response = await fetch(`${API}/products`);

            if (!response.ok) return;

            products = await response.json();
            if (!Array.isArray(products)) return;
        } catch {
            return;
        }

        grid.querySelectorAll(".card").forEach((card) => {
            if (card.querySelector(".admin-edit-product")) return;

            const product = products.find((item) =>
                productMatchesCard(item, card)
            );

            if (!product) return;

            const button = document.createElement("button");
            button.type = "button";
            button.className = "admin-edit-product";
            button.textContent = "Editar produto";

            button.addEventListener("click", () => openEditor(product));

            card.appendChild(button);
        });
    }

    function setup() {
        injectStyles();
        createModal();

        if (!isAdmin()) return;

        const grid = document.querySelector(".menu-grid");
        if (!grid) return;

        refreshEditButtons();

        const observer = new MutationObserver(() => {
            refreshEditButtons();
        });

        observer.observe(grid, {
            childList: true,
            subtree: true
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setup);
    } else {
        setup();
    }
})();