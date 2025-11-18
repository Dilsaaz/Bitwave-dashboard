// backend/infura_sample.js
// Placeholder on-chain verification (fake/simple for now)

async function verifyTxOnChain(txHash) {
  try {
    if (!txHash) return { ok: false };

    // Real blockchain verification normally requires INFURA / ALCHEMY API key.
    // Here we simply return success after basic validation so system runs smoothly.
    const isValid = txHash.length > 10;

    return { ok: isValid };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

module.exports = { verifyTxOnChain };
