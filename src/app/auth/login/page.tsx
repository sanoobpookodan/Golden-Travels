import SignInForm from "@/modules/auth/components/SignInForm";
import { ThemeProvider } from "@/context/ThemeContext";
import "@/styles/admin-styles.css";
import "@/styles/admin-custome-styles.scss";
import { Outfit } from "next/font/google";

export const metadata = {
  title: "Login",
};

const outfit = Outfit({
  subsets: ["latin"],
});

export default function LoginPage() {
  return <SignInForm />;
}
