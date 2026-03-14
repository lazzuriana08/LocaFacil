/**
 * Componente Produto
 * Realiza a interface ProdutoService.
 * Gerencia o catálogo de veículos e equipamentos eletrônicos.
 */
const ProdutoService = require('../interfaces/ProdutoService');
const VehicleModel = require('../models/Vehicle');
const ElectronicModel = require('../models/Electronic');

class ProdutoComponent extends ProdutoService {
  // --- Interface ProdutoService ---

  async visualizarProdutos() {
    const [vehicles, electronics] = await Promise.all([
      VehicleModel.getAvailable(),
      ElectronicModel.getAvailable()
    ]);
    return { vehicles, electronics };
  }

  async obterDetalhesProduto(idProduto, tipo) {
    if (tipo === 'vehicle') return VehicleModel.findById(idProduto);
    return ElectronicModel.findById(idProduto);
  }

  async verificarDisponibilidade(idProduto, tipo) {
    const produto = await this.obterDetalhesProduto(idProduto, tipo);
    return produto != null && produto.status === 'available';
  }

  // --- Operações de Veículos ---

  async listarVeiculos(status) {
    return VehicleModel.getAll(status);
  }

  async veiculosDisponiveis() {
    return VehicleModel.getAvailable();
  }

  async buscarVeiculo(id) {
    return VehicleModel.findById(id);
  }

  async criarVeiculo(data) {
    return VehicleModel.create(data);
  }

  async atualizarVeiculo(id, data) {
    return VehicleModel.update(id, data);
  }

  async deletarVeiculo(id) {
    return VehicleModel.delete(id);
  }

  // --- Operações de Eletrônicos ---

  async listarEletronicos(status) {
    return ElectronicModel.getAll(status);
  }

  async eletronicosDisponiveis() {
    return ElectronicModel.getAvailable();
  }

  async buscarEletronico(id) {
    return ElectronicModel.findById(id);
  }

  async criarEletronico(data) {
    return ElectronicModel.create(data);
  }

  async atualizarEletronico(id, data) {
    return ElectronicModel.update(id, data);
  }

  async deletarEletronico(id) {
    return ElectronicModel.delete(id);
  }
}

module.exports = new ProdutoComponent();
