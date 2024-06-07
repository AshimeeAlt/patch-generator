(function(global) {
  // I am not gonna comment this code
  const jargin = Generator.sel('legalStuff/jargin');
  Generator.sel('legalStuff/dropdownButton').onclick = function() {
    if (Number(this.dataset.active) == 0) {
      this.dataset.active = '1';
      jargin.style.display = 'block';
      this.textContent = 'v | Legal Stuff.';
    } else {
      this.dataset.active = '0';
      jargin.style.display = 'none';
      this.textContent = '> | Legal Stuff.'
    }
  }
}).bind({}, globalThis)();