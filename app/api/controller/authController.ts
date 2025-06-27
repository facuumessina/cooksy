const registerStep1 = (req, res) => {
    const { email, alias } = req.body;
    // Validación y lógica de negocio acá
    res.status(200).json({ message: 'Registro paso 1 OK' });
  };
  
  const registerStep2 = (req, res) => {
    const { email, password, nombre } = req.body;
    res.status(201).json({ message: 'Usuario registrado' });
  };
  
  const login = (req, res) => {
    const { email, password } = req.body;
    res.status(200).json({ token: 'mock-jwt-token' });
  };
  
  const recoverPassword = (req, res) => {
    const { email } = req.body;
    res.status(200).json({ message: 'Código enviado' });
  };
  
  const resetPassword = (req, res) => {
    const { email, code, newPassword } = req.body;
    res.status(200).json({ message: 'Clave actualizada' });
  };
  
  module.exports = {
    registerStep1,
    registerStep2,
    login,
    recoverPassword,
    resetPassword
  };