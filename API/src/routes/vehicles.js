const express = require('express');
const router = express.Router();
const produtoService = require('../components/ProdutoComponent');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

router.get('/', async (req, res) => {
  try {
    const vehicles = await produtoService.listarVeiculos(req.query.status);
    res.json(vehicles);
  } catch (error) {
    console.error('Erro ao listar veículos:', error);
    res.status(500).json({ error: 'Erro ao listar' });
  }
});

router.get('/available', async (req, res) => {
  try {
    const vehicles = await produtoService.veiculosDisponiveis();
    res.json(vehicles);
  } catch (error) {
    console.error('Erro ao listar veículos disponíveis:', error);
    res.status(500).json({ error: 'Erro ao listar' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const vehicle = await produtoService.buscarVeiculo(req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Veiculo nao encontrado' });
    res.json(vehicle);
  } catch (error) {
    console.error('Erro ao buscar veículo:', error);
    res.status(500).json({ error: 'Erro ao buscar' });
  }
});

// Admin
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, brand, model, year, color, license_plate, daily_price } = req.body;
    if (!name || !brand || !model || !year || !daily_price) {
      return res.status(400).json({ error: 'Campos faltando' });
    }
    const vehicle = await produtoService.criarVeiculo({ name, brand, model, year, color, license_plate, daily_price });
    res.status(201).json({ message: 'Veiculo criado', vehicle });
  } catch (error) {
    console.error('Erro ao criar veículo:', error);
    res.status(500).json({ error: 'Erro ao criar' });
  }
});

router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, brand, model, year, color, license_plate, daily_price, status } = req.body;
    const vehicle = await produtoService.atualizarVeiculo(req.params.id, {
      name: name || undefined, brand: brand || undefined, model: model || undefined,
      year: year || undefined, color: color || undefined, license_plate: license_plate || undefined,
      daily_price: daily_price || undefined, status: status || undefined
    });
    res.json({ message: 'Veiculo atualizado', vehicle });
  } catch (error) {
    console.error('Erro ao atualizar veículo:', error);
    res.status(500).json({ error: 'Erro ao atualizar' });
  }
});

router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const success = await produtoService.deletarVeiculo(req.params.id);
    if (!success) return res.status(404).json({ error: 'Veiculo nao encontrado' });
    res.json({ message: 'Veiculo deletado' });
  } catch (error) {
    console.error('Erro ao deletar veículo:', error);
    res.status(500).json({ error: 'Erro ao deletar' });
  }
});

module.exports = router;
