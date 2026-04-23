const InsuranceModel = require('../models/Insurance');

const insuranceController = {
  async getAll(req, res) {
    try {
      const insurances = await InsuranceModel.getAll();
      res.json(insurances);
    } catch (error) {
      console.error('Erro ao listar seguros:', error);
      res.status(500).json({ error: 'Erro ao listar' });
    }
  },

  async getById(req, res) {
    try {
      const insurance = await InsuranceModel.findById(req.params.id);
      if (!insurance) {
        return res.status(404).json({ error: 'Seguro nao encontrado' });
      }
      res.json(insurance);
    } catch (error) {
      console.error('Erro ao buscar seguro:', error);
      res.status(500).json({ error: 'Erro ao buscar' });
    }
  },

  async create(req, res) {
    try {
      const { name, description, daily_price, coverage_type } = req.body;

      if (!name || !daily_price) {
        return res.status(400).json({ error: 'Nome e preco diario obrigatorios' });
      }

      const insurance = await InsuranceModel.create({
        name,
        description,
        daily_price,
        coverage_type
      });

      res.status(201).json({
        message: 'Seguro criado',
        insurance
      });
    } catch (error) {
      console.error('Erro ao criar seguro:', error);
      res.status(500).json({ error: 'Erro ao criar' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description, daily_price, coverage_type, is_active } = req.body;

      const insurance = await InsuranceModel.update(id, {
        name: name || undefined,
        description: description || undefined,
        daily_price: daily_price || undefined,
        coverage_type: coverage_type || undefined,
        is_active: is_active !== undefined ? is_active : undefined
      });

      res.json({
        message: 'Seguro atualizado',
        insurance
      });
    } catch (error) {
      console.error('Erro ao atualizar seguro:', error);
      res.status(500).json({ error: 'Erro ao atualizar' });
    }
  }
};

module.exports = insuranceController;