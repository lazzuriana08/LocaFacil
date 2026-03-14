/**
 * @interface SeguroService
 * @description <<interface>> Contrato para gerenciamento de apólices de seguro
 * disponíveis para associação a uma locação.
 *
 * Interface FORNECIDA por: SeguroComponent
 * Interface REQUERIDA por: LocacaoComponent (opcional — para vincular seguro na locação)
 */
class SeguroService {
  /**
   * Lista todas as apólices de seguro ativas disponíveis para contratação.
   * @returns {Promise<Array>} Lista de seguros
   */
  async listarOpcoesSeguro() {
    throw new Error('Not implemented');
  }

  /**
   * Valida a existência do seguro e o vincula a uma locação.
   * @param {number} idLocacao - ID da locação
   * @param {number} idSeguro - ID do seguro a vincular
   * @returns {Promise<Object>} Dados do seguro vinculado
   * @throws {Error} Se o seguro não for encontrado
   */
  async vincularSeguro(idLocacao, idSeguro) {
    throw new Error('Not implemented');
  }
}

module.exports = SeguroService;
