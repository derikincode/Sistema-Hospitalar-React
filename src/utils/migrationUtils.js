// src/utils/migrationUtils.js
// Utilitário para migrar dados do IndexedDB para Supabase

class MigrationUtils {
    constructor(newDatabaseService) {
      this.newDb = newDatabaseService;
      this.oldDbName = 'HospitalProductsDB';
      this.oldStoreName = 'products';
    }
  
    // Conecta ao IndexedDB antigo
    async connectToOldDB() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.oldDbName, 1);
  
        request.onerror = () => {
          console.log('IndexedDB antigo não encontrado ou erro na conexão');
          resolve(null);
        };
  
        request.onsuccess = () => {
          resolve(request.result);
        };
  
        request.onblocked = () => {
          reject(new Error('IndexedDB bloqueado'));
        };
      });
    }
  
    // Busca todos os produtos do IndexedDB antigo
    async getOldProducts() {
      const db = await this.connectToOldDB();
      
      if (!db) {
        console.log('Nenhum banco de dados antigo encontrado');
        return [];
      }
  
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.oldStoreName], 'readonly');
        const store = transaction.objectStore(this.oldStoreName);
        const request = store.getAll();
  
        request.onsuccess = () => {
          const products = request.result || [];
          console.log(`${products.length} produtos encontrados no IndexedDB`);
          resolve(products);
        };
  
        request.onerror = () => {
          console.error('Erro ao buscar produtos do IndexedDB:', request.error);
          reject(request.error);
        };
      });
    }
  
    // Migra produtos do IndexedDB para Supabase
    async migrateProducts() {
      try {
        console.log('🚀 Iniciando migração de dados...');
  
        // Busca produtos do IndexedDB antigo
        const oldProducts = await this.getOldProducts();
  
        if (oldProducts.length === 0) {
          console.log('✅ Nenhum produto para migrar');
          return { success: true, migrated: 0, errors: [] };
        }
  
        console.log(`📦 Encontrados ${oldProducts.length} produtos para migrar`);
  
        let migratedCount = 0;
        const errors = [];
  
        // Migra cada produto
        for (const product of oldProducts) {
          try {
            // Formata o produto para o novo formato
            const formattedProduct = {
              codigo: product.codigo,
              nome: product.nome,
              marca: product.marca,
              setor: product.setor || '',
              descricao: product.descricao || '',
              fotos: product.fotos || []
            };
  
            // Verifica se já existe no Supabase
            const exists = await this.newDb.checkCodeExists(product.codigo);
            
            if (exists) {
              console.log(`⚠️ Produto ${product.codigo} já existe no Supabase, pulando...`);
              continue;
            }
  
            // Adiciona ao Supabase
            await this.newDb.addProduct(formattedProduct);
            migratedCount++;
            
            console.log(`✅ Produto ${product.codigo} migrado com sucesso`);
  
          } catch (error) {
            console.error(`❌ Erro ao migrar produto ${product.codigo}:`, error);
            errors.push({
              produto: product.codigo,
              erro: error.message
            });
          }
        }
  
        console.log(`🎉 Migração concluída! ${migratedCount} produtos migrados`);
        
        if (errors.length > 0) {
          console.warn(`⚠️ ${errors.length} erros durante a migração:`, errors);
        }
  
        return {
          success: true,
          migrated: migratedCount,
          total: oldProducts.length,
          errors: errors
        };
  
      } catch (error) {
        console.error('❌ Erro geral na migração:', error);
        return {
          success: false,
          error: error.message,
          migrated: 0,
          errors: []
        };
      }
    }
  
    // Remove dados do IndexedDB antigo (após confirmação)
    async clearOldDB() {
      try {
        const db = await this.connectToOldDB();
        
        if (!db) {
          console.log('Nenhum banco antigo para limpar');
          return true;
        }
  
        return new Promise((resolve, reject) => {
          const transaction = db.transaction([this.oldStoreName], 'readwrite');
          const store = transaction.objectStore(this.oldStoreName);
          const request = store.clear();
  
          request.onsuccess = () => {
            console.log('✅ IndexedDB antigo limpo com sucesso');
            resolve(true);
          };
  
          request.onerror = () => {
            console.error('❌ Erro ao limpar IndexedDB antigo:', request.error);
            reject(request.error);
          };
        });
  
      } catch (error) {
        console.error('❌ Erro ao limpar banco antigo:', error);
        throw error;
      }
    }
  
    // Deleta completamente o IndexedDB antigo
    async deleteOldDB() {
      return new Promise((resolve, reject) => {
        const deleteRequest = indexedDB.deleteDatabase(this.oldDbName);
  
        deleteRequest.onsuccess = () => {
          console.log('✅ IndexedDB antigo deletado completamente');
          resolve(true);
        };
  
        deleteRequest.onerror = () => {
          console.error('❌ Erro ao deletar IndexedDB antigo:', deleteRequest.error);
          reject(deleteRequest.error);
        };
  
        deleteRequest.onblocked = () => {
          console.warn('⚠️ Deleção do IndexedDB bloqueada (feche outras abas)');
          reject(new Error('Deleção bloqueada - feche outras abas do sistema'));
        };
      });
    }
  
    // Verifica se existe dados no IndexedDB antigo
    async hasOldData() {
      try {
        const products = await this.getOldProducts();
        return products.length > 0;
      } catch (error) {
        console.error('Erro ao verificar dados antigos:', error);
        return false;
      }
    }
  
    // Executa migração completa com confirmações
    async runFullMigration() {
      const hasOldData = await this.hasOldData();
      
      if (!hasOldData) {
        return {
          success: true,
          message: 'Nenhum dado antigo encontrado para migrar',
          migrated: 0
        };
      }
  
      // Executa migração
      const result = await this.migrateProducts();
      
      if (result.success && result.migrated > 0) {
        // Pergunta se quer limpar dados antigos
        const shouldClear = window.confirm(
          `Migração concluída com sucesso! ${result.migrated} produtos foram migrados.\n\n` +
          'Deseja remover os dados antigos do IndexedDB? ' +
          '(Recomendado para liberar espaço)'
        );
  
        if (shouldClear) {
          try {
            await this.clearOldDB();
            result.oldDataCleared = true;
          } catch (error) {
            console.warn('Aviso: Não foi possível limpar dados antigos:', error);
            result.oldDataCleared = false;
          }
        }
      }
  
      return result;
    }
  }
  
  export default MigrationUtils;