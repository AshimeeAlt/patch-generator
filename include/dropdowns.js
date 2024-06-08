/**!
 * Dropdown code
 * @argument {globalThis} global The global scope
 * @returns {undefined}
 * @file
 * @fileoverview All of the code
 * @author Ashimee https://github.com/Ashimee/
 * @version 1.0
 * @copyright MIT & LGPLv3 License
 * Do not remove this comment
 */
(function(global) {
  /**!
   * Find the corosponding dropdown for the x-dropdown
   * @argument {String} dropdown The dropdown id
   * @returns {Element} The dropdown content element
   */
  const selDropdown = (dropdown) => document.querySelector(`*[data-dropdown="${dropdown}"]:not(x-dropdown-span)`);
  document.querySelectorAll('x-dropdown-span').forEach(span => {
    // Make sure open and close exist
    span.dataset.open = span.dataset?.open ?? 'closed';
    selDropdown(span.dataset.dropdown).dataset.open = span.dataset.open;
    // Create the SVG arrow
    // Thanks bootstrap! (https://icons.getbootstrap.com/icons/arrow-up-short/)
    const dropdownArrowSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    dropdownArrowSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    dropdownArrowSvg.setAttribute('width', '16');
    dropdownArrowSvg.setAttribute('height', '16');
    dropdownArrowSvg.setAttribute('viewBox', '0 0 16 16');
    dropdownArrowSvg.setAttribute('class', 'bi bi-arrow-up-short');
    dropdownArrowSvg.setAttribute('fill', '#ffffff');
    const dropdownArrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    dropdownArrowPath.setAttribute('fill-rule', 'evenodd');
    dropdownArrowPath.setAttribute('d', 'M8 12a.5.5 0 0 0 .5-.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 .5.5');
    dropdownArrowSvg.appendChild(dropdownArrowPath);
    span.insertBefore(dropdownArrowSvg, span.childNodes[0]);
    // Add the onclick
    span.onclick = function() {
      // Make sure "data-dropdown" is defined
      if (this.dataset?.dropdown) {
        // Get our dropdown content node
        const dropdownContent = selDropdown(this.dataset.dropdown);
        // Open / Close it
        const open = this.dataset.open === 'open' ? 'closed' : 'open'
        this.dataset.open = open;
        dropdownContent.dataset.open = open;
        // Redraw
        dropdownContent.offsetHeight;
      }
    }
  });
}).bind({}, globalThis)();