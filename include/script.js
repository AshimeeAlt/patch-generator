/**!
 * The main code
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
  // We use an IIFE to prevent leaking stuff to global scope
  /**!
   * Simple sanitize function to prevent XSS
   * @argument {String} str The string to sanitize
   * @returns {String} The sanitized String
   */
  function sanitize(str) {
    // Replace all escape \'s to be doubled so \ -> \\
    // And replace all " with \"
    return str.replaceAll('\\', '\\\\').replaceAll('"', '\"');
  }

  /**!
   * Some shared exports from the JS object :yawn:
   * @type {Object}
   */
  let theExports = {};
  /**!
   * JS generator for the patches
   * @argument {Object} opts Generator options (provided by the user)
   * @returns {String} The generated JavaScript
   */
  function generatePatchs(opts) {
    // Some default JS
    let PATCH_LICENSE = 'MIT';
    let js = `const patcher=((function(Scratch){const extId="${sanitize(opts.extId)}",PATCHES_ID=\`__\${extId}_patches__\`,vm=Scratch.vm,runtime=vm.runtime;let exports;`;
    /* Setup */
    /**!
     * All of the patches
     * @type {Object}
     */
    let patch = {
      /**!
       * Checks if the chosen (patch: {name}) is active.
       * @type {Function}
       * @argument {String} name The options
       * @returns {String} Empty string if inactive otherwise the JS
       */
      _use(name) {
        /**!
         * @type {Array<boolean|string>} Array order: [active, ...js]
         */
        const sel = this[name];
        if (sel[0]) return sel.slice(1).join('');
        else return '';
      },
      /**!
       * What to add to the patcher exports, Array order: [active, ...js]
       * @type {Array<boolean|string>}
       */
      exports: [false, 'exports={', '};'],
      /**!
       * _convertBlockForScratchBlocks, Array order: [active, ...js]
       * @type {Array<boolean|string>}
       */
      cbfsb: [false, 'const _cbfsb=runtime._convertBlockForScratchBlocks;runtime._convertBlockForScratchBlocks=function(blockInfo,categoryInfo){','const res=_cbfsb.call(this,blockInfo,categoryInfo);','return res};'],
      /**!
       * _buildMenuForScratchBlocks, Array order: [active, ...js]
       * @type {Array<boolean|string>}
       */
      bmfsb: [false, 'const _bmfsb=runtime._buildMenuForScratchBlocks;runtime._buildMenuForScratchBlocks=function(menuName,menuInfo,categoryInfo){', 'const res=_bmfsb.call(this);', 'return res};'],
      /**!
       * _constructInlineImageJson, Array order: [active, ...js]
       * @type {Array<boolean|string>}
       */
      ciij: [false, 'const _ciij=runtime._constructInlineImageJson;runtime._constructInlineImageJson=function(argInfo){','const res=_ciij.call(this,argInfo);','return res;};'],
      /**!
       * All the Blockly patches, Array order: [active, ...js]
       * @type {Array<boolean|string>}
       */
      blockly: [false, 'if(Scratch.gui)Scratch.gui.getBlockly().then(Blockly=>{const ScratchBlocks=Blockly;','});'],
    };
    /**!
     * All the dependancies
     * @type {Object}
     */
    let depenancies = {
      /**!
       * Does a key exist on a object, Array order: [active, ...js]
       * @type {Array<boolean|string>}
       */
      hasOwn: [false, 'const hasOwn=(obj,prop)=>Object.prototype.hasOwnProperty.call(obj,prop);'],
      /**!
       * After other dependancies load this, Array order: [active, ...js]
       * @type {Array<boolean|string>}
       */
      load: [false, ''],
    };
    /* The option handling */
    if (opts.inlineBlock) {
      // Add the INLINE block definition to be added before the main patchs
      depenancies.load[1] += 'Scratch.BlockType.INLINE="INLINE";';
      // Enable cbfsb and tell that we depend on hasOwn
      patch.cbfsb[0] = true;
      // Add our patch after res is ran
      patch.cbfsb[1] += 'if(blockInfo.blockType==="INLINE")blockInfo.blockType=Scratch.BlockType.BOOLEAN,blockInfo.outputShape=3,blockInfo.allowDropAnywhere=true,blockInfo.branchCount=blockInfo.branchCount??1;';
      // We depend on outputShape so auto enable it
      opts.block_outputShape = true;
    }
    if (opts.block_outputShape) {
      // Enable cbfsb and tell that we depend on hasOwn
      patch.cbfsb[0] = true;
      depenancies.hasOwn[0] = true;
      // Add our patch after res is ran
      patch.cbfsb[2] += 'if(hasOwn(blockInfo,"outputShape"))res.json.outputShape=blockInfo.outputShape;';
    }
    if (opts.block_output) {
      // Enable cbfsb and tell that we depend on hasOwn
      patch.cbfsb[0] = true;
      depenancies.hasOwn[0] = true;
      // Add our patch after res is ran
      patch.cbfsb[2] += 'if(hasOwn(blockInfo,"output"))res.json.output=blockInfo.output,res.json.check_=blockInfo.output;';
    }
    if (opts.menu_outputShape) {
      // Enable bmfsb and tell that we depend on hasOwn
      patch.bmfsb[0] = true;
      depenancies.hasOwn[0] = true;
      // Add our patch after res is ran
      patch.bmfsb[2] += 'if(hasOwn(menuInfo,"outputShape"))res.json.outputShape=menuInfo.outputShape;';
    }
    if (opts.menu_output) {
      // Enable bmfsb and tell that we depend on hasOwn
      patch.bmfsb[0] = true;
      depenancies.hasOwn[0] = true;
      // Add our patch after res is ran
      patch.bmfsb[2] += 'if(hasOwn(menuInfo,"output"))res.json.output=menuInfo.output,res.json.check_=menuInfo.output;';
    }
    if (opts.terminalHats) {
      // Enable cbfsb and add our patch after res is ran
      patch.cbfsb[0] = true;
      patch.cbfsb[2] += 'if(blockInfo.isTerminal&&(blockInfo.blockType===Scratch.BlockType.HAT||blockInfo.blockType===Scratch.BlockType.EVENT))res.json.nextStatement=undefined;';
    }
    if (opts.export_patchFn) {
      // This is to be exported so enable exports and add this to the exports
      patch.exports[0] = true;
      patch.exports[1] += 'patch(obj,funcs){obj.patches={};Object.keys(funcs).forEach((key)=>{obj.patches[key]=obj[key].bind(obj);obj[key]=function(...args){this["$"+key]=obj.patches[key];funcs[key].call(this,...args);};});},cst_patch(obj,functions){if(obj[PATCHES_ID])return;obj[PATCHES_ID]={};for(const name in functions){const original=obj[name];obj[PATCHES_ID][name]=obj[name];if(original){obj[name]=function(...args){const callOriginal=(...args)=>original.call(this,...args);return functions[name].call(this,callOriginal,...args)};}else{obj[name]=function(...args){return functions[name].call(this,()=>{},...args)};}}},unpatchCst(obj){if(typeof obj[PATCHES_ID]!=="object")return;for(const patch in Object.keys(obj[PATCHES_ID])){const patched=obj[PATCHES_ID][patch];obj[patch]=patched;};obj[PATCHES_ID]=undefined;},';
    }
    if (opts.customFieldSupport) {
      // We depend on hasOwn so this needs to go after that loads
      // Add this to be after main dependancies and add our patch
      depenancies.hasOwn[0] = true;
      depenancies.load[0] = true;
      depenancies.load[1] += 'const bcfi=runtime._buildCustomFieldInfo.bind(runtime),bcftfsb=runtime._buildCustomFieldTypeForScratchBlocks.bind(runtime);let fi=null;runtime._buildCustomFieldInfo=function(fieldName,fieldInfo,extensionId,categoryInfo){fi=fieldInfo;return bcfi(fieldName,fieldInfo,extensionId,categoryInfo)};runtime._buildCustomFieldTypeForScratchBlocks=function(fieldName,output,outputShape,categoryInfo){let res=bcftfsb(fieldName,output,outputShape,categoryInfo);if(fi){if(fi.color1)res.json.colour=fi.color1;if(fi.color2)res.json.colourSecondary=fi.color2;if(fi.color3)res.json.colourTertiary=fi.color3;if(hasOwn(fi,"output"))res.json.output=fi.output;fi=null;};return res;};';
    }
    if (opts.addBlockShape) {
      // Add this to be after main dependancies and add our patch
      depenancies.load[0] = true;
      depenancies.load[1] += 'Scratch.BlockShape=Scratch?.BlockShape??{HEXAGON:1,ROUND:2,SQUARE:3};';
    }
    if (opts.customInlineImageSize) {
      // Enable ciij and add our patch
      patch.ciij[0] = true;
      patch.ciij[2] += 'res.width=argInfo?.width??24,res.height=argInfo?.height??res.width;';
    }
    if (opts.duplicatingBlocks.bool) {
      /**!
       * Generate the opcodes for the duplicating blocks
       * @type {Array<string>}
       */
      const opcodes = opts.duplicatingBlocks.opcodes.split(',').map(opcode => `"${sanitize(`${(opts.duplicatingBlocks.fullOpcodes?'':opts.extId+'_')}${opcode.trim()}`)}"`);
      // Make sure we have some opcodes
      if (opcodes[0].trim() !== `"${sanitize(`${opts.extId}_`)}"`) {
        // This patch requires blockly so enable it and add our new JS
        patch.blockly[0] = true;
        patch.blockly[1] += `const $dbod=[${opcodes}],sbuisar=Blockly.scratchBlocksUtils.isShadowArgumentReporter;Blockly.scratchBlocksUtils.isShadowArgumentReporter=function(block){return(sbuisar.call(this,block)||block.isShadow()&&$dbod.includes(block.type))};`;
      }
    }
    if (opts.tooltips) {
      // We need to patch some blockly and vm functions
      // so enable cbfsb and blockly same with exports and laod
      patch.cbfsb[0] = true;
      patch.blockly[0] = true;
      patch.exports[0] = true;
      depenancies.load[0] = true;
      depenancies.hasOwn[0] = true;
      // Add the JS for blockly and exports
      depenancies.load[1] += 'const $ttps={};';
      patch.exports[1] += 'ttpExt:`${PATCHES_ID}_tooltip_extension`,';
      patch.blockly[1] += 'Blockly.Extensions.register(exports.ttpExt,function(){const thisBlock=this;this.setTooltip(()=>{const customTtp=$ttps?.[thisBlock.type];return(typeof customTtp==="function"?customTtp.call(this):customTtp)});});';
      // Add the JS for the VM after res
      patch.cbfsb[2] += 'if(hasOwn(blockInfo,"tooltip")){$ttps[res.json.type]=blockInfo.tooltip;res.json.extensions.push(exports.ttpExt);};';
    }
    /* Finalizing */
    /**!
     * Load a dependancy
     * @private
     * @argument {String} key The dependancy to load
     * @returns {undefined}
     */
    const depend = (key) => {
      /**!
       * @type {Array<boolean|string|array>}
       */
      const entry = depenancies[key];
      // Make sure the dependancy and its JS exist
      if (entry[0] && entry[1]) {
        // Add its JS to the current JS if it exists
        js += entry[1];
      }
      // If theres an array after the JS treat it as the dependancies this dependancy requires
      for (const need of (entry?.[2]??[])) {
        // Load the dependancy
        depend(need);
      }
    };
    /**!
     * All the dependancies
     */
    const ALL_DEPENDS = Object.keys(depenancies);
    for (const need of ALL_DEPENDS) {
      depend(need);
    }
    // Load all the patches in
    js += patch._use('blockly');
    js += patch._use('cbfsb');
    js += patch._use('bmfsb');
    js += patch._use('ciij');
    js += patch._use('exports');
    // Some more default JS
    js += 'return exports;})(Scratch));';
    js = `/**! THIS PATCH IS LICENSED UNDER ${PATCH_LICENSE} LICENSE **/${js}`;
    theExports = {
      patch, depenancies, depend
    };
    return js;
  }

  /**!
   * Find a element based on if its "data-for" is the same as {for_}
   * @private
   * @returns {HTMLInputElement|HTMLDivElement|HTMLTextAreaElement} The selected element
   */
  const sel = (for_) => document.querySelector(`*[data-for="${for_}"]`);

  // This is for showing and hiding the menu for block/duplicateOnDrag
  sel('block/duplicateOnDrag').onchange = function() {
    // Check if we are enabled and if we are show otherwise hide
    sel('block/duplicateOnDrag/container').style.display = this.checked ? 'initial' : 'none';
  };
  // This is for the fancy double auto shit
  sel('block/inline').onchange = function() {
    // Get the outputShape checkbox and its parent to toggle the disabled attribute
    const outputShape = sel('block/outputShape');
    outputShape.parentElement.classList.toggle('disabled-label');
    // If its disabled then click it if its not checked and actually disabled it
    if (outputShape.parentElement.classList.contains('disabled-label')) {
      if (!outputShape.checked) outputShape.click();
      outputShape.disabled = true;
    } else {
      // Otherwise enable it and uncheck it
      outputShape.disabled = false;
      setTimeout(() => outputShape.click(), 5);
    }
  }

  /**!
   * Generate the options for {generatePatches} based on checkboxes in the document
   * @returns {Object} The constructed settings from the user
   */
  function makeOptions() {
    /**!
     * @type {Object}
     * @param {{extId: string}} extId The extension id
     * @param {{inlineBlock: boolean}} inlineBlock Inline block patch
     * @param {{block_outputShape: Boolean}} block_outputShape outputShape for blocks patch
     * @param {{block_output: Boolean}} block_output output for blocks patch
     */
    const res = {
      /** @type {String} */
      extId: sel('extId').value,
      inlineBlock: sel('block/inline').checked,
      block_outputShape: sel('block/outputShape').checked,
      block_output: sel('block/output').checked,
      menu_outputShape: sel('menu/outputShape').checked,
      menu_output: sel('menu/output').checked,
      terminalHats: sel('block/terminalHats').checked,
      customFieldSupport: sel('add/fieldSupport').checked,
      export_patchFn: sel('add/patchFns').checked,
      customInlineImageSize: sel('arg/wxhInlineImage').checked,
      addBlockShape: sel('add/blockShape').checked,
      duplicatingBlocks: { bool: sel('block/duplicateOnDrag').checked, opcodes: sel('block/duplicateOnDrag/blocks').value, fullOpcodes: sel('block/duplicateOnDrag/fullOpcodes').checked },
      tooltips: sel('block/tooltips').checked,
    };
    return res;
  }

  /**!
   * JavaScript Beautifier
   * @type {Function}
   * @argument {String} JS The JavaScript to beautify
   * @argument {Object} options Beautifier options
   * @returns {String} The beautified JavaScript
   * (Warning: this is lazilly loaded!)
   */
  let $js_beautify;
    /**!
   * JavaScript Minifier
   * @type {Function}
   * @argument {String} JS The JavaScript to minify
   * @returns {String} The minified JavaScript
   * (Warning: this is lazilly loaded!)
   */
  let $js_minify;
  /**!
   * The config for the beautifier
   * @type {Object}
   */
  const beautify_options = {
    indent_size: 2,
    indent_char: ' ',
    indent_with_tabs: false,
    editorconfig: true,
    eol: '\n',
    end_with_newline: true,
    indent_level: 0,
    preserve_newlines: true,
    max_preserve_newlines: 2,
    jslint_happy: true,
    space_after_anon_function: true,
    space_after_named_function: true,
    wrap_line_length: 0,
    indent_empty_lines: false,
  };

  /**!
   * Generates the JS based on user input when the generate button is pressed
   * @returns {undefined}
   */
  async function gen() {
    /* Setup */
    const output = sel('gen/output');
    const minify = sel('gen/minify').checked,
          beautify = sel('gen/beautify').checked;
    output.value = '// GENERATING... //';
    let js = `/* eslint-disable */${generatePatchs(makeOptions())}/* eslint-enable */`;
    /* Main */
    // Beautifying
    if (beautify) {
      // Tell the user we are beautifying
      output.value = '// Beautifying... //';
      if (!document.querySelector('script[data-beautifyscript]')) {
        // Leak js_beautify
        $js_beautify = await (new Promise((resolve) => {
          const jsBeautify = document.createElement('script');
          jsBeautify.dataset['beautifyscript'] = true;
          jsBeautify.onload = function() {
            const beautify = window.js_beautify;
            delete window.js_beautify;
            resolve(beautify);
          };
          jsBeautify.onerror = function() {
            alert('Failed to load beautifier.');
            resolve(false);
          };
          // Load the script
          document.body.appendChild(jsBeautify);
          jsBeautify.src = './include/beautify(1.15.1).min.js';
        }));
      }
      js = $js_beautify(js, beautify_options);
    }
    // Minifying
    if (minify) {
      // Tell the user we are minifying
      output.value = '// Minifying... //';
      if (!document.querySelector('script[data-minifyscript]')) {
        // Leak js_beautify
        $js_minify = await (new Promise((resolve) => {
          const jsMinify = document.createElement('script');
          jsMinify.dataset['minifyscript'] = true;
          jsMinify.onload = function() {
            const minify = window.Terser.minify;
            delete window.Terser;
            resolve(minify);
          };
          jsMinify.onerror = function() {
            alert('Failed to load minifier.');
            resolve(false);
          };
          // Load the script
          document.body.appendChild(jsMinify);
          jsMinify.src = './include/terser.min.js';
        }));
      }
      js = await $js_minify({'index.js': js});
      js = js.code;
    }
    // Add our credits comment
    js = js.replace('function', '/**! Generated by patch generator. https://github.com/AshimeeAlt/patch-generator */function');
    // And spit out the JS for the user
    output.value = js;

    // Showing the dependancys and stuff it patches
    // WIP
    /*
    let str = 'This patch: (Adds dependancys: '
    const NEEDS = Object.entries(theExports.depenancies);
    for (const need of NEEDS) {
      if (need[1][0]) {
        str += `(${need[0]}),`;
      }
    }
    str += '), and (Patches: ';
    const PATCHS = Object.entries(theExports.patch);
    for (const patch of PATCHS) {
      if (patch[1][0]) {
        str += `(${patch[0]}),`;
      }
    }
    str += ')';
    sel('gen/magic').value = str;
    */
  }

  // For the checkboxes
  document.body.addEventListener('click', (ev) => {
    const target = ev.target;
    if (target.nodeName === 'SPAN' && target.classList.contains('label')) {
      // Click the checkbox as we are apart of the checkbox
      const checkbox = target.querySelector('input[type="checkbox"]');
      checkbox.click();
    }
  });

  // Share some stuff
  global.Generator = {
    gen: function() {
      // Ik your reading this so hah!
      gen();
    },
    sel: function(for_) {
      return sel(for_);
    },
    /**!
     * @returns {$js_beautify}
     */
    get js_beautify() {
      return $js_beautify;
    },
  }
}).bind({}, globalThis)();