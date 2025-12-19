#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * Script to extract compiled Plutus validator codes from plutus.json
 * and generate environment variables
 */

const PLUTUS_JSON_PATH = path.join(__dirname, "../../../contracts/plutus.json");
const ENV_OUTPUT_PATH = path.join(__dirname, "../.env.contracts");

function extractPlutusCode() {
  try {
    console.log("📦 Extracting Plutus validator codes...\n");

    // Read plutus.json
    const plutusData = JSON.parse(fs.readFileSync(PLUTUS_JSON_PATH, "utf8"));

    if (!plutusData.validators || !Array.isArray(plutusData.validators)) {
      throw new Error("Invalid plutus.json format");
    }

    // Find specific validators
    const validators = {
      ORDER_VALIDATOR: plutusData.validators.find((v: any) =>
        v.title.includes("order_validator.order_validator.spend")
      ),
      LOAN_VALIDATOR: plutusData.validators.find((v: any) =>
        v.title.includes("loan_validator.loan_validator.spend")
      ),
      ESCROW_VALIDATOR: plutusData.validators.find((v: any) =>
        v.title.includes("payment_escrow.payment_escrow.spend")
      ),
      AUTH_VALIDATOR: plutusData.validators.find((v: any) =>
        v.title.includes("auth_validator.auth_validator.spend")
      ),
      SALE_VALIDATOR: plutusData.validators.find((v: any) =>
        v.title.includes("sale_validator.sale_validator.spend")
      ),
      MINTING_POLICY: plutusData.validators.find((v: any) =>
        v.title.includes("minting_policy.minting_policy.mint")
      ),
    };

    // Generate .env file content
    let envContent = "";
    envContent += "# Plutus Validator Codes\n";
    envContent += "# Generated automatically from contracts/plutus.json\n";
    envContent += "# Generated at: " + new Date().toISOString() + "\n\n";

    const validatorKeys = Object.keys(validators);
    let foundCount = 0;

    validatorKeys.forEach((key) => {
      const validator = validators[key];
      if (validator) {
        const code = validator.compiledCode;
        console.log(`✅ Found ${key}: ${validator.title}`);
        console.log(`   Code length: ${code.length} characters`);
        console.log(`   Hash: ${validator.hash}\n`);

        envContent += `NEXT_PUBLIC_${key}_CODE=${code}\n`;
        foundCount++;
      } else {
        console.warn(`⚠️  Not found: ${key}\n`);
        envContent += `# NEXT_PUBLIC_${key}_CODE=\n`;
      }
    });

    // Write to .env.contracts
    fs.writeFileSync(ENV_OUTPUT_PATH, envContent);

    console.log(
      `\n✅ Extracted ${foundCount}/${validatorKeys.length} validators`
    );
    console.log(`📝 Written to: ${ENV_OUTPUT_PATH}\n`);

    // Instructions
    console.log("📋 Next steps:");
    console.log(
      "1. Copy the contents of .env.contracts to your .env.local file"
    );
    console.log("2. Or merge it automatically:");
    console.log(`   cat ${ENV_OUTPUT_PATH} >> .env.local\n`);

    // Also generate TypeScript constants file
    generateTypescriptConstants(validators);
  } catch (error) {
    console.error("❌ Error extracting Plutus codes:", error);
    process.exit(1);
  }
}

function generateTypescriptConstants(validators: any) {
  const tsPath = path.join(__dirname, "../lib/contract-codes.ts");

  let tsContent = "/**\n";
  tsContent += " * Compiled Plutus validator codes\n";
  tsContent += " * Auto-generated from contracts/plutus.json\n";
  tsContent += " * Generated at: " + new Date().toISOString() + "\n";
  tsContent += " */\n\n";

  tsContent += "export const VALIDATOR_CODES = {\n";

  Object.entries(validators).forEach(([key, validator]) => {
    if (validator) {
      tsContent += `  ${key}: "${validator.compiledCode}",\n`;
    } else {
      tsContent += `  ${key}: "",\n`;
    }
  });

  tsContent += "} as const;\n\n";

  tsContent += "export const VALIDATOR_HASHES = {\n";

  Object.entries(validators).forEach(([key, validator]) => {
    if (validator) {
      tsContent += `  ${key}: "${validator.hash}",\n`;
    } else {
      tsContent += `  ${key}: "",\n`;
    }
  });

  tsContent += "} as const;\n";

  fs.writeFileSync(tsPath, tsContent);

  console.log(`📝 TypeScript constants written to: ${tsPath}\n`);
}

// Run the extraction
extractPlutusCode();
