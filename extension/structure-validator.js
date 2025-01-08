import { STRUCTURE_VERSION, CRITICAL_SELECTORS, CONTENT_PATTERNS } from './structure-definitions.js';

class StructureValidator {
  constructor() {
    this.validationResults = {
      version: STRUCTURE_VERSION,
      timestamp: new Date().toISOString(),
      isValid: true,
      errors: [],
      warnings: []
    };
  }

  // Main validation method
  async validate() {
    this.validationResults.errors = [];
    this.validationResults.warnings = [];

    // Wait for the page to be ready
    await this.waitForPageReady();

    // Check all critical selectors
    this.validateSelectors();

    // Check content patterns
    this.validateContentPatterns();

    // Update final validation status
    this.validationResults.isValid = this.validationResults.errors.length === 0;

    return this.validationResults;
  }

  // Wait for key elements to be present
  async waitForPageReady() {
    return new Promise((resolve) => {
      const checkReady = () => {
        const purchaseElements = document.querySelectorAll(CRITICAL_SELECTORS.purchase.selector);
        if (purchaseElements.length > 0) {
          resolve();
        } else {
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    });
  }

  // Validate all critical selectors
  validateSelectors() {
    for (const [key, def] of Object.entries(CRITICAL_SELECTORS)) {
      const elements = document.querySelectorAll(def.selector);
      
      // Check if required elements exist
      if (def.required && elements.length === 0) {
        this.addError(`Required selector "${key}" not found: ${def.selector}`);
        continue;
      }

      // Check attributes
      if (def.attributes) {
        elements.forEach(element => {
          def.attributes.forEach(attr => {
            if (!element.hasAttribute(attr)) {
              this.addError(`Missing required attribute "${attr}" for selector "${key}"`);
            }
          });
        });
      }

      // Check classes
      if (def.classes) {
        elements.forEach(element => {
          def.classes.forEach(className => {
            if (!element.classList.contains(className)) {
              this.addError(`Missing required class "${className}" for selector "${key}"`);
            }
          });
        });
      }

      // Check data attributes
      if (def.dataAttributes) {
        elements.forEach(element => {
          def.dataAttributes.forEach(dataAttr => {
            const [attr, value] = dataAttr.split('=');
            const actualValue = element.getAttribute(attr.trim());
            if (!actualValue || (value && actualValue !== value.replace(/['"]/g, ''))) {
              this.addError(`Invalid data attribute ${dataAttr} for selector "${key}"`);
            }
          });
        });
      }
    }
  }

  // Validate content patterns
  validateContentPatterns() {
    for (const [key, pattern] of Object.entries(CONTENT_PATTERNS)) {
      const selector = CRITICAL_SELECTORS[key]?.selector;
      if (!selector) continue;

      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const content = element.textContent.trim();
        if (pattern.required && !pattern.pattern.test(content)) {
          this.addError(`Content pattern mismatch for "${key}": ${content}`);
        }
      });
    }
  }

  // Add an error to the validation results
  addError(message) {
    this.validationResults.errors.push({
      message,
      timestamp: new Date().toISOString()
    });
  }

  // Add a warning to the validation results
  addWarning(message) {
    this.validationResults.warnings.push({
      message,
      timestamp: new Date().toISOString()
    });
  }
}

export default StructureValidator; 