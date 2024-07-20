import { useCookies } from "react-cookie";
import cookie from "cookie";

export default function useHasLogin(serverCookies?: string): boolean {
  const [clientCookies] = useCookies();
  const cookies = serverCookies ? cookie.parse(serverCookies) : clientCookies;
  const { lid, tid } = cookies;
  const mInfo = cookies.m_info;
  // const csrf = cookies["XSRF-TOKEN"];
  return lid && tid && mInfo;
}
