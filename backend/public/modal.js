class AprovarLojaModal {
  constructor() {
    this.modal = null;
    this.backdrop = null;
    this.panel = null;
    this.nomeSpan = null;
    this.aprovarBtn = null;
    this.cancelarBtn = null;
    this.loading = false;
    this.currentId = null;
    this.currentNome = null;

    this.init();
  }

  init() {
    // Aguarda o DOM estar pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.createModal());
    } else {
      this.createModal();
    }
  }

  createModal() {
    const modalHTML = `
      <div id="aprovar-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div class="aprovar-modal-backdrop absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"></div>
        <div class="aprovar-modal-panel relative bg-white dark:bg-gray-950 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md transform transition-all duration-300">
          <div class="p-6">
            <div class="flex items-start gap-4">
              <div class="flex size-12 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <svg class="size-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Aprovar Loja</h3>
                <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Tem certeza que deseja aprovar a loja <strong class="modal-loja-nome text-gray-900 dark:text-white"></strong>?
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Após aprovação, a loja poderá operar normalmente.</p>
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-3 p-6 pt-0">
            <button type="button" class="modal-cancelar-btn px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition">
              Cancelar
            </button>
            <button type="button" class="modal-aprovar-btn inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
              <span class="btn-text">Aprovar</span>
              <span class="btn-loading hidden items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Aprovando...
              </span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Selecionar elementos
    this.modal = document.getElementById('aprovar-modal');
    this.backdrop = this.modal.querySelector('.aprovar-modal-backdrop');
    this.panel = this.modal.querySelector('.aprovar-modal-panel');
    this.nomeSpan = this.modal.querySelector('.modal-loja-nome');
    this.aprovarBtn = this.modal.querySelector('.modal-aprovar-btn');
    this.cancelarBtn = this.modal.querySelector('.modal-cancelar-btn');

    console.log('Modal criado:', { modal: this.modal, backdrop: this.backdrop, panel: this.panel });
    
    this.bindEvents();
  }

  bindEvents() {
    if (!this.cancelarBtn || !this.backdrop || !this.aprovarBtn) {
      console.error('Elementos do modal não encontrados');
      return;
    }

    this.cancelarBtn.addEventListener('click', () => {
      console.log('Botão cancelar clicado');
      this.close();
    });
    
    this.backdrop.addEventListener('click', (e) => {
      if (e.target === this.backdrop) {
        console.log('Backdrop clicado');
        this.close();
      }
    });
    
    this.aprovarBtn.addEventListener('click', () => {
      console.log('Botão aprovar clicado');
      this.aprovar();
    });

    // ESC para fechar
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
        this.close();
      }
    });

    console.log('Eventos vinculados com sucesso');
  }

  open(id, nome) {
    console.log('Abrindo modal para:', { id, nome });
    
    if (!this.modal) {
      console.error('Modal não inicializado');
      return;
    }

    this.currentId = id;
    this.currentNome = nome;
    this.nomeSpan.textContent = nome;
    
    // Mostrar modal
    this.modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Animar entrada
    requestAnimationFrame(() => {
      this.backdrop.style.opacity = '1';
      this.panel.style.transform = 'scale(1)';
      this.panel.style.opacity = '1';
    });
  }

  close() {
    console.log('Fechando modal');
    
    if (!this.modal) return;

    // Animar saída
    this.backdrop.style.opacity = '0';
    this.panel.style.transform = 'scale(0.95)';
    this.panel.style.opacity = '0';
    
    setTimeout(() => {
      this.modal.classList.add('hidden');
      document.body.style.overflow = '';
      this.currentId = null;
      this.currentNome = null;
    }, 300);
  }

  setLoading(loading) {
    this.loading = loading;
    const text = this.aprovarBtn.querySelector('.btn-text');
    const loadingEl = this.aprovarBtn.querySelector('.btn-loading');
    
    if (loading) {
      text.classList.add('hidden');
      loadingEl.classList.remove('hidden');
      loadingEl.classList.add('flex');
      this.aprovarBtn.disabled = true;
      this.cancelarBtn.disabled = true;
    } else {
      text.classList.remove('hidden');
      loadingEl.classList.add('hidden');
      loadingEl.classList.remove('flex');
      this.aprovarBtn.disabled = false;
      this.cancelarBtn.disabled = false;
    }
  }

  async aprovar() {
    if (this.loading || !this.currentId) {
      console.log('Aprovação ignorada:', { loading: this.loading, id: this.currentId });
      return;
    }

    console.log('Iniciando aprovação da loja:', this.currentId);
    this.setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const API_URL = 'http://127.0.0.1:3001/api/v1';
      
      const response = await fetch(`${API_URL}/lojas/${this.currentId}/aprovar`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('Resposta da API:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao aprovar loja');
      }

      // Feedback de sucesso
      if (window.showFeedback) {
        window.showFeedback('Loja aprovada com sucesso!', false);
      } else {
        alert('Loja aprovada com sucesso!');
      }

      this.close();

      // Recarregar lista
      setTimeout(() => {
        if (window.fetchLojas) {
          const page = window.currentPage || 1;
          const search = window.currentSearch || '';
          const status = window.currentStatus || '';
          console.log('Recarregando lojas:', { page, search, status });
          window.fetchLojas(page, search, status);
        }
      }, 300);

    } catch (error) {
      console.error('Erro ao aprovar loja:', error);
      
      if (window.showFeedback) {
        window.showFeedback(`Erro: ${error.message}`, true);
      } else {
        alert(`Erro: ${error.message}`);
      }
    } finally {
      this.setLoading(false);
    }
  }
}

// Inicializar modal globalmente
console.log('Inicializando AprovarLojaModal...');
window.aprovarLojaModal = new AprovarLojaModal();
console.log('AprovarLojaModal inicializado:', window.aprovarLojaModal);