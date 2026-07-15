const fs = require('fs');
const file = 'src/pages/employee/payment/ReceivePayment.jsx';
let content = fs.readFileSync(file, 'utf8');

// Fix mangled characters
content = content.replace(/Γé╣/g, '₹');
content = content.replace(/Γ£ô/g, '✓');
content = content.replace(/Γƒ│/g, '↻');

// Fix the unmatched parenthesis
// The unmatched `{selectedLoan && (` starts before `<div className="flex gap-6 items-start">`
// It should be closed after that div ends.
// Let's find the end of that div. It ends at `</div>\n    </div>\n  );\n};`
// So we want to replace `      </div>\n    </div>\n  );\n};`
// with `      </div>\n      )}\n    </div>\n  );\n};`

content = content.replace(
  '      </div>\n    </div>\n  );\n};',
  '      </div>\n      )}\n    </div>\n  );\n};'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed missing brace and characters');
