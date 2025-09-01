const express = require('express');
const router = express.Router();

const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const clientesRoutes = require('./routes/clientes');
const agendamentosRoutes = require('./routes/agendamentos');
const consultoresRoutes = require('./routes/consultores');
const imobiliariasRoutes = require('./routes/imobiliarias');
const leadsRoutes = require('./routes/leads');

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/clientes', clientesRoutes);
router.use('/agendamentos', agendamentosRoutes);
router.use('/consultores', consultoresRoutes);
router.use('/imobiliarias', imobiliariasRoutes);
router.use('/leads', leadsRoutes);

module.exports = router;
