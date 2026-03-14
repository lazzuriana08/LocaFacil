/**
 * @interface LocacaoService
 * @description <<interface>> Contrato para gerenciamento do ciclo de vida do
 * contrato de locação e do histórico do cliente.
 *
 * Interface FORNECIDA por: LocacaoComponent
 * Interface REQUERIDA por: PagamentoComponent
 */
class LocacaoService {
  /**
   * Verifica disponibilidade, calcula preços e registra a locação.
   * @param {number} idUsuario - ID do usuário que está alugando
   * @param {number} idProduto - ID do produto a ser locado
   * @param {{tipo: string, start_date: string, end_date: string, insurance_selected: boolean, insurance_price: number}} prazo - Dados do período e seguro
   * @returns {Promise<Object>} Registro da locação criada
   * @throws {Error} Se o produto estiver indisponível
   */
  async iniciarLocacao(idUsuario, idProduto, prazo) {
    throw new Error('Not implemented');
  }

  /**
   * Persiste o contrato de locação no banco de dados.
   * @param {Object} dadosLocacao - Dados completos da locação
   * @returns {Promise<Object>} Registro persistido
   */
  async registrarLocacao(dadosLocacao) {
    throw new Error('Not implemented');
  }

  /**
   * Retorna o histórico de locações de um usuário.
   * @param {number} idUsuario - ID do usuário
   * @returns {Promise<Array>} Lista de locações
   */
  async consultarHistorico(idUsuario) {
    throw new Error('Not implemented');
  }
}

module.exports = LocacaoService;
