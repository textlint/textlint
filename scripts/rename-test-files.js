#!/usr/bin/env node
/**
 * Script to rename test files from `-test.ts` to `.test.ts` pattern
 * This ensures consistency with vitest's default test file patterns
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Find all -test.ts files recursively
function findTestFiles(dir) {
    const files = [];

    function searchDirectory(currentDir) {
        const items = fs.readdirSync(currentDir);

        for (const item of items) {
            const itemPath = path.join(currentDir, item);
            const stat = fs.statSync(itemPath);

            if (stat.isDirectory()) {
                // Skip node_modules and other irrelevant directories
                if (!["node_modules", ".git", "dist", "build", ".next"].includes(item)) {
                    searchDirectory(itemPath);
                }
            } else if (stat.isFile() && item.endsWith("-test.ts")) {
                files.push(itemPath);
            }
        }
    }

    searchDirectory(dir);
    return files;
}

// Rename a single file
function renameFile(oldPath) {
    const newPath = oldPath.replace(/-test\.ts$/, ".test.ts");

    console.log(`Renaming: ${oldPath} -> ${newPath}`);

    try {
        // Use git mv to rename the file (preserves history)
        execSync(`git mv "${oldPath}" "${newPath}"`, { stdio: "inherit" });
        return { success: true, oldPath, newPath };
    } catch (error) {
        console.error(`Failed to rename ${oldPath}:`, error.message);
        return { success: false, oldPath, newPath, error: error.message };
    }
}

// Main execution
function main() {
    const projectRoot = path.resolve(__dirname, "..");
    console.log(`Searching for -test.ts files in: ${projectRoot}`);

    const testFiles = findTestFiles(projectRoot);
    console.log(`Found ${testFiles.length} test files to rename:`);

    if (testFiles.length === 0) {
        console.log("No -test.ts files found to rename.");
        return;
    }

    // Show files that will be renamed
    testFiles.forEach((file, index) => {
        const relativePath = path.relative(projectRoot, file);
        const newPath = relativePath.replace(/-test\.ts$/, ".test.ts");
        console.log(`${index + 1}. ${relativePath} -> ${newPath}`);
    });

    console.log("\nStarting rename process...");

    const results = [];
    for (const file of testFiles) {
        const result = renameFile(file);
        results.push(result);
    }

    // Summary
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(`\nRename complete:`);
    console.log(`✅ Successfully renamed: ${successful} files`);
    console.log(`❌ Failed to rename: ${failed} files`);

    if (failed > 0) {
        console.log("\nFailed files:");
        results
            .filter((r) => !r.success)
            .forEach((r) => {
                console.log(`  ${r.oldPath}: ${r.error}`);
            });
    }

    console.log("\n📝 Next steps:");
    console.log("1. Review the changes: git status");
    console.log("2. Run tests to ensure everything works: npm test");
    console.log('3. Commit the changes: git commit -m "rename: change test files from -test.ts to .test.ts"');
}

if (require.main === module) {
    main();
}

module.exports = { findTestFiles, renameFile };
