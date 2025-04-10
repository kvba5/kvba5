import { Octokit } from "@octokit/rest";

export default class Github {
    private username: string;
    rest: Octokit;


    constructor(username: string, auth?: string) {
        this.username = username;
        this.rest = new Octokit({ auth })
    }

    

    /**
     * Gets star count of first 100 repos from API. (not more to prevent spam)
     * @returns Star count
     */
    async getStarCount(): Promise<number> {
        const repos = await this.rest.repos.listForUser({
            username: this.username,
            per_page: 100
        })
        return repos.data.reduce((n, r) => n + (r.stargazers_count ?? 0), 0)
    }

    /**
     * Gets pull requests count from API.
     * @returns Pull requests count
     */
    async getPullRequests(): Promise<number> {
        const pr = await this.rest.request("/search/issues", {
            q: `is:pr author:${this.username}`,
            advanced_search: "true",
            per_page: 1
        })
        return pr.data.total_count
    }
}