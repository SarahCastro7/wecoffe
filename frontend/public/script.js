
const API = "http://localhost:3000";

/* ---------- UTILIDADES ---------- */

function getUser() {
    try {
        return JSON.parse(localStorage.getItem("user"));
    } catch {
        return null;
    }
}

function salvarUser(user, token) {
    localStorage.setItem("user", JSON.stringify(user));

    if (token) {
        localStorage.setItem("token", token);
    }
}

function lerImagem(arquivo, max = 600) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onerror = () => reject(new Error("Não consegui ler a imagem."));

        reader.onload = () => {
            const img = new Image();

            img.onerror = () => reject(new Error("O arquivo não é uma imagem válida."));

            img.onload = () => {
                const escala = Math.min(
                    1,
                    max / Math.max(img.width, img.height)
                );

                const canvas = document.createElement("canvas");
                canvas.width = Math.max(1, Math.round(img.width * escala));
                canvas.height = Math.max(1, Math.round(img.height * escala));

                const ctx = canvas.getContext("2d");
                ctx.fillStyle = "#fff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                resolve(canvas.toDataURL("image/jpeg", 0.8));
            };

            img.src = reader.result;
        };

        reader.readAsDataURL(arquivo);
    });
}

function headersAutenticados() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
    };
}

async function lerResposta(res) {
    const texto = await res.text();

    try {
        return texto ? JSON.parse(texto) : {};
    } catch {
        return { erro: "O servidor devolveu uma resposta inválida." };
    }
}

/* ---------- ELEMENTOS DO USUÁRIO ---------- */

const userImg = document.getElementById("user-img");
const loginBtn = document.getElementById("login-btn");
const modalLogin = document.querySelector(".login-modal");

const inputFoto = document.createElement("input");
inputFoto.type = "file";
inputFoto.accept = "image/jpeg,image/png,image/webp,image/gif";
inputFoto.hidden = true;
document.body.appendChild(inputFoto);

/* ---------- SAUDAÇÃO E ADMINISTRADOR ---------- */

function mostrarUsuario() {
    const user = getUser();

    if (userImg) {
        userImg.src = user?.foto_usuario || "";
        userImg.alt = user ? "Foto de perfil" : "Foto de perfil — entrar";
        userImg.style.cursor = "pointer";
        userImg.title = user
            ? "Abrir meu perfil"
            : "Clique para entrar";
    }

    if (loginBtn) {
        loginBtn.textContent = user ? "SAIR" : "LOGIN";
    }

    let saudacao = document.getElementById("user-greeting");

    if (!saudacao && userImg?.parentElement) {
        saudacao = document.createElement("button");
        saudacao.id = "user-greeting";
        saudacao.type = "button";
        userImg.parentElement.insertAdjacentElement("afterend", saudacao);
    }

    if (saudacao) {
        saudacao.textContent = user
            ? `Olá, ${user.nome_usuario || user.email_usuario}!`
            : "";

        saudacao.hidden = !user;
        saudacao.onclick = () => abrirPainelPerfil();
    }

    let linkAdmin = document.getElementById("admin-create-product");

    if (user?.funcao_usuario === "admin") {
        if (!linkAdmin) {
            linkAdmin = document.createElement("a");
            linkAdmin.id = "admin-create-product";
            linkAdmin.href = "makeItem.html";
            linkAdmin.textContent = "Criar Produto";

            (saudacao || userImg?.parentElement)
                ?.insertAdjacentElement("afterend", linkAdmin);
        }

        linkAdmin.hidden = false;
    } else {
        linkAdmin?.remove();
    }

    document.body.classList.toggle(
    "admin-mode",
    user?.funcao_usuario === "admin"
    );
}

/* ---------- ABRIR O PERFIL PELA FOTO CIRCULAR ---------- */

userImg?.addEventListener("click", () => {
    if (getUser()) {
        abrirPainelPerfil();
        return;
    }

    if (modalLogin) {
        modalLogin.classList.add("active");
        document.body.classList.add("no-scroll");
    } else {
        alert("Faça login para acessar seu perfil.");
    }
});

/* ---------- FOTO DE PERFIL ---------- */

inputFoto.addEventListener("change", async () => {
    const arquivo = inputFoto.files?.[0];

    if (!arquivo) return;

    try {
        if (!getUser() || !localStorage.getItem("token")) {
            throw new Error("Sua sessão expirou. Entre novamente.");
        }

        if (!arquivo.type.startsWith("image/")) {
            throw new Error("Selecione um arquivo de imagem.");
        }

        const foto = await lerImagem(arquivo, 300);

        const res = await fetch(`${API}/user/foto`, {
            method: "PUT",
            headers: headersAutenticados(),
            body: JSON.stringify({ foto })
        });

        const dados = await lerResposta(res);

        if (!res.ok) {
            throw new Error(dados.erro || "Não foi possível atualizar a foto.");
        }

        salvarUser(dados);
        mostrarUsuario();

        const painel = document.getElementById("profile-panel");
        if (painel) {
            const mensagem = painel.querySelector("#profile-message");
            if (mensagem) mensagem.textContent = "Foto salva com sucesso!";
        }
    } catch (erro) {
        alert(erro.message);
    } finally {
        inputFoto.value = "";
    }
});

