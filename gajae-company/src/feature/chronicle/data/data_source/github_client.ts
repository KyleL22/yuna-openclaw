export class GithubClient {
  private accessToken: string;
  private baseUrl: string = "https://api.github.com";
  private owner: string = "openclaw-kong";
  private repo: string = "openclaw-workspace";

  constructor() {
    this.accessToken = process.env.GITHUB_TOKEN || "";
  }

  async fetchDirectory(path: string) {
    if (!this.accessToken) {
      console.warn("GITHUB_TOKEN is missing. Returning mock data for demo.");
      return this.getMockDirectory(path);
    }

    const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `token ${this.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return this.getMockDirectory(path);
      }
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    return response.json();
  }

  async fetchContent(path: string) {
    if (!this.accessToken) return "# Mock Content\nThis is a demo content.";

    const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `token ${this.accessToken}`,
        Accept: "application/vnd.github.v3.raw",
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) return "# Mock Content\nFailed to fetch real content.";

    return response.text();
  }

  private getMockDirectory(path: string) {
    if (path.includes("daily")) {
      return [
        { name: "20260206", type: "dir" },
        { name: "20260205", type: "dir" },
        { name: "20260204", type: "dir" },
      ];
    }
    if (path.includes("20260206")) {
      return [
        { name: "20260206_0900_System-Wakeup.md", type: "file", sha: "s1", path: "p1" },
        { name: "20260206_1400_Feature-Implementation.md", type: "file", sha: "s2", path: "p2" },
        { name: "20260206_1630_Subagent-Deployment.md", type: "file", sha: "s3", path: "p3" },
      ];
    }
    return [];
  }
}
