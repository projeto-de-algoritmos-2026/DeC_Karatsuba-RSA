const presets = {
  small:  ['999983', '999979'],
  medium: ['999999999989', '999999999961'],
  large:  ['898747209830209138845847', '1133749500938626168596863'],
  huge:   ['1133072706964093502606907334964996669713177904237', '1185367310283948444751022001052382111297924370901'],
  rsa2048: [
    '179646191117222609216073952853013268454128478547405542182247711543776184342521031264748584390305033668058585828584806331508898403585976705097406260163127017701341397577449698440026538460062989303542827937830247810111813115182161663894276739198478283310345713397411642865144461138210819505720915942799372472709179646191117222609216073952853013268454128478547405542182247711543776184342521031264748584390305033668058585828584806331508898403585976705097406260163127017701341397577449698440026538460062989303542827937830247810111813115182161663894276739198478283310345713397411642865144461138210819505720915942799372472709',
    '113385125091095971773581451068053620800696609866223178522627409883094201063771517103560062598367609175431220312027780707104710279126676264726615225062895201441553717899565116038871092795937611271786562615081411435903892420287342134681502838517866159012788711635761270336385669086172291884603399161417487313547113385125091095971773581451068053620800696609866223178522627409883094201063771517103560062598367609175431220312027780707104710279126676264726615225062895201441553717899565116038871092795937611271786562615081411435903892420287342134681502838517866159012788711635761270336385669086172291884603399161417487313547',
  ],
};

function setPreset(size) {
  document.getElementById('num1').value = presets[size][0];
  document.getElementById('num2').value = presets[size][1];
}

function getInputs() {
  const x = document.getElementById('num1').value.trim();
  const y = document.getElementById('num2').value.trim();
  return { x, y };
}

function showError(msg) {
  const el = document.getElementById('error-msg');
  el.textContent = msg;
  el.classList.remove('hidden');
}

function hideError() {
  document.getElementById('error-msg').classList.add('hidden');
}

function showResult(method, data) {
  const card = document.getElementById(`${method}-result`);
  document.getElementById(`${method}-time`).textContent = data.time_ms;
  document.getElementById(`${method}-value`).textContent = data.result;
  card.classList.remove('hidden');
  document.getElementById('results').classList.remove('hidden');
}

function hideAll() {
  document.getElementById('karatsuba-result').classList.add('hidden');
  document.getElementById('naive-result').classList.add('hidden');
  document.getElementById('comparison').classList.add('hidden');
  document.getElementById('match-check').classList.add('hidden');
  document.getElementById('results').classList.add('hidden');
  hideError();
}

async function fetchMultiply(endpoint, x, y) {
  const res = await fetch(`/api/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ x, y }),
  });
  return res.json();
}

async function calculate(method) {
  hideAll();
  const { x, y } = getInputs();
  if (!x || !y) {
    showError('Preencha os dois números.');
    return;
  }

  const endpoint = method === 'karatsuba' ? 'karatsuba' : 'naive';
  try {
    const data = await fetchMultiply(endpoint, x, y);
    if (data.error) {
      showError(data.error);
      return;
    }
    showResult(method, data);
  } catch (e) {
    showError('Erro na requisição.');
  }
}

async function calculateBoth() {
  hideAll();
  const { x, y } = getInputs();
  if (!x || !y) {
    showError('Preencha os dois números.');
    return;
  }

  try {
    const [kData, nData] = await Promise.all([fetchMultiply('karatsuba', x, y), fetchMultiply('naive', x, y)]);

    if (kData.error || nData.error) {
      showError(kData.error || nData.error);
      return;
    }

    showResult('karatsuba', kData);
    showResult('naive', nData);

    const compEl = document.getElementById('comparison');
    const diff = nData.time_ms - kData.time_ms;
    const ratio = nData.time_ms > 0 ? (nData.time_ms / Math.max(kData.time_ms, 0.0001)).toFixed(2) : '—';

    if (diff > 0) {
      compEl.textContent = `Karatsuba foi ${ratio}× mais rápido (economizou ${diff.toFixed(4)} ms)`;
    } else if (diff < 0) {
      compEl.textContent = `Ingênuo foi mais rápido por ${Math.abs(diff).toFixed(4)} ms (número pequeno demais para Karatsuba compensar)`;
    } else {
      compEl.textContent = 'Tempos praticamente iguais.';
    }
    compEl.classList.remove('hidden');

    const matchEl = document.getElementById('match-check');
    if (kData.result === nData.result) {
      matchEl.textContent = '✓ Ambos produziram o mesmo resultado — corretude validada';
      matchEl.className = 'match-card match-ok';
    } else {
      matchEl.textContent = '✗ Resultados diferentes — erro na implementação';
      matchEl.className = 'match-card match-fail';
    }
    matchEl.classList.remove('hidden');

    document.getElementById('results').classList.remove('hidden');
  } catch (e) {
    showError('Erro na requisição.');
  }
}

async function runRsaDemo() {
  const btn = document.getElementById('rsa-btn');
  const loading = document.getElementById('rsa-loading');
  const result = document.getElementById('rsa-result');

  btn.disabled = true;
  loading.classList.remove('hidden');
  result.classList.add('hidden');

  try {
    const res = await fetch('/api/rsa-demo', { method: 'POST' });
    const data = await res.json();

    document.getElementById('p-value').textContent = data.p;
    document.getElementById('q-value').textContent = data.q;
    document.getElementById('n-value').textContent = data.n_karatsuba;
    document.getElementById('p-digits').textContent = `(${data.p_digits} dígitos)`;
    document.getElementById('q-digits').textContent = `(${data.q_digits} dígitos)`;
    document.getElementById('n-digits').textContent = `(${data.n_digits} dígitos)`;
    document.getElementById('rsa-k-time').textContent = data.time_karatsuba_ms;
    document.getElementById('rsa-n-time').textContent = data.time_naive_ms;

    const compEl = document.getElementById('rsa-comparison');
    const diff = data.time_naive_ms - data.time_karatsuba_ms;
    const ratio = (data.time_naive_ms / Math.max(data.time_karatsuba_ms, 0.0001)).toFixed(2);
    if (diff > 0) {
      compEl.textContent = `Karatsuba foi ${ratio}× mais rápido em primos reais de 1024 bits`;
    } else {
      compEl.textContent = `Ingênuo foi mais rápido por ${Math.abs(diff).toFixed(4)} ms`;
    }

    const matchEl = document.getElementById('rsa-match');
    if (data.match) {
      matchEl.textContent = '✓ Ambos produziram o mesmo n — corretude validada';
      matchEl.className = 'match-card match-ok';
    } else {
      matchEl.textContent = '✗ Resultados divergem — erro na implementação';
      matchEl.className = 'match-card match-fail';
    }

    result.classList.remove('hidden');
  } catch (e) {
    showError('Erro ao gerar demo RSA.');
  } finally {
    loading.classList.add('hidden');
    btn.disabled = false;
  }
}