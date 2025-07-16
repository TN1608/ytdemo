'use client'
import Header from "@/components/fragments/Header";
import {debounce} from "lodash";
import {useRouter} from "next/navigation";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { useState } from "react";

const ProfilePage = () => {
    const router = useRouter();
    const [savedVideos, setSavedVideos] = useState([]);
    const [likedVideos, setLikedVideos] = useState([]);

    const handleSearch = debounce((query: string) => {
        if (query.trim()) {
            router.push(`/?q=${encodeURIComponent(query)}`);
        }
    }, 500);

    const getSavedVideos = async () => {
        try{
            const response = await getSavedVideos()
            setSavedVideos(response?.videos || []);
        }catch (err: any) {
            console.error('Error fetching saved videos:', err);
        }
    }

    return (
        <div>
            <Header onSearch={handleSearch}/>
            <main className="container mx-auto p-4 flex flex-col md:flex-row gap-8">
                <section className="flex-1">
                    {/*    Tabs chia ra video da like va video da luu    */}
                    <Tabs
                        defaultValue="tab-1"
                        orientation="vertical"
                        className="w-full flex-row"
                    >
                        <TabsList className="flex-col">
                            <TabsTrigger value="tab-1" className="w-full">
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="tab-2" className="w-full">
                                Projects
                            </TabsTrigger>
                            <TabsTrigger value="tab-3" className="w-full">
                                Packages
                            </TabsTrigger>
                        </TabsList>
                        <div className="grow rounded-md border text-start">
                            <TabsContent value="tab-1">
                                <p className="text-muted-foreground px-4 py-3 text-xs">
                                    Content for Tab 1
                                </p>
                            </TabsContent>
                            <TabsContent value="tab-2">
                                <p className="text-muted-foreground px-4 py-3 text-xs">
                                    Content for Tab 2
                                </p>
                            </TabsContent>
                            <TabsContent value="tab-3">
                                <p className="text-muted-foreground px-4 py-3 text-xs">
                                    Content for Tab 3
                                </p>
                            </TabsContent>
                        </div>
                    </Tabs>
                </section>
            </main>
        </div>
    )
}

export default ProfilePage;
