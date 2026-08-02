/* ============================================
   StockPilot — Floating Form Helpers
   ============================================ */

const FormHelper = {
  read(formData) {
    const obj = {};
    Object.entries(formData).forEach(([key, id]) => {
      const el = document.getElementById(id);
      obj[key] = el ? el.value : '';
    });
    return obj;
  },
  readInt(formData) {
    const obj = this.read(formData);
    Object.keys(obj).forEach(k => {
      if (obj[k] !== '' && !isNaN(Number(obj[k]))) obj[k] = Number(obj[k]);
    });
    return obj;
  }
};