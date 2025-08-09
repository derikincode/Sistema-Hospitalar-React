// src/services/database.js
const DB_NAME = 'HospitalProductsDB';
const DB_VERSION = 1;
const STORE_NAME = 'products';

class DatabaseService {
  constructor() {
    this.db = null;
  }

  // Inicializa o banco de dados
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Erro ao abrir o banco de dados:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('Banco de dados inicializado com sucesso');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Cria o object store para produtos se não existir
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { 
            keyPath: 'id',
            autoIncrement: false 
          });

          // Cria índices para busca eficiente
          objectStore.createIndex('codigo', 'codigo', { unique: true });
          objectStore.createIndex('nome', 'nome', { unique: false });
          objectStore.createIndex('marca', 'marca', { unique: false });
          objectStore.createIndex('setor', 'setor', { unique: false });
          objectStore.createIndex('createdAt', 'createdAt', { unique: false });
          objectStore.createIndex('updatedAt', 'updatedAt', { unique: false });

          console.log('Object store de produtos criado');
        }
      };
    });
  }

  // Adiciona um produto
  async addProduct(product) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      // Adiciona timestamps
      const productWithTimestamps = {
        ...product,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const request = store.add(productWithTimestamps);

      request.onsuccess = () => {
        console.log('Produto adicionado com sucesso:', productWithTimestamps);
        resolve(productWithTimestamps);
      };

      request.onerror = () => {
        console.error('Erro ao adicionar produto:', request.error);
        reject(request.error);
      };
    });
  }

  // Atualiza um produto
  async updateProduct(product) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      // Mantém o createdAt original e atualiza apenas o updatedAt
      const productWithTimestamp = {
        ...product,
        updatedAt: new Date().toISOString()
      };

      const request = store.put(productWithTimestamp);

      request.onsuccess = () => {
        console.log('Produto atualizado com sucesso:', productWithTimestamp);
        resolve(productWithTimestamp);
      };

      request.onerror = () => {
        console.error('Erro ao atualizar produto:', request.error);
        reject(request.error);
      };
    });
  }

  // Remove um produto
  async deleteProduct(id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('Produto removido com sucesso:', id);
        resolve(id);
      };

      request.onerror = () => {
        console.error('Erro ao remover produto:', request.error);
        reject(request.error);
      };
    });
  }

  // Busca um produto por ID
  async getProduct(id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('Erro ao buscar produto:', request.error);
        reject(request.error);
      };
    });
  }

  // Busca todos os produtos
  async getAllProducts() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const products = request.result || [];
        console.log(`${products.length} produtos carregados do banco de dados`);
        resolve(products);
      };

      request.onerror = () => {
        console.error('Erro ao buscar produtos:', request.error);
        reject(request.error);
      };
    });
  }

  // Busca produtos por campo específico
  async searchProducts(indexName, searchValue) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index(indexName);
      const request = index.getAll(searchValue);

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('Erro ao buscar produtos:', request.error);
        reject(request.error);
      };
    });
  }

  // Verifica se um código já existe (excluindo um ID específico para edição)
  async checkCodeExists(codigo, excludeId = null) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('codigo');
      const request = index.get(codigo);

      request.onsuccess = () => {
        const result = request.result;
        if (result && excludeId && result.id === excludeId) {
          resolve(false); // O código pertence ao produto sendo editado
        } else {
          resolve(!!result); // Retorna true se existe, false se não
        }
      };

      request.onerror = () => {
        console.error('Erro ao verificar código:', request.error);
        reject(request.error);
      };
    });
  }

  // Limpa todos os produtos (útil para desenvolvimento/testes)
  async clearAllProducts() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('Todos os produtos foram removidos');
        resolve();
      };

      request.onerror = () => {
        console.error('Erro ao limpar produtos:', request.error);
        reject(request.error);
      };
    });
  }

  // Exporta todos os produtos como JSON
  async exportProducts() {
    const products = await this.getAllProducts();
    return JSON.stringify(products, null, 2);
  }

  // Importa produtos de um JSON
  async importProducts(jsonData) {
    try {
      const products = JSON.parse(jsonData);
      
      if (!Array.isArray(products)) {
        throw new Error('Dados inválidos: esperado um array de produtos');
      }

      for (const product of products) {
        // Verifica se o produto já existe
        const exists = await this.getProduct(product.id);
        if (exists) {
          await this.updateProduct(product);
        } else {
          await this.addProduct(product);
        }
      }

      return products.length;
    } catch (error) {
      console.error('Erro ao importar produtos:', error);
      throw error;
    }
  }

  // Retorna estatísticas do banco de dados
  async getStats() {
    const products = await this.getAllProducts();
    
    const stats = {
      totalProducts: products.length,
      totalBrands: new Set(products.map(p => p.marca).filter(Boolean)).size,
      totalSectors: new Set(products.map(p => p.setor).filter(Boolean)).size,
      productsWithImages: products.filter(p => p.fotos && p.fotos.length > 0).length,
      totalImages: products.reduce((sum, p) => sum + (p.fotos ? p.fotos.length : 0), 0),
      lastUpdate: products.length > 0 
        ? new Date(Math.max(...products.map(p => new Date(p.updatedAt || p.createdAt))))
        : null
    };

    return stats;
  }
}

// Exporta uma instância única do serviço
const databaseService = new DatabaseService();
export default databaseService;