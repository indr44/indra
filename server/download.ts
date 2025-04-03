import { Request, Response } from "express";
import AdmZip from "adm-zip";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the root directory of the project
const rootDir = path.resolve(__dirname, "..");

// Directories and files to exclude from the zip
const excludeDirs = [
  "node_modules",
  ".git",
  "dist",
  ".next",
  "tempobook/dynamic",
  "tempobook/storyboards",
];

const excludeFiles = [".DS_Store", ".env", ".env.local", "*.log", "*.zip"];

export async function downloadProject(req: Request, res: Response) {
  try {
    // Create a new zip file
    const zip = new AdmZip();

    // Function to recursively add files to the zip
    const addFilesToZip = (dir: string, zipPath: string = "") => {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const filePath = path.join(dir, file);
        const relativePath = path.join(zipPath, file);

        // Check if the file/directory should be excluded
        if (
          excludeDirs.some(
            (excludeDir) =>
              file === excludeDir || filePath.includes(excludeDir),
          )
        ) {
          continue;
        }

        if (
          excludeFiles.some((pattern) => {
            if (pattern.includes("*")) {
              const regex = new RegExp(pattern.replace("*", ".*"));
              return regex.test(file);
            }
            return file === pattern;
          })
        ) {
          continue;
        }

        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          // Recursively add files from subdirectory
          addFilesToZip(filePath, relativePath);
        } else {
          // Add file to zip
          zip.addFile(relativePath, fs.readFileSync(filePath));
        }
      }
    };

    // Add all files to the zip
    addFilesToZip(rootDir);

    // Set response headers
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=desdig-project.zip",
    );

    // Send the zip file
    res.end(zip.toBuffer());
  } catch (error) {
    console.error("Error creating project zip:", error);
    res.status(500).json({ error: "Failed to create project zip" });
  }
}
