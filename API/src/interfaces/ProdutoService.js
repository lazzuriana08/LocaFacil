/**
 * @interface ProdutoService
 * @description <<interface>> Contrato para gestão e visualização do catálogo de
 * itens disponíveis para locação (veículos e eletrônicos).
 *
 * Interface FORNECIDA por: ProdutoComponent
 * Interface REQUERIDA por: LocacaoComponent
 */
class ProdutoService {
  /**
   * Lista todos os produtos disponíveis para locação.
   * @returns {Promise<{vehicles: Array, electronics: Array}>}
   */
  async visualizarProdutos() {
    throw new Error('Not implemented');
  }

  /**
   * Retorna os detalhes completos de um produto pelo ID e tipo.
   * @param {number} idProduto - ID do produto
   * @param {'vehicle'|'electronic'} tipo - Tipo do produto
   * @returns {Promise<Object|null>}
   */
  async obterDetalhesProduto(idProduto, tipo) {
    throw new Error('Not implemented');
  }

  /**
   * Verifica se um produto está disponível (status === 'available').
   * @param {number} idProduto - ID do produto
   * @param {'vehicle'|'electronic'} tipo - Tipo do produto
   * @returns {Promise<boolean>}
   */
  async verificarDisponibilidade(idProduto, tipo) {
    throw new Error('Not implemented');
  }
}

module.exports = ProdutoService;
