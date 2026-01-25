#!/usr/bin/env node
/**
 * Dev Docs MCP Server
 *
 * A unified MCP server for fetching developer documentation from multiple sources.
 * Designed for easy extensibility - add new documentation providers by implementing
 * the DocProvider interface.
 *
 * ## Adding a New Documentation Provider
 *
 * 1. Implement the DocProvider interface:
 *    ```typescript
 *    const myProvider: DocProvider = {
 *      id: "my-provider",
 *      name: "My Documentation",
 *      baseUrl: "https://docs.example.com/",
 *      searchTool: { name: "my_docs_search", description: "...", categoryName: "topic" },
 *      fetchTool: { name: "my_docs_fetch", description: "...", pathExample: "guide/intro" },
 *      defaultCodeLang: "javascript",
 *      search: async (query, category) => { ... },
 *      fetch: async (path) => { ... },
 *    };
 *    ```
 *
 * 2. Add the provider to the `providers` array at the bottom of this file.
 *
 * 3. The tools will be automatically registered with the MCP server.
 *
 * ## Output Format Contract
 *
 * All providers must return data in these standardized formats:
 *
 * SearchResult:
 *   - title: string (document title)
 *   - url: string (full URL to the document)
 *   - summary: string (brief description, max ~200 chars)
 *   - category: string (framework/section name)
 *
 * DocContent:
 *   - title: string (document title)
 *   - path: string (normalized path used to fetch)
 *   - url: string (full URL)
 *   - overview: string (intro paragraph, max ~500 chars)
 *   - sections: Array<{heading, content}> (max 10 sections, content max 1000 chars each)
 *   - codeExamples: string[] (max 5 examples, each max 2000 chars)
 *   - relatedLinks: Array<{title, url}> (max 10 links)
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { parse, HTMLElement } from "node-html-parser";

// ============================================================================
// Types & Interfaces
// ============================================================================

/** Standardized search result format */
interface SearchResult {
  title: string;
  url: string;
  summary: string;
  category: string;
}

/** Standardized document content format */
interface DocContent {
  title: string;
  path: string;
  url: string;
  overview: string;
  sections: Array<{ heading: string; content: string }>;
  codeExamples: string[];
  relatedLinks: Array<{ title: string; url: string }>;
}

/** Tool definition metadata */
interface ToolMeta {
  name: string;
  description: string;
  categoryName?: string; // e.g., "framework" for Apple, "category" for GitHub
  pathExample: string;
}

/**
 * Documentation Provider Interface
 *
 * Implement this interface to add a new documentation source.
 * The MCP server will automatically register search and fetch tools for each provider.
 */
interface DocProvider {
  /** Unique identifier (used for cache keys) */
  id: string;
  /** Human-readable name */
  name: string;
  /** Base URL for documentation */
  baseUrl: string;
  /** Search tool configuration */
  searchTool: ToolMeta;
  /** Fetch tool configuration */
  fetchTool: ToolMeta;
  /** Default language for code blocks */
  defaultCodeLang: string;
  /** Search implementation */
  search(query: string, category?: string): Promise<SearchResult[]>;
  /** Fetch implementation */
  fetch(path: string): Promise<DocContent>;
}

// ============================================================================
// Shared Utilities
// ============================================================================

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() });
}

async function fetchHtml(url: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 100)); // Rate limiting

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.text();
}

/** Extract text content from an element, limited to maxLength */
function extractText(el: HTMLElement | null, maxLength = 1000): string {
  if (!el) return "";
  return el.text.trim().substring(0, maxLength);
}

/** Normalize a URL path */
function normalizePath(path: string, prefixesToRemove: string[]): string {
  let normalized = path;
  for (const prefix of prefixesToRemove) {
    normalized = normalized.replace(new RegExp(`^/?${prefix}/?`, "i"), "");
  }
  return normalized;
}

/** Make a URL absolute if it's relative */
function absoluteUrl(href: string, baseUrl: string): string {
  if (href.startsWith("http")) return href;
  const base = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const path = href.startsWith("/") ? href : `/${href}`;
  return `${base}${path}`;
}

// ============================================================================
// Apple Developer Documentation Provider
// ============================================================================

