const fs = require('fs');
const file = 'src/pages/employee/payment/ReceivePayment.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '          </form>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  );\r\n};',
  '          </form>\r\n        </div>\r\n      </div>\r\n      )}\r\n    </div>\r\n  );\r\n};'
);

content = content.replace(
  '          </form>\n        </div>\n      </div>\n    </div>\n  );\n};',
  '          </form>\n        </div>\n      </div>\n      )}\n    </div>\n  );\n};'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed missing brace');
