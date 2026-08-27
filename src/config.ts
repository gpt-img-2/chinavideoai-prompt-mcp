export type ChinaVideoAIConfig = {
  appBaseUrl: string;
};

function parseBaseUrl(value: string | undefined) {
  const candidate = (value || "https://chinavideoai.com")
    .trim()
    .replace(/\/+$/, "");
  const url = new URL(candidate);

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("China Video AI base URL must use http or https.");
  }

  return url.toString().replace(/\/+$/, "");
}

export function loadConfig(): ChinaVideoAIConfig {
  return {
    appBaseUrl: parseBaseUrl(process.env.CHINAVIDEOAI_APP_BASE_URL),
  };
}
