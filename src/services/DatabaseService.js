// src/services/DatabaseService.js
import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'SUA_URL_AQUI';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'SUA_CHAVE_AQUI';

class DatabaseService {
  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    this.tableName = 'products';
  }

  // Inicializa conexão (opcional, já que Supabase conecta automaticamente)
  async init() {
    try {
      const { error } = await this.supabase.from(this.tableName).select('count', { count: 'exact', head: true });
      if (error) throw error;
      console.log('Conexão com Supabase estabelecida com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao conectar com Supabase:', error);
      throw error;
    }
  }

  // Adiciona um produto
  async addProduct(product) {
    try {
      const productData = {
        codigo: product.codigo.toLowerCase(),
        nome: product.nome,
        marca: product.marca,
        setor: product.setor,
        descricao: product.descricao || null,
        fotos: product.fotos || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from(this.tableName)
        .insert([productData])
        .select()
        .single();

      if (error) throw error;

      console.log('Produto adicionado com sucesso:', data);
      
      // Retorna no formato esperado pelo frontend
      return {
        id: data.id,
        codigo: data.codigo,
        nome: data.nome,
        marca: data.marca,
        setor: data.setor,
        descricao: data.descricao,
        fotos: data.fotos,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      if (error.code === '23505') { // Código duplicado
        throw new Error('Este código já está em uso');
      }
      throw error;
    }
  }

  // Atualiza um produto
  async updateProduct(product) {
    try {
      const productData = {
        codigo: product.codigo.toLowerCase(),
        nome: product.nome,
        marca: product.marca,
        setor: product.setor,
        descricao: product.descricao || null,
        fotos: product.fotos || [],
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from(this.tableName)
        .update(productData)
        .eq('id', product.id)
        .select()
        .single();

      if (error) throw error;

      console.log('Produto atualizado com sucesso:', data);
      
      // Retorna no formato esperado pelo frontend
      return {
        id: data.id,
        codigo: data.codigo,
        nome: data.nome,
        marca: data.marca,
        setor: data.setor,
        descricao: data.descricao,
        fotos: data.fotos,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      if (error.code === '23505') { // Código duplicado
        throw new Error('Este código já está em uso');
      }
      throw error;
    }
  }

  // Remove um produto
  async deleteProduct(id) {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('Produto removido com sucesso:', id);
      return id;
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      throw error;
    }
  }

  // Busca um produto por ID
  async getProduct(id) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Produto não encontrado
        }
        throw error;
      }

      // Retorna no formato esperado pelo frontend
      return {
        id: data.id,
        codigo: data.codigo,
        nome: data.nome,
        marca: data.marca,
        setor: data.setor,
        descricao: data.descricao,
        fotos: data.fotos,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      throw error;
    }
  }

  // Busca todos os produtos
  async getAllProducts() {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const products = (data || []).map(item => ({
        id: item.id,
        codigo: item.codigo,
        nome: item.nome,
        marca: item.marca,
        setor: item.setor,
        descricao: item.descricao,
        fotos: item.fotos || [],
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));

      console.log(`${products.length} produtos carregados do Supabase`);
      return products;
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
  }

  // Busca produtos por campo específico
  async searchProducts(field, value) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .ilike(field, `%${value}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        codigo: item.codigo,
        nome: item.nome,
        marca: item.marca,
        setor: item.setor,
        descricao: item.descricao,
        fotos: item.fotos || [],
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
  }

  // Verifica se um código já existe (excluindo um ID específico para edição)
  async checkCodeExists(codigo, excludeId = null) {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('id')
        .eq('codigo', codigo.toLowerCase());

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data && data.length > 0;
    } catch (error) {
      console.error('Erro ao verificar código:', error);
      throw error;
    }
  }

  // Limpa todos os produtos (útil para desenvolvimento/testes)
  async clearAllProducts() {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .neq('id', 0); // Deleta todos os registros

      if (error) throw error;

      console.log('Todos os produtos foram removidos');
      return true;
    } catch (error) {
      console.error('Erro ao limpar produtos:', error);
      throw error;
    }
  }

  // Exporta todos os produtos como JSON
  async exportProducts() {
    try {
      const products = await this.getAllProducts();
      return JSON.stringify(products, null, 2);
    } catch (error) {
      console.error('Erro ao exportar produtos:', error);
      throw error;
    }
  }

  // Importa produtos de um JSON
  async importProducts(jsonData) {
    try {
      const products = JSON.parse(jsonData);
      
      if (!Array.isArray(products)) {
        throw new Error('Dados inválidos: esperado um array de produtos');
      }

      let importedCount = 0;

      for (const product of products) {
        try {
          // Verifica se o produto já existe pelo código
          const exists = await this.checkCodeExists(product.codigo);
          
          if (exists) {
            // Se existe, atualiza
            const { data: existingProduct } = await this.supabase
              .from(this.tableName)
              .select('id')
              .eq('codigo', product.codigo.toLowerCase())
              .single();

            if (existingProduct) {
              await this.updateProduct({ ...product, id: existingProduct.id });
            }
          } else {
            // Se não existe, adiciona
            await this.addProduct(product);
          }
          importedCount++;
        } catch (productError) {
          console.warn('Erro ao importar produto:', product.codigo, productError);
        }
      }

      return importedCount;
    } catch (error) {
      console.error('Erro ao importar produtos:', error);
      throw error;
    }
  }

  // Retorna estatísticas do banco de dados
  async getStats() {
    try {
      const { data: products, error } = await this.supabase
        .from(this.tableName)
        .select('marca, setor, fotos, created_at, updated_at');

      if (error) throw error;

      const stats = {
        totalProducts: products.length,
        totalBrands: new Set(products.map(p => p.marca).filter(Boolean)).size,
        totalSectors: new Set(products.map(p => p.setor).filter(Boolean)).size,
        productsWithImages: products.filter(p => p.fotos && p.fotos.length > 0).length,
        totalImages: products.reduce((sum, p) => sum + (p.fotos ? p.fotos.length : 0), 0),
        lastUpdate: products.length > 0 
          ? new Date(Math.max(...products.map(p => new Date(p.updated_at || p.created_at))))
          : null
      };

      return stats;
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  }

  // Busca produtos com filtros avançados
  async searchProductsAdvanced(filters = {}) {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*');

      // Aplicar filtros
      if (filters.search) {
        query = query.or(`nome.ilike.%${filters.search}%,codigo.ilike.%${filters.search}%,marca.ilike.%${filters.search}%`);
      }

      if (filters.marca) {
        query = query.eq('marca', filters.marca);
      }

      if (filters.setor) {
        query = query.eq('setor', filters.setor);
      }

      if (filters.hasImages === 'com') {
        query = query.not('fotos', 'is', null).gt('fotos->0', 'null');
      } else if (filters.hasImages === 'sem') {
        query = query.or('fotos.is.null,fotos.eq.[]');
      }

      // Ordenação
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        codigo: item.codigo,
        nome: item.nome,
        marca: item.marca,
        setor: item.setor,
        descricao: item.descricao,
        fotos: item.fotos || [],
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
    } catch (error) {
      console.error('Erro ao buscar produtos com filtros:', error);
      throw error;
    }
  }

  // Método para testar conexão
  async testConnection() {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .select('count', { count: 'exact', head: true });

      if (error) throw error;

      console.log('✅ Conexão com Supabase funcionando corretamente');
      return true;
    } catch (error) {
      console.error('❌ Erro na conexão com Supabase:', error);
      return false;
    }
  }
}

// Exporta uma instância única do serviço
const databaseService = new DatabaseService();
export default databaseService;