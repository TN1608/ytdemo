'use client';

import { IoHomeOutline, IoMenu } from 'react-icons/io5';
import { RiPlayList2Line } from 'react-icons/ri';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormEvent, useState } from 'react';
import { ThemeToggleButton } from '@/components/ui/ThemeToggleButton';
import Link from 'next/link';
import {useAuth} from "@/context/AuthenticateProvider";
import {useSearchHandler} from "@/context/SearchProvider";

const Header = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const { isAuthenticated, logout, currentUser } = useAuth();
    const onSearch = useSearchHandler();

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim() && onSearch) {
            onSearch(searchQuery);
            setSearchQuery('');
        }
    };

    return (
        <div className="flex items-center justify-between p-2 bg-transparent backdrop-blur-2xl">
            <div className="items-center flex gap-1 text-foreground">
                <Sheet>
                    <SheetTrigger className="text-foreground hover:text-gray-900 cursor-pointer rounded-md hover:bg-gray-100 transition-colors duration-200 hover:shadow-sm hover:scale-105 p-2">
                        <IoMenu size={24} />
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64">
                        <SheetHeader>
                            <SheetTitle className="text-lg font-semibold text-foreground">MyTube</SheetTitle>
                            <SheetDescription className="text-sm text-secondary-foreground">
                                Explore videos, playlists, and more
                            </SheetDescription>
                        </SheetHeader>
                        <Separator />
                        <div className="flex flex-col p-3">
                            <Link href="/" className="items-center cursor-pointer flex gap-2 hover:bg-accent p-2 rounded-md transition-colors duration-200">
                                <IoHomeOutline size={24} />
                                <span className="text-foreground">Home</span>
                            </Link>
                            <Link href="/about" className="items-center cursor-pointer flex gap-2 hover:bg-accent p-2 rounded-md transition-colors duration-200">
                                <RiPlayList2Line size={24} />
                                <span className="text-foreground">About</span>
                            </Link>
                            {isAuthenticated && (
                                <Link href="/profile" className="items-center cursor-pointer flex gap-2 hover:bg-accent p-2 rounded-md transition-colors duration-200">
                                    <RiPlayList2Line size={24} />
                                    <span className="text-foreground">Profile</span>
                                </Link>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
                <Link href="/" className="font-bold text-2xl transition-all text-foreground hover:scale-105">
                    MyTube
                </Link>
            </div>
            <form onSubmit={handleSearch} className="flex items-center">
                <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 max-w-md"
                    placeholder="Search YouTube..."
                    disabled={!onSearch}
                />
                <Button type="submit" className="ml-2" variant="outline" disabled={!onSearch}>
                    Search
                </Button>
            </form>
            <div className="flex items-center gap-2">
                {isAuthenticated ? (
                    <>
                        <div className={"flex items-center gap-2"}>
                            <span className={"text-foreground font-semibold"}>
                                Welcome, {currentUser?.username || 'User'}
                            </span>
                            <Button variant="outline" onClick={logout}>
                                Sign out
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className={"flex items-center gap-2"}>
                        <Link href="/signin">
                            <Button variant="outline">Sign in</Button>
                        </Link>
                        <Link href="/signup">
                            <Button variant="outline">Sign up</Button>
                        </Link>
                    </div>
                )}
                <ThemeToggleButton variant="circle-blur" start="bottom-right" />
            </div>
        </div>
    );
};

export default Header;