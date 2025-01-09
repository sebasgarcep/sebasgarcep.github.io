import { getAllTags } from "@/lib/tags";

export const loader = (): Promise<string[]> => {
  return getAllTags();
};