const appleProvider: DocProvider = {
  id: "apple",
  name: "Apple Developer Documentation",
  baseUrl: "https://developer.apple.com/documentation/",
  searchTool: {
    name: "apple_docs_search",
    description: "Search Apple Developer Documentation for iOS/macOS frameworks, APIs, and guides.",
    categoryName: "framework",
    pathExample: "storekit/in-app_purchase",
  },
  fetchTool: {
    name: "apple_docs_fetch",
    description: "Fetch a specific Apple documentation page with overview, sections, and code examples.",
    pathExample: "storekit/in-app_purchase",
  },
  defaultCodeLang: "swift",

  async search(query: string, framework?: string): Promise<SearchResult[]> {
    const cacheKey = `${this.id}:search:${query}:${framework || ""}`;
    const cached = getCached<SearchResult[]>(cacheKey);
    if (cached) return cached;

    const searchQuery = framework ? `${framework} ${query}` : query;
    const searchUrl = `https://developer.apple.com/search/search_data.php?q=${encodeURIComponent(searchQuery)}&results=10&type=Documentation`;

    try {
      const response = await fetch(searchUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        return this.scrapeSearch(searchQuery);
      }

      const data = await response.json();
      const results: SearchResult[] = [];

      if (data.results && Array.isArray(data.results)) {
        for (const item of data.results.slice(0, 10)) {
          const url = item.url || "";
          results.push({
            title: item.title || "Untitled",
            url: absoluteUrl(url, "https://developer.apple.com"),
            summary: (item.description || item.abstract || "").substring(0, 200),
            category: this.extractCategory(url),
          });
        }
      }

      setCache(cacheKey, results);
      return results;
    } catch {
      return this.scrapeSearch(searchQuery);
    }
  },

  async scrapeSearch(query: string): Promise<SearchResult[]> {
    const url = `https://developer.apple.com/search/?q=${encodeURIComponent(query)}&type=Documentation`;
    try {
      const html = await fetchHtml(url);
      const root = parse(html);
      const results: SearchResult[] = [];

      const items = root.querySelectorAll(".search-result, .result-item, article");
      for (const item of items.slice(0, 10)) {
        const linkEl = item.querySelector("a");
        const titleEl = item.querySelector("h2, h3, .title") || linkEl;
        const summaryEl = item.querySelector("p, .description, .summary");

        if (linkEl && titleEl) {
          const href = linkEl.getAttribute("href") || "";
          results.push({
            title: extractText(titleEl, 100),
            url: absoluteUrl(href, "https://developer.apple.com"),
            summary: extractText(summaryEl, 200),
            category: this.extractCategory(href),
          });
        }
      }
      return results;
    } catch {
      return [];
    }
  },

  extractCategory(url: string): string {
    const match = url.match(/\/documentation\/([^/]+)/i);
    return match ? match[1] : "apple";
  },

  async fetch(path: string): Promise<DocContent> {
    const normalizedPath = normalizePath(path, ["documentation"]);
    const cacheKey = `${this.id}:doc:${normalizedPath}`;
    const cached = getCached<DocContent>(cacheKey);
    if (cached) return cached;

    const url = `${this.baseUrl}${normalizedPath}`;
    const html = await fetchHtml(url);
    const root = parse(html);

    const title = extractText(root.querySelector("h1, .title, [data-title]"), 200) || normalizedPath;
    const overview = extractText(root.querySelector(".abstract, .overview, [data-abstract], .intro p"), 500);

    const sections: Array<{ heading: string; content: string }> = [];
    const sectionEls = root.querySelectorAll("section, .section, article > div, .content-section");
    for (const section of sectionEls.slice(0, 10)) {
      const headingEl = section.querySelector("h2, h3, .heading");
      const heading = extractText(headingEl, 100);
      if (heading) {
        const content = section.text.replace(heading, "").trim().substring(0, 1000);
        if (content) sections.push({ heading, content });
      }
    }

    const codeExamples: string[] = [];
    const codeEls = root.querySelectorAll("pre, code.code-listing, .code-sample");
    for (const codeEl of codeEls.slice(0, 5)) {
      const code = codeEl.text.trim();
      if (code.length > 10 && code.length < 2000) codeExamples.push(code);
    }

    const relatedLinks: Array<{ title: string; url: string }> = [];
    const relatedEls = root.querySelectorAll(".related-links a, .see-also a");
    for (const linkEl of relatedEls.slice(0, 10)) {
      const href = linkEl.getAttribute("href");
      const linkTitle = extractText(linkEl as HTMLElement, 100);
      if (href && linkTitle && href.includes("/documentation/")) {
        relatedLinks.push({ title: linkTitle, url: absoluteUrl(href, "https://developer.apple.com") });
      }
    }

    const result: DocContent = { title, path: normalizedPath, url, overview, sections, codeExamples, relatedLinks };
    setCache(cacheKey, result);
    return result;
  },
};

// ============================================================================
// GitHub Documentation Provider
// ============================================================================