/* ---------- MODAL CRUD DO PERFIL ---------- */

function abrirPainelPerfil() {
    const user = getUser();

    if (!user || !localStorage.getItem("token")) {
        if (modalLogin) {
            modalLogin.classList.add("active");
            document.body.classList.add("no-scroll");
        } else {
            alert("Faça login para acessar seu perfil.");
        }
        return;
    }

    let painel = document.getElementById("profile-panel");

    if (!painel) {
        painel = document.createElement("div");
        painel.id = "profile-panel";

        painel.innerHTML = `
            <div class="profile-box" role="dialog"
                 aria-modal="true" aria-labelledby="profile-title">

                <button type="button" id="profile-close"
                    class="profile-close" aria-label="Fechar">×</button>

                <h2 id="profile-title">Meu perfil</h2>

                <div class="profile-photo-area">
                    <img id="profile-photo-preview"
                        alt="Sua foto de perfil"
                        style="width:90px;height:90px;object-fit:cover;
                        border-radius:50%;display:block;margin:0 auto 10px;">

                    <button type="button" id="profile-photo">
                        Trocar foto
                    </button>
                </div>

                <label for="profile-name">Nome</label>
                <input id="profile-name" type="text"
                    maxlength="50" autocomplete="name" required>

                <label for="profile-email">E-mail</label>
                <input id="profile-email" type="email"
                    maxlength="50" autocomplete="email" required>

                <button type="button" id="profile-save">
                    Salvar nome e e-mail
                </button>

                <hr>

                <h3>Alterar senha</h3>

                <label for="profile-old-password">Senha atual</label>
                <input id="profile-old-password" type="password"
                    autocomplete="current-password">

                <label for="profile-new-password">
                    Nova senha (mínimo 6 caracteres)
                </label>
                <input id="profile-new-password" type="password"
                    minlength="6" autocomplete="new-password">

                <label for="profile-confirm-password">
                    Confirmar nova senha
                </label>
                <input id="profile-confirm-password" type="password"
                    minlength="6" autocomplete="new-password">

                <button type="button" id="profile-save-password">
                    Salvar nova senha
                </button>

                <p id="profile-message" role="status" aria-live="polite"></p>
            </div>
        `;

        document.body.appendChild(painel);

        const fechar = () => painel.remove();

        painel.querySelector("#profile-close").onclick = fechar;

        painel.addEventListener("click", (e) => {
            if (e.target === painel) fechar();
        });

        painel.querySelector("#profile-photo").onclick = () => {
            inputFoto.click();
        };

        /* Atualizar nome e e-mail no banco */
        painel.querySelector("#profile-save").onclick = async () => {
            const msg = painel.querySelector("#profile-message");
            const botao = painel.querySelector("#profile-save");

            msg.textContent = "";

            try {
                const nome = painel.querySelector("#profile-name").value.trim();
                const email = painel.querySelector("#profile-email").value.trim();

                if (!nome || !email) {
                    throw new Error("Preencha o nome e o e-mail.");
                }

                if (nome.length > 50 || email.length > 50) {
                    throw new Error("O nome e o e-mail devem ter até 50 caracteres.");
                }

                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    throw new Error("Digite um e-mail válido.");
                }

                botao.disabled = true;
                botao.textContent = "Salvando...";

                const res = await fetch(`${API}/user/perfil`, {
                    method: "PUT",
                    headers: headersAutenticados(),
                    body: JSON.stringify({ nome, email })
                });

                const dados = await lerResposta(res);

                if (!res.ok) {
                    throw new Error(dados.erro || "Não foi possível atualizar o perfil.");
                }

                salvarUser(dados);
                mostrarUsuario();

                msg.textContent = "Nome e e-mail salvos com sucesso!";
            } catch (erro) {
                msg.textContent = erro.message;
            } finally {
                botao.disabled = false;
                botao.textContent = "Salvar nome e e-mail";
            }
        };

        /* Atualizar senha no banco */
        painel.querySelector("#profile-save-password").onclick = async () => {
            const msg = painel.querySelector("#profile-message");
            const botao = painel.querySelector("#profile-save-password");

            msg.textContent = "";

            try {
                const senhaAtual =
                    painel.querySelector("#profile-old-password").value;

                const senhaNova =
                    painel.querySelector("#profile-new-password").value;

                const confirmar =
                    painel.querySelector("#profile-confirm-password").value;

                if (!senhaAtual || !senhaNova || !confirmar) {
                    throw new Error("Preencha os três campos de senha.");
                }

                if (senhaNova.length < 6) {
                    throw new Error("A nova senha precisa ter pelo menos 6 caracteres.");
                }

                if (senhaNova !== confirmar) {
                    throw new Error("A confirmação da nova senha não corresponde.");
                }

                botao.disabled = true;
                botao.textContent = "Salvando...";

                const res = await fetch(`${API}/user/senha`, {
                    method: "PUT",
                    headers: headersAutenticados(),
                    body: JSON.stringify({ senhaAtual, senhaNova })
                });

                const dados = await lerResposta(res);

                if (!res.ok) {
                    throw new Error(dados.erro || "Não foi possível alterar a senha.");
                }

                painel.querySelector("#profile-old-password").value = "";
                painel.querySelector("#profile-new-password").value = "";
                painel.querySelector("#profile-confirm-password").value = "";

                msg.textContent = dados.mensagem || "Senha alterada com sucesso!";
            } catch (erro) {
                msg.textContent = erro.message;
            } finally {
                botao.disabled = false;
                botao.textContent = "Salvar nova senha";
            }
        };
    }

    /* Atualizar os campos ao abrir o painel */
    const usuarioAtual = getUser();

    painel.querySelector("#profile-name").value =
        usuarioAtual?.nome_usuario || "";

    painel.querySelector("#profile-email").value =
        usuarioAtual?.email_usuario || "";

    painel.querySelector("#profile-photo-preview").src =
        usuarioAtual?.foto_usuario || "";

    painel.querySelector("#profile-message").textContent = "";

    painel.querySelector("#profile-old-password").value = "";
    painel.querySelector("#profile-new-password").value = "";
    painel.querySelector("#profile-confirm-password").value = "";
}

