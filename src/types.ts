export interface OpenEvidenceAskRequest {
  question: string;
  originalArticleId?: string;
  articleType?: string;
  personalizationEnabled?: boolean;
  disableCaching?: boolean;
  variantConfigurationFile?: string;
}

export interface WaitOptions {
  timeoutMs?: number;
  intervalMs?: number;
}

export interface AuthStatusResult {
  authenticated: boolean;
  statusCode: number;
  user?: Record<string, unknown>;
  message?: string;
}

