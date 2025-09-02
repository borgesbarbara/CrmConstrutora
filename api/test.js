module.exports = async (req, res) => {
  console.log('🧪 Test API endpoint called');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Headers:', req.headers);
  
  res.status(200).json({
    message: 'API Test endpoint working',
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path
  });
};
