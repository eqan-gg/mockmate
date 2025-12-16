import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export const ThemeToggle = () => {
    const [theme, setTheme] = useState<"light" | "dark">("light");

    useEffect(() => {
        // Check for saved theme preference or default to light
        const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
        setTheme(initialTheme);

        // Apply theme to document
        if (initialTheme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);

        // Update DOM
        if (newTheme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }

        // Save preference
        localStorage.setItem("theme", newTheme);
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="fixed top-4 right-4 z-50 h-10 w-10 rounded-full touch-manipulation"
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
            {theme === "light" ? (
                <Moon className="w-5 h-5" />
            ) : (
                <Sun className="w-5 h-5" />
            )}
        </Button>
    );
};
