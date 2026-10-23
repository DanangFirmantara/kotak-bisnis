// PreToolUse guard (Edit|Write): blokir edit Flyway migration yang sudah di-commit, dan tulis ke db/migration/oracle.
// File migration baru / belum di-commit tetap boleh. Exit 2 = blokir, pesan di stderr diteruskan ke Claude.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function block(msg) {
  process.stderr.write('GUARDRAIL: ' + msg + '\n');
  process.exit(2);
}

let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0);
  }
  const filePath = (input.tool_input && input.tool_input.file_path) || '';
  const norm = filePath.replace(/\\/g, '/');
  if (!norm.includes('/db/migration/')) process.exit(0);

  if (norm.includes('/db/migration/oracle')) {
    block('Project ini PostgreSQL only — jangan tulis ke db/migration/oracle.');
  }
  if (!fs.existsSync(filePath)) process.exit(0);

  let tracked = false;
  try {
    execFileSync('git', ['ls-files', '--error-unmatch', path.basename(filePath)], {
      cwd: path.dirname(filePath),
      stdio: 'ignore',
    });
    tracked = true;
  } catch {
    tracked = false;
  }
  if (tracked) {
    block(`Migration sudah di-commit: ${norm}. Jangan diedit — buat versi baru V{n+1}__deskripsi.sql.`);
  }
  process.exit(0);
});
