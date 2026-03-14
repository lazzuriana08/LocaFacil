/**
 * Componente Pagamento
 * Realiza a interface PagamentoService.
 * Gerencia as transações financeiras e comunica-se com o gateway de pagamento.
 *
 * Requer: ILocacaoService (LocacaoComponent)
 */
const PagamentoService = require('../interfaces/PagamentoService');
const locacaoService = require('./LocacaoComponent');

class PagamentoComponent extends PagamentoService {
  // --- Interface PagamentoService ---

  async processarPagamento(idLocacao, dadosPagamento) {
    const locacao = await locacaoService.buscarLocacao(idLocacao);
    if (!locacao) throw new Error('Locação não encontrada');
    if (locacao.status === 'cancelled') throw new Error('Locação cancelada');
    if (locacao.payment_status === 'confirmed') throw new Error('Pagamento já confirmado');

    // Simulação de gateway de pagamento (sem integração real)
    return this.confirmarPagamento(idLocacao);
  }

  async confirmarPagamento(idTransacao) {
    return locacaoService.atualizarPagamento(idTransacao, 'confirmed');
  }
}

module.exports = new PagamentoComponent();
