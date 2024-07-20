import { useCookies } from "react-cookie";
import cookie from "cookie";

export default function useGetLoginId(serverCookies?: string): string {
  const [clientCookies] = useCookies();
  const cookies = serverCookies ? cookie.parse(serverCookies) : clientCookies;
  const { lid } = cookies;
  return lid;
}
