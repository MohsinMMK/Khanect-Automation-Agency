
import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT_DIR = join(__dirname, "..");
const DOC_PATHS = [
    join(ROOT_DIR, "CLAUDE.md"),
    join(ROOT_DIR, "AGENTS.md"),
    join(ROOT_DIR, "GEMINI.md"),
];

// Helper to count lines in a file
async function countLines(filePath: string): Promise<number> {
  try {
    const content = await readFile(filePath, "utf-8");
    return content.split("\n").length;
  } catch (e) {
    return 0;
  }
}

// Helper to recursively list files and categorize them
async function scanDirectory(dir: string, exclude: string[] = []): Promise<{ files: string[], tsFiles: number, totalLines: number }> {
    let files: string[] = [];
    let tsFiles = 0;
    let totalLines = 0;

    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        if (exclude.includes(entry.name)) continue;
        const fullPath = join(dir, entry.name);
        
        if (entry.isDirectory()) {
            const result = await scanDirectory(fullPath, exclude);
            files = files.concat(result.files);
            tsFiles += result.tsFiles;
            totalLines += result.totalLines;
        } else {
             files.push(fullPath.replace(ROOT_DIR + "\\", "").replace(/\\/g, "/"));
             if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
                 tsFiles++;
                 totalLines += await countLines(fullPath);
             }
        }
    }
    return { files, tsFiles, totalLines };
}

async function getProjectStats() {
    const srcStats = await scanDirectory(join(ROOT_DIR, "src"), ["node_modules", ".git", "dist", ".gemini"]);
    return srcStats;
}



// Helper to read SKILL.md frontmatter or header
async function getSkillInfo(dirPath: string): Promise<{ name: string, description: string, path: string } | null> {
    const skillMdPath = join(dirPath, "SKILL.md");
    try {
        const content = await readFile(skillMdPath, "utf-8");
        const relativePath = dirPath.replace(ROOT_DIR, "").replace(/\\/g, "/");
        
        // Try to parse simple Frontmatter
        const nameMatch = content.match(/name:\s*(.*)/);
        const descMatch = content.match(/description:\s*(.*)/);
        
        let name = nameMatch ? nameMatch[1].trim() : "Unknown Skill";
        let description = descMatch ? descMatch[1].trim() : "No description provided.";

        // Fallback to H1 if no frontmatter name
        if (name === "Unknown Skill") {
             const h1Match = content.match(/^#\s+(.*)/m);
             if (h1Match) name = h1Match[1].trim();
        }

        return { name, description, path: relativePath };
    } catch (e) {
        return null;
    }
}

async function getSkills() {
    const skillsDir = join(ROOT_DIR, "skills");
    const skills: { name: string, description: string, path: string }[] = [];
    
    try {
        const entries = await readdir(skillsDir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory()) {
                const info = await getSkillInfo(join(skillsDir, entry.name));
                if (info) skills.push(info);
            }
        }
    } catch (e) {
        console.warn("No skills directory found or empty.");
    }
    return skills;
}

// Helper to get script description from top comments
async function getScriptInfo(filePath: string): Promise<{ name: string, description: string } | null> {
    try {
        const content = await readFile(filePath, "utf-8");
        const lines = content.split("\n");
        let description = "No description.";
        
        // Look for basic comment block at the top
        for (let i = 0; i < Math.min(lines.length, 10); i++) {
            const line = lines[i].trim();
            if (line.startsWith("/**")) continue;
            if (line.startsWith("*/")) break;
            if (line.startsWith("*")) {
                 const clean = line.replace(/^\*\s*/, "").trim();
                 if (clean && !clean.toLowerCase().includes("usage") && !clean.includes("@")) {
                     description = clean;
                     break;
                 }
            }
            // Also check single line comments
            if (line.startsWith("//") && i > 0) { // skip shebang or imports
                 description = line.replace(/^\/\/\s*/, "").trim();
                 break;
            }
        }
        
        return { name: filePath.replace(ROOT_DIR, "").replace(/\\/g, "/"), description };
    } catch (e) {
        return null;
    }
}

async function getScripts() {
    const scriptsDir = join(ROOT_DIR, "scripts");
    const scripts: { name: string, description: string }[] = [];
    try {
        const entries = await readdir(scriptsDir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".js"))) {
               const info = await getScriptInfo(join(scriptsDir, entry.name));
               if (info) scripts.push(info);
            }
        }
    } catch (e) {
        console.warn("No scripts directory found.");
    }
    return scripts;
}


async function updateDocs() {
    try {
        const stats = await getProjectStats();
        const skills = await getSkills();
        const scripts = await getScripts();
        const timestamp = new Date().toISOString();
        
        // Construct new sections
        const statsSection = `
## Project Stats (Auto-generated)
- **Total Source Files**: ${stats.tsFiles}
- **Total Lines of Code**: ${stats.totalLines}
- **Last Updated**: ${timestamp}
`;

        const skillsSection = `
## Active Skills (Auto-generated)
${skills.map(s => `- **[${s.name}](${s.path}/SKILL.md)**: ${s.description}`).join("\n")}
`;

        const scriptsSection = `
## Available Scripts (Auto-generated)
${scripts.map(s => `- **[${s.name.split('/').pop()}](${s.name})**: ${s.description}`).join("\n")}
`;

        // Helper to replace or append section
        const updateSection = (title: string, content: string, source: string) => {
             const regex = new RegExp(`## ${title}[\\s\\S]*?(?=\\n## |$)`);
             if (regex.test(source)) {
                 return source.replace(regex, content.trim());
             } else {
                 return source + `\n\n${content.trim()}`;
             }
        };

        for (const docPath of DOC_PATHS) {
            const currentContent = await readFile(docPath, "utf-8");
            let newContent = currentContent;

            newContent = updateSection("Project Stats \\(Auto-generated\\)", statsSection, newContent);
            newContent = updateSection("Active Skills \\(Auto-generated\\)", skillsSection, newContent);
            newContent = updateSection("Available Scripts \\(Auto-generated\\)", scriptsSection, newContent);

            await writeFile(docPath, newContent, "utf-8");
            console.log(`${basename(docPath)} updated successfully with stats, skills, and scripts.`);
        }
    } catch (error) {
        console.error("Error updating docs:", error);
    }
}

updateDocs();