mostrarUsuario();

/* ---------- LOGIN E LOGOUT ---------- */

if (modalLogin && loginBtn) {
    loginBtn.addEventListener("click", () => {
        if (getUser()) {
            localStorage.removeItem("user");
            localStorage.removeItem("token");

            mostrarUsuario();
            return;
        }

        modalLogin.classList.add("active");
        document.body.classList.add("no-scroll");
    });

    modalLogin.querySelector(".close-btn")?.addEventListener("click", () => {
        modalLogin.classList.remove("active");
        document.body.classList.remove("no-scroll");
    });

    modalLogin.addEventListener("click", (e) => {
        if (e.target === modalLogin) {
            modalLogin.classList.remove("active");
            document.body.classList.remove("no-scroll");
        }
    });

    document.getElementById("login-form")?.addEventListener(
        "submit",
        async (e) => {
            e.preventDefault();

            const msg = document.getElementById("login-msg");
            if (msg) msg.textContent = "";

            try {
                const res = await fetch(`${API}/user/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: document.getElementById("email-input").value,
                        senha: document.getElementById("password-input").value
                    })
                });

                const dados = await lerResposta(res);

                if (!res.ok) {
                    if (msg) msg.textContent =
                        dados.erro || "Não foi possível entrar.";
                    return;
                }

                salvarUser(dados.usuario, dados.token);

                modalLogin.classList.remove("active");
                document.body.classList.remove("no-scroll");

                mostrarUsuario();
            } catch {
                if (msg) {
                    msg.textContent =
                        "Servidor fora do ar. Verifique se o backend está rodando.";
                }
            }
        }
    );
}

/* ---------- PRODUTOS: LISTAGEM, FILTROS E PESQUISA ---------- */

const grid = document.querySelector(".menu-grid");

if (grid && grid.firstElementChild) {
    const modelo = grid.firstElementChild.cloneNode(true);
    grid.innerHTML = "";

    const seeMore = document.getElementById("see-more");
    const buscaInput = document.querySelector(".search-bar");

    const aviso = document.createElement("p");
    aviso.id = "products-msg";

    if (seeMore) {
        seeMore.before(aviso);
    } else {
        grid.after(aviso);
    }

    const POR_PAGINA = 8;

    let produtos = [];
    let tipoAtivo = null;
    let busca = "";
    let visiveis = POR_PAGINA;

    function filtrar() {
        return produtos.filter((p) => {
            const nome = (p.nome_produto || "").toLowerCase();
            const descricao = (p.descricao_produto || "").toLowerCase();

            const correspondeTipo =
                !tipoAtivo || p.tipo_produto === tipoAtivo;

            const correspondeBusca =
                nome.includes(busca) || descricao.includes(busca);

            return correspondeTipo && correspondeBusca;
        });
    }

    function mostrarProdutos() {
        grid.innerHTML = "";

        const filtrados = filtrar();

        filtrados.slice(0, visiveis).forEach((p) => {
            const card = modelo.cloneNode(true);
            const imagem = card.querySelector(".item-img");

            if (imagem) {
                imagem.src = p.foto_produto || "../imgs/Ice Coffee.png";
                imagem.alt = p.nome_produto || "Produto";
            }

            const nome = card.querySelector(".item-name");
            if (nome) nome.textContent = p.nome_produto || "";

            const descricao = card.querySelector(".item-desc");
            if (descricao) descricao.textContent = p.descricao_produto || "";

            const preco = card.querySelector(".item-price");

            if (preco) {
                preco.textContent =
                    "R$ " +
                    Number(p.preco_produto || 0)
                        .toFixed(2)
                        .replace(".", ",");
            }

            grid.appendChild(card);
        });

        if (filtrados.length === 0) {
            aviso.textContent = "Nenhum produto encontrado.";
        } else {
            aviso.textContent = "";
        }

        if (seeMore) {
            seeMore.hidden = filtrados.length <= visiveis;
        }
    }

    seeMore?.addEventListener("click", () => {
        if (visiveis < filtrar().length) {
            visiveis += POR_PAGINA;
            mostrarProdutos();
        }
    });

    document.querySelectorAll(".filter-buttons button").forEach((botao) => {
        botao.addEventListener("click", () => {
            tipoAtivo =
                tipoAtivo === botao.dataset.tipo
                    ? null
                    : botao.dataset.tipo;

            document.querySelectorAll(".filter-buttons button").forEach((b) => {
                b.classList.toggle(
                    "active",
                    b.dataset.tipo === tipoAtivo
                );
            });

            visiveis = POR_PAGINA;
            mostrarProdutos();
        });
    });

    buscaInput?.addEventListener("input", (e) => {
        busca = e.target.value.toLowerCase().trim();
        visiveis = POR_PAGINA;
        mostrarProdutos();
    });

    fetch(`${API}/products`)
        .then(async (res) => {
            const dados = await lerResposta(res);

            if (!res.ok) {
                throw new Error(dados.erro || "Não foi possível carregar os produtos.");
            }

            return dados;
        })
        .then((dados) => {
            produtos = Array.isArray(dados) ? dados : [];
            mostrarProdutos();
        })
        .catch((erro) => {
            aviso.textContent = erro.message ||
                "Servidor fora do ar. Verifique se o backend está rodando.";
        });
}

/* ---------- CADASTRO DE PRODUTOS ---------- */

const formProduto = document.getElementById("product-form");

if (formProduto) {
    const inputImg = document.getElementById("product-img");
    const preview = document.getElementById("product-preview");
    const msg = document.getElementById("form-msg");
    const qtd = document.getElementById("product-qty");

    let foto = null;

    inputImg?.addEventListener("change", async () => {
        const arquivo = inputImg.files?.[0];
        if (!arquivo) return;

        try {
            foto = await lerImagem(arquivo, 600);

            if (preview) {
                preview.src = foto;
                preview.hidden = false;
            }

            if (msg) msg.textContent = "";
        } catch (erro) {
            if (msg) msg.textContent = erro.message;
        }
    });

    document.getElementById("qty-minus")?.addEventListener("click", () => {
        if (qtd && Number(qtd.value) > 1) {
            qtd.value = Number(qtd.value) - 1;
        }
    });

    document.getElementById("qty-plus")?.addEventListener("click", () => {
        if (qtd) {
            qtd.value = Number(qtd.value || 1) + 1;
        }
    });

    formProduto.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (msg) msg.textContent = "";

        try {
            const user = getUser();

            if (!user || !localStorage.getItem("token")) {
                throw new Error("Faça login antes de cadastrar um produto.");
            }

            if (user.funcao_usuario !== "admin") {
                throw new Error("Somente administradores podem criar produtos.");
            }

            const nome = document.getElementById("product-name").value.trim();
            const descricao = document.getElementById("product-desc").value.trim();
            const tipo = document.getElementById("product-type").value;
            const preco = document.getElementById("product-price").value;
            const quantidade = qtd?.value || 1;

            if (!nome || !tipo || preco === "") {
                throw new Error("Preencha o nome, o tipo e o preço.");
            }

            const res = await fetch(`${API}/products`, {
                method: "POST",
                headers: headersAutenticados(),
                body: JSON.stringify({
                    nome,
                    descricao,
                    tipo,
                    preco,
                    quantidade,
                    foto
                })
            });

            const dados = await lerResposta(res);

            if (!res.ok) {
                throw new Error(dados.erro || "Não foi possível criar o produto.");
            }

            if (msg) msg.textContent = "Produto criado com sucesso!";

            formProduto.reset();

            if (preview) {
                preview.src = "";
                preview.hidden = true;
            }

            foto = null;
        } catch (erro) {
            if (msg) msg.textContent = erro.message;
        }
    });
}
