window.currentPage = 1;
window.currentSearch = "";
window.currentStatus = "";


document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "http://127.0.0.1:3001/api/v1";
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    window.location.href = "/api/v1/dashboard/login.html";
    return;
  }

  // Elementos DOM
  const userEmailSpan = document.getElementById("user-email");
  const logoutButton = document.getElementById("logout-button");
  const feedbackDiv = document.getElementById("feedback-message");
  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");
  const tableBody = document.getElementById("lojas-table-body");
  const prevBtn = document.getElementById("prev-page");
  const nextBtn = document.getElementById("next-page");
  const paginationInfo = document.getElementById("pagination-info");
  const totalItemsSpan = document.getElementById("total-items");
  const filterButtons = document.querySelectorAll(".filter-btn");

  // Estado da aplicação
  let state = {
    currentPage: 1,
    currentSearch: "",
    currentStatus: "",
    totalPages: 1,
    usersCache: new Map()
  };

  // --- FUNÇÕES UTILITÁRIAS ---
  window.showFeedback = (message, isError = false) => {
    feedbackDiv.textContent = message;
    feedbackDiv.className = `mb-6 p-4 text-sm rounded-lg ${
      isError
        ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
        : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
    }`;
    feedbackDiv.classList.remove("hidden");
    setTimeout(() => feedbackDiv.classList.add("hidden"), 5000);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    window.location.href = "/api/v1/dashboard/login.html";
  };

  // --- CARREGAR CACHE DE USUÁRIOS ---
  const loadUsersCache = async () => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.status === 401 || response.status === 403) {
        logout();
        return;
      }
      
      if (!response.ok) throw new Error("Erro ao carregar usuários");
      
      const { data } = await response.json();
      console.log("Usuários carregados:", data.length);
      
      data.forEach(user => {
        const nomeCompleto = `${user.primeiroNome || ''} ${user.ultimoNome || ''}`.trim() || "Sem nome";
        state.usersCache.set(user.id, {
          nomeCompleto,
          email: user.email || "---"
        });
      });
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    }
  };

  // --- BUSCAR LOJAS ---
  window.fetchLojas = async (page = 1, search = "", status = "") => {

    try {
      console.log("Buscando lojas:", { page, search, status });
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10"
      });
      
      if (search && search.trim()) {
        params.append("search", search.trim());
      }
      
      if (status && status.trim()) {
        params.append("status", status.trim());
      }

      const url = `${API_URL}/lojas?${params.toString()}`;
      console.log("URL da requisição:", url);

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 401 || response.status === 403) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      window.currentPage = result.pagination.page;
      window.currentSearch = search;
      window.currentStatus = status;
      console.log("Resposta da API:", result);

      if (!result.data || !result.pagination) {
        throw new Error("Formato de resposta inválido");
      }

      state.totalPages = result.pagination.totalPages || 1;
      state.currentPage = result.pagination.page || 1;

      renderLojas(result.data);
      updatePagination(result.pagination);
      
    } catch (error) {
      console.error("Erro ao buscar lojas:", error);
      window.showFeedback(`Erro ao carregar lojas: ${error.message}`, true);
      tableBody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-red-500">Erro: ${error.message}</td></tr>`;
    }
  };

  // --- RENDERIZAR LOJAS ---
  const renderLojas = (lojas) => {
    tableBody.innerHTML = "";

    if (!lojas?.length) {
      tableBody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-gray-500 dark:text-gray-400">Nenhuma loja encontrada</td></tr>`;
      return;
    }

    lojas.forEach(loja => {
      const dono = state.usersCache.get(loja.donoId) || { nomeCompleto: "Carregando...", email: "---" };
      const logo = loja.logoUrl
        ? `<img src="${loja.logoUrl}" alt="${loja.nome}" class="w-10 h-10 rounded-full object-cover" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
           <div class="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300" style="display:none;">${loja.nome[0].toUpperCase()}</div>`
        : `<div class="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">${loja.nome[0].toUpperCase()}</div>`;

      const badge = getStatusBadge(loja.status);

      const row = document.createElement("tr");
      row.className = "hover:bg-gray-50 dark:hover:bg-gray-900 transition";
      row.innerHTML = `
        <td class="py-4 px-6">${logo}</td>
        <td class="py-4 px-6 font-medium">${loja.nome}</td>
        <td class="py-4 px-6">
          <div class="flex flex-col">
            <span class="font-medium text-gray-900 dark:text-white">${dono.nomeCompleto}</span>
            <span class="text-xs text-gray-500 dark:text-gray-400">${dono.email}</span>
          </div>
        </td>
        <td class="py-4 px-6">${badge}</td>
        <td class="py-4 px-6 text-center">
          ${loja.status === "pendente"
            ? `<button 
                 data-loja-id="${loja.id}" 
                 data-loja-nome="${loja.nome.replace(/"/g, '&quot;')}"
                 class="aprovar-loja-btn text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium transition cursor-pointer"
                 title="Aprovar loja">
                 Aprovar
               </button>`
            : '<span class="text-gray-400 text-sm">—</span>'}
        </td>
      `;
      tableBody.appendChild(row);
    });

    // Adicionar event listeners aos botões de aprovar
    const aprovarBtns = tableBody.querySelectorAll('.aprovar-loja-btn');
    aprovarBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const lojaId = this.getAttribute('data-loja-id');
        const lojaNome = this.getAttribute('data-loja-nome');
        console.log('Botão aprovar clicado:', { lojaId, lojaNome });
        
        if (window.aprovarLojaModal) {
          window.aprovarLojaModal.open(lojaId, lojaNome);
        } else {
          console.error('Modal não disponível');
          alert('Erro: Modal de aprovação não inicializado');
        }
      });
    });
  };

  // --- BADGE DE STATUS ---
  const getStatusBadge = (status) => {
    const statusMap = {
      pendente: {
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        text: "text-yellow-800 dark:text-yellow-400",
        label: "Pendente"
      },
      aprovado: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-800 dark:text-blue-400",
        label: "Aprovado"
      },
      ativa: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-800 dark:text-green-400",
        label: "Ativa"
      },
      suspensa: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-800 dark:text-red-400",
        label: "Suspensa"
      },
      inativa: {
        bg: "bg-gray-100 dark:bg-gray-900/30",
        text: "text-gray-800 dark:text-gray-400",
        label: "Inativa"
      }
    };

    const config = statusMap[status] || statusMap.inativa;
    return `<span class="px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}">${config.label}</span>`;
  };

  // --- ATUALIZAR PAGINAÇÃO ---
  const updatePagination = (pagination) => {
    const start = (pagination.page - 1) * pagination.limit + 1;
    const end = Math.min(pagination.page * pagination.limit, pagination.total);
    paginationInfo.textContent = pagination.total > 0 ? `${start}-${end}` : "0";
    totalItemsSpan.textContent = pagination.total;
    prevBtn.disabled = pagination.page <= 1;
    nextBtn.disabled = pagination.page >= pagination.totalPages;
  };

  // --- EVENTOS ---
  logoutButton.addEventListener("click", logout);

  searchBtn.addEventListener("click", () => {
    state.currentSearch = searchInput.value.trim();
    state.currentPage = 1;
    window.fetchLojas(1, state.currentSearch, state.currentStatus);
  });

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      searchBtn.click();
    }
  });

  prevBtn.addEventListener("click", () => {
    if (state.currentPage > 1) {
      state.currentPage--;
      window.fetchLojas(state.currentPage, state.currentSearch, state.currentStatus);
    }
  });

  nextBtn.addEventListener("click", () => {
    if (state.currentPage < state.totalPages) {
      state.currentPage++;
      window.fetchLojas(state.currentPage, state.currentSearch, state.currentStatus);
    }
  });

  // --- FILTROS ---
  filterButtons.forEach(btn => {
    btn.addEventListener("click", function() {
      filterButtons.forEach(b => {
        b.classList.remove("bg-indigo-600", "text-white");
        b.classList.add("bg-gray-200", "dark:bg-gray-700", "text-gray-700", "dark:text-gray-300");
      });
      this.classList.remove("bg-gray-200", "dark:bg-gray-700", "text-gray-700", "dark:text-gray-300");
      this.classList.add("bg-indigo-600", "text-white");

      state.currentStatus = this.dataset.status || "";
      state.currentPage = 1;
      state.currentSearch = "";
      searchInput.value = "";
      window.fetchLojas(1, "", state.currentStatus);
    });
  });


  // --- MODAL ADICIONAR LOJA ---
  const addLojaModal = document.getElementById("add-loja-modal");
  const openAddLojaBtn = document.getElementById("open-add-loja-modal");
  const cancelAddLojaBtn = document.getElementById("cancel-add-loja");
  const addLojaForm = document.getElementById("add-loja-form");
  const backdrop = document.getElementById("modal-backdrop");

  if (openAddLojaBtn && addLojaModal) {
    const openModal = () => {
      addLojaModal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    };

    const closeModal = () => {
      addLojaModal.classList.add("hidden");
      document.body.style.overflow = "";
      if (addLojaForm) addLojaForm.reset();
    };

    openAddLojaBtn.addEventListener("click", openModal);
    if (cancelAddLojaBtn) cancelAddLojaBtn.addEventListener("click", closeModal);
    if (backdrop) backdrop.addEventListener("click", closeModal);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !addLojaModal.classList.contains("hidden")) {
        closeModal();
      }
    });

    if (addLojaForm) {
      addLojaForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const payload = {
          donoId: document.getElementById("donoId").value,
          nome: document.getElementById("nome").value,
          descricao: document.getElementById("descricao").value || undefined,
          logoUrl: document.getElementById("logoUrl").value || undefined,
          bannerUrl: document.getElementById("bannerUrl").value || undefined,
          emailComercial: document.getElementById("emailComercial").value || undefined,
          telefoneComercial: document.getElementById("telefoneComercial").value || undefined,
          documentoIdentificacao: document.getElementById("documentoIdentificacao").value || undefined,
          enderecoComercial: {
            rua: document.getElementById("rua").value,
            numero: document.getElementById("numero").value || undefined,
            bairro: document.getElementById("bairro").value,
            cidade: document.getElementById("cidade").value,
            estado: document.getElementById("estado").value,
            cep: document.getElementById("cep").value,
            complemento: document.getElementById("complemento").value || undefined,
          }
        };

        try {
          const response = await fetch(`${API_URL}/lojas`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          });

          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.errors?.map(e => e.message).join(", ") || data.message);
          }

          window.showFeedback("Loja criada com sucesso!", false);
          closeModal();
          window.fetchLojas(1, "", state.currentStatus);
        } catch (error) {
          window.showFeedback(`Erro: ${error.message}`, true);
        }
      });
    }
  }

  // --- POPULAR SELECT DE DONOS ---
  const populateUsersSelect = async () => {
    const select = document.getElementById("donoId");
    if (!select) return;

    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Erro ao carregar usuários");

      const { data } = await response.json();
      select.innerHTML = '<option value="">Selecione um dono</option>';
      
      data.forEach(user => {
        const nome = `${user.primeiroNome || ''} ${user.ultimoNome || ''}`.trim() || "Sem nome";
        const option = new Option(`${nome} (${user.email})`, user.id);
        select.add(option);
      });
    } catch (error) {
      console.error("Erro ao popular select:", error);
      select.innerHTML = '<option value="">Erro ao carregar usuários</option>';
    }
  };

  // --- INICIALIZAÇÃO ---
  const init = async () => {
    console.log("Iniciando aplicação...");
    
    userEmailSpan.textContent = localStorage.getItem("userEmail") || "Admin";
    
    await loadUsersCache();
    
    await window.fetchLojas(1, "", "");
    
    await populateUsersSelect();
    
    console.log("Aplicação iniciada com sucesso!");
    console.log("Modal disponível:", window.aprovarLojaModal ? "Sim" : "Não");
  };

  init();
});