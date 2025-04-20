import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export const useCheckDarkMode = () => {
  const [isDark, setIsDark] = useState<null | boolean>(null);
  const theme = useTheme();

  useEffect(() => {
    const systemTheme = theme.systemTheme;

    const currentTheme = theme.theme === "system" ? systemTheme : theme.theme;
    setIsDark(currentTheme === "dark");
  }, [theme]);

  return isDark;
};
