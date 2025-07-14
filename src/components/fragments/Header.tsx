'use client'

import {IoHomeOutline, IoMenu} from "react-icons/io5";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {Separator} from "@/components/ui/separator";
import {RiPlayList2Line} from "react-icons/ri";
import {Input} from "@/components/ui/input";
import {useState} from "react";
import {Button} from "@/components/ui/button";

interface HeaderProps {
    onSearch: (query: string) => void;
}

const Header = ({onSearch}: HeaderProps) => {
    const [searchQuery, setSearchQuery] = useState<string>('');

    const handleSearch = (e: any) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            onSearch(searchQuery);
            setSearchQuery('')
        }
    }
    return (
        <div className={"flex items-center justify-between p-2 bg-gradient-to-bl from-gray-200 to-white shadow-md "}>
            <Sheet>
                <SheetTrigger
                    className="text-gray-700 hover:text-gray-900 cursor-pointer rounded-md hover:bg-gray-100 transition-colors duration-200 hover:shadow-sm hover:scale-105 p-2">
                    <IoMenu size={24}/>
                </SheetTrigger>
                <SheetContent side="left" className="w-64">
                    <SheetHeader>
                        <SheetTitle className="text-lg font-semibold">Menu</SheetTitle>
                        <SheetDescription className="text-sm text-gray-600">
                            Navigate through the app
                        </SheetDescription>
                    </SheetHeader>
                    <Separator/>
                    <div className={"flex flex-col p-3"}>
                        <div
                            className={"items-center cursor-pointer flex gap-2 hover:bg-gray-100 p-2 rounded-md transition-colors duration-200"}>
                            <IoHomeOutline size={24}/>
                            <span className={"text-gray-700"}>Home</span>
                        </div>
                        <div
                            className={"items-center cursor-pointer flex gap-2 hover:bg-gray-100 p-2 rounded-md transition-colors duration-200"}>
                            <RiPlayList2Line size={24}/>
                            <span className={"text-gray-700"}>About</span>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
            {/*youtube Searchbar*/}
            <form
                onSubmit={handleSearch}
                className="flex items-center"
            >
                <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 max-w-md"
                    placeholder="Search YouTube..."
                />
                <Button
                    type="submit"
                    className="ml-2"
                    variant="outline"
                >
                    Search
                </Button>
            </form>
        </div>
    );
};

export default Header;