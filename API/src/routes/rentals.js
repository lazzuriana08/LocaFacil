const express = require('express');
const router = express.Router();
const locacaoService = require('../components/LocacaoComponent');
const pagamentoService = require('../components/PagamentoComponent');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

// User
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { vehicle_id, electronic_id, start_date, end_date, insurance_selected, insurance_price } = req.body;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'Datas obrigatorias' });
    }
    if (!vehicle_id && !electronic_id) {
      return res.status(400).json({ error: 'Selecione item' });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    if (Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) <= 0) {
      return res.status(400).json({ error: 'Datas invalidas' });
    }

    const idProduto = vehicle_id || electronic_id;
    const tipo = vehicle_id ? 'vehicle' : 'electronic';

    const rental = await locacaoService.iniciarLocacao(req.user.id, idProduto, {
      tipo, start_date, end_date, insurance_selected, insurance_price
    });

    res.status(201).json({ message: 'Locacao criada', rental });
  } catch (error) {
    console.error('Erro ao criar locação:', error);
    const status = error.message === 'Produto indisponível para o período' ? 400 : 500;
    res.status(status).json({ error: error.message || 'Erro ao criar' });
  }
});

router.get('/user/my-rentals', authMiddleware, async (req, res) => {
  try {
    const rentals = await locacaoService.consultarHistorico(req.user.id);
    res.json(rentals);
  } catch (error) {
    console.error('Erro ao listar locações do usuário:', error);
    res.status(500).json({ error: 'Erro ao listar' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const rental = await locacaoService.buscarLocacao(req.params.id);
    if (!rental) return res.status(404).json({ error: 'Locacao nao encontrada' });
    if (rental.user_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({ error: 'Sem acesso' });
    }
    res.json(rental);
  } catch (error) {
    console.error('Erro ao buscar locação:', error);
    res.status(500).json({ error: 'Erro ao buscar' });
  }
});

router.post('/:id/payment', authMiddleware, async (req, res) => {
  try {
    const rental = await locacaoService.buscarLocacao(req.params.id);
    if (!rental) return res.status(404).json({ error: 'Locacao nao encontrada' });
    if (rental.user_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({ error: 'Sem acesso' });
    }
    const updatedRental = await pagamentoService.processarPagamento(req.params.id, req.body);
    res.json({ message: 'Pagamento ok', rental: updatedRental });
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    res.status(500).json({ error: 'Erro no pagamento' });
  }
});

router.post('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const rental = await locacaoService.buscarLocacao(req.params.id);
    if (!rental) return res.status(404).json({ error: 'Locacao nao encontrada' });
    if (rental.user_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({ error: 'Sem acesso' });
    }
    const updatedRental = await locacaoService.atualizarStatus(req.params.id, 'cancelled');
    res.json({ message: 'Locacao cancelada', rental: updatedRental });
  } catch (error) {
    console.error('Erro ao cancelar locação:', error);
    res.status(500).json({ error: 'Erro ao cancelar' });
  }
});

// Admin
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const rentals = await locacaoService.listarLocacoes();
    res.json(rentals);
  } catch (error) {
    console.error('Erro ao listar locações:', error);
    res.status(500).json({ error: 'Erro ao listar' });
  }
});

module.exports = router;
