function buildImprovedCode({ sourceCode, issues }) {
  if (!sourceCode || !Array.isArray(issues) || issues.length === 0) {
    return sourceCode || '';
  }

  const hasSqlInjection = issues.some(
    (issue) =>
      issue?.type === 'security' &&
      /sql\s*injection/i.test(`${issue.title || ''} ${issue.explanation || ''}`)
  );

  if (hasSqlInjection) {
    const sqlAssignment = sourceCode.match(
      /const\s+(\w+)\s*=\s*(["'`])([\s\S]*?)\2\s*\+\s*(\w+)\s*;?/
    );

    if (sqlAssignment) {
      const [, variableName, quote, sqlPrefix, valueName] = sqlAssignment;
      const placeholder = sqlPrefix.includes('?') ? sqlPrefix : `${sqlPrefix}?`;
      const replacement = `const ${variableName} = ${quote}${placeholder}${quote};\n  return database.query(${variableName}, [${valueName}]);`;

      const withoutReturn = sourceCode.replace(
        new RegExp(
          `const\\s+${variableName}\\s*=\\s*${quote}[\\s\\S]*?;?\\s*return\\s+database\\.query\\([\\s\\S]*?\\);?`,
          'm'
        ),
        replacement
      );

      if (withoutReturn !== sourceCode) {
        return withoutReturn;
      }
    }
  }

  return sourceCode;
}

module.exports = buildImprovedCode;