const githubProvider: DocProvider = {
  id: "github",
  name: "GitHub Documentation",
  baseUrl: "https://docs.github.com/en/",
  searchTool: {
    name: "github_docs_search",
    description: "Search GitHub Documentation for guides on Pages, Actions, Issues, Repositories, etc.",
    categoryName: "category",
    pathExample: "pages/getting-started-with-github-pages",
  },
  fetchTool: {
    name: "github_docs_fetch",
    description: "Fetch a specific GitHub documentation page with overview, sections, and code examples.",
    pathExample: "pages/getting-started-with-github-pages",
  },
  defaultCodeLang: "yaml",

  async search(query: string, category?: string): Promise<SearchResult[]> {
    const cacheKey = `${this.id}:search:${query}:${category || ""}`;
    const cached = getCached<SearchResult[]>(cacheKey);
    if (cached) return cached;

    const searchQuery = category ? `${category} ${query}` : query;
    const searchUrl = `https://docs.github.com/search?query=${encodeURIComponent(searchQuery)}`;

    try {
      const html = await fetchHtml(searchUrl);
      const root = parse(html);
      const results: SearchResult[] = [];

      const items = root.querySelectorAll("article, .search-result, [data-testid='search-result']");
      for (const item of items.slice(0, 10)) {
        const linkEl = item.querySelector("a");
        const titleEl = item.querySelector("h2, h3, .title, [data-testid='result-title']") || linkEl;
        const summaryEl = item.querySelector("p, .description, [data-testid='result-description']");

        if (linkEl && titleEl) {
          const href = linkEl.getAttribute("href") || "";
          results.push({
            title: extractText(titleEl as HTMLElement, 100),
            url: absoluteUrl(href, "https://docs.github.com"),
            summary: extractText(summaryEl, 200),
            category: this.extractCategory(href),
          });
        }
      }

      // Fallback: if no search results, try category page
      if (results.length === 0 && category) {
        const categoryResults = await this.fetchCategoryLinks(category);
        const filtered = categoryResults.filter(
          (r) =>
            r.title.toLowerCase().includes(query.toLowerCase()) ||
            r.summary.toLowerCase().includes(query.toLowerCase())
        );
        setCache(cacheKey, filtered);
        return filtered;
      }

      setCache(cacheKey, results);
      return results;
    } catch {
      return [];
    }
  },

  async fetchCategoryLinks(category: string): Promise<SearchResult[]> {
    const normalizedCategory = category.toLowerCase().replace(/\s+/g, "-");
    const url = `${this.baseUrl}${normalizedCategory}`;

    try {
      const html = await fetchHtml(url);
      const root = parse(html);
      const results: SearchResult[] = [];

      const links = root.querySelectorAll("main a, .content a, article a");
      for (const link of links.slice(0, 20)) {
        const href = link.getAttribute("href") || "";
        const title = extractText(link as HTMLElement, 100);
        if (href && title && href.includes("/en/") && !href.includes("#")) {
          results.push({
            title,
            url: absoluteUrl(href, "https://docs.github.com"),
            summary: "",
            category: normalizedCategory,
          });
        }
      }
      return results;
    } catch {
      return [];
    }
  },

  extractCategory(url: string): string {
    const match = url.match(/\/en\/([^/]+)/i);
    return match ? match[1] : "github";
  },

  async fetch(path: string): Promise<DocContent> {
    const normalizedPath = normalizePath(path, ["en", "docs.github.com/en"]);
    const cacheKey = `${this.id}:doc:${normalizedPath}`;
    const cached = getCached<DocContent>(cacheKey);
    if (cached) return cached;

    const url = `${this.baseUrl}${normalizedPath}`;
    const html = await fetchHtml(url);
    const root = parse(html);

    const title = extractText(root.querySelector("h1, .article-title, [data-testid='article-title']"), 200) || normalizedPath;
    const overview = extractText(root.querySelector(".intro, .lead, article > p:first-of-type, .article-intro"), 500);

    const sections: Array<{ heading: string; content: string }> = [];
    const headings = root.querySelectorAll("h2, h3");
    for (const heading of headings.slice(0, 15)) {
      const headingText = extractText(heading as HTMLElement, 100);
      if (headingText) {
        let content = "";
        let sibling = heading.nextElementSibling;
        while (sibling && !["H2", "H3"].includes(sibling.tagName)) {
          content += sibling.text.trim() + " ";
          sibling = sibling.nextElementSibling;
        }
        content = content.trim().substring(0, 1000);
        if (content) sections.push({ heading: headingText, content });
      }
    }

    const codeExamples: string[] = [];
    const codeEls = root.querySelectorAll("pre, code.highlight, .code-example");
    for (const codeEl of codeEls.slice(0, 5)) {
      const code = codeEl.text.trim();
      if (code.length > 10 && code.length < 2000) codeExamples.push(code);
    }

    const relatedLinks: Array<{ title: string; url: string }> = [];
    const relatedEls = root.querySelectorAll("aside a, .sidebar a");
    for (const linkEl of relatedEls.slice(0, 10)) {
      const href = linkEl.getAttribute("href");
      const linkTitle = extractText(linkEl as HTMLElement, 100);
      if (href && linkTitle && href.includes("/en/") && !href.includes("#")) {
        relatedLinks.push({ title: linkTitle, url: absoluteUrl(href, "https://docs.github.com") });
      }
    }

    const result: DocContent = { title, path: normalizedPath, url, overview, sections, codeExamples, relatedLinks };
    setCache(cacheKey, result);
    return result;
  },
};

