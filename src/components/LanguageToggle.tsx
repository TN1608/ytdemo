import {Button} from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {FaLanguage} from "react-icons/fa6";
import {useLanguage} from "@/context/LanguageProvider";
import React, {useState} from "react";

const LanguageToggle = () => {
    const {language, setLanguage, isLoading} = useLanguage();
    const [isSelected, setIsSelected] = useState(false);
    const languages = [
        {code: "en", name: "English"},
        {code: "vi", name: "Vietnamese"},
        {code: "es", name: "Spanish"},
        {code: "fr", name: "French"},
    ];

    const handleLanguageChange = (code: "en" | "vi", e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        setLanguage(code);
        setIsSelected(true);
    }

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-between">
                    <p className={"text-sm font-medium text-foreground/80"}>
                        {languages.find(lang => lang.code === language)?.code}
                    </p>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Choose Language</DropdownMenuLabel>
                <DropdownMenuSeparator/>
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={(e) => handleLanguageChange(lang.code as "en" | "vi", e)}
                        className="flex items-center justify-between"
                    >
                        {lang.name}
                        {language === lang.code && (
                            <span className="text-green-500">✓</span>
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
export default LanguageToggle;