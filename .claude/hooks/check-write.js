// PreToolUse guard (Edit|Write): blokir pola kode terlarang berdasarkan jenis file.
// Diadaptasi dari check-write.sh project IPA (Oracle/portal SSO) ke stack Kotak Bisnis (PostgreSQL, JWT sendiri, React).
// Exit 2 = blokir, pesan di stderr diteruskan ke Claude.

function block(msg, filePath) {
  process.stderr.write(`GUARDRAIL (check-write): ${msg}\n  file: ${filePath}\n`);
  process.exit(2);
}

const javaRules = [
  [/^\s*import\s+lombok\./m, 'Lombok dilarang. Tulis getter/setter/constructor eksplisit atau pakai Java record.'],
  [/@(Data|Getter|Setter|Builder|Slf4j|RequiredArgsConstructor|NoArgsConstructor|AllArgsConstructor|Value)\b/, 'Anotasi Lombok terdeteksi. Project ini tanpa Lombok.'],
  [/\bHttpSession\b/, 'HttpSession dilarang — auth stateless via JWT (SessionCreationPolicy.STATELESS).'],
  [/@Where\s*\(/, '@Where deprecated di Hibernate 6+. Pakai @SQLRestriction.'],
  [/has(Any)?Role\s*\(\s*['"]ROLE_/, "hasRole('ROLE_X') tidak akan match — Spring menambah prefix ROLE_ otomatis. Pakai hasRole('ADMIN')."],
];

const migrationRules = [
  [/\b(VARCHAR2|NVARCHAR2|CLOB|NCLOB|SYSDATE|SYSTIMESTAMP)\b|\bNUMBER\s*\(/i, 'Tipe/fungsi Oracle di migration PostgreSQL. Pakai VARCHAR/TEXT/NUMERIC/CURRENT_TIMESTAMP.'],
  [/GENERATED\s+ALWAYS\s+AS\s+IDENTITY/i, 'Pakai BIGSERIAL untuk id (konsisten dengan template tabel).'],
  [/^\s*(is_[a-z_]+|active|enabled|deleted)\s+(VAR)?CHAR\s*\(\s*1\s*\)/im, "Kolom flag pakai BOOLEAN, bukan CHAR(1)/VARCHAR(1) 'Y'/'N'."],
  [/^\s*[a-z_]+\s+(FLOAT|REAL|DOUBLE\s+PRECISION)\b/im, 'Jangan FLOAT/REAL/DOUBLE untuk angka bisnis — pakai NUMERIC(19,2).'],
  [/^\s*"?(user|order|group|limit|offset|table|check|desc)"?\s+(VARCHAR|TEXT|INTEGER|BIGINT|NUMERIC|TIMESTAMP|DATE|BOOLEAN|UUID)/im, 'Nama kolom = reserved word PostgreSQL. Ganti nama (mis. username, order_no).'],
];

const tsRules = [
  [/:\s*any\b|\bas\s+any\b|<any>/, 'Tipe `any` dilarang (TS strict). Pakai unknown + narrowing atau tipe di src/types/.'],
  [/(localStorage|sessionStorage)\.setItem\([^)]*(password|passwd|credential)/i, 'Jangan simpan password/credential di browser storage — cukup token + profil ringkas.'],
];

let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0);
  }
  const ti = input.tool_input || {};
  const filePath = ti.file_path || '';
  const content = ti.content || ti.new_string || '';
  if (!filePath || !content) process.exit(0);
  const norm = filePath.replace(/\\/g, '/');

  const apply = (rules) => {
    for (const [re, msg] of rules) if (re.test(content)) block(msg, norm);
  };

  if (norm.endsWith('.java')) apply(javaRules);
  if (/\/db\/migration\/.*\.sql$/.test(norm)) apply(migrationRules);

  if (/\/frontend\/src\/.*\.tsx?$/.test(norm)) {
    apply(tsRules);
    const isApiLayer = /\/frontend\/src\/(services|lib)\//.test(norm);
    if (!isApiLayer && /\bfetch\s*\(/.test(content)) {
      block('fetch langsung di luar src/services/ atau src/lib/ dilarang — lewat service + hook TanStack Query.', norm);
    }
  }
  process.exit(0);
});
