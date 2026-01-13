import { homedir } from "os";
import path from "path";

const _homedir = homedir();

/**
 * Get platform-specific local application data directory
 * - Windows: %LOCALAPPDATA%\hmpact
 * - macOS: ~/Library/hmpact
 * - Linux/Unix: ~/.hmpact (XDG Base Directory)
 */
function getPlatformLocalAppDataDir(): string {
  const platform = process.platform;

  if (platform === "win32") {
    // Windows: Use LOCALAPPDATA
    const localAppData = process.env.LOCALAPPDATA;
    if (localAppData) {
      return path.join(localAppData, "hmpact");
    }
    // Fallback to user profile if LOCALAPPDATA is not set
    return path.join(_homedir, "AppData", "Local", "hmpact");
  } else if (platform === "darwin") {
    // macOS: Use Library/hmpact
    return path.join(_homedir, "Library", "hmpact");
  } else {
    // Linux/Unix: Use XDG Base Directory specification
    const xdgCacheHome = process.env.XDG_CACHE_HOME;
    if (xdgCacheHome) {
      return path.join(xdgCacheHome, "hmpact");
    }
    return path.join(_homedir, ".hmpact");
  }
}

export const hpath = {
  homedir: {
    user: _homedir,
    hmpact: getPlatformLocalAppDataDir(),
    cache: path.join(getPlatformLocalAppDataDir(), "cache"),
  },
};
