/**
 * Componente Seguro
 * Realiza a interface SeguroService.
 * Isola a lógica de negócios relacionada às apólices de seguro.
 */
const SeguroService = require('../interfaces/SeguroService');
const InsuranceModel = require('../models/Insurance');

class SeguroComponent extends SeguroService {
  // --- Interface SeguroService ---

  async listarOpcoesSeguro() {
    return InsuranceModel.getAll();
  }

  async vincularSeguro(idLocacao, idSeguro) {
    const seguro = await InsuranceModel.findById(idSeguro);
    if (!seguro) throw new Error('Seguro não encontrado');
    return seguro;
  }

  // --- Operações CRUD (Admin) ---

  async buscarSeguro(id) {
    return InsuranceModel.findById(id);
  }

  async criarSeguro(data) {
    return InsuranceModel.create(data);
  }

  async atualizarSeguro(id, data) {
    return InsuranceModel.update(id, data);
  }
}

module.exports = new SeguroComponent();
