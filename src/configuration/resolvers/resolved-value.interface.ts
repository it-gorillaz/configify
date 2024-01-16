/**
 * The resolved value interface
 */
export interface ResolvedValue {
  id: string;
  success: boolean;
  key: string;
  value?: string;
  error?: Error;
}
