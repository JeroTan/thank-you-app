import { thankYouData, type ThankYouDataType } from "../../components/mockdata/thankYouData";

export async function thankYouDataMockFetching(): Promise<ThankYouDataType[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(thankYouData);
    }, 1000);
  });
}
