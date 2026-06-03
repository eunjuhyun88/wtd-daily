export interface ParamDef {
  key: string;
  label: string;
  default: number | boolean;
  min?: number;
  max?: number;
  step?: number;
  current: number | boolean;
}

const INPUT_RE =
  /const\s+(\w+)\s*=\s*input\(\s*([\d.]+|true|false)\s*(?:,\s*['"]([^'"]+)['"])?\s*(?:,\s*\{([^}]*)\})?\s*\)/g;

function parseOptions(optStr: string | undefined): { min?: number; max?: number; step?: number } {
  if (!optStr) return {};
  const get = (key: string) => {
    const m = optStr.match(new RegExp(`${key}\\s*:\\s*([\\d.]+)`));
    return m ? parseFloat(m[1]) : undefined;
  };
  return { min: get('minval'), max: get('maxval'), step: get('step') };
}

function parseDefault(raw: string): number | boolean {
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return parseFloat(raw);
}

export function parseParams(code: string): ParamDef[] {
  const results: ParamDef[] = [];
  let m: RegExpExecArray | null;
  INPUT_RE.lastIndex = 0;
  while ((m = INPUT_RE.exec(code)) !== null) {
    const [, key, rawDefault, rawLabel, optStr] = m;
    const def = parseDefault(rawDefault);
    const { min, max, step } = parseOptions(optStr);
    results.push({
      key,
      label: rawLabel ?? key,
      default: def,
      min,
      max,
      step,
      current: def,
    });
  }
  return results;
}
