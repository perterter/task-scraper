import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import fetch from 'node-fetch';
import * as path from 'path';

const GITHUB_API_URL = 'https://api.github.com/repos';
const REPO_OWNER = 'abextm';
const REPO_NAME = 'osrs-cache';
const VERSION_FILE = 'cache-version.txt';
const versionFilePath = path.join('./osrs-cache', 'cache-version.txt');

@Injectable()
export class CacheService {
  public async updateCache(): Promise<void> {
    // Run the function to download the repository
    this.downloadRepository();
    // Fetch the latest commit hash to use as the version
    const latestVersion = await this.getLatestCommitHash();
    // Update the version file
    this.updateVersionFile(latestVersion);
  }

  // Fetches the contents of a given path in the repository
  private async fetchRepoContents(repoPath: string): Promise<any[]> {
    const url = `${GITHUB_API_URL}/${REPO_OWNER}/${REPO_NAME}/contents/${repoPath}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error fetching repository contents: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching repository contents from ${url}`, error);
      throw error;
    }
  }

  // Downloads a file from the GitHub repo and saves it locally
  private async downloadFile(fileUrl: string, filePath: string): Promise<void> {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`Error downloading file: ${response.statusText}`);
      }
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(buffer));
      console.log(`Downloaded file: ${filePath}`);
    } catch (error) {
      console.error(`Error downloading file from ${fileUrl}`, error);
      throw error;
    }
  }

  // Recursively downloads the contents of a GitHub repository
  private async downloadRepoContents(repoPath: string, localPath: string): Promise<void> {
    const contents = await this.fetchRepoContents(repoPath);

    for (const item of contents) {
      const itemPath = path.join(localPath, item.name);
      if (item.type === 'dir') {
        // Create the directory locally
        if (!fs.existsSync(itemPath)) {
          fs.mkdirSync(itemPath, { recursive: true });
        }
        // Recursively process the directory
        await this.downloadRepoContents(`${repoPath}/${item.name}`, itemPath);
      } else if (item.type === 'file') {
        // Download the file
        await this.downloadFile(item.download_url, itemPath);
      }
    }
  }

  // Main function to download the entire repository
  private async downloadRepository(): Promise<void> {
    const targetDir = './osrs-cache';
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    try {
      console.log('Starting repository download...');
      await this.downloadRepoContents('', targetDir);
      console.log('Repository download complete.');
    } catch (error) {
      console.error('Failed to download the repository:', error);
    }
  }

  // Fetches the latest commit hash from the repository
  private async getLatestCommitHash(): Promise<string> {
    const commitsUrl = `${GITHUB_API_URL}/${REPO_OWNER}/${REPO_NAME}/commits`;
    try {
      const response = await fetch(commitsUrl);
      if (!response.ok) {
        throw new Error(`Error fetching latest commit: ${response.statusText}`);
      }
      const commits = await response.json();
      return commits[0].sha; // Get the latest commit hash
    } catch (error) {
      console.error(`Error fetching latest commit from ${commitsUrl}`, error);
      throw error;
    }
  }

  // Updates the version file with the latest commit hash
  private updateVersionFile(version: string): void {
    const versionFilePath = path.join('./osrs-cache', VERSION_FILE);
    fs.writeFileSync(versionFilePath, version);
    console.log(`Updated version file: ${versionFilePath} with version: ${version}`);
  }

  // Checks if the cache is up to date
  public async isCacheUpToDate(): Promise<boolean> {
    const latestVersion = await this.getLatestCommitHash();
    const localVersion = this.getLocalVersion();
    console.log('cache latestVersion ', latestVersion);
    console.log('cache-localVersion ', localVersion);

    // If the local version doesn't exist or doesn't match the latest, return false
    if (!localVersion || localVersion !== latestVersion) {
      return false;
    }
    return true;
  }

  // Reads the local version from the cache-version.txt file
  private getLocalVersion(): string | null {
    if (!fs.existsSync(versionFilePath)) {
      return null;
    }
    return fs.readFileSync(versionFilePath, 'utf-8').trim();
  }
}
