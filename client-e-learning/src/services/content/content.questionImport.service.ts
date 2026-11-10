import { requestMultipart } from "@/services/api.service";
import type { CsvValidationResult } from "@/types/question-import";

export const questionImportService = {
  async validate(bankId: number, file: File): Promise<CsvValidationResult> {
    const body = new FormData();
    body.append("file", file);
    const response = await requestMultipart<CsvValidationResult>(
      `/v1/content/question-banks/${bankId}/questions/import/validate`,
      body,
    );
    if (!response.data) {
      throw new Error("CSV validation response is missing its data.");
    }
    return response.data;
  },
};
