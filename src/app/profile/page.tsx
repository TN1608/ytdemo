'use client'
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
import {Card, CardContent, CardHeader} from "@/components/ui/card";

const ProfilePage = () => {
    const router = useRouter();
    const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([]);
    const [likedVideos, setLikedVideos] = useState<LikedVideo[]>([]);

    const fetchSavedVideos = async () => {
        try {
            const response = await getSavedVideos()
            setSavedVideos(response.videos);
        } catch (err: any) {
            console.error('Error fetching saved videos:', err);
        }
    }

    const fetchLikedVideos = async () => {
        try {
            const response = await getLikedVideos();
            setLikedVideos(response.videos);
        } catch (err: any) {
            console.error('Error fetching liked videos:', err);
        }
    }

    useEffect(() => {
        fetchSavedVideos();
        fetchLikedVideos();
    }, []);

    return (
        <div>
            <main className="container mx-auto p-4 flex flex-col md:flex-row gap-8">
                <section className="flex-1">
                    <Tabs
                        defaultValue="tab-1"
                        orientation="vertical"
                        className="w-full flex-row"
                    >
                        <TabsList className="flex-col h-fit">
                            <TabsTrigger value="tab-1" className="w-full">
                                Liked Videos
                            </TabsTrigger>
                            <TabsTrigger value="tab-2" className="w-full">
                                Saved Videos
                            </TabsTrigger>
                        </TabsList>
                        <div className="grow rounded-md border text-start">
                            <TabsContent value="tab-1">
                                <div className="p-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {likedVideos.length > 0 ? (
                                        likedVideos.map(video => (
                                            <Card key={video.id} className="flex flex-col h-full">
                                                <CardHeader className="pb-2">
                                                    <h3 className="text-lg font-semibold truncate">{video.title}</h3>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                                                </CardHeader>
                                                <CardContent className="flex flex-col gap-2 flex-1 justify-center">
                                                    <img
                                                        src={video.thumbnail}
                                                        alt={video.title}
                                                        className="w-full h-48 object-cover rounded-md border"
                                                    />
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground">No liked videos found.</p>
                                    )}
                                </div>
                            </TabsContent>
                            <TabsContent value="tab-2">
                                <div className="p-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {savedVideos.length > 0 ? (
                                        savedVideos.map(video => (
                                            <Card key={video.videoId} className="flex flex-col h-full">
                                                <CardHeader className="pb-2">
                                                    <h3 className="text-lg font-semibold truncate">{video.title}</h3>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                                                </CardHeader>
                                                <CardContent className="flex flex-col gap-2 flex-1 justify-center">
                                                    <img
                                                        src={video.thumbnail}
                                                        alt={video.title}
                                                        className="w-full h-48 object-cover rounded-md border"
                                                    />
                                                </CardContent>
                                            </Card>
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
