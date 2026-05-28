/**
 * Vietnamese Synonym Mapping for developers searching in Vietnamese.
 * Maps common Vietnamese dev terms to standard codebase keyword candidates.
 */

const SYNONYM_MAP = {
  'chốt': ['checkout', 'confirm', 'finalize', 'save', 'update', 'chot', 'invoice', 'api'],
  'điện': ['electricity', 'electric', 'power', 'dien', 'invoice', 'sqlite', 'helper', 'db'],
  'nước': ['water', 'nuoc', 'invoice', 'sqlite', 'helper', 'db'],
  'điện nước': ['electricity', 'water', 'utility', 'utilities', 'dien', 'nuoc', 'invoice', 'sqlite', 'helper', 'db', 'vietqr', 'payment'],
  'thanh toán': ['payment', 'pay', 'transaction', 'invoice', 'bill', 'vietqr', 'qr', 'transfer', 'banking'],
  'hợp đồng': ['contract', 'lease', 'agreement', 'hopdong'],
  'hoàn cọc': ['deposit', 'refund', 'return', 'liquidation', 'termination', 'hoancoc'],
  'thành viên': ['tenant', 'member', 'user', 'guest', 'khach'],
  'khách': ['tenant', 'member', 'user', 'guest', 'khach'],
  'phòng': ['room', 'house', 'property', 'phong'],
  'nhà': ['house', 'property', 'phong', 'nha'],
  'hóa đơn': ['invoice', 'bill', 'receipt', 'hoadon'],
  'dịch vụ': ['service', 'utility', 'dichvu'],
  'chủ': ['landlord', 'owner', 'host', 'chu'],
  'admin': ['landlord', 'owner', 'host', 'admin'],
  'authentication': ['auth', 'login', 'session', 'jwt', 'token', 'user', 'security', 'middleware'],
  'auth': ['auth', 'login', 'session', 'jwt', 'token', 'user', 'security', 'middleware'],
  'persistence': ['db', 'database', 'prisma', 'sqlite', 'sql', 'helper', 'model', 'schema', 'repository'],
  'database': ['db', 'database', 'prisma', 'sqlite', 'sql', 'helper', 'model', 'schema', 'repository'],
  'workflow': ['flow', 'engine', 'rule', 'rules', 'process', 'step', 'run', 'agent', 'executor'],
  'agent': ['agent', 'expert', 'rules', 'prompt', 'role', 'assistant']
};

function expandKeywords(keywords) {
  const expanded = new Set();
  
  keywords.forEach(kw => {
    expanded.add(kw);
    
    // Exact mapping check
    if (SYNONYM_MAP[kw]) {
      SYNONYM_MAP[kw].forEach(syn => expanded.add(syn));
    }

    // Checking subsets or combinations
    Object.keys(SYNONYM_MAP).forEach(key => {
      if (kw.includes(key) || key.includes(kw)) {
        SYNONYM_MAP[key].forEach(syn => expanded.add(syn));
      }
    });
  });

  return Array.from(expanded);
}

module.exports = {
  expandKeywords,
  SYNONYM_MAP
};
