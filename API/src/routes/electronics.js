const express = require('express');
const router = express.Router();
const produtoService = require('../components/ProdutoComponent');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

router.get('/', async (req, res) => {
  try {
    const electronics = await produtoService.listarEletronicos(req.query.status);
    res.json(electronics);
  } catch (error) {
    console.error('Erro ao listar eletrônicos:', error);
    res.status(500).json({ error: 'Erro ao listar' });
  }
});

router.get('/available', async (req, res) => {
  try {
    const electronics = await produtoService.eletronicosDisponiveis();
    res.json(electronics);
  } catch (error) {
    console.error('Erro ao listar eletrônicos disponíveis:', error);
    res.status(500).json({ error: 'Erro ao listar' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const electronic = await produtoService.buscarEletronico(req.params.id);
    if (!electronic) return res.status(404).json({ error: 'Eletronico nao encontrado' });
    res.json(electronic);
  } catch (error) {
    console.error('Erro ao buscar eletrônico:', error);
    res.status(500).json({ error: 'Erro ao buscar' });
  }
});

// Admin
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, brand, model, specifications, daily_price } = req.body;
    if (!name || !brand || !model || !daily_price) {
      return res.status(400).json({ error: 'Campos faltando' });
    }
    const electronic = await produtoService.criarEletronico({ name, brand, model, specifications, daily_price });
    res.status(201).json({ message: 'Eletronico criado', electronic });
  } catch (error) {
    console.error('Erro ao criar eletrônico:', error);
    res.status(500).json({ error: 'Erro ao criar' });
  }
});

router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, brand, model, specifications, daily_price, status } = req.body;
    const electronic = await produtoService.atualizarEletronico(req.params.id, {
      name: name || undefined, brand: brand || undefined, model: model || undefined,
      specifications: specifications || undefined, daily_price: daily_price || undefined,
      status: status || undefined
    });
    res.json({ message: 'Eletronico atualizado', electronic });
  } catch (error) {
    console.error('Erro ao atualizar eletrônico:', error);
    res.status(500).json({ error: 'Erro ao atualizar' });
  }
});

router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const success = await produtoService.deletarEletronico(req.params.id);
    if (!success) return res.status(404).json({ error: 'Eletronico nao encontrado' });
    res.json({ message: 'Eletronico deletado' });
  } catch (error) {
    console.error('Erro ao deletar eletrônico:', error);
    res.status(500).json({ error: 'Erro ao deletar' });
  }
});

module.exports = router;
