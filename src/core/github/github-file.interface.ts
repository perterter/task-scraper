export interface GitHubFile {
  name: string; // Name of the file (e.g., 'file1.json')
  path: string; // Full path to the file (e.g., 'json/file1.json')
  sha: string; // SHA-1 hash of the file
  size: number; // Size of the file in bytes
  url: string; // API URL to get the file's contents
  html_url: string; // URL to view the file on GitHub
  git_url: string; // API URL to get the Git object
  download_url: string; // Direct URL to download the file
  type: 'file'; // Type will always be 'file' for files
}
