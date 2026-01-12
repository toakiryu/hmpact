import { homedir } from "os";
import path from "path";

const _homedir = homedir();

/**
 * Get platform-specific cache directory
 * - Windows: %LOCALAPPDATA%\hmpact\cache
 * - macOS: ~/Library/Caches/hmpact
 * - Linux/Unix: ~/.cache/hmpact (XDG Base Directory)
 */
function getPlatformCacheDir(): string {
  const platform = process.platform;

  if (platform === "win32") {
    // Windows: Use LOCALAPPDATA
    const localAppData = process.env.LOCALAPPDATA;
    if (localAppData) {
      return path.join(localAppData, "hmpact", "cache");
    }
    // Fallback to user profile if LOCALAPPDATA is not set
    return path.join(_homedir, "AppData", "Local", "hmpact", "cache");
  } else if (platform === "darwin") {
    // macOS: Use Library/Caches
    return path.join(_homedir, "Library", "Caches", "hmpact");
  } else {
    // Linux/Unix: Use XDG Base Directory specification
    const xdgCacheHome = process.env.XDG_CACHE_HOME;
    if (xdgCacheHome) {
      return path.join(xdgCacheHome, "hmpact");
    }
    return path.join(_homedir, ".cache", "hmpact");
  }
}

export const hpath = {
  homedir: {
    user: _homedir,
    hmpact: path.join(_homedir, ".hmpact"),
    cache: getPlatformCacheDir(),
  },
};
