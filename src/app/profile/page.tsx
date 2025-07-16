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
import {useEffect, useState} from "react";
import {LikedVideo, SavedVideo} from "@/types";
import {getLikedVideos, getSavedVideos} from "@/services";

const ProfilePage = () => {
    const router = useRouter();
    const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([]);
    const [likedVideos, setLikedVideos] = useState<LikedVideo[]>([]);

    const handleSearch = debounce((query: string) => {
        if (query.trim()) {
            router.push(`/?q=${encodeURIComponent(query)}`);
        }
    }, 500);

    const fetchSavedVideos = async () => {
        try{
            const response = await getSavedVideos()
            setSavedVideos(response.videos);
        }catch (err: any) {
            console.error('Error fetching saved videos:', err);
        }
    }

    const fetchLikedVideos = async () => {
        try {
            const response = await getLikedVideos();
            setLikedVideos(response?.videos);
        } catch (err: any) {
            console.error('Error fetching liked videos:', err);
        }
    }

    useEffect(() => {
        getSavedVideos();
        getLikedVideos();
    }, []);

    return (
        <div>
            <Header onSearch={handleSearch}/>
            <main className="container mx-auto p-4 flex flex-col md:flex-row gap-8">
                <section className="flex-1">
                    <Tabs
                        defaultValue="tab-1"
                        orientation="vertical"
                        className="w-full flex-row"
                    >
                        <TabsList className="flex-col">
                            <TabsTrigger value="tab-1" className="w-full">
                                Liked Videos
                            </TabsTrigger>
                            <TabsTrigger value="tab-2" className="w-full">
                                Saved Videos
                            </TabsTrigger>
                        </TabsList>
                        <div className="grow rounded-md border text-start">
                            <TabsContent value="tab-1">
                                <div className="p-4">
                                    {likedVideos.length > 0 ? (
                                        likedVideos.map(video => (
                                            <div key={video.videoId} className="mb-4">
                                                <h3 className="text-lg font-semibold">{video.videoId}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {video.status ? 'Liked' : 'Disliked'} at {new Date(video.updatedAt).toLocaleString()}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground">No liked videos found.</p>
                                    )}
                                </div>
                            </TabsContent>
                            <TabsContent value="tab-2">
                                <div className="p-4">
                                    {savedVideos.length > 0 ? (
                                        savedVideos.map(video => (
                                            <div key={video.videoId} className="mb-4">
                                                <h3 className="text-lg font-semibold">{video.title}</h3>
                                                <p className="text-sm text-muted-foreground">{video.description}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground">No saved videos found.</p>
                                    )}
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </section>
            </main>
        </div>
    )
}

export default ProfilePage;