// ============================================================================
// Provider Registry
// ============================================================================

/**
 * Add new documentation providers here.
 * Each provider will automatically get search and fetch tools registered.
 */
const providers: DocProvider[] = [appleProvider, githubProvider];

// ============================================================================
// MCP Server Setup
// ============================================================================

const server = new Server(
  { name: "dev-docs", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// Dynamically generate tools from providers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: providers.flatMap((p) => [
    {
      name: p.searchTool.name,
      description: `${p.searchTool.description} Returns titles, URLs, and summaries.`,
      inputSchema: {
        type: "object" as const,
        properties: {
          query: { type: "string", description: `Search query (e.g., "${p.searchTool.pathExample}")` },
          ...(p.searchTool.categoryName && {
            [p.searchTool.categoryName]: {
              type: "string",
              description: `Optional ${p.searchTool.categoryName} filter`,
            },
          }),
        },
        required: ["query"],
      },
    },
    {
      name: p.fetchTool.name,
      description: p.fetchTool.description,
      inputSchema: {
        type: "object" as const,
        properties: {
          path: { type: "string", description: `Path (e.g., "${p.fetchTool.pathExample}")` },
        },
        required: ["path"],
      },
    },
  ]),
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    for (const provider of providers) {
      // Search tool
      if (name === provider.searchTool.name) {
        const { query, ...rest } = args as { query: string; [key: string]: string | undefined };
        const category = provider.searchTool.categoryName ? rest[provider.searchTool.categoryName] : undefined;
        const results = await provider.search(query, category);

        if (results.length === 0) {
          return {
            content: [
              {
                type: "text" as const,
                text: `No ${provider.name} results found for "${query}"${category ? ` in ${category}` : ""}. Try different terms.`,
              },
            ],
          };
        }

        const formatted = results
          .map((r, i) => `${i + 1}. **${r.title}** (${r.category})\n   ${r.url}\n   ${r.summary}`)
          .join("\n\n");

        return {
          content: [
            {
              type: "text" as const,
              text: `## ${provider.name} Search Results\n\nQuery: "${query}"${category ? ` | ${provider.searchTool.categoryName}: ${category}` : ""}\n\n${formatted}`,
            },
          ],
        };
      }

      // Fetch tool
      if (name === provider.fetchTool.name) {
        const { path } = args as { path: string };
        const doc = await provider.fetch(path);
        return { content: [{ type: "text" as const, text: formatDocContent(doc, provider.defaultCodeLang) }] };
      }
    }

    return { content: [{ type: "text" as const, text: `Unknown tool: ${name}` }], isError: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { content: [{ type: "text" as const, text: `Error: ${message}` }], isError: true };
  }
});

function formatDocContent(doc: DocContent, defaultLang: string): string {
  let output = `# ${doc.title}\n\n`;
  output += `**URL:** ${doc.url}\n\n`;

  if (doc.overview) {
    output += `## Overview\n\n${doc.overview}\n\n`;
  }

  if (doc.sections.length > 0) {
    output += `## Sections\n\n`;
    for (const section of doc.sections) {
      output += `### ${section.heading}\n\n${section.content}\n\n`;
    }
  }

  if (doc.codeExamples.length > 0) {
    output += `## Code Examples\n\n`;
    for (const code of doc.codeExamples) {
      output += "```" + defaultLang + "\n" + code + "\n```\n\n";
    }
  }

  if (doc.relatedLinks.length > 0) {
    output += `## Related Links\n\n`;
    for (const link of doc.relatedLinks) {
      output += `- [${link.title}](${link.url})\n`;
    }
  }

  return output;
}

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Dev Docs MCP server running on stdio");
}

main().catch(console.error);
