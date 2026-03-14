/**
 * @interface PagamentoService
 * @description <<interface>> Contrato de integração para processamento financeiro
 * e comunicação com o gateway de pagamento.
 *
 * Interface FORNECIDA por: PagamentoComponent
 * Interface REQUERIDA por: routes/rentals.js (cliente da interface)
 */
class PagamentoService {
  /**
   * Valida o estado da locação e inicia o processamento do pagamento.
   * @param {number} idLocacao - ID da locação a ser paga
   * @param {Object} dadosPagamento - Dados do meio de pagamento
   * @returns {Promise<Object>} Locação com status de pagamento atualizado
   * @throws {Error} Se a locação não existir, estiver cancelada ou já paga
   */
  async processarPagamento(idLocacao, dadosPagamento) {
    throw new Error('Not implemented');
  }

  /**
   * Confirma o pagamento atualizando o status no banco de dados.
   * @param {number} idTransacao - ID da locação/transação
   * @returns {Promise<Object>} Locação atualizada com payment_status = 'confirmed'
   */
  async confirmarPagamento(idTransacao) {
    throw new Error('Not implemented');
  }
}

module.exports = PagamentoService;
