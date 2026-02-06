const counters = {};

function increment(name) {
  counters[name] = (counters[name] || 0) + 1;
  try {
    console.log(`[metrics] ${name}=${counters[name]}`);
  } catch (e) {}
}

function get(name) {
  return counters[name] || 0;
}

module.exports = { increment, get };
