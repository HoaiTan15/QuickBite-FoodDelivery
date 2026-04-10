const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: '❌ Không có token, vui lòng đăng nhập' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: '❌ Token không hợp lệ hoặc đã hết hạn' });
  }
};

// Kiểm tra quyền truy cập
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: '❌ Bạn không có quyền truy cập' });
    }
    next();
  };
};