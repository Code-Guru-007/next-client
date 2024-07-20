// sections
import { JwtLoginView } from "minimal/sections/auth/jwt";

// ----------------------------------------------------------------------

export const metadata = {
  title: "Jwt: Login",
};

export default function LoginPage() {
  return <JwtLoginView />;
}
