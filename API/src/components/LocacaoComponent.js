/**
 * Componente Locação
 * Realiza a interface LocacaoService.
 * Orquestra o ciclo de vida do contrato de aluguel.
 *
 * Requer: IProdutoService (ProdutoComponent)
 * Requer: ISeguroService  (SeguroComponent)
 */
const LocacaoService = require('../interfaces/LocacaoService');
const RentalModel = require('../models/Rental');
const produtoService = require('./ProdutoComponent');
const seguroService = require('./SeguroComponent');

class LocacaoComponent extends LocacaoService {
  // --- Interface LocacaoService ---

  async iniciarLocacao(idUsuario, idProduto, prazo) {
    // prazo: { tipo, start_date, end_date, insurance_selected, insurance_price }
    const disponivel = await produtoService.verificarDisponibilidade(idProduto, prazo.tipo);
    if (!disponivel) throw new Error('Produto indisponível para o período');

    const produto = await produtoService.obterDetalhesProduto(idProduto, prazo.tipo);

    const startDate = new Date(prazo.start_date);
    const endDate = new Date(prazo.end_date);
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    const daily_rate = produto.daily_price;
    const total_price = daily_rate * totalDays;
    const insurancePrice = prazo.insurance_selected ? (prazo.insurance_price || 0) : 0;
    const final_total = total_price + (insurancePrice * totalDays);

    return this.registrarLocacao({
      user_id: idUsuario,
      vehicle_id: prazo.tipo === 'vehicle' ? idProduto : null,
      electronic_id: prazo.tipo === 'electronic' ? idProduto : null,
      rental_type: prazo.tipo,
      start_date: prazo.start_date,
      end_date: prazo.end_date,
      total_days: totalDays,
      daily_rate,
      total_price,
      insurance_selected: prazo.insurance_selected || false,
      insurance_price: insurancePrice,
      final_total
    });
  }

  async registrarLocacao(dadosLocacao) {
    return RentalModel.create(dadosLocacao);
  }

  async consultarHistorico(idUsuario) {
    return RentalModel.getByUserId(idUsuario);
  }

  // --- Operações adicionais ---

  async buscarLocacao(id) {
    return RentalModel.findById(id);
  }

  async listarLocacoes() {
    return RentalModel.getAll();
  }

  async atualizarStatus(id, status) {
    return RentalModel.updateStatus(id, status);
  }

  async atualizarPagamento(id, paymentStatus) {
    return RentalModel.updatePaymentStatus(id, paymentStatus);
  }
}

module.exports = new LocacaoComponent();
