// app/page.tsx
import Header from '../components/fragments/Header';
import VideoPlayer from '../components/VideoPlayer';
import { getPlaylistItems } from '@/services/search';
import { PlaylistItem, SearchResult } from '@/types';
import ClientHome from "@/app/ClientHome";

interface HomeProps {
    initialVideos: PlaylistItem[];
}

export default async function Home() {
    const data = await getPlaylistItems({ playlistId: 'RDimXIrrk1ftQ', maxResults: 10 });
    const initialVideos = data.items;

    return <ClientHome initialVideos={initialVideos} />;
}